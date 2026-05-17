import { signal, computed, effect } from '@preact/signals-react'
import { persistedSignal } from './persist'
import { currentTrack, currentTime, duration, isPlaying } from './player'
import { parseLyrics, getActiveLyricIndex } from '@/utils/lrc'
import { rpc } from '@/ipc/client'

/** Whether the legacy lyrics side panel is open (keybinding still works) */
export const showLyrics = signal(false)

export function toggleLyrics() {
  showLyrics.value = !showLyrics.value
}

/** Whether the full-screen player detail overlay is open */
export const showPlayerDetail = signal(false)

export function openPlayerDetail() {
  showPlayerDetail.value = true
}

export function closePlayerDetail() {
  showPlayerDetail.value = false
}

/** Whether desktop lyrics overlay is active */
export const desktopLyricsEnabled = persistedSignal('lyra:desktopLyrics', false)

export async function toggleDesktopLyrics() {
  const next = !desktopLyricsEnabled.value
  desktopLyricsEnabled.value = next
  try {
    await rpc.request.toggleDesktopLyrics({ visible: next })
  } catch (e) {
    console.error('Failed to toggle desktop lyrics:', e)
    desktopLyricsEnabled.value = !next
  }
}

/**
 * Parsed lyrics for the currently playing track.
 * Recomputed only when the track changes (not on every timeupdate).
 */
export const parsedLyrics = computed(() => {
  const track = currentTrack.value
  if (!track?.lyrics) return null
  return parseLyrics(track.lyrics)
})

/**
 * Index of the active lyric line based on current playback time.
 * The computed deduplicates — the Lyrics panel re-renders only on line changes,
 * not on every second of playback.
 */
export const activeLyricIndex = computed(() => {
  const parsed = parsedLyrics.value
  if (!parsed || parsed.type !== 'lrc') return -1
  return getActiveLyricIndex(parsed.lines, currentTime.value)
})

// ─── Push lyrics state to main process for desktop lyrics window ──────────────

let pushTimer: ReturnType<typeof setInterval> | null = null
let lastPushedTrackId = ''

effect(() => {
  const enabled = desktopLyricsEnabled.value

  if (!enabled) {
    if (pushTimer) {
      clearInterval(pushTimer)
      pushTimer = null
    }
    return
  }

  // Ensure the lyrics window is created/shown when enabled
  rpc.request.toggleDesktopLyrics({ visible: true }).catch(() => {})

  const pushState = () => {
    const track = currentTrack.value
    const trackId = track?.filePath ?? ''

    const needFullPush = trackId !== lastPushedTrackId
    lastPushedTrackId = trackId

    rpc.request.pushLyricsState({
      trackId,
      title: track?.title ?? '',
      artist: track?.artist ?? '',
      lyrics: needFullPush ? (track?.lyrics ?? null) : null,
      currentTime: currentTime.value,
      duration: duration.value,
      isPlaying: isPlaying.value,
    }).catch(() => {})
  }

  pushState()
  pushTimer = setInterval(pushState, 100)

  return () => {
    if (pushTimer) {
      clearInterval(pushTimer)
      pushTimer = null
    }
  }
})

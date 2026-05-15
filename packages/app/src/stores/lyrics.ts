import { signal, computed } from '@preact/signals-react'
import { currentTrack, currentTime } from './player'
import { parseLyrics, getActiveLyricIndex } from '@/utils/lrc'

/** Whether the lyrics panel is open */
export const showLyrics = signal(false)

export function toggleLyrics() {
  showLyrics.value = !showLyrics.value
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

import { signal, computed, effect } from '@preact/signals-react'
import { persistedSignal, store } from './persist'
import { setAccentColor, dynamicAccent } from './theme'
import { extractVibrantColor } from '@/utils/colorExtract'
import type { Track } from '@/types/music'

const AUDIO_SERVER = 'http://localhost:1421'
const SAVE_INTERVAL = 10_000

const audio = new Audio()

// ─── Playback state ───────────────────────────────────────────────────────────

export const currentTrack = signal<Track | null>(null)
export const isPlaying = signal(false)
export const currentTime = signal(0)
export const duration = signal(0)
export const volume = persistedSignal('lyra:volume', 0.8)
export const playlist = signal<Track[]>([])
export const playIndex = signal(-1)

// ─── Playback modes ───────────────────────────────────────────────────────────

/** @default 'none' */
export const repeatMode = persistedSignal<RepeatMode>('lyra:repeatMode', 'none')
export const shuffleMode = persistedSignal('lyra:shuffleMode', false)

/** Shuffled indices into playlist[] */
const shuffleQueue = signal<number[]>([])
/** Current position within shuffleQueue */
const shufflePos = signal(-1)

// ─── Derived ──────────────────────────────────────────────────────────────────

export const progress = computed(() =>
  duration.value > 0 ? currentTime.value / duration.value : 0,
)

// ─── Audio setup ──────────────────────────────────────────────────────────────

audio.volume = volume.peek()

let lastSaveTs = 0

function saveLastPlayed() {
  const track = currentTrack.value
  if (!track) return
  store.setItem('lyra:lastPlayed', {
    filePath: track.filePath,
    time: audio.currentTime,
  })
}

audio.addEventListener('timeupdate', () => {
  currentTime.value = audio.currentTime

  const now = Date.now()
  if (now - lastSaveTs > SAVE_INTERVAL) {
    lastSaveTs = now
    saveLastPlayed()
  }
})

audio.addEventListener('loadedmetadata', () => {
  duration.value = audio.duration || 0
})

audio.addEventListener('ended', () => {
  nextTrack()
})

audio.addEventListener('play', () => {
  isPlaying.value = true
})

audio.addEventListener('pause', () => {
  isPlaying.value = false
  saveLastPlayed()
})

audio.addEventListener('error', () => {
  console.error(`Audio error [${audio.error?.code}]: ${audio.error?.message}`)
  isPlaying.value = false
})

// ─── Dynamic accent from album art ───────────────────────────────────────────

effect(() => {
  const track = currentTrack.value
  if (!track || !dynamicAccent.value) return

  extractVibrantColor(getCoverUrl(track.filePath))
    .then(color => setAccentColor(color))
    .catch(() => { /* keep current accent on error */ })
})

effect(() => {
  if (!dynamicAccent.value) setAccentColor(null)
})

// ─── Shuffle helpers ──────────────────────────────────────────────────────────

/** Fisher-Yates shuffle of 0..length-1 indices, placing currentIdx first */
function buildShuffleQueue(length: number, currentIdx: number): number[] {
  const indices = Array.from({ length }, (_, i) => i).filter(i => i !== currentIdx)

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  return currentIdx >= 0 ? [currentIdx, ...indices] : indices
}

function resetShuffle() {
  shuffleQueue.value = []
  shufflePos.value = -1
}

// ─── Core playback ────────────────────────────────────────────────────────────

function loadAndPlay(track: Track) {
  currentTrack.value = track
  audio.src = `${AUDIO_SERVER}/stream?path=${encodeURIComponent(track.filePath)}`
  audio.play().catch(e => console.error('Play failed:', e))
  saveLastPlayed()
}

export function playTrack(track: Track, list?: Track[], index?: number) {
  if (list) {
    playlist.value = list
    resetShuffle()
  }
  if (index !== undefined) playIndex.value = index
  loadAndPlay(track)
}

export function togglePlay() {
  if (!currentTrack.value) return
  audio.paused ? audio.play() : audio.pause()
}

export function nextTrack() {
  const list = playlist.value
  if (list.length === 0) return

  if (repeatMode.value === 'one') {
    audio.currentTime = 0
    audio.play().catch(console.error)
    return
  }

  if (shuffleMode.value) {
    let queue = shuffleQueue.value
    let pos = shufflePos.value + 1

    if (queue.length === 0) {
      queue = buildShuffleQueue(list.length, playIndex.value)
      shuffleQueue.value = queue
      pos = 0
    }

    if (pos >= queue.length) {
      if (repeatMode.value === 'all') {
        queue = buildShuffleQueue(list.length, -1)
        shuffleQueue.value = queue
        pos = 0
      } else {
        return
      }
    }

    shufflePos.value = pos
    playIndex.value = queue[pos]
    loadAndPlay(list[queue[pos]])
    return
  }

  const nextIdx = playIndex.value + 1
  if (nextIdx >= list.length) {
    if (repeatMode.value === 'all') {
      playIndex.value = 0
      loadAndPlay(list[0])
    }
    return
  }

  playIndex.value = nextIdx
  loadAndPlay(list[nextIdx])
}

export function prevTrack() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0
    return
  }

  const list = playlist.value
  if (list.length === 0) return

  if (shuffleMode.value) {
    const queue = shuffleQueue.value
    const pos = shufflePos.value - 1
    if (pos < 0) return

    shufflePos.value = pos
    playIndex.value = queue[pos]
    loadAndPlay(list[queue[pos]])
    return
  }

  const prevIdx = playIndex.value <= 0 ? list.length - 1 : playIndex.value - 1
  playIndex.value = prevIdx
  loadAndPlay(list[prevIdx])
}

export function seekTo(time: number) {
  audio.currentTime = time
}

export function setVolume(v: number) {
  const clamped = Math.max(0, Math.min(1, v))
  volume.value = clamped
  audio.volume = clamped
}

export function toggleShuffle() {
  shuffleMode.value = !shuffleMode.value
  resetShuffle()
}

export function cycleRepeat() {
  const modes: RepeatMode[] = ['none', 'all', 'one']
  const idx = modes.indexOf(repeatMode.value)
  repeatMode.value = modes[(idx + 1) % modes.length]
}

export function restoreTrack(track: Track, list: Track[], index: number, time: number) {
  currentTrack.value = track
  playlist.value = list
  playIndex.value = index
  audio.src = `${AUDIO_SERVER}/stream?path=${encodeURIComponent(track.filePath)}`

  const onReady = () => {
    audio.currentTime = time
    audio.removeEventListener('loadedmetadata', onReady)
  }
  audio.addEventListener('loadedmetadata', onReady)
}

export async function getLastPlayed(): Promise<{ filePath: string; time: number } | null> {
  try {
    return await store.getItem('lyra:lastPlayed')
  } catch {
    return null
  }
}

export function playNext(track: Track) {
  const list = playlist.value
  if (list.length === 0) {
    playTrack(track, [track], 0)
    return
  }

  const insertIdx = playIndex.value + 1
  const newList = [...list]
  newList.splice(insertIdx, 0, track)
  playlist.value = newList
  resetShuffle()
}

export function addToQueue(track: Track) {
  const list = playlist.value
  if (list.length === 0) {
    playTrack(track, [track], 0)
    return
  }

  playlist.value = [...list, track]
  resetShuffle()
}

export function removeFromQueue(index: number) {
  const list = playlist.value
  if (index < 0 || index >= list.length) return

  const newList = list.filter((_, i) => i !== index)
  playlist.value = newList

  if (index < playIndex.value) {
    playIndex.value = playIndex.value - 1
  } else if (index === playIndex.value) {
    if (newList.length === 0) {
      currentTrack.value = null
      audio.pause()
      audio.src = ''
    } else {
      const nextIdx = Math.min(index, newList.length - 1)
      playIndex.value = nextIdx
      loadAndPlay(newList[nextIdx])
    }
  }

  resetShuffle()
}

export function getAudioStreamUrl(filePath: string) {
  return `${AUDIO_SERVER}/stream?path=${encodeURIComponent(filePath)}`
}

export function getCoverUrl(filePath: string) {
  return `${AUDIO_SERVER}/cover?path=${encodeURIComponent(filePath)}`
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type RepeatMode = 'none' | 'one' | 'all'

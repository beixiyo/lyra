import { signal, computed } from '@preact/signals-react'
import { persistedSignal } from './persist'
import type { Track } from '@/types/music'

const AUDIO_SERVER = 'http://localhost:1421'
const SAVE_INTERVAL = 10_000

const audio = new Audio()

export const currentTrack = signal<Track | null>(null)
export const isPlaying = signal(false)
export const currentTime = signal(0)
export const duration = signal(0)
export const volume = persistedSignal('lyra:volume', 0.8)
export const playlist = signal<Track[]>([])
export const playIndex = signal(-1)

audio.volume = volume.peek()

export const progress = computed(() =>
  duration.value > 0 ? currentTime.value / duration.value : 0,
)

let lastSaveTs = 0

function saveLastPlayed() {
  const track = currentTrack.value
  if (!track) return

  try {
    localStorage.setItem('lyra:lastPlayed', JSON.stringify({
      filePath: track.filePath,
      time: audio.currentTime,
    }))
  } catch { /* */ }
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
  const err = audio.error
  console.error(`Audio error [${err?.code}]: ${err?.message}`)
  isPlaying.value = false
})

function loadAndPlay(track: Track) {
  currentTrack.value = track
  audio.src = `${AUDIO_SERVER}/stream?path=${encodeURIComponent(track.filePath)}`
  audio.play().catch(e => console.error('Play failed:', e))
  saveLastPlayed()
}

export function playTrack(track: Track, list?: Track[], index?: number) {
  if (list) playlist.value = list
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

  const nextIdx = (playIndex.value + 1) % list.length
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

export function getLastPlayed(): { filePath: string; time: number } | null {
  try {
    const stored = localStorage.getItem('lyra:lastPlayed')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function getAudioStreamUrl(filePath: string) {
  return `${AUDIO_SERVER}/stream?path=${encodeURIComponent(filePath)}`
}

export function getCoverUrl(filePath: string) {
  return `${AUDIO_SERVER}/cover?path=${encodeURIComponent(filePath)}`
}

import { signal, computed } from '@preact/signals-react'
import { persistedSignal } from './persist'
import { rpc } from '@/ipc'
import type { Track, ScanResult } from '@/types/music'

export const tracks = signal<Track[]>([])
export const isScanning = signal(false)
export const scanError = signal<string | null>(null)
export const currentView = persistedSignal<ViewType>('lyra:view', 'artists')
export const selectedFolder = signal<string | null>(null)
export const selectedAlbum = signal<string | null>(null)
export const musicDirs = persistedSignal<string[]>('lyra:musicDirs', [])
export const searchQuery = signal('')

function matchesQuery(t: Track, q: string) {
  return t.title.toLowerCase().includes(q)
    || t.artist.toLowerCase().includes(q)
    || t.album.toLowerCase().includes(q)
}

export const filteredTracks = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return tracks.value
  return tracks.value.filter(t => matchesQuery(t, q))
})

export const folders = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  const map = new Map<string, Track[]>()

  for (const t of tracks.value) {
    const key = t.folder
    const arr = map.get(key)
    if (arr) arr.push(t)
    else map.set(key, [t])
  }

  return [...map.entries()]
    .filter(([name, items]) => {
      if (!q) return true
      if (name.toLowerCase().includes(q)) return true
      return items.some(t => matchesQuery(t, q))
    })
    .map(([name, items]) => ({ name, count: items.length, firstTrack: items[0] }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

export const albums = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  const map = new Map<string, Track[]>()

  for (const t of tracks.value) {
    const key = t.album
    const arr = map.get(key)
    if (arr) arr.push(t)
    else map.set(key, [t])
  }

  return [...map.entries()]
    .filter(([name, items]) => {
      if (!q) return true
      if (name.toLowerCase().includes(q)) return true
      return items.some(t => matchesQuery(t, q))
    })
    .map(([name, items]) => ({
      name,
      artist: items[0].albumArtist || items[0].artist || '',
      year: items[0].year,
      count: items.length,
      firstTrack: items[0],
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

export const albumTracks = computed(() => {
  if (!selectedAlbum.value) return []

  const base = filteredTracks.value
  const album = selectedAlbum.value ?? ''
  return base
    .filter(t => (t.album || '') === album)
    .sort((a, b) => (a.track?.no ?? 0) - (b.track?.no ?? 0))
})

export const displayTracks = computed(() => {
  const base = filteredTracks.value
  if (!selectedFolder.value) return base

  const folder = selectedFolder.value ?? ''
  return base.filter(t => t.folder === folder)
})

export async function detectMusicDirs() {
  try {
    const dir = await rpc.request.getDefaultMusicDir({}) as string
    if (dir) musicDirs.value = [dir]
  } catch (e) {
    console.error('Failed to detect music dir:', e)
  }
}

export async function scanLibrary(dirs: string[]) {
  if (dirs.length === 0) return

  isScanning.value = true
  scanError.value = null

  try {
    const results = await Promise.all(
      dirs.map(dir => rpc.request.scanMusicDir({ dir }) as Promise<ScanResult>),
    )

    const allTracks: Track[] = []
    let total = 0
    let errors = 0

    for (const r of results) {
      allTracks.push(...r.results)
      total += r.total
      errors += r.errors.length
    }

    tracks.value = allTracks
    console.log(`Scanned ${total} files, ${allTracks.length} parsed, ${errors} errors`)
  } catch (e) {
    scanError.value = String(e)
    console.error('Scan failed:', e)
  } finally {
    isScanning.value = false
  }
}

export async function pickAndAddDirs() {
  try {
    const paths = await rpc.request.pickMusicDirs({}) as string[]
    if (!paths?.length) return

    const existing = new Set(musicDirs.value)
    const newDirs = paths.filter(p => !existing.has(p))
    if (newDirs.length === 0) return

    musicDirs.value = [...musicDirs.value, ...newDirs]
    await scanLibrary(musicDirs.value)
  } catch (e) {
    console.error('Pick dirs failed:', e)
  }
}

export async function removeMusicDir(dir: string) {
  musicDirs.value = musicDirs.value.filter(d => d !== dir)
  tracks.value = tracks.value.filter(t => !t.filePath.startsWith(dir))
}

export function selectFolder(folder: string) {
  selectedFolder.value = folder
  currentView.value = 'artist-detail'
}

export function selectAlbum(album: string) {
  selectedAlbum.value = album
  currentView.value = 'album-detail'
}

export function goBack() {
  selectedFolder.value = null
  selectedAlbum.value = null

  const view = currentView.peek()
  if (view === 'artist-detail') currentView.value = 'artists'
  else if (view === 'album-detail') currentView.value = 'albums'
  else currentView.value = 'artists'
}

type ViewType = 'artists' | 'songs' | 'artist-detail' | 'albums' | 'album-detail' | 'settings'

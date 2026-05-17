import { computed } from '@preact/signals-react'
import { persistedSignal } from './persist'

const playlists = persistedSignal<Playlist[]>('lyra:playlists', [])

export const playlistList = computed(() => playlists.value)

export function getPlaylist(id: string): Playlist | undefined {
  return playlists.value.find(p => p.id === id)
}

export function createPlaylist(name: string): Playlist {
  const pl: Playlist = {
    id: crypto.randomUUID(),
    name,
    trackPaths: [],
    createdAt: Date.now(),
  }
  playlists.value = [...playlists.value, pl]
  return pl
}

export function deletePlaylist(id: string) {
  playlists.value = playlists.value.filter(p => p.id !== id)
}

export function renamePlaylist(id: string, name: string) {
  playlists.value = playlists.value.map(p =>
    p.id === id ? { ...p, name } : p,
  )
}

export function addToPlaylist(id: string, filePath: string) {
  playlists.value = playlists.value.map(p => {
    if (p.id !== id) return p
    if (p.trackPaths.includes(filePath)) return p
    return { ...p, trackPaths: [...p.trackPaths, filePath] }
  })
}

export function removeFromPlaylist(id: string, filePath: string) {
  playlists.value = playlists.value.map(p =>
    p.id === id
      ? { ...p, trackPaths: p.trackPaths.filter(t => t !== filePath) }
      : p,
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Playlist = {
  id: string
  name: string
  trackPaths: string[]
  createdAt: number
}

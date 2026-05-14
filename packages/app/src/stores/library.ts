import { signal, computed } from '@preact/signals-react'
import { rpc } from '@/ipc'
import type { Track, ScanResult } from '@/types/music'

export const tracks = signal<Track[]>([])
export const isScanning = signal(false)
export const scanError = signal<string | null>(null)
export const currentView = signal<'artists' | 'songs' | 'artist-detail'>('artists')
export const selectedFolder = signal<string | null>(null)

export const folders = computed(() => {
  const map = new Map<string, Track[]>()

  for (const t of tracks.value) {
    const key = t.folder || '未分类'
    const arr = map.get(key)
    if (arr) arr.push(t)
    else map.set(key, [t])
  }

  return [...map.entries()]
    .map(([name, items]) => ({ name, count: items.length, firstTrack: items[0] }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

export const displayTracks = computed(() => {
  if (!selectedFolder.value) return tracks.value

  const folder = selectedFolder.value === '未分类' ? '' : selectedFolder.value
  return tracks.value.filter(t => t.folder === folder)
})

export async function scanLibrary(dir: string) {
  isScanning.value = true
  scanError.value = null

  try {
    const result = await rpc.request.scanMusicDir({ dir }) as ScanResult
    tracks.value = result.results
    console.log(`Scanned ${result.total} files, ${result.results.length} parsed, ${result.errors.length} errors`)
  } catch (e) {
    scanError.value = String(e)
    console.error('Scan failed:', e)
  } finally {
    isScanning.value = false
  }
}

export function selectFolder(folder: string) {
  selectedFolder.value = folder
  currentView.value = 'artist-detail'
}

export function goBack() {
  selectedFolder.value = null
  currentView.value = 'artists'
}

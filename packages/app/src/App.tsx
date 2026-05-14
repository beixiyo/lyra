import { cn } from 'utils'
import { memo } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { onMounted } from 'hooks'
import { Loader2 } from 'lucide-react'
import {
  currentView, selectedFolder, displayTracks, tracks,
  isScanning, scanError,
  scanLibrary, goBack,
} from '@/stores/library'
import { Sidebar } from '@/components/Sidebar'
import { Player } from '@/components/Player'
import { ArtistsGrid } from '@/components/ArtistsGrid'
import { TrackList } from '@/components/TrackList'

const MUSIC_DIR = '/home/dev/Music'

export const App = memo(() => {
  useSignals()

  onMounted(() => {
    scanLibrary(MUSIC_DIR)
  })

  return (
    <main className="flex h-screen bg-neutral-950 text-white overflow-hidden select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto px-8 py-7 custom-scrollbar">
          <MainContent />
        </div>

        <Player />
      </div>
    </main>
  )
})

const MainContent = memo(() => {
  useSignals()

  if (isScanning.value) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-sm">正在扫描音乐库…</p>
      </div>
    )
  }

  if (scanError.value) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-400">
        <p className="text-sm">扫描失败</p>
        <p className="text-xs text-neutral-600">{scanError.value}</p>
      </div>
    )
  }

  if (tracks.value.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
        暂无音乐
      </div>
    )
  }

  const view = currentView.value

  if (view === 'artists') {
    return <ArtistsGrid />
  }

  if (view === 'artist-detail') {
    return (
      <TrackList
        tracks={displayTracks.value}
        title={selectedFolder.value ?? ''}
        showBack
        onBack={goBack}
      />
    )
  }

  if (view === 'songs') {
    return (
      <TrackList
        tracks={tracks.value}
        title="所有歌曲"
      />
    )
  }

  return null
})

MainContent.displayName = 'MainContent'

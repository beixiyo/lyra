import { memo } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { useTranslation } from 'react-i18next'
import { onMounted } from 'hooks'
import { Loader2, FolderOpen } from 'lucide-react'
import {
  currentView, selectedFolder, selectedAlbum, displayTracks, albumTracks,
  tracks, filteredTracks, isScanning, scanError, searchQuery,
  scanLibrary, goBack, musicDirs, detectMusicDirs, pickAndAddDirs,
} from '@/stores/library'
import { getLastPlayed, restoreTrack } from '@/stores/player'
import { initKeybindings, initGlobalShortcuts } from '@/stores/keybindings'
import { Sidebar } from '@/components/Sidebar'
import { Player } from '@/components/Player'
import { PlayerDetail } from '@/components/PlayerDetail'
import { ArtistsGrid } from '@/components/ArtistsGrid'
import { AlbumsGrid } from '@/components/AlbumsGrid'
import { TrackList } from '@/components/TrackList'
import { SearchBar } from '@/components/SearchBar'
import { Settings } from '@/components/Settings'

export const App = memo(() => {
  useSignals()

  onMounted(async () => {
    initKeybindings()
    initGlobalShortcuts()

    if (musicDirs.value.length === 0) await detectMusicDirs()
    if (musicDirs.value.length === 0) return

    await scanLibrary(musicDirs.value)

    const last = getLastPlayed()
    if (!last) return

    const allTracks = tracks.value
    const idx = allTracks.findIndex(t => t.filePath === last.filePath)
    if (idx !== -1) {
      restoreTrack(allTracks[idx], allTracks, idx, last.time)
    }
  })

  return (
    <main className="flex h-screen bg-bg text-primary overflow-hidden select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {tracks.value.length > 0 && (
          <div className="px-8 pt-5 shrink-0 flex justify-end">
            <SearchBar className="w-64" />
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto px-8 py-5 custom-scrollbar">
          <MainContent />
        </div>

        <Player />
      </div>

      <PlayerDetail />
    </main>
  )
})

App.displayName = 'App'

const MainContent = memo(() => {
  useSignals()
  const { t } = useTranslation()

  if (musicDirs.value.length === 0) {
    return (
      <button
        onClick={pickAndAddDirs}
        className="flex flex-col items-center justify-center h-full gap-3 text-secondary hover:text-primary transition-colors w-full"
      >
        <FolderOpen className="w-10 h-10 text-muted" />
        <p className="text-sm">{t('app.pickMusicDir')}</p>
      </button>
    )
  }

  if (isScanning.value) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-secondary">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-sm">{t('app.scanning')}</p>
      </div>
    )
  }

  if (scanError.value) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-secondary">
        <p className="text-sm">{t('app.scanFailed')}</p>
        <p className="text-xs text-muted">{scanError.value}</p>
      </div>
    )
  }

  if (tracks.value.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted text-sm">
        {t('app.noMusic')}
      </div>
    )
  }

  if (searchQuery.value && filteredTracks.value.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted text-sm">
        {t('app.noSearchResults', { query: searchQuery.value })}
      </div>
    )
  }

  const view = currentView.value

  if (view === 'artists') return <ArtistsGrid />

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

  if (view === 'albums') return <AlbumsGrid />

  if (view === 'album-detail') {
    return (
      <TrackList
        tracks={albumTracks.value}
        title={selectedAlbum.value ?? ''}
        showBack
        onBack={goBack}
      />
    )
  }

  if (view === 'songs') {
    return (
      <TrackList
        tracks={filteredTracks.value}
        title={t('nav.allSongs')}
      />
    )
  }

  if (view === 'settings') return <Settings />

  return null
})

MainContent.displayName = 'MainContent'

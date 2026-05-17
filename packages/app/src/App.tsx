import { memo } from 'react'
import { motion } from 'motion/react'
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
import { Header } from '@/components/Header'
import { Player } from '@/components/Player'
import { PlayerDetail } from '@/components/PlayerDetail'
import { Queue } from '@/components/Queue'
import { TrackContextMenu } from '@/components/TrackContextMenu'
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="flex-1 flex flex-col min-w-0"
      >
        <Header>
          {tracks.value.length > 0 && (
            <SearchBar className="w-64" />
          )}
        </Header>

        <div className="flex-1 min-h-0 overflow-y-auto px-8 py-5 custom-scrollbar">
          <MainContent />
        </div>

        <Player />
      </motion.div>

      <PlayerDetail />
      <Queue />
      <TrackContextMenu />
    </main>
  )
})

App.displayName = 'App'

const MainContent = memo(() => {
  useSignals()
  const { t } = useTranslation()

  if (musicDirs.value.length === 0) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.15 }}
        onClick={pickAndAddDirs}
        className="flex flex-col items-center justify-center h-full gap-3 text-secondary hover:text-primary transition-colors w-full"
      >
        <FolderOpen className="w-10 h-10 text-muted" />
        <p className="text-sm">{t('app.pickMusicDir')}</p>
      </motion.button>
    )
  }

  if (isScanning.value) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center h-full gap-3 text-secondary"
      >
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-sm">{t('app.scanning')}</p>
      </motion.div>
    )
  }

  if (scanError.value) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex flex-col items-center justify-center h-full gap-2 text-secondary"
      >
        <p className="text-sm">{t('app.scanFailed')}</p>
        <p className="text-xs text-muted">{scanError.value}</p>
      </motion.div>
    )
  }

  if (tracks.value.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center h-full text-muted text-sm"
      >
        {t('app.noMusic')}
      </motion.div>
    )
  }

  if (searchQuery.value && filteredTracks.value.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center h-full text-muted text-sm"
      >
        {t('app.noSearchResults', { query: searchQuery.value })}
      </motion.div>
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

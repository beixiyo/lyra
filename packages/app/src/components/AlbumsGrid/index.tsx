import { cn } from 'utils'
import { memo } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useSignals } from '@preact/signals-react/runtime'
import { useLatestCallback } from 'hooks'
import { albums, selectAlbum } from '@/stores/library'
import { CoverArt } from '../CoverArt'

export const AlbumsGrid = memo<AlbumsGridProps>(({ style, className }) => {
  useSignals()
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('flex flex-col', className)}
      style={style}
    >
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="text-[28px] font-bold tracking-tight mb-6"
      >
        {t('nav.albums')}
      </motion.h1>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
        }}
        className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4"
      >
        {albums.value.map(album => (
          <AlbumCard
            key={album.name}
            name={album.name}
            artist={album.artist}
            coverFilePath={album.firstTrack.filePath}
            onSelect={selectAlbum}
          />
        ))}
      </motion.div>
    </motion.div>
  )
})

AlbumsGrid.displayName = 'AlbumsGrid'

const AlbumCard = memo<AlbumCardProps>(({
  name,
  artist,
  coverFilePath,
  onSelect,
}) => {
  const { t } = useTranslation()
  const handleClick = useLatestCallback(() => onSelect(name))

  return (
    <motion.button
      variants={{
        hidden: { opacity: 0, scale: 0.92, y: 15 },
        visible: { opacity: 1, scale: 1, y: 0 },
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 22, mass: 0.8 }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className={cn(
        'flex flex-col items-center gap-3 p-4 rounded-xl transition-colors',
        'hover:bg-overlay/[0.04]',
      )}
    >
      <CoverArt
        filePath={coverFilePath}
        size={140}
        className="rounded-lg"
        iconScale={0.3}
      />

      <div className="text-center w-full">
        <p className="text-[13px] font-medium truncate">{name || t('library.unknownAlbum')}</p>
        <p className="text-[11px] text-muted mt-0.5 truncate">{artist}</p>
      </div>
    </motion.button>
  )
})

AlbumCard.displayName = 'AlbumCard'

export type AlbumsGridProps = {} & React.HTMLAttributes<HTMLElement>

type AlbumCardProps = {
  name: string
  artist: string
  coverFilePath: string
  onSelect: (name: string) => void
}

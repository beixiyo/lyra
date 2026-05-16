import { cn } from 'utils'
import { memo } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useSignals } from '@preact/signals-react/runtime'
import { useLatestCallback } from 'hooks'
import { folders, selectFolder } from '@/stores/library'
import { CoverArt } from '../CoverArt'

export const ArtistsGrid = memo<ArtistsGridProps>(({ style, className }) => {
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
        {t('nav.artists')}
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
        {folders.value.map(folder => (
          <ArtistCard
            key={folder.name}
            name={folder.name}
            count={folder.count}
            coverFilePath={folder.firstTrack.filePath}
            onSelect={selectFolder}
          />
        ))}
      </motion.div>
    </motion.div>
  )
})

ArtistsGrid.displayName = 'ArtistsGrid'

const ArtistCard = memo<ArtistCardProps>(({
  name,
  count,
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
        className="rounded-full"
        iconScale={0.3}
      />

      <div className="text-center w-full">
        <p className="text-[13px] font-medium truncate">{name || t('library.uncategorized')}</p>
        <p className="text-[11px] text-muted mt-0.5">{t('library.trackCount', { count })}</p>
      </div>
    </motion.button>
  )
})

ArtistCard.displayName = 'ArtistCard'

export type ArtistsGridProps = {} & React.HTMLAttributes<HTMLElement>

type ArtistCardProps = {
  name: string
  count: number
  coverFilePath: string
  onSelect: (name: string) => void
}

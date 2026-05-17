import { cn } from 'utils'
import { formatDuration } from 'utils'
import { memo } from 'react'
import { signal } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { useLatestCallback } from 'hooks'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { X, ListMusic } from 'lucide-react'
import {
  playlist, playIndex, isPlaying,
  playTrack, removeFromQueue,
} from '@/stores/player'
import { CoverArt } from '../CoverArt'

export const showQueue = signal(false)

export function toggleQueue() {
  showQueue.value = !showQueue.value
}

export const Queue = memo(() => {
  useSignals()

  const show = showQueue.value
  const list = playlist.value
  const idx = playIndex.value

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className={cn(
            'fixed right-0 top-0 bottom-0 z-40 w-80',
            'flex flex-col',
            'bg-surface/95 backdrop-blur-xl border-l border-line/[0.06]',
          )}
        >
          <QueueHeader count={list.length} />

          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
            {list.length === 0
              ? <EmptyQueue />
              : list.map((track, i) => (
                  <QueueItem
                    key={`${track.filePath}-${i}`}
                    track={track}
                    index={i}
                    isActive={i === idx}
                    isPlaying={isPlaying.value && i === idx}
                  />
                ))
            }
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

Queue.displayName = 'Queue'

const QueueHeader = memo<{ count: number }>(({ count }) => {
  const { t } = useTranslation()

  const handleClose = useLatestCallback(() => {
    showQueue.value = false
  })

  return (
    <div className="flex items-center justify-between px-4 py-4 shrink-0">
      <div className="flex items-center gap-2">
        <ListMusic className="w-4 h-4 text-accent" />
        <h3 className="text-[14px] font-semibold text-primary">{t('queue.title')}</h3>
        <span className="text-[12px] text-muted ml-1">{count}</span>
      </div>

      <button
        onClick={handleClose}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-overlay/[0.08] text-muted hover:text-primary transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
})

QueueHeader.displayName = 'QueueHeader'

const QueueItem = memo<QueueItemProps>(({ track, index, isActive, isPlaying }) => {
  useSignals()

  const handlePlay = useLatestCallback(() => {
    playTrack(track, playlist.value, index)
  })

  const handleRemove = useLatestCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    removeFromQueue(index)
  })

  return (
    <div
      onClick={handlePlay}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer group transition-colors',
        'hover:bg-overlay/[0.05]',
        isActive && 'bg-overlay/[0.06]',
      )}
    >
      <CoverArt filePath={track.filePath} size={36} className="rounded-sm shrink-0" iconScale={0.3} />

      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[13px] truncate',
          isActive ? 'text-accent font-medium' : 'text-primary',
        )}>
          {isPlaying && <span className="mr-1.5">♫</span>}
          {track.title}
        </p>
        <p className="text-[11px] text-muted truncate mt-0.5">{track.artist}</p>
      </div>

      <span className="text-[11px] text-muted tabular-nums shrink-0 mr-1">
        {track.duration ? formatDuration(track.duration) : ''}
      </span>

      <button
        onClick={handleRemove}
        className="w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-overlay/[0.1] text-muted hover:text-primary transition-all shrink-0"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
})

QueueItem.displayName = 'QueueItem'

const EmptyQueue = memo(() => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted">
      <ListMusic className="w-8 h-8 opacity-20" />
      <p className="text-[13px] opacity-50">{t('queue.empty')}</p>
    </div>
  )
})

EmptyQueue.displayName = 'EmptyQueue'

type QueueItemProps = {
  track: import('@/types/music').Track
  index: number
  isActive: boolean
  isPlaying: boolean
}

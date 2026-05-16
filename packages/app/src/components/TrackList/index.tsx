import { cn } from 'utils'
import { formatDuration } from 'utils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSignals } from '@preact/signals-react/runtime'
import { useLatestCallback } from 'hooks'
import { playTrack, currentTrack, isPlaying } from '@/stores/player'
import { CoverArt } from '../CoverArt'
import type { Track } from '@/types/music'

export const TrackList = memo<TrackListProps>(({
  tracks,
  title,
  showBack,
  onBack,
  style,
  className,
}) => {
  useSignals()
  const { t } = useTranslation()

  const handlePlay = useLatestCallback((track: Track, index: number) => {
    playTrack(track, tracks, index)
  })

  return (
    <div
      className={cn('flex flex-col', className)}
      style={style}
    >
      {(title || showBack) && (
        <div className="flex items-center gap-3 mb-6">
          {showBack && (
            <button
              onClick={onBack}
              className="text-accent text-sm hover:underline underline-offset-2"
            >
              {t('trackList.back')}
            </button>
          )}

          {showBack && <span className="text-muted">/</span>}

          {title && (
            <h1 className="text-[28px] font-bold tracking-tight">{title}</h1>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted border-b border-line/[0.06]">
        <span className="w-8 text-center">#</span>
        <span className="w-10 shrink-0" />
        <span className="flex-1">{t('trackList.colTitle')}</span>
        <span className="w-44 hidden sm:block">{t('trackList.colAlbum')}</span>
        <span className="w-16 text-right">{t('trackList.colDuration')}</span>
      </div>

      <div className="flex flex-col">
        {tracks.map((track, i) => (
          <TrackItem
            key={track.filePath}
            track={track}
            index={i}
            isActive={currentTrack.value?.filePath === track.filePath}
            isCurrentPlaying={isPlaying.value && currentTrack.value?.filePath === track.filePath}
            onPlay={handlePlay}
          />
        ))}
      </div>
    </div>
  )
})

TrackList.displayName = 'TrackList'

const TrackItem = memo<TrackItemProps>(({
  track,
  index,
  isActive,
  isCurrentPlaying,
  onPlay,
}) => {
  const handleClick = useLatestCallback(() => onPlay(track, index))

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center gap-4 px-4 py-2.5 text-sm transition-colors text-left',
        'hover:bg-overlay/[0.04]',
        isActive && 'bg-overlay/[0.04]',
      )}
    >
      <span
        className={cn(
          'w-8 text-center tabular-nums text-[13px] shrink-0',
          isActive ? 'text-accent' : 'text-muted',
        )}
      >
        {isCurrentPlaying ? '♫' : index + 1}
      </span>

      <CoverArt
        filePath={track.filePath}
        size={40}
        className="rounded-sm"
        iconScale={0.35}
      />

      <div className="flex-1 min-w-0">
        <p className={cn('truncate text-[13px]', isActive ? 'text-accent' : 'text-primary')}>
          {track.title}
        </p>
        <p className="truncate text-[12px] text-muted mt-0.5">{track.artist}</p>
      </div>

      <span className="w-44 truncate text-[13px] text-muted hidden sm:block">
        {track.album}
      </span>

      <span className="w-16 text-right tabular-nums text-[13px] text-muted">
        {track.duration ? formatDuration(track.duration) : '--:--'}
      </span>
    </button>
  )
})

TrackItem.displayName = 'TrackItem'

export type TrackListProps = {
  tracks: Track[]
  title?: string
  showBack?: boolean
  onBack?: () => void
} & React.HTMLAttributes<HTMLElement>

type TrackItemProps = {
  track: Track
  index: number
  isActive: boolean
  isCurrentPlaying: boolean
  onPlay: (track: Track, index: number) => void
}

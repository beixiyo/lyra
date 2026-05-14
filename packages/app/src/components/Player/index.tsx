import { cn } from 'utils'
import { formatDuration } from 'utils'
import { memo, useRef } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { useLatestCallback } from 'hooks'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import {
  currentTrack, isPlaying, currentTime, duration,
  volume, progress,
  togglePlay, nextTrack, prevTrack, seekTo, setVolume,
} from '@/stores/player'
import { CoverArt } from '../CoverArt'

export const Player = memo<PlayerProps>(({ style, className }) => {
  useSignals()

  const track = currentTrack.value
  if (!track) return null

  return (
    <div
      className={cn(
        'h-20 flex items-center px-5 gap-6 shrink-0',
        'bg-neutral-900/80 backdrop-blur-xl border-t border-white/[0.06]',
        className,
      )}
      style={style}
    >
      <TrackInfo />
      <PlaybackControls />
      <VolumeControl />
    </div>
  )
})

Player.displayName = 'Player'

const TrackInfo = memo(() => {
  useSignals()

  const track = currentTrack.value
  if (!track) return null

  return (
    <div className="flex items-center gap-3 w-56 min-w-0 shrink-0">
      <CoverArt filePath={track.filePath} size={48} className="rounded-md" />

      <div className="min-w-0">
        <p className="text-[13px] font-medium truncate text-neutral-100">
          {track.title}
        </p>
        <p className="text-[12px] text-neutral-500 truncate mt-0.5">
          {track.artist}
        </p>
      </div>
    </div>
  )
})

TrackInfo.displayName = 'TrackInfo'

const PlaybackControls = memo(() => {
  useSignals()

  return (
    <div className="flex-1 flex flex-col items-center gap-1.5 max-w-2xl">
      <div className="flex items-center gap-5">
        <button
          onClick={prevTrack}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <SkipBack className="w-[14px] h-[14px]" fill="currentColor" />
        </button>

        <button
          onClick={togglePlay}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full',
            'bg-white text-neutral-950 hover:scale-105 transition-transform',
          )}
        >
          {isPlaying.value
            ? <Pause className="w-[14px] h-[14px]" fill="currentColor" />
            : <Play className="w-[14px] h-[14px] ml-[2px]" fill="currentColor" />
          }
        </button>

        <button
          onClick={nextTrack}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <SkipForward className="w-[14px] h-[14px]" fill="currentColor" />
        </button>
      </div>

      <ProgressBar />
    </div>
  )
})

PlaybackControls.displayName = 'PlaybackControls'

const ProgressBar = memo(() => {
  useSignals()

  const barRef = useRef<HTMLDivElement>(null)

  const handleSeek = useLatestCallback((e: React.MouseEvent) => {
    const el = barRef.current
    if (!el || !duration.value) return
    const rect = el.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seekTo(ratio * duration.value)
  })

  return (
    <div className="flex items-center gap-2.5 w-full">
      <span className="text-[11px] tabular-nums text-neutral-500 w-10 text-right select-none">
        {formatDuration(currentTime.value)}
      </span>

      <div
        ref={barRef}
        onClick={handleSeek}
        className="flex-1 h-1 bg-white/[0.08] rounded-full cursor-pointer group relative"
      >
        <div
          className="h-full bg-white/50 rounded-full group-hover:bg-rose-500 transition-colors relative"
          style={{ width: `${progress.value * 100}%` }}
        >
          <div
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white',
              'opacity-0 group-hover:opacity-100 transition-opacity shadow-sm',
            )}
          />
        </div>
      </div>

      <span className="text-[11px] tabular-nums text-neutral-500 w-10 select-none">
        {duration.value > 0 ? formatDuration(duration.value) : '--:--'}
      </span>
    </div>
  )
})

ProgressBar.displayName = 'ProgressBar'

const VolumeControl = memo(() => {
  useSignals()

  const barRef = useRef<HTMLDivElement>(null)

  const handleVolumeClick = useLatestCallback((e: React.MouseEvent) => {
    const el = barRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setVolume(ratio)
  })

  const handleToggleMute = useLatestCallback(() => {
    setVolume(volume.value > 0 ? 0 : 0.8)
  })

  return (
    <div className="flex items-center gap-2 w-28 shrink-0">
      <button
        onClick={handleToggleMute}
        className="text-neutral-400 hover:text-white transition-colors"
      >
        {volume.value > 0
          ? <Volume2 className="w-[14px] h-[14px]" />
          : <VolumeX className="w-[14px] h-[14px]" />
        }
      </button>

      <div
        ref={barRef}
        onClick={handleVolumeClick}
        className="flex-1 h-1 bg-white/[0.08] rounded-full cursor-pointer"
      >
        <div
          className="h-full bg-white/50 rounded-full"
          style={{ width: `${volume.value * 100}%` }}
        />
      </div>
    </div>
  )
})

VolumeControl.displayName = 'VolumeControl'

export type PlayerProps = {} & React.HTMLAttributes<HTMLElement>

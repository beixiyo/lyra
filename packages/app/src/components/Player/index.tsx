import { cn } from 'utils'
import { formatDuration } from 'utils'
import { memo, useRef } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { useLatestCallback } from 'hooks'
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX,
  Shuffle, Repeat, Repeat1,
} from 'lucide-react'
import {
  currentTrack, isPlaying, currentTime, duration, volume, progress,
  repeatMode, shuffleMode,
  togglePlay, nextTrack, prevTrack, seekTo, setVolume,
  toggleShuffle, cycleRepeat,
} from '@/stores/player'
import { openPlayerDetail } from '@/stores/lyrics'
import { CoverArt } from '../CoverArt'

// ─── Root bar ─────────────────────────────────────────────────────────────────

export const Player = memo<PlayerProps>(({ style, className }) => {
  useSignals()

  if (!currentTrack.value) return null

  return (
    <div
      className={cn(
        'h-20 flex items-center px-5 gap-6 shrink-0',
        'bg-surface/80 backdrop-blur-xl border-t border-line/[0.06]',
        className,
      )}
      style={style}
    >
      <TrackInfo />
      <PlaybackControls />
      <RightControls />
    </div>
  )
})

Player.displayName = 'Player'

// ─── Track info ───────────────────────────────────────────────────────────────

const TrackInfo = memo(() => {
  useSignals()

  const track = currentTrack.value
  if (!track) return null

  return (
    <div
      onClick={openPlayerDetail}
      className="flex items-center gap-3 w-56 min-w-0 shrink-0 cursor-pointer group"
    >
      <CoverArt filePath={track.filePath} size={48} className="rounded-md" />

      <div className="min-w-0">
        <p className="text-[13px] font-medium truncate text-primary group-hover:text-accent transition-colors">
          {track.title}
        </p>
        <p className="text-[12px] text-muted truncate mt-0.5">
          {track.artist}
        </p>
      </div>
    </div>
  )
})

TrackInfo.displayName = 'TrackInfo'

// ─── Centre playback controls ─────────────────────────────────────────────────

export const PlaybackControls = memo(() => {
  useSignals()

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-1.5">

      <div className="flex items-center gap-5">
        {/* Shuffle */}
        <ModeButton active={shuffleMode.value} onClick={toggleShuffle} title="Shuffle">
          <Shuffle className="w-[13px] h-[13px]" />
        </ModeButton>

        {/* Previous */}
        <button
          onClick={prevTrack}
          className="text-secondary hover:text-primary transition-colors"
        >
          <SkipBack className="w-[14px] h-[14px]" fill="currentColor" />
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full',
            'bg-primary text-bg hover:scale-105 transition-transform',
          )}
        >
          {isPlaying.value
            ? <Pause className="w-[14px] h-[14px]" fill="currentColor" />
            : <Play className="w-[14px] h-[14px] ml-[2px]" fill="currentColor" />
          }
        </button>

        {/* Next */}
        <button
          onClick={nextTrack}
          className="text-secondary hover:text-primary transition-colors"
        >
          <SkipForward className="w-[14px] h-[14px]" fill="currentColor" />
        </button>

        {/* Repeat */}
        <RepeatButton />
      </div>

      <ProgressBar />
    </div>
  )
})

PlaybackControls.displayName = 'PlaybackControls'

// ─── Repeat button (cycles none → all → one) ──────────────────────────────────

const RepeatButton = memo(() => {
  useSignals()
  const mode = repeatMode.value

  return (
    <ModeButton active={mode !== 'none'} onClick={cycleRepeat} title={`Repeat: ${mode}`}>
      {mode === 'one'
        ? <Repeat1 className="w-[13px] h-[13px]" />
        : <Repeat className="w-[13px] h-[13px]" />
      }
    </ModeButton>
  )
})

RepeatButton.displayName = 'RepeatButton'

// ─── Reusable mode toggle button ──────────────────────────────────────────────

const ModeButton = memo<ModeButtonProps>(({ active, onClick, title, children }) => (
  <button
    onClick={onClick}
    title={title}
    className={cn(
      'relative flex items-center justify-center transition-colors',
      active ? 'text-accent' : 'text-muted hover:text-secondary',
    )}
  >
    {children}
    {active && (
      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
    )}
  </button>
))

ModeButton.displayName = 'ModeButton'

// ─── Progress bar ─────────────────────────────────────────────────────────────

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
      <span className="text-[11px] tabular-nums text-muted w-10 text-right select-none">
        {formatDuration(currentTime.value)}
      </span>

      <div
        ref={barRef}
        onClick={handleSeek}
        className="flex-1 h-1 bg-overlay/[0.08] rounded-full cursor-pointer group relative"
      >
        <div
          className="h-full bg-overlay/50 group-hover:bg-accent rounded-full transition-colors relative"
          style={{ width: `${progress.value * 100}%` }}
        >
          <div className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary',
            'opacity-0 group-hover:opacity-100 transition-opacity shadow-sm',
          )} />
        </div>
      </div>

      <span className="text-[11px] tabular-nums text-muted w-10 select-none">
        {duration.value > 0 ? formatDuration(duration.value) : '--:--'}
      </span>
    </div>
  )
})

ProgressBar.displayName = 'ProgressBar'

// ─── Right controls (volume + lyrics) ────────────────────────────────────────

const RightControls = memo(() => (
  <div className="flex items-center gap-3 shrink-0">
    <VolumeControl />
  </div>
))

RightControls.displayName = 'RightControls'

// ─── Volume control ───────────────────────────────────────────────────────────

export const VolumeControl = memo(() => {
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
    <div className="flex items-center gap-2 w-28">
      <button
        onClick={handleToggleMute}
        className="text-secondary hover:text-primary transition-colors"
      >
        {volume.value > 0
          ? <Volume2 className="w-[14px] h-[14px]" />
          : <VolumeX className="w-[14px] h-[14px]" />
        }
      </button>

      <div
        ref={barRef}
        onClick={handleVolumeClick}
        className="flex-1 h-1 bg-overlay/[0.08] rounded-full cursor-pointer"
      >
        <div
          className="h-full bg-overlay/50 rounded-full"
          style={{ width: `${volume.value * 100}%` }}
        />
      </div>
    </div>
  )
})

VolumeControl.displayName = 'VolumeControl'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PlayerProps = {} & React.HTMLAttributes<HTMLElement>

type ModeButtonProps = {
  active: boolean
  onClick: () => void
  title: string
} & React.PropsWithChildren

import { cn } from 'utils'
import { formatDuration } from 'utils'
import { memo, useRef, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useSignals } from '@preact/signals-react/runtime'
import { useLatestCallback } from 'hooks'
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX,
  Shuffle, Repeat, Repeat1,
  ListMusic, Heart,
} from 'lucide-react'
import {
  currentTrack, isPlaying, currentTime, duration, volume, progress,
  repeatMode, shuffleMode,
  togglePlay, nextTrack, prevTrack, seekTo, setVolume,
  toggleShuffle, cycleRepeat,
} from '@/stores/player'
import { openPlayerDetail } from '@/stores/lyrics'
import { isFavorite, toggleFavorite } from '@/stores/favorites'
import { toggleQueue } from '../Queue'
import { CoverArt } from '../CoverArt'

// ─── Root bar ─────────────────────────────────────────────────────────────────

export const Player = memo<PlayerProps>(({ style, className }) => {
  useSignals()

  if (!currentTrack.value) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24, mass: 0.9 }}
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
    </motion.div>
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
            'bg-primary text-bg',
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

// ─── Progress bar (with drag) ─────────────────────────────────────────────────

const ProgressBar = memo(() => {
  useSignals()

  const barRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [dragRatio, setDragRatio] = useState(0)

  const getRatio = useLatestCallback((clientX: number) => {
    const el = barRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  })

  const handleMouseDown = useLatestCallback((e: React.MouseEvent) => {
    if (!duration.value) return
    const ratio = getRatio(e.clientX)
    setDragging(true)
    setDragRatio(ratio)
  })

  useEffect(() => {
    if (!dragging) return

    const handleMove = (e: MouseEvent) => {
      setDragRatio(getRatio(e.clientX))
    }

    const handleUp = (e: MouseEvent) => {
      const ratio = getRatio(e.clientX)
      seekTo(ratio * duration.value)
      setDragging(false)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
  }, [dragging])

  const displayRatio = dragging ? dragRatio : progress.value
  const displayTime = dragging ? dragRatio * duration.value : currentTime.value

  return (
    <div className="flex items-center gap-2.5 w-full">
      <span className="text-[11px] tabular-nums text-secondary w-10 text-right select-none">
        {formatDuration(displayTime)}
      </span>

      <div
        ref={barRef}
        onMouseDown={handleMouseDown}
        className="flex-1 h-1 bg-overlay/[0.08] rounded-full cursor-pointer group relative"
      >
        <div
          className={cn(
            'h-full rounded-full relative',
            dragging ? 'bg-accent' : 'bg-overlay/50 group-hover:bg-accent',
            !dragging && 'transition-colors',
          )}
          style={{ width: `${displayRatio * 100}%` }}
        >
          <div className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-sm',
            dragging ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100',
            'transition-opacity',
          )} />
        </div>
      </div>

      <span className="text-[11px] tabular-nums text-secondary w-10 select-none">
        {duration.value > 0 ? formatDuration(duration.value) : '--:--'}
      </span>
    </div>
  )
})

ProgressBar.displayName = 'ProgressBar'

// ─── Right controls (like + volume + queue) ──────────────────────────────────

const RightControls = memo(() => {
  useSignals()

  const track = currentTrack.value
  const liked = track ? isFavorite(track.title) : false

  const handleToggleFavorite = useLatestCallback(() => {
    if (!track) return
    toggleFavorite(track.title)
  })

  return (
    <div className="flex items-center gap-3 shrink-0">
      <button
        onClick={handleToggleFavorite}
        className={cn(
          'transition-colors',
          liked ? 'text-accent' : 'text-muted hover:text-secondary',
        )}
        title="Like"
      >
        <Heart className="w-[14px] h-[14px]" fill={liked ? 'currentColor' : 'none'} />
      </button>

      <VolumeControl />

      <button
        onClick={toggleQueue}
        className="text-muted hover:text-secondary transition-colors"
        title="Queue"
      >
        <ListMusic className="w-[14px] h-[14px]" />
      </button>
    </div>
  )
})

RightControls.displayName = 'RightControls'

// ─── Volume control (with drag) ───────────────────────────────────────────────

export const VolumeControl = memo(() => {
  useSignals()

  const barRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [dragValue, setDragValue] = useState(0)

  const getRatio = useLatestCallback((clientX: number) => {
    const el = barRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  })

  const handleMouseDown = useLatestCallback((e: React.MouseEvent) => {
    const ratio = getRatio(e.clientX)
    setDragging(true)
    setDragValue(ratio)
    setVolume(ratio)
  })

  useEffect(() => {
    if (!dragging) return

    const handleMove = (e: MouseEvent) => {
      const ratio = getRatio(e.clientX)
      setDragValue(ratio)
      setVolume(ratio)
    }

    const handleUp = () => {
      setDragging(false)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
  }, [dragging])

  const handleToggleMute = useLatestCallback(() => {
    setVolume(volume.value > 0 ? 0 : 0.8)
  })

  const displayValue = dragging ? dragValue : volume.value

  return (
    <div className="flex items-center gap-2 w-28">
      <button
        onClick={handleToggleMute}
        className="text-secondary hover:text-primary transition-colors"
      >
        {displayValue > 0
          ? <Volume2 className="w-[14px] h-[14px]" />
          : <VolumeX className="w-[14px] h-[14px]" />
        }
      </button>

      <div
        ref={barRef}
        onMouseDown={handleMouseDown}
        className="flex-1 h-1 bg-overlay/[0.08] rounded-full cursor-pointer group relative"
      >
        <div
          className={cn(
            'h-full rounded-full relative',
            dragging ? 'bg-accent' : 'bg-overlay/50 group-hover:bg-accent',
            !dragging && 'transition-colors',
          )}
          style={{ width: `${displayValue * 100}%` }}
        >
          <div className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary shadow-sm',
            dragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            'transition-opacity',
          )} />
        </div>
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

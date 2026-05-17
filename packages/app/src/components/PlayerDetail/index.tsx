import { cn } from 'utils'
import { memo, useState } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { ChevronDown, Music2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Track } from '@/types/music'
import { currentTrack, getCoverUrl, isPlaying } from '@/stores/player'
import { showPlayerDetail, closePlayerDetail, parsedLyrics } from '@/stores/lyrics'
import { PlaybackControls, VolumeControl } from '../Player'
import { LrcView, PlainView } from '../Lyrics'
import { BlurBgImg } from 'comps'

// ─── Overlay ──────────────────────────────────────────────────────────────────

export const PlayerDetail = memo(() => {
  useSignals()

  const show = showPlayerDetail.value
  const track = currentTrack.value

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col',
        'transition-transform duration-500 ease-[cubic-bezier(.32,.72,0,1)]',
        show ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      {/* Ambient blur background */}
      {track && (
        <BlurBgImg
          img={getCoverUrl(track.filePath)}
          blur="80px"
          showForeground={false}
          flow
          className="absolute inset-0"
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-bg/80" />

      {/* Header */}
      <div className="relative z-10 h-14 flex items-center px-6 shrink-0">
        <button
          onClick={closePlayerDetail}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full',
            'bg-overlay/20 hover:bg-overlay/30',
            'text-primary',
            'transition-colors backdrop-blur-sm',
          )}
          aria-label="Close"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="relative z-10 flex-1 flex min-h-0 px-12 pb-10 gap-12">
        <TrackSection track={track} />

        <div className="w-px bg-line/[0.06] self-stretch shrink-0" />

        <LyricsSection />
      </div>
    </div>
  )
})

PlayerDetail.displayName = 'PlayerDetail'

// ─── Left: cover + info + controls ───────────────────────────────────────────

const TrackSection = memo<{ track: ReturnType<typeof currentTrack.peek> }>(({ track }) => {
  useSignals()
  const [hovered, setHovered] = useState(false)

  return (
  <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-xs mx-auto w-full">
    <div
      className="w-full aspect-square rounded-full shadow-2xl overflow-hidden animate-[spin_30s_linear_infinite]"
      style={{ animationPlayState: isPlaying.value && !hovered ? 'running' : 'paused' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {track
        ? <img
            src={getCoverUrl(track.filePath)}
            alt="Cover"
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        : <div className="w-full h-full bg-raised/80 flex items-center justify-center">
            <Music2 className="w-16 h-16 text-muted opacity-30" />
          </div>
      }
    </div>

    <div
      className="w-full text-center space-y-1"
      style={{ textShadow: '0 1px 4px rgba(0,0,0,0.15), 0 0 12px rgba(0,0,0,0.1)' }}
    >
      <h2 className="text-[19px] font-semibold text-primary truncate leading-snug">
        {track?.title ?? '—'}
      </h2>
      <p className="text-[14px] text-secondary truncate">{track?.artist}</p>
      {track?.album && (
        <p className="text-[12px] text-secondary truncate">{track.album}</p>
      )}
    </div>

    {track && <AudioInfo track={track} />}

    <div className="w-full space-y-3">
      <PlaybackControls />
      <div className="flex justify-center pt-1">
        <div className="w-36">
          <VolumeControl />
        </div>
      </div>
    </div>
  </div>
  )
})

TrackSection.displayName = 'TrackSection'

// ─── Right: lyrics ────────────────────────────────────────────────────────────

const LyricsSection = memo(() => {
  useSignals()
  const { t } = useTranslation()
  const parsed = parsedLyrics.value

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted shrink-0 pb-3 border-b border-line/[0.06] mb-4">
        {t('lyrics.title')}
      </p>

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2">
        {!parsed
          ? <NoLyricsInline />
          : parsed.type === 'lrc'
            ? <LrcView lines={parsed.lines} />
            : <PlainView text={parsed.text} />
        }
      </div>
    </div>
  )
})

LyricsSection.displayName = 'LyricsSection'

// ─── Audio metadata badges ───────────────────────────────────────────────────

function formatBitrate(bps: number): string {
  return bps >= 1000 ? `${Math.round(bps / 1000)} kbps` : `${bps} bps`
}

function formatSampleRate(hz: number): string {
  return hz >= 1000 ? `${(hz / 1000).toFixed(1).replace(/\.0$/, '')} kHz` : `${hz} Hz`
}

const AudioInfo = memo<{ track: Track }>(({ track }) => {
  const { t } = useTranslation()

  const tags: { text: string; accent?: boolean }[] = []

  const codec = track.codec || track.container
  if (codec) tags.push({ text: codec.toUpperCase() })
  if (track.bitrate) tags.push({ text: formatBitrate(track.bitrate) })
  if (track.sampleRate) tags.push({ text: formatSampleRate(track.sampleRate) })
  if (track.bitsPerSample) tags.push({ text: `${track.bitsPerSample}-bit` })
  if (track.lossless) tags.push({ text: t('audioInfo.lossless'), accent: true })

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {tags.map(tag => (
        <span
          key={tag.text}
          className={cn(
            'px-2 py-0.5 rounded-md text-[11px] backdrop-blur-sm',
            tag.accent
              ? 'bg-accent/15 text-accent border border-accent/20'
              : 'bg-overlay/[0.08] text-secondary',
          )}
        >
          {tag.text}
        </span>
      ))}
    </div>
  )
})

AudioInfo.displayName = 'AudioInfo'

// ─── Empty state (inline, no icon centering) ──────────────────────────────────

const NoLyricsInline = memo(() => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted">
      <Music2 className="w-6 h-6 opacity-30" />
      <p className="text-[13px] opacity-50">{t('lyrics.noLyrics')}</p>
    </div>
  )
})

NoLyricsInline.displayName = 'NoLyricsInline'

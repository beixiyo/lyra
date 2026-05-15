import { cn } from 'utils'
import { memo } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { ChevronDown, Music2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { currentTrack, getCoverUrl } from '@/stores/player'
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
    <BlurBgImg
      img={track ? getCoverUrl(track.filePath) : ''}
      blur="80px"
      className={cn(
        'fixed inset-0 z-50',
        'transition-transform duration-500 ease-[cubic-bezier(.32,.72,0,1)]',
        show ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      {/* Dark overlay to keep content legible */}
      <div className="absolute inset-0 bg-bg/80" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Header */}
        <div className="h-14 flex items-center px-6 shrink-0">
          <button
            onClick={closePlayerDetail}
            className="text-muted hover:text-primary transition-colors p-1 -ml-1 rounded-lg"
            aria-label="Close"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex min-h-0 px-12 pb-10 gap-12">
          <TrackSection track={track} />

          <div className="w-px bg-line/[0.06] self-stretch shrink-0" />

          <LyricsSection />
        </div>
      </div>
    </BlurBgImg>
  )
})

PlayerDetail.displayName = 'PlayerDetail'

// ─── Left: cover + info + controls ───────────────────────────────────────────

const TrackSection = memo<{ track: ReturnType<typeof currentTrack.peek> }>(({ track }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-xs mx-auto w-full">
    <div className="w-full rounded-2xl shadow-2xl overflow-hidden">
      {track
        ? <img
            src={getCoverUrl(track.filePath)}
            alt="Cover"
            className="w-full aspect-square object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        : <div className="w-full aspect-square bg-raised/80 flex items-center justify-center">
            <Music2 className="w-16 h-16 text-muted opacity-30" />
          </div>
      }
    </div>

    <div className="w-full text-center space-y-1">
      <h2 className="text-[19px] font-semibold text-primary truncate leading-snug">
        {track?.title ?? '—'}
      </h2>
      <p className="text-[14px] text-secondary truncate">{track?.artist}</p>
      {track?.album && (
        <p className="text-[12px] text-muted truncate">{track.album}</p>
      )}
    </div>

    <div className="w-full space-y-3">
      <PlaybackControls />
      <div className="flex justify-center pt-1">
        <div className="w-36">
          <VolumeControl />
        </div>
      </div>
    </div>
  </div>
))

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

import { cn, formatDuration } from 'utils'
import { memo, useLayoutEffect, useRef } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { useSignal } from '@preact/signals-react'
import { useTranslation } from 'react-i18next'
import { Music2 } from 'lucide-react'
import { currentTrack, seekTo } from '@/stores/player'
import { parsedLyrics, activeLyricIndex } from '@/stores/lyrics'
import { useInsertStyle } from 'hooks'
import type { LyricLine } from '@/utils/lrc'

const LYRIC_ANCHOR_CSS = `
  .lyric-row:hover {
    anchor-name: --current-lyric;
  }

  .lyric-time-badge {
    position: fixed;
    position-anchor: --current-lyric;
    top: anchor(center);
    transform: translateY(-50%);
    right: 1.25rem;
    opacity: 0;
    pointer-events: none;
    user-select: none;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--color-surface) 90%, transparent);
    color: color-mix(in srgb, var(--color-primary) 80%, transparent);
    transition: opacity 300ms ease-in-out, top 120ms ease-out;
    z-index: 10;
  }

  .lyrics-container:has(.lyric-row:hover) .lyric-time-badge {
    opacity: 1;
  }
`

// ─── Public panel ─────────────────────────────────────────────────────────────

export const LyricsPanel = memo<LyricsPanelProps>(({ className, style }) => {
  useSignals()
  const { t } = useTranslation()

  const track = currentTrack.value
  const parsed = parsedLyrics.value

  if (!track) return null

  return (
    <aside
      className={cn(
        'w-72 shrink-0 flex flex-col',
        'border-l border-line/[0.06] bg-surface/40 backdrop-blur-xl',
        className,
      )}
      style={style}
    >
      <div className="px-5 pt-5 pb-3 shrink-0 border-b border-line/[0.06]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {t('lyrics.title')}
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-5 py-4">
        {!parsed
          ? <NoLyrics />
          : parsed.type === 'lrc'
            ? <LrcView lines={parsed.lines} />
            : <PlainView text={parsed.text} />
        }
      </div>
    </aside>
  )
})

LyricsPanel.displayName = 'LyricsPanel'

// ─── LRC synced view ──────────────────────────────────────────────────────────

export const LrcView = memo<{ lines: LyricLine[] }>(({ lines }) => {
  useSignals()
  useInsertStyle(LYRIC_ANCHOR_CSS)

  const activeIdx = activeLyricIndex.value
  const lineRefs = useRef<(HTMLElement | null)[]>([])
  const hoveredTime = useSignal<number | null>(null)

  useLayoutEffect(() => {
    const el = lineRefs.current[activeIdx]
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIdx])

  return (
    <div className="lyrics-container flex flex-col gap-0.5">
      {lines.map((line, i) => (
        <div
          key={i}
          ref={el => { lineRefs.current[i] = el as HTMLElement | null }}
          onClick={() => seekTo(line.time)}
          onMouseEnter={() => { hoveredTime.value = line.time }}
          className="lyric-row flex items-center cursor-pointer"
        >
          <p
            className={cn(
              'flex-1 py-1.5 leading-relaxed break-words text-center',
              'transition-all duration-[600ms] ease-out origin-center',
              i === activeIdx
                ? 'text-[16px] font-semibold text-primary scale-[1.06]'
                : 'text-[14px] text-secondary scale-100 hover:text-primary/70',
            )}
          >
            {line.text}
          </p>
        </div>
      ))}

      <span className="lyric-time-badge">
        {hoveredTime.value !== null ? formatDuration(hoveredTime.value) : ''}
      </span>
    </div>
  )
})

LrcView.displayName = 'LrcView'

// ─── Plain text view ──────────────────────────────────────────────────────────

export const PlainView = memo<{ text: string }>(({ text }) => (
  <p className="text-[14px] leading-relaxed text-secondary whitespace-pre-wrap">
    {text}
  </p>
))

PlainView.displayName = 'PlainView'

// ─── Empty state ─────────────────────────────────────────────────────────────

export const NoLyrics = memo(() => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-muted">
      <Music2 className="w-7 h-7 opacity-40" />
      <p className="text-[13px] opacity-50">{t('lyrics.noLyrics')}</p>
    </div>
  )
})

NoLyrics.displayName = 'NoLyrics'

// ─── Types ────────────────────────────────────────────────────────────────────

export type LyricsPanelProps = {} & React.HTMLAttributes<HTMLElement>

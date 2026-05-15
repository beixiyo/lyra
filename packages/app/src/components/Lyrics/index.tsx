import { cn } from 'utils'
import { memo, useLayoutEffect, useRef } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { useTranslation } from 'react-i18next'
import { Music2 } from 'lucide-react'
import { currentTrack } from '@/stores/player'
import { parsedLyrics, activeLyricIndex } from '@/stores/lyrics'
import type { LyricLine } from '@/utils/lrc'

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

  const activeIdx = activeLyricIndex.value
  const lineRefs = useRef<(HTMLElement | null)[]>([])

  // Scroll active line into view whenever it changes
  useLayoutEffect(() => {
    const el = lineRefs.current[activeIdx]
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIdx])

  return (
    <div className="flex flex-col gap-0.5">
      {lines.map((line, i) => (
        <p
          key={i}
          ref={el => { lineRefs.current[i] = el }}
          className={cn(
            'py-1.5 leading-relaxed cursor-default break-words text-center',
            'transition-all duration-[600ms] ease-out origin-center',
            i === activeIdx
              ? 'text-[16px] font-semibold text-primary scale-[1.06]'
              : 'text-[14px] text-secondary scale-100',
          )}
        >
          {line.text}
        </p>
      ))}
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

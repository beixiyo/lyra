import { memo } from 'react'
import { useSignal } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { cn } from 'utils'
import { KaraokeLine } from './KaraokeLine'
import { ControlBar } from './ControlBar'
import { useLyricsSync } from './useLyricsSync'
import { useDesktopLyricsSettings } from './useSettings'

export const DesktopLyrics = memo(() => {
  useSignals()

  const sync = useLyricsSync()
  const settings = useDesktopLyricsSettings()
  const hovered = useSignal(false)

  const { lines, activeIndex, fillPercent, title, artist, hasLyrics } = sync
  const { fontSize, locked, activeColor, inactiveColor } = settings

  const currentLine = activeIndex >= 0 ? lines[activeIndex] : null
  const nextLine = activeIndex >= 0 && activeIndex < lines.length - 1
    ? lines[activeIndex + 1]
    : null

  const showControls = hovered.value && !locked.value

  return (
    <div
      className={cn(
        'w-full h-full flex flex-col rounded-xl',
        'bg-black/30 backdrop-blur-sm',
        'transition-[background-color] duration-200',
        hovered.value && 'bg-black/50',
        !locked.value && 'electrobun-webkit-app-region-drag cursor-grab active:cursor-grabbing',
      )}
      onMouseEnter={() => { hovered.value = true }}
      onMouseLeave={() => { hovered.value = false }}
      onWheel={(e) => {
        e.preventDefault()
        if (e.deltaY < 0) settings.increaseFontSize()
        else settings.decreaseFontSize()
      }}
    >
      {/* Control bar — fades in on hover */}
      <div
        className="shrink-0 transition-opacity duration-200 electrobun-webkit-app-region-no-drag"
        style={{ opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none' }}
      >
        <ControlBar
          locked={locked.value}
          onToggleLock={settings.toggleLock}
          onFontIncrease={settings.increaseFontSize}
          onFontDecrease={settings.decreaseFontSize}
          onClose={settings.close}
          title={title}
          artist={artist}
        />
      </div>

      {/* Lyrics display */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1 px-6 min-h-0 overflow-hidden">
        {hasLyrics && currentLine ? (
          <>
            <KaraokeLine
              text={currentLine.text}
              fillPercent={fillPercent}
              active
              fontSize={fontSize.value}
              activeColor={activeColor.value}
              inactiveColor={inactiveColor.value}
            />

            {nextLine && (
              <KaraokeLine
                text={nextLine.text}
                fillPercent={0}
                active={false}
                fontSize={fontSize.value}
                activeColor={activeColor.value}
                inactiveColor={inactiveColor.value}
              />
            )}
          </>
        ) : (
          <p
            className="text-white/40 select-none"
            style={{ fontSize: fontSize.value * 0.6 }}
          >
            {title ? `♪ ${title}` : 'Lyra Desktop Lyrics'}
          </p>
        )}
      </div>
    </div>
  )
})

DesktopLyrics.displayName = 'DesktopLyrics'

import { memo, useMemo } from 'react'
import { splitBilingual } from '@/utils/lrc'

export const KaraokeLine = memo<KaraokeLineProps>(({
  text,
  fillPercent,
  active,
  fontSize,
  activeColor,
  inactiveColor,
}) => {
  const bilingual = useMemo(() => splitBilingual(text), [text])
  const fillPct = `${(fillPercent * 100).toFixed(1)}%`

  const gradientStyle = active
    ? {
        background: `linear-gradient(to right, ${activeColor} ${fillPct}, ${inactiveColor} ${fillPct})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      } as React.CSSProperties
    : { color: inactiveColor }

  const baseStyle: React.CSSProperties = {
    fontSize: active ? fontSize : fontSize * 0.72,
    fontWeight: active ? 700 : 500,
    lineHeight: 1.4,
    textShadow: `0 2px 12px rgba(0,0,0,0.5), 0 0 4px rgba(0,0,0,0.3)`,
    transition: 'font-size 0.4s cubic-bezier(0.16,1,0.3,1), font-weight 0.3s, opacity 0.3s',
    opacity: active ? 1 : 0.7,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  }

  if (!bilingual) {
    return (
      <p style={{ ...baseStyle, ...gradientStyle }}>
        {text}
      </p>
    )
  }

  const [latin, cjk] = bilingual
  const subFontSize = active ? fontSize * 0.55 : fontSize * 0.45

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <p style={{ ...baseStyle, ...gradientStyle }}>
        {latin}
      </p>
      <p style={{
        ...baseStyle,
        fontSize: subFontSize,
        fontWeight: active ? 500 : 400,
        opacity: active ? 0.8 : 0.5,
        color: active ? activeColor : inactiveColor,
      }}>
        {cjk}
      </p>
    </div>
  )
})

KaraokeLine.displayName = 'KaraokeLine'

type KaraokeLineProps = {
  text: string
  fillPercent: number
  active: boolean
  fontSize: number
  activeColor: string
  inactiveColor: string
}

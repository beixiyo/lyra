import { memo } from 'react'

const BTN = 'w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/15 active:bg-white/25 transition-colors text-white/80 hover:text-white cursor-pointer'

export const ControlBar = memo<ControlBarProps>(({
  locked,
  onToggleLock,
  onFontIncrease,
  onFontDecrease,
  onClose,
  title,
  artist,
}) => {
  return (
    <div
      className="flex items-center justify-between px-3 h-8 select-none"
      style={{ minHeight: 32 }}
    >
      <div className="flex items-center gap-1">
        <button className={BTN} onClick={onToggleLock} title={locked ? 'Unlock' : 'Lock'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {locked
              ? <>
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </>
              : <>
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </>
            }
          </svg>
        </button>

        <button className={BTN} onClick={onFontDecrease} title="Smaller">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <button className={BTN} onClick={onFontIncrease} title="Larger">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 text-white/50 text-[11px] truncate max-w-[60%]">
        {title && (
          <span className="truncate">
            {artist ? `${artist} — ${title}` : title}
          </span>
        )}
      </div>

      <button className={BTN} onClick={onClose} title="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
})

ControlBar.displayName = 'ControlBar'

type ControlBarProps = {
  locked: boolean
  onToggleLock: () => void
  onFontIncrease: () => void
  onFontDecrease: () => void
  onClose: () => void
  title: string
  artist: string
}

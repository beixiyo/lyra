import { cn } from 'utils'
import { memo, useRef } from 'react'
import { signal } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { useLatestCallback } from 'hooks'
import { useTranslation } from 'react-i18next'
import { ContextMenu } from 'comps'
import type { ContextMenuRef } from 'comps'
import {
  Play, ListPlus, ListEnd, Heart,
} from 'lucide-react'
import { playTrack, playNext, addToQueue } from '@/stores/player'
import { isFavorite, toggleFavorite } from '@/stores/favorites'
import type { Track } from '@/types/music'

const contextTrack = signal<Track | null>(null)
const contextIndex = signal(-1)
const contextList = signal<Track[]>([])

export function openTrackContextMenu(
  event: MouseEvent | React.MouseEvent,
  track: Track,
  list: Track[],
  index: number,
) {
  contextTrack.value = track
  contextIndex.value = index
  contextList.value = list
  trackMenuRef?.open(event as MouseEvent)
}

let trackMenuRef: ContextMenuRef | null = null

export const TrackContextMenu = memo(() => {
  useSignals()
  const { t } = useTranslation()
  const ref = useRef<ContextMenuRef>(null)

  const setRef = useLatestCallback((el: ContextMenuRef | null) => {
    trackMenuRef = el
    ;(ref as any).current = el
  })

  const track = contextTrack.value
  const liked = track ? isFavorite(track.title) : false

  const handlePlay = useLatestCallback(() => {
    if (!track) return
    playTrack(track, contextList.value, contextIndex.value)
  })

  const handlePlayNext = useLatestCallback(() => {
    if (!track) return
    playNext(track)
  })

  const handleAddToQueue = useLatestCallback(() => {
    if (!track) return
    addToQueue(track)
  })

  const handleToggleFavorite = useLatestCallback(() => {
    if (!track) return
    toggleFavorite(track.title)
  })

  return (
    <ContextMenu
      ref={setRef}
      width={180}
      className="py-1.5 bg-surface/95 backdrop-blur-xl border border-line/[0.08]"
    >
      <MenuItem icon={Play} label={t('contextMenu.play')} onClick={handlePlay} />
      <MenuItem icon={ListEnd} label={t('contextMenu.playNext')} onClick={handlePlayNext} />
      <MenuItem icon={ListPlus} label={t('contextMenu.addToQueue')} onClick={handleAddToQueue} />

      <div className="h-px bg-line/[0.06] mx-3 my-1.5" />

      <MenuItem
        icon={Heart}
        label={liked ? t('contextMenu.unlike') : t('contextMenu.like')}
        onClick={handleToggleFavorite}
        active={liked}
      />
    </ContextMenu>
  )
})

TrackContextMenu.displayName = 'TrackContextMenu'

const MenuItem = memo<MenuItemProps>(({ icon: Icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors',
      'hover:bg-overlay/[0.06]',
      active ? 'text-accent' : 'text-primary',
    )}
  >
    <Icon className="w-3.5 h-3.5 shrink-0" fill={active ? 'currentColor' : 'none'} />
    <span>{label}</span>
  </button>
))

MenuItem.displayName = 'MenuItem'

type MenuItemProps = {
  icon: React.ComponentType<{ className?: string; fill?: string }>
  label: string
  onClick: () => void
  active?: boolean
}

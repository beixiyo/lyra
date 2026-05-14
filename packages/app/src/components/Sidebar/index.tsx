import { cn } from 'utils'
import { memo } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { useTranslation } from 'react-i18next'
import { useLatestCallback } from 'hooks'
import { Disc3, Users, ListMusic, Disc, Settings } from 'lucide-react'
import { currentView, goBack } from '@/stores/library'

const NAV_ITEMS = [
  { id: 'artists' as const, icon: Users, key: 'nav.artists' },
  { id: 'albums' as const, icon: Disc, key: 'nav.albums' },
  { id: 'songs' as const, icon: ListMusic, key: 'nav.allSongs' },
]

export const Sidebar = memo<SidebarProps>(({ style, className }) => {
  useSignals()
  const { t } = useTranslation()

  const handleNav = useLatestCallback((id: string) => {
    if (id === 'artists' || id === 'albums') {
      goBack()
      currentView.value = id as typeof currentView.value
    } else {
      currentView.value = id as typeof currentView.value
    }
  })

  return (
    <aside
      className={cn(
        'w-56 h-full flex flex-col shrink-0',
        'bg-neutral-900/40 border-r border-white/[0.06]',
        className,
      )}
      style={style}
    >
      <div className="flex items-center gap-2.5 px-5 pt-7 pb-5">
        <Disc3 className="w-5 h-5 text-rose-500" />
        <span className="text-[15px] font-semibold tracking-wide">Lyra</span>
      </div>

      <nav className="flex-1 px-3">
        <p className="px-2.5 mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          {t('nav.library')}
        </p>

        <div className="space-y-0.5">
          {NAV_ITEMS.map(item => {
            const view = currentView.value
            const active = view === item.id
              || (item.id === 'artists' && view === 'artist-detail')
              || (item.id === 'albums' && view === 'album-detail')

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={cn(
                  'flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-lg text-[13px] transition-colors',
                  active
                    ? 'bg-white/[0.08] text-white font-medium'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]',
                )}
              >
                <item.icon className="w-[16px] h-[16px]" />
                {t(item.key)}
              </button>
            )
          })}
        </div>
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={() => { currentView.value = 'settings' }}
          className={cn(
            'flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-lg text-[13px] transition-colors',
            currentView.value === 'settings'
              ? 'bg-white/[0.08] text-white font-medium'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]',
          )}
        >
          <Settings className="w-[16px] h-[16px]" />
          {t('nav.settings')}
        </button>
      </div>
    </aside>
  )
})

Sidebar.displayName = 'Sidebar'

export type SidebarProps = {} & React.HTMLAttributes<HTMLElement>

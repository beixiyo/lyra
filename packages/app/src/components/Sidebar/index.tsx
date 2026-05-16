import { cn } from 'utils'
import { memo } from 'react'
import { motion } from 'motion/react'
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
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.8 }}
      className={cn(
        'w-56 h-full flex flex-col shrink-0',
        'bg-surface/40 border-r border-line/[0.06]',
        className,
      )}
      style={style}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
        className="flex items-center gap-2.5 px-5 pt-7 pb-5"
      >
        <Disc3 className="w-5 h-5 text-accent" />
        <span className="text-[15px] font-semibold tracking-wide text-primary">Lyra</span>
      </motion.div>

      <nav className="flex-1 px-3">
        <p className="px-2.5 mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
          {t('nav.library')}
        </p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
          }}
          className="space-y-0.5"
        >
          {NAV_ITEMS.map(item => {
            const view = currentView.value
            const active = view === item.id
              || (item.id === 'artists' && view === 'artist-detail')
              || (item.id === 'albums' && view === 'album-detail')

            return (
              <motion.button
                key={item.id}
                variants={{
                  hidden: { opacity: 0, x: -12 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                onClick={() => handleNav(item.id)}
                className={cn(
                  'flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-lg text-[13px] transition-colors',
                  active
                    ? 'bg-overlay/[0.08] text-primary font-medium'
                    : 'text-secondary hover:text-primary hover:bg-overlay/[0.04]',
                )}
              >
                <item.icon className="w-[16px] h-[16px]" />
                {t(item.key)}
              </motion.button>
            )
          })}
        </motion.div>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.35 }}
        className="px-3 pb-4"
      >
        <button
          onClick={() => { currentView.value = 'settings' }}
          className={cn(
            'flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-lg text-[13px] transition-colors',
            currentView.value === 'settings'
              ? 'bg-overlay/[0.08] text-primary font-medium'
              : 'text-secondary hover:text-primary hover:bg-overlay/[0.04]',
          )}
        >
          <Settings className="w-[16px] h-[16px]" />
          {t('nav.settings')}
        </button>
      </motion.div>
    </motion.aside>
  )
})

Sidebar.displayName = 'Sidebar'

export type SidebarProps = {} & React.HTMLAttributes<HTMLElement>

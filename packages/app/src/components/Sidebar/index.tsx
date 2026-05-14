import { cn } from 'utils'
import { memo } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { useLatestCallback } from 'hooks'
import { Disc3, Users, ListMusic, Disc, FolderPlus, X } from 'lucide-react'
import { currentView, goBack, musicDirs, pickAndAddDirs, removeMusicDir } from '@/stores/library'

const NAV_ITEMS = [
  { id: 'artists' as const, label: '艺术家', icon: Users },
  { id: 'albums' as const, label: '专辑', icon: Disc },
  { id: 'songs' as const, label: '所有歌曲', icon: ListMusic },
]

export const Sidebar = memo<SidebarProps>(({ style, className }) => {
  useSignals()

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
        <span className="text-[15px] font-semibold tracking-wide">Music</span>
      </div>

      <nav className="flex-1 px-3">
        <p className="px-2.5 mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          资料库
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
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>

      <DirManager />
    </aside>
  )
})

Sidebar.displayName = 'Sidebar'

const DirManager = memo(() => {
  useSignals()

  const dirs = musicDirs.value

  return (
    <div className="px-3 pb-4">
      <div className="flex items-center justify-between px-2.5 mb-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          目录
        </p>
        <button
          onClick={pickAndAddDirs}
          className="text-neutral-500 hover:text-neutral-200 transition-colors"
          title="添加目录"
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-0.5 max-h-32 overflow-y-auto custom-scrollbar">
        {dirs.map(dir => (
          <div
            key={dir}
            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] text-neutral-500 hover:bg-white/[0.04]"
          >
            <span className="flex-1 truncate" title={dir}>
              {dir.split('/').pop()}
            </span>
            <button
              onClick={() => removeMusicDir(dir)}
              className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-neutral-300 transition-opacity shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
})

DirManager.displayName = 'DirManager'

export type SidebarProps = {} & React.HTMLAttributes<HTMLElement>

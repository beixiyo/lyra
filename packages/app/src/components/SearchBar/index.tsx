import { cn } from 'utils'
import { memo, useRef } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { useLatestCallback } from 'hooks'
import { Search, X } from 'lucide-react'
import { searchQuery } from '@/stores/library'

export const SearchBar = memo<SearchBarProps>(({ style, className }) => {
  useSignals()

  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = useLatestCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    searchQuery.value = e.target.value
  })

  const handleClear = useLatestCallback(() => {
    searchQuery.value = ''
    inputRef.current?.focus()
  })

  return (
    <div
      className={cn('relative flex items-center', className)}
      style={style}
    >
      <Search className="absolute left-2.5 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />

      <input
        ref={inputRef}
        type="text"
        value={searchQuery.value}
        onChange={handleChange}
        placeholder="搜索歌曲、艺术家、专辑…"
        className={cn(
          'w-full pl-8 pr-8 py-1.5 text-[13px]',
          'bg-white/[0.06] rounded-lg border border-transparent',
          'text-neutral-200 placeholder:text-neutral-500',
          'focus:outline-none focus:border-white/[0.1] focus:bg-white/[0.08]',
          'transition-colors',
        )}
      />

      {searchQuery.value && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
})

SearchBar.displayName = 'SearchBar'

export type SearchBarProps = {} & React.HTMLAttributes<HTMLElement>

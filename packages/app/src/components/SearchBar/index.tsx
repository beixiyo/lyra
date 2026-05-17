import { cn } from 'utils'
import { memo, useRef } from 'react'
import { motion } from 'motion/react'
import { useSignals } from '@preact/signals-react/runtime'
import { useLatestCallback } from 'hooks'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { searchQuery } from '@/stores/library'

export const SearchBar = memo<SearchBarProps>(({ style, className }) => {
  useSignals()

  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = useLatestCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    searchQuery.value = e.target.value
  })

  const handleClear = useLatestCallback(() => {
    searchQuery.value = ''
    inputRef.current?.focus()
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28, delay: 0.2 }}
      className={cn('relative flex items-center electrobun-webkit-app-region-no-drag', className)}
      style={style}
    >
      <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />

      <input
        ref={inputRef}
        type="text"
        value={searchQuery.value}
        onChange={handleChange}
        placeholder={t('search.placeholder')}
        className={cn(
          'w-full pl-8 pr-8 py-1.5 text-[13px]',
          'bg-overlay/[0.06] rounded-lg border border-transparent',
          'text-primary placeholder:text-muted',
          'focus:outline-none focus:border-line/[0.1] focus:bg-overlay/[0.08]',
          'transition-colors',
        )}
      />

      {searchQuery.value && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 text-muted hover:text-secondary transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  )
})

SearchBar.displayName = 'SearchBar'

export type SearchBarProps = {} & React.HTMLAttributes<HTMLElement>

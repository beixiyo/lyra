import { useEffect, useState } from 'react'

/**
 * 防抖 state — 值变化后延迟更新
 */
export function useDebounceState<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(timer)
  }, [value, ms])

  return debounced
}

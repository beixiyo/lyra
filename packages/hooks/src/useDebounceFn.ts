import { useEffect, useMemo, useRef } from 'react'
import { debounce } from 'utils'

/**
 * 防抖函数 hook — 组件卸载时自动 cancel
 */
export function useDebounceFn<T extends (...args: any[]) => any>(fn: T, ms = 300) {
  const ref = useRef(fn)
  ref.current = fn

  const debounced = useMemo(
    () => debounce((...args: Parameters<T>) => ref.current(...args), ms),
    [ms],
  )

  useEffect(() => () => debounced.cancel(), [debounced])

  return debounced
}

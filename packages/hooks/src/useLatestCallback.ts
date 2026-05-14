import { useCallback, useRef } from 'react'

/**
 * 替代 useCallback — 返回引用稳定的函数，内部始终调用最新逻辑
 */
export function useLatestCallback<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef(fn)
  ref.current = fn

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(((...args: any[]) => ref.current(...args)) as T, [])
}

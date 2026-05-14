import { useEffect, useMemo, useRef } from 'react'
import { throttle } from 'utils'

/**
 * 节流函数 hook — 组件卸载时自动 cancel
 */
export function useThrottleFn<T extends (...args: any[]) => any>(fn: T, ms = 300) {
  const ref = useRef(fn)
  ref.current = fn

  const throttled = useMemo(
    () => throttle((...args: Parameters<T>) => ref.current(...args), ms),
    [ms],
  )

  useEffect(() => () => throttled.cancel(), [throttled])

  return throttled
}

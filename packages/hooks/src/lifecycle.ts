import { useEffect, useRef } from 'react'

/**
 * 组件挂载后执行，支持 async 函数
 */
export function onMounted(fn: () => void | Promise<void>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fn() }, [])
}

/**
 * 组件卸载时执行
 */
export function onUnmounted(fn: () => void) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => fn, [])
}

/**
 * 跳过首次渲染的 effect
 */
export function useUpdateEffect(fn: () => void | (() => void), deps: any[]) {
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    return fn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

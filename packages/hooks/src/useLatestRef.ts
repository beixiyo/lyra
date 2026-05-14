import { useRef } from 'react'

/**
 * @returns 始终指向最新值的 ref，不触发重渲染
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}

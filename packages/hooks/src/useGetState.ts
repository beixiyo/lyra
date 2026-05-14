import { useCallback, useRef, useState } from 'react'

type SetStateAction<S> = S | ((prev: S) => S)
type GetLatest<S> = () => S
type SetStateFn<S> = ((action: SetStateAction<S>) => void) & { getLatest: GetLatest<S> }

/**
 * useState 增强 — setState 附带 getLatest() 方法
 */
export function useGetState<S>(initialState: S | (() => S)): [S, SetStateFn<S>] {
  const [state, _setState] = useState(initialState)
  const ref = useRef(state)

  const setState = useCallback((action: SetStateAction<S>) => {
    _setState((prev) => {
      const next = typeof action === 'function' ? (action as (prev: S) => S)(prev) : action
      ref.current = next
      return next
    })
  }, []) as SetStateFn<S>

  setState.getLatest = useCallback(() => ref.current, [])

  return [state, setState]
}

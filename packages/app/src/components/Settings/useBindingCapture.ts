import { useEffect } from 'react'
import { useLatestCallback } from 'hooks'
import { setBinding } from '@/stores/keybindings'
import type { ActionId } from '@/stores/keybindings'

const MODIFIER_KEYS = new Set(['Control', 'Alt', 'Shift', 'Meta'])

/**
 * While `listeningAction` is non-null, intercepts the next keydown at capture
 * phase (before the global keybinding handler fires). Escape cancels without
 * saving; any other non-modifier key saves the new binding. Calls `onDone`
 * either way to let the caller clear the listening state.
 */
export function useBindingCapture(
  listeningAction: ActionId | null,
  onDone: () => void,
) {
  const stableDone = useLatestCallback(onDone)

  useEffect(() => {
    if (!listeningAction) return

    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopImmediatePropagation()
      if (MODIFIER_KEYS.has(e.key)) return
      if (e.code !== 'Escape') setBinding(listeningAction, e.code)
      stableDone()
    }

    const handleMouseDown = () => stableDone()

    window.addEventListener('keydown', handleKey, true)
    window.addEventListener('mousedown', handleMouseDown, true)

    return () => {
      window.removeEventListener('keydown', handleKey, true)
      window.removeEventListener('mousedown', handleMouseDown, true)
    }
  }, [listeningAction])
}

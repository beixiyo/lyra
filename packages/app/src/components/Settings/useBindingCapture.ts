import { useEffect } from 'react'
import { useLatestCallback } from 'hooks'
import { setBinding } from '@/stores/keybindings'
import type { ActionId } from '@/stores/keybindings'

const MODIFIER_KEYS = new Set(['Control', 'Alt', 'Shift', 'Meta'])

/**
 * Build a canonical binding string from a KeyboardEvent.
 * Format: [Ctrl+][Shift+][Alt+][Meta+]<code>
 * Example: "Ctrl+Shift+ArrowLeft"
 */
function buildBinding(e: KeyboardEvent): string {
  const parts: string[] = []
  if (e.ctrlKey)  parts.push('Ctrl')
  if (e.shiftKey) parts.push('Shift')
  if (e.altKey)   parts.push('Alt')
  if (e.metaKey)  parts.push('Meta')
  parts.push(e.code)
  return parts.join('+')
}

/**
 * While `listeningAction` is non-null, intercepts the FIRST non-modifier
 * keydown (capture phase, before the global handler fires).
 * - Escape → cancels without saving
 * - Any other key → saves modifier+code combination, then calls onDone
 */
export function useBindingCapture(
  listeningAction: ActionId | null,
  onDone: () => void,
) {
  const stableDone = useLatestCallback(onDone)

  useEffect(() => {
    if (!listeningAction) return

    // Guard against key-repeat firing the handler multiple times before
    // the React effect cleanup has a chance to remove the listener.
    let captured = false

    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopImmediatePropagation()

      // Wait until the user presses a non-modifier key
      if (MODIFIER_KEYS.has(e.key)) return
      if (captured) return
      captured = true

      if (e.code !== 'Escape') setBinding(listeningAction, buildBinding(e))
      stableDone()
    }

    window.addEventListener('keydown', handleKey, true)
    return () => window.removeEventListener('keydown', handleKey, true)
  }, [listeningAction])
}

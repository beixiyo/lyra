import { signal, effect } from '@preact/signals-react'

export function persistedSignal<T>(key: string, defaultValue: T) {
  let initial = defaultValue

  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) initial = JSON.parse(stored)
  } catch { /* corrupt data, use default */ }

  const s = signal<T>(initial)

  effect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(s.value))
    } catch { /* quota exceeded, silently ignore */ }
  })

  return s
}

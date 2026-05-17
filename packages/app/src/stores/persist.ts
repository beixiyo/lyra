import { signal, effect } from '@preact/signals-react'
import localforage from 'localforage'

export const store = localforage.createInstance({ name: 'lyra' })

export function persistedSignal<T>(key: string, defaultValue: T) {
  let initial = defaultValue

  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) initial = JSON.parse(stored)
  } catch { /* corrupt data, use default */ }

  const s = signal<T>(initial)
  let ready = false

  store.getItem<T>(key).then(val => {
    if (val !== null) {
      s.value = val
    } else if (initial !== defaultValue) {
      store.setItem(key, initial)
    }
    ready = true
  }).catch(() => { ready = true })

  effect(() => {
    const val = s.value
    if (!ready) return
    store.setItem(key, val)
  })

  return s
}

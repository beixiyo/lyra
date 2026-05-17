import { computed } from '@preact/signals-react'
import { persistedSignal } from './persist'

export type TitlebarButtonId = 'minimize' | 'maximize' | 'close'

export type TitlebarButtonConfig = {
  id: TitlebarButtonId
  visible: boolean
}

const DEFAULT_BUTTONS: TitlebarButtonConfig[] = [
  { id: 'minimize', visible: true },
  { id: 'maximize', visible: true },
  { id: 'close', visible: true },
]

export const titlebarPosition = persistedSignal<'left' | 'right'>('titlebar-position', 'right')

export const titlebarButtons = persistedSignal<TitlebarButtonConfig[]>('titlebar-buttons', DEFAULT_BUTTONS)

export const visibleButtons = computed(() =>
  titlebarButtons.value.filter(b => b.visible),
)

export function toggleButtonVisible(id: TitlebarButtonId) {
  titlebarButtons.value = titlebarButtons.value.map(b =>
    b.id === id ? { ...b, visible: !b.visible } : b,
  )
}

export function reorderButtons(newOrder: TitlebarButtonId[]) {
  const map = Object.fromEntries(titlebarButtons.value.map(b => [b.id, b]))
  titlebarButtons.value = newOrder.map(id => map[id])
}

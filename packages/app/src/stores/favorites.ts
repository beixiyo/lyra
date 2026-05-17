import { computed } from '@preact/signals-react'
import { persistedSignal } from './persist'

const favoriteSet = persistedSignal<string[]>('lyra:favorites', [])

export const favorites = computed(() => new Set(favoriteSet.value))

export function isFavorite(title: string) {
  return favorites.value.has(title)
}

export function toggleFavorite(title: string) {
  const list = favoriteSet.value
  if (list.includes(title)) {
    favoriteSet.value = list.filter(t => t !== title)
  } else {
    favoriteSet.value = [...list, title]
  }
}

export function addFavorite(title: string) {
  if (!favoriteSet.value.includes(title)) {
    favoriteSet.value = [...favoriteSet.value, title]
  }
}

export function removeFavorite(title: string) {
  favoriteSet.value = favoriteSet.value.filter(t => t !== title)
}

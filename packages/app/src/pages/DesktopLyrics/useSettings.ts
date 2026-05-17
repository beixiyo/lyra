import { useSignal } from '@preact/signals-react'
import { useEffect } from 'react'
import { useLatestCallback } from 'hooks'
import { lyricsRpc } from '@/ipc/lyrics-client'

const STORAGE_KEY = 'lyra:desktop-lyrics-settings'

const FONT_MIN = 18
const FONT_MAX = 56
const FONT_STEP = 2

interface SettingsData {
  fontSize: number
  locked: boolean
  activeColor: string
  inactiveColor: string
}

const DEFAULTS: SettingsData = {
  fontSize: 32,
  locked: false,
  activeColor: '#60a5fa',
  inactiveColor: 'rgba(255, 255, 255, 0.85)',
}

function loadSettings(): SettingsData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULTS, ...JSON.parse(stored) }
  } catch { /* use defaults */ }
  return { ...DEFAULTS }
}

function saveSettings(data: SettingsData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useDesktopLyricsSettings() {
  const initial = loadSettings()
  const fontSize = useSignal(initial.fontSize)
  const locked = useSignal(initial.locked)
  const activeColor = useSignal(initial.activeColor)
  const inactiveColor = useSignal(initial.inactiveColor)

  useEffect(() => {
    saveSettings({
      fontSize: fontSize.value,
      locked: locked.value,
      activeColor: activeColor.value,
      inactiveColor: inactiveColor.value,
    })
  })

  const increaseFontSize = useLatestCallback(() => {
    fontSize.value = Math.min(FONT_MAX, fontSize.value + FONT_STEP)
  })

  const decreaseFontSize = useLatestCallback(() => {
    fontSize.value = Math.max(FONT_MIN, fontSize.value - FONT_STEP)
  })

  const toggleLock = useLatestCallback(() => {
    locked.value = !locked.value
  })

  const close = useLatestCallback(() => {
    lyricsRpc.request.hideLyricsWindow({}).catch(() => {})
  })

  return {
    fontSize,
    locked,
    activeColor,
    inactiveColor,
    increaseFontSize,
    decreaseFontSize,
    toggleLock,
    close,
  }
}

import { effect } from '@preact/signals-react'
import { persistedSignal } from './persist'

export type ThemeId = 'dark' | 'light' | 'nord' | 'rosepine'

/**
 * Semantic CSS custom properties that make up a theme.
 * All keys map 1-to-1 with the `@theme` tokens in index.css.
 */
export type ThemeTokens = {
  '--color-bg': string
  '--color-surface': string
  '--color-raised': string
  '--color-primary': string
  '--color-secondary': string
  '--color-muted': string
  '--color-accent': string
  '--color-overlay': string
  '--color-line': string
}

/** Built-in theme presets */
export const THEMES: Record<ThemeId, { name: string } & ThemeTokens> = {
  dark: {
    name: 'Dark',
    '--color-bg':        '#0a0a0a',
    '--color-surface':   '#171717',
    '--color-raised':    '#262626',
    '--color-primary':   '#fafafa',
    '--color-secondary': '#a3a3a3',
    '--color-muted':     '#525252',
    '--color-accent':    '#f43f5e',
    '--color-overlay':   '#ffffff',
    '--color-line':      '#ffffff',
  },
  light: {
    name: 'Light',
    '--color-bg':        '#f0f0f0',
    '--color-surface':   '#ffffff',
    '--color-raised':    '#e8e8e8',
    '--color-primary':   '#0a0a0a',
    '--color-secondary': '#525252',
    '--color-muted':     '#a3a3a3',
    '--color-accent':    '#f43f5e',
    '--color-overlay':   '#000000',
    '--color-line':      '#000000',
  },
  nord: {
    name: 'Nord',
    '--color-bg':        '#2e3440',
    '--color-surface':   '#3b4252',
    '--color-raised':    '#434c5e',
    '--color-primary':   '#eceff4',
    '--color-secondary': '#d8dee9',
    '--color-muted':     '#4c566a',
    '--color-accent':    '#88c0d0',
    '--color-overlay':   '#ffffff',
    '--color-line':      '#ffffff',
  },
  rosepine: {
    name: 'Rosé Pine',
    '--color-bg':        '#191724',
    '--color-surface':   '#1f1d2e',
    '--color-raised':    '#26233a',
    '--color-primary':   '#e0def4',
    '--color-secondary': '#908caa',
    '--color-muted':     '#403d52',
    '--color-accent':    '#eb6f92',
    '--color-overlay':   '#ffffff',
    '--color-line':      '#ffffff',
  },
}

export const THEME_IDS = Object.keys(THEMES) as ThemeId[]

/** Currently active theme — persisted across sessions */
export const currentTheme = persistedSignal<ThemeId>('lyra:theme', 'dark')

/** Whether album art drives the accent color dynamically */
export const dynamicAccent = persistedSignal('lyra:dynamicAccent', true)

const DARK_THEMES = new Set<ThemeId>(['dark', 'nord', 'rosepine'])

function applyTokens(id: ThemeId, tokens: ThemeTokens) {
  const root = document.documentElement
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value)
  }
  const isDark = DARK_THEMES.has(id)
  root.classList.toggle('dark', isDark)
  root.classList.toggle('light', !isDark)
}

/**
 * Override only the accent token — used for album-art-driven dynamic color.
 * Pass `null` to reset to the current theme's default accent.
 */
export function setAccentColor(color: string | null) {
  const accent = color ?? THEMES[currentTheme.peek()]['--color-accent']
  document.documentElement.style.setProperty('--color-accent', accent)
}

/** Switch active theme and immediately apply all its tokens to :root */
export function applyTheme(id: ThemeId) {
  currentTheme.value = id
}

// Apply theme tokens whenever currentTheme changes (runs immediately on import)
effect(() => {
  applyTokens(currentTheme.value, THEMES[currentTheme.value])
})

import {
  togglePlay, nextTrack, prevTrack,
  setVolume, volume, seekTo, currentTime, duration,
  toggleShuffle, cycleRepeat,
} from './player'
import { toggleLyrics, showPlayerDetail, closePlayerDetail, showLyrics } from './lyrics'
import { currentView, goBack } from './library'
import { persistedSignal } from './persist'

const SEEK_STEP_SEC = 5
const DETAIL_SEEK_STEP = 3
const VOLUME_STEP = 0.05

/** All bindable action identifiers */
export type ActionId =
  | 'togglePlay'
  | 'nextTrack'
  | 'prevTrack'
  | 'volumeUp'
  | 'volumeDown'
  | 'seekForward'
  | 'seekBack'
  | 'toggleMute'
  | 'toggleShuffle'
  | 'cycleRepeat'
  | 'toggleLyrics'
  | 'navBack'
  | 'navArtists'
  | 'navAlbums'
  | 'navSongs'

/**
 * Default keyboard bindings.
 * Values are KeyboardEvent.code strings (layout-independent).
 * Bindings containing Ctrl+Shift+Alt are treated as "global" and respect
 * the globalShortcutsEnabled toggle.
 */
export const DEFAULT_BINDINGS: Record<ActionId, string> = {
  togglePlay:    'Space',
  nextTrack:     'Ctrl+Shift+Alt+ArrowRight',
  prevTrack:     'Ctrl+Shift+Alt+ArrowLeft',
  volumeUp:      'Ctrl+Shift+Alt+ArrowUp',
  volumeDown:    'Ctrl+Shift+Alt+ArrowDown',
  seekForward:   'KeyL',
  seekBack:      'KeyJ',
  toggleMute:    'KeyM',
  toggleShuffle: 'KeyS',
  cycleRepeat:   'KeyR',
  toggleLyrics:  'KeyU',
  navBack:       'Escape',
  navArtists:    'Digit1',
  navAlbums:     'Digit2',
  navSongs:      'Digit3',
}

/**
 * Fixed global shortcut for toggling playback — not user-configurable,
 * active only when globalShortcutsEnabled is true.
 */
const GLOBAL_TOGGLE_PLAY_BINDING = 'Ctrl+Shift+Alt+KeyP'

/** Human-readable label for display in Settings */
export const ACTION_LABELS: Record<ActionId, string> = {
  togglePlay:    'keybindings.togglePlay',
  nextTrack:     'keybindings.nextTrack',
  prevTrack:     'keybindings.prevTrack',
  volumeUp:      'keybindings.volumeUp',
  volumeDown:    'keybindings.volumeDown',
  seekForward:   'keybindings.seekForward',
  seekBack:      'keybindings.seekBack',
  toggleMute:    'keybindings.toggleMute',
  toggleShuffle: 'keybindings.toggleShuffle',
  cycleRepeat:   'keybindings.cycleRepeat',
  toggleLyrics:  'keybindings.toggleLyrics',
  navBack:       'keybindings.navBack',
  navArtists:    'keybindings.navArtists',
  navAlbums:     'keybindings.navAlbums',
  navSongs:      'keybindings.navSongs',
}

const KEY_LABELS: Record<string, string> = {
  Space:      '␣',
  ArrowLeft:  '←',
  ArrowRight: '→',
  ArrowUp:    '↑',
  ArrowDown:  '↓',
  Escape:     'Esc',
  Enter:      '↵',
  Backspace:  '⌫',
  Tab:        '⇥',
}

/**
 * Format a binding string for display.
 * Handles both simple codes ("Space") and modifier combos ("Ctrl+Shift+ArrowLeft").
 */
export function codeToLabel(binding: string): string {
  return binding
    .split('+')
    .map(part => KEY_LABELS[part] ?? part.replace(/^Key/, '').replace(/^Digit/, ''))
    .join('+')
}

/**
 * Returns true when a KeyboardEvent matches a binding string.
 * Modifier presence must match exactly — "ArrowLeft" won't fire if Ctrl is held.
 */
function matchBinding(e: KeyboardEvent, binding: string): boolean {
  const parts = binding.split('+')
  const code  = parts[parts.length - 1]
  const mods  = new Set(parts.slice(0, -1).map(p => p.toLowerCase()))

  return e.code === code
    && e.ctrlKey  === mods.has('ctrl')
    && e.shiftKey === mods.has('shift')
    && e.altKey   === mods.has('alt')
    && e.metaKey  === mods.has('meta')
}

/** Returns true when a binding requires Ctrl+Shift+Alt — treated as "global" */
function isGlobalBinding(binding: string): boolean {
  const mods = new Set(binding.split('+').slice(0, -1).map(p => p.toLowerCase()))
  return mods.has('ctrl') && mods.has('shift') && mods.has('alt')
}

/** Whether the Ctrl+Shift+Alt+* global shortcuts are active */
export const globalShortcutsEnabled = persistedSignal<boolean>('lyra:globalShortcuts', true)

export function toggleGlobalShortcuts() {
  globalShortcutsEnabled.value = !globalShortcutsEnabled.value
}

/** User-overridden bindings — only stores keys that differ from DEFAULT_BINDINGS */
export const customBindings = persistedSignal<Partial<Record<ActionId, string>>>(
  'lyra:keybindings',
  {},
)

/** Effective bindings = defaults merged with user overrides */
export function getEffectiveBindings(): Record<ActionId, string> {
  return { ...DEFAULT_BINDINGS, ...customBindings.peek() }
}

/** Override a single binding */
export function setBinding(action: ActionId, code: string) {
  customBindings.value = { ...customBindings.value, [action]: code }
}

/** Reset a single binding back to its default */
export function resetBinding(action: ActionId) {
  const next = { ...customBindings.value }
  delete next[action]
  customBindings.value = next
}

// ─── Action dispatch ─────────────────────────────────────────────────────────

let muted = false
let preMuteVolume = 0.8

function dispatch(action: ActionId) {
  switch (action) {
    case 'togglePlay':    togglePlay(); break
    case 'nextTrack':     nextTrack(); break
    case 'prevTrack':     prevTrack(); break
    case 'volumeUp':      setVolume(volume.peek() + VOLUME_STEP); break
    case 'volumeDown':    setVolume(volume.peek() - VOLUME_STEP); break
    case 'seekForward':   seekTo(Math.min(currentTime.peek() + SEEK_STEP_SEC, duration.peek())); break
    case 'seekBack':      seekTo(Math.max(currentTime.peek() - SEEK_STEP_SEC, 0)); break
    case 'toggleShuffle': toggleShuffle(); break
    case 'cycleRepeat':   cycleRepeat(); break
    case 'toggleLyrics':  toggleLyrics(); break
    case 'toggleMute': {
      if (muted) {
        setVolume(preMuteVolume)
        muted = false
      } else {
        preMuteVolume = volume.peek() || 0.8
        setVolume(0)
        muted = true
      }
      break
    }
    case 'navBack': {
      if (showPlayerDetail.peek()) { closePlayerDetail(); break }
      if (showLyrics.peek()) { toggleLyrics(); break }
      const view = currentView.peek()
      if (view === 'artist-detail' || view === 'album-detail') goBack()
      break
    }
    case 'navArtists': currentView.value = 'artists'; break
    case 'navAlbums':  currentView.value = 'albums'; break
    case 'navSongs':   currentView.value = 'songs'; break
  }
}

// ─── Global listener ─────────────────────────────────────────────────────────

const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement

  // Never intercept keys when the user is typing
  if (INPUT_TAGS.has(target.tagName)) return
  if (target.isContentEditable) return

  // In player detail: plain left/right seek ±3s instead of their bound actions
  if (showPlayerDetail.peek() && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
    if (e.code === 'ArrowLeft') {
      e.preventDefault()
      seekTo(Math.max(currentTime.peek() - DETAIL_SEEK_STEP, 0))
      return
    }
    if (e.code === 'ArrowRight') {
      e.preventDefault()
      seekTo(Math.min(currentTime.peek() + DETAIL_SEEK_STEP, duration.peek()))
      return
    }
  }

  const globalEnabled = globalShortcutsEnabled.peek()

  // Fixed global shortcut: Ctrl+Shift+Alt+P → togglePlay
  if (globalEnabled && matchBinding(e, GLOBAL_TOGGLE_PLAY_BINDING)) {
    e.preventDefault()
    dispatch('togglePlay')
    return
  }

  const bindings = getEffectiveBindings()

  for (const [actionId, binding] of Object.entries(bindings)) {
    if (matchBinding(e, binding)) {
      if (isGlobalBinding(binding) && !globalEnabled) continue
      e.preventDefault()
      dispatch(actionId as ActionId)
      return
    }
  }
}

/** Call once at app startup to enable keyboard shortcuts */
export function initKeybindings() {
  window.addEventListener('keydown', handleKeydown)
}

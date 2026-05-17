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
const POLL_INTERVAL_MS = 300

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

export const DEFAULT_BINDINGS: Record<ActionId, string> = {
  togglePlay:    'Ctrl+Shift+Alt+KeyP',
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

export function codeToLabel(binding: string): string {
  return binding
    .split('+')
    .map(part => KEY_LABELS[part] ?? part.replace(/^Key/, '').replace(/^Digit/, ''))
    .join('+')
}

/**
 * Convert binding string to Electrobun GlobalShortcut accelerator format.
 * "Ctrl+Shift+Alt+KeyP" → "Control+Shift+Alt+P"
 */
export function bindingToAccelerator(binding: string): string {
  return binding
    .split('+')
    .map(part => {
      if (part === 'Ctrl') return 'Control'
      if (part.startsWith('Key')) return part.slice(3)
      if (part.startsWith('Digit')) return part.slice(5)
      if (part.startsWith('Arrow')) return part.slice(5)
      return part
    })
    .join('+')
}

function matchBinding(e: KeyboardEvent, binding: string): boolean {
  if (!binding) return false

  const parts = binding.split('+')
  const code  = parts[parts.length - 1]
  const mods  = new Set(parts.slice(0, -1).map(p => p.toLowerCase()))

  return e.code === code
    && e.ctrlKey  === mods.has('ctrl')
    && e.shiftKey === mods.has('shift')
    && e.altKey   === mods.has('alt')
    && e.metaKey  === mods.has('meta')
}

// ─── Persisted state ─────────────────────────────────────────────────────────

/** Empty string means unbound */
export const customBindings = persistedSignal<Partial<Record<ActionId, string>>>(
  'lyra:keybindings',
  {},
)

export const globalShortcutActions = persistedSignal<Partial<Record<ActionId, boolean>>>(
  'lyra:globalShortcutActions',
  {},
)

// ─── Binding management ──────────────────────────────────────────────────────

export function getEffectiveBindings(): Record<ActionId, string> {
  return { ...DEFAULT_BINDINGS, ...customBindings.peek() }
}

export function setBinding(action: ActionId, code: string) {
  customBindings.value = { ...customBindings.value, [action]: code }
  syncGlobalShortcuts()
}

export function resetBinding(action: ActionId) {
  const next = { ...customBindings.value }
  delete next[action]
  customBindings.value = next
  syncGlobalShortcuts()
}

export function removeBinding(action: ActionId) {
  if (globalShortcutActions.peek()[action]) {
    const next = { ...globalShortcutActions.peek() }
    delete next[action]
    globalShortcutActions.value = next
  }

  customBindings.value = { ...customBindings.value, [action]: '' }
  syncGlobalShortcuts()
}

// ─── Global shortcut management ──────────────────────────────────────────────
// 通过 Electrobun GlobalShortcut API 注册系统级快捷键。
// 由于 Linux webkit2gtk 下 bun→webview RPC 不通，采用 webview 轮询方案：
//   bun 端: callback 将 action 入队 → webview 端: 每 300ms poll 取走并 dispatch
// 如果 macOS/CEF 下 bun→webview 可用，可改为 rpc.send 直推，去掉轮询。
//
// 用 dynamic import('@/ipc') 而非顶层 import，避免 Electroview 初始化失败
// 导致整个 keybindings 模块加载失败（keydown listener 也不会注册）。

export function toggleActionGlobal(action: ActionId) {
  const current = globalShortcutActions.peek()

  if (current[action]) {
    const next = { ...current }
    delete next[action]
    globalShortcutActions.value = next
  } else {
    globalShortcutActions.value = { ...current, [action]: true }
  }

  syncGlobalShortcuts()
}

async function syncGlobalShortcuts() {
  try {
    const { rpc } = await import('@/ipc')
    await rpc.request.unregisterAllGlobalShortcuts({})

    const bindings = getEffectiveBindings()
    const globals = globalShortcutActions.peek()

    for (const [action, enabled] of Object.entries(globals)) {
      if (!enabled) continue
      const binding = bindings[action as ActionId]
      if (!binding) continue
      await rpc.request.registerGlobalShortcut({
        action,
        accelerator: bindingToAccelerator(binding),
      })
    }
  } catch {
    // RPC not available (pure web dev mode)
  }
}

export async function initGlobalShortcuts() {
  await syncGlobalShortcuts()

  setInterval(async () => {
    try {
      const { rpc } = await import('@/ipc')

      const actions = await rpc.request.pollGlobalShortcutActions({})
      for (const action of actions) {
        dispatch(action as ActionId)
      }

      const trayActions = await rpc.request.pollTrayActions({})
      for (const action of trayActions) {
        if (action === 'togglePlay') dispatch('togglePlay')
        else if (action === 'next') dispatch('nextTrack')
        else if (action === 'prev') dispatch('prevTrack')
      }
    } catch {
      // ignore
    }
  }, POLL_INTERVAL_MS)
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

  if (INPUT_TAGS.has(target.tagName)) return
  if (target.isContentEditable) return

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

  // Space 固定触发 togglePlay，不进 Settings、不可改绑
  if (e.code === 'Space' && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
    e.preventDefault()
    dispatch('togglePlay')
    return
  }

  const bindings = getEffectiveBindings()

  for (const [actionId, binding] of Object.entries(bindings)) {
    if (matchBinding(e, binding)) {
      e.preventDefault()
      dispatch(actionId as ActionId)
      return
    }
  }
}

export function initKeybindings() {
  window.addEventListener('keydown', handleKeydown)
}

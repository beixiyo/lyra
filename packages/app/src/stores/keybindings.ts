import {
  togglePlay, nextTrack, prevTrack,
  setVolume, volume, seekTo, currentTime, duration,
  toggleShuffle, cycleRepeat,
} from './player'
import { toggleLyrics, showPlayerDetail, closePlayerDetail, showLyrics } from './lyrics'
import { currentView, goBack } from './library'

const SEEK_STEP_SEC = 5
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
 */
export const DEFAULT_BINDINGS: Record<ActionId, string> = {
  togglePlay:    'Space',
  nextTrack:     'ArrowRight',
  prevTrack:     'ArrowLeft',
  volumeUp:      'ArrowUp',
  volumeDown:    'ArrowDown',
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

/** Human-readable key name for a KeyboardEvent.code */
export function codeToLabel(code: string): string {
  const map: Record<string, string> = {
    Space: '␣ Space',
    ArrowLeft: '← Left',
    ArrowRight: '→ Right',
    ArrowUp: '↑ Up',
    ArrowDown: '↓ Down',
    Escape: 'Esc',
  }
  if (code in map) return map[code]
  // e.g. 'KeyL' → 'L', 'Digit1' → '1'
  return code.replace(/^Key/, '').replace(/^Digit/, '')
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

  const bindings = DEFAULT_BINDINGS

  for (const [actionId, code] of Object.entries(bindings)) {
    if (e.code === code) {
      // Prevent default browser behaviour (e.g. Space scrolling the page)
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

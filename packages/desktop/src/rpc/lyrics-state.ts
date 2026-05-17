export interface LyricsState {
  trackId: string
  title: string
  artist: string
  lyrics: string | null
  currentTime: number
  duration: number
  isPlaying: boolean
  updatedAt: number
}

const EMPTY_STATE: LyricsState = {
  trackId: '',
  title: '',
  artist: '',
  lyrics: null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  updatedAt: 0,
}

let state: LyricsState = { ...EMPTY_STATE }

export function updateLyricsState(partial: Partial<LyricsState>) {
  const next = { ...state, ...partial, updatedAt: Date.now() }

  // When lyrics is explicitly null but trackId unchanged, keep existing lyrics
  // (main window omits lyrics on periodic pushes to save bandwidth)
  if (partial.lyrics === null && partial.trackId === state.trackId && state.lyrics !== null) {
    next.lyrics = state.lyrics
  }

  // Track changed with no lyrics — clear stored lyrics
  if (partial.trackId && partial.trackId !== state.trackId && partial.lyrics === null) {
    next.lyrics = null
  }

  state = next
}

export function getLyricsState(): LyricsState {
  return state
}

import { getLyricsState, type LyricsState } from './lyrics-state'
import { windowManager, WindowType } from '../window-manager'

export const lyricsRequests = {
  pollLyricsState: (): LyricsState => {
    return getLyricsState()
  },

  hideLyricsWindow: (): boolean => {
    windowManager.hide(WindowType.LYRICS)
    return true
  },
}

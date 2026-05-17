import { BrowserView, type RPCSchema } from 'electrobun/bun'
import { lyricsRequests } from '../rpc/lyrics-handlers'
import { windowManager } from './window-manager'
import { WindowType } from './types'
import type { LyricsState } from '../rpc/lyrics-state'

type LyricsRPC = {
  bun: RPCSchema<{
    requests: {
      pollLyricsState: { params: {}; response: LyricsState }
      hideLyricsWindow: { params: {}; response: boolean }
    }
    messages: {}
  }>
  webview: RPCSchema<{
    requests: {}
    messages: {}
  }>
}

export async function createLyricsWindow() {
  if (windowManager.exists(WindowType.LYRICS)) {
    return windowManager.get(WindowType.LYRICS)
  }

  const rpc = BrowserView.defineRPC<LyricsRPC>({
    maxRequestTime: 10_000,
    handlers: {
      requests: lyricsRequests,
      messages: {},
    },
  })

  return windowManager.create(WindowType.LYRICS, { rpc })
}

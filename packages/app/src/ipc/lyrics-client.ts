import Electrobun, { Electroview } from 'electrobun/view'
import type { lyricsRequests } from 'desktop/rpc/lyrics-handlers'
import type { InferRequests } from './core/types'

type LyricsRPC = {
  bun: {
    requests: InferRequests<typeof lyricsRequests>
    messages: {}
  }
  webview: {
    requests: {}
    messages: {}
  }
}

const rpcInstance = Electroview.defineRPC<LyricsRPC>({
  maxRequestTime: 10_000,
  handlers: {
    requests: {},
    messages: {},
  },
})

const electrobun = new Electrobun.Electroview({ rpc: rpcInstance })

export const lyricsRpc = electrobun.rpc!

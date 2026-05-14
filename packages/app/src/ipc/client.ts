import Electrobun, { Electroview } from 'electrobun/view'
import type { bunRequests, bunMessages } from 'desktop/rpc'
import type { InferRequests, InferMessages } from './core/types'

type AppRPC = {
  bun: {
    requests: InferRequests<typeof bunRequests>
    messages: InferMessages<typeof bunMessages>
  }
  webview: {
    requests: {}
    messages: {}
  }
}

const rpcInstance = Electroview.defineRPC<AppRPC>({
  maxRequestTime: 60_000,
  handlers: {
    requests: {},
    messages: {},
  },
})

export const electrobun = new Electrobun.Electroview({ rpc: rpcInstance })

export const rpc = electrobun.rpc!

import { BrowserView, Tray, type RPCSchema } from 'electrobun/bun'
import type { InferRequests, InferMessages } from 'app/src/ipc/core/types'
import { bunRequests, bunMessages } from './rpc/handlers'
import { setMainWindow } from './rpc/window'
import { pendingTrayActions } from './rpc/tray'
import { windowManager, WindowType } from './window-manager'

type AppRPC = {
  bun: RPCSchema<{
    requests: InferRequests<typeof bunRequests>
    messages: InferMessages<typeof bunMessages>
  }>
  webview: RPCSchema<{
    requests: {}
    messages: {}
  }>
}

const rpc = BrowserView.defineRPC<AppRPC>({
  maxRequestTime: 60_000,
  handlers: {
    requests: bunRequests,
    messages: {
      '*': (name, payload) => {
        console.log(`[RPC message] ${name}:`, payload)
      },
      ...bunMessages,
    },
  },
})

const mainWindow = await windowManager.create(WindowType.MAIN, { rpc })
setMainWindow(mainWindow!)

// ─── System Tray ──────────────────────────────────────────────────────────────

const tray = new Tray({ title: 'Lyra' })

tray.setMenu([
  { label: 'Show Lyra', action: 'show' },
  { type: 'divider' },
  { label: '⏯ Play / Pause', action: 'togglePlay' },
  { label: '⏭ Next', action: 'next' },
  { label: '⏮ Previous', action: 'prev' },
  { type: 'divider' },
  { label: 'Quit', action: 'quit' },
])

tray.on('tray-clicked', (event: any) => {
  const action = event?.data?.action
  switch (action) {
    case 'show':
      mainWindow?.show()
      break
    case 'togglePlay':
    case 'next':
    case 'prev':
      pendingTrayActions.push(action)
      break
    case 'quit':
      tray.remove()
      windowManager.destroyAll()
      break
    default:
      mainWindow?.show()
  }
})

console.log('Lyra app started!')

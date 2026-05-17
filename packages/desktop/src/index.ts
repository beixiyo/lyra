import { BrowserView, BrowserWindow, Tray, Updater, type RPCSchema } from 'electrobun/bun'
import type { InferRequests, InferMessages } from 'app/src/ipc/core/types'
import { bunRequests, bunMessages } from './rpc/handlers'
import { setMainWindow } from './rpc/window'
import { pendingTrayActions } from './rpc/tray'

const DEV_SERVER_PORT = 1420
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`

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

async function getMainViewUrl(): Promise<string> {
  const channel = await Updater.localInfo.channel()

  if (channel === 'dev') {
    try {
      await fetch(DEV_SERVER_URL, { method: 'HEAD' })
      console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`)
      return DEV_SERVER_URL
    } catch {
      console.log('Vite dev server not running. Run "bun run dev" for HMR support.')
    }
  }

  return 'views://mainview/index.html'
}

const url = await getMainViewUrl()

const mainWindow = new BrowserWindow({
  title: 'Electrobun Starter',
  url,
  titleBarStyle: 'hidden',
  frame: {
    width: 1200,
    height: 800,
    x: 200,
    y: 200,
  },
  rpc,
})

setMainWindow(mainWindow)

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
      mainWindow.show()
      break
    case 'togglePlay':
    case 'next':
    case 'prev':
      pendingTrayActions.push(action)
      break
    case 'quit':
      tray.remove()
      mainWindow.close()
      break
    default:
      mainWindow.show()
  }
})


console.log('Electrobun Starter app started!')

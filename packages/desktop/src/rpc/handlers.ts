import { GlobalShortcut } from 'electrobun/bun'
import { mainWindow } from './window'

// Workaround: bun→webview RPC (send/request) 在 Linux webkit2gtk + dev 模式下不通，
// 所以改为 webview 轮询 bun 端的 action 队列。
// macOS 或 CEF renderer 下 bun→webview 可能正常工作，可尝试改为 rpc.send 直推方案。
// 参考: Electrobun 所有双向 RPC 测试都用 renderer:'cef'，webkit2gtk 未覆盖。
// - bun→webview 传输层: https://github.com/blackboardsh/electrobun/blob/main/package/src/bun/core/BrowserView.ts#L306
// - WebSocket 通道:     https://github.com/blackboardsh/electrobun/blob/main/package/src/bun/core/Socket.ts#L173
// - 浏览器端接收:       https://github.com/blackboardsh/electrobun/blob/main/package/src/browser/index.ts#L62
// - RPC 双向测试(仅CEF): https://github.com/blackboardsh/electrobun/blob/main/kitchen/src/tests/rpc.test.ts#L34
const pendingGlobalActions: string[] = []

export const bunRequests = {
  readFile: async ({ path }: { path: string }) => {
    return await Bun.file(path).text()
  },

  getAppVersion: () => {
    return '0.1.0'
  },

  scanMusicDir: async ({ dir }: { dir: string }) => {
    const { scanAndParse } = await import('../music/scanner')
    return await scanAndParse(dir)
  },

  getDefaultMusicDir: async () => {
    const { homedir } = await import('node:os')
    const { existsSync } = await import('node:fs')
    const { join } = await import('node:path')

    const home = homedir()

    const xdgMusic = Bun.env.XDG_MUSIC_DIR
    if (xdgMusic && existsSync(xdgMusic)) return xdgMusic

    const musicDir = join(home, 'Music')
    if (existsSync(musicDir)) return musicDir

    return ''
  },

  pickMusicDirs: async () => {
    const { homedir } = await import('node:os')
    const { Utils } = await (import('electrobun/bun') as Promise<any>)
    return await Utils.openFileDialog({
      startingFolder: homedir(),
      canChooseFiles: false,
      canChooseDirectory: true,
      allowsMultipleSelection: true,
    }) as string[]
  },

  registerGlobalShortcut: ({ action, accelerator }: { action: string, accelerator: string }) => {
    if (GlobalShortcut.isRegistered(accelerator)) {
      GlobalShortcut.unregister(accelerator)
    }
    return GlobalShortcut.register(accelerator, () => {
      pendingGlobalActions.push(action)
    })
  },

  unregisterGlobalShortcut: ({ accelerator }: { accelerator: string }) => {
    return GlobalShortcut.unregister(accelerator)
  },

  unregisterAllGlobalShortcuts: () => {
    GlobalShortcut.unregisterAll()
    pendingGlobalActions.length = 0
    return true
  },

  pollGlobalShortcutActions: () => {
    const actions = [...pendingGlobalActions]
    pendingGlobalActions.length = 0
    return actions
  },

  windowMinimize: () => {
    mainWindow?.minimize()
    return true
  },

  windowMaximize: () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
    return true
  },

  windowClose: () => {
    mainWindow?.close()
    return true
  },
}

export const bunMessages = {
  log: ({ msg }: { msg: string }) => {
    console.log('[WebView]', msg)
  },
}

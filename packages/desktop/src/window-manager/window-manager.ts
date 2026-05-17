import { BrowserWindow, Updater } from 'electrobun/bun'
import { WINDOW_CONFIGS } from './configs'
import { calculatePosition, clampToScreen } from './position'
import { WindowType, type WindowConfig, type WindowCreateOptions } from './types'

const DEV_SERVER_PORT = 1420
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`

let isDev: boolean | null = null

async function checkIsDev(): Promise<boolean> {
  if (isDev !== null) return isDev

  const channel = await Updater.localInfo.channel()
  if (channel !== 'dev') {
    isDev = false
    return false
  }

  try {
    await fetch(DEV_SERVER_URL, { method: 'HEAD' })
    isDev = true
  } catch {
    isDev = false
  }

  return isDev
}

function resolveUrl(config: WindowConfig, dev: boolean): string {
  if (dev) {
    const path = config.devPath ?? ''
    return path
      ? new URL(path, DEV_SERVER_URL).toString()
      : DEV_SERVER_URL
  }

  const htmlPath = config.htmlPath ?? 'index.html'
  return `views://mainview/${htmlPath}`
}

class WindowManager {
  private windows = new Map<WindowType, BrowserWindow>()

  async create(type: WindowType, options: WindowCreateOptions = {}): Promise<BrowserWindow | null> {
    const existing = this.get(type)
    if (existing) {
      existing.activate()
      return existing
    }

    const preset = WINDOW_CONFIGS[type]
    if (!preset) return null

    const config: WindowConfig = { ...preset, ...options.configOverride }
    const { width, height } = clampToScreen(config.width, config.height)
    const { x, y } = calculatePosition(config.position, width, height)
    const dev = await checkIsDev()
    const url = resolveUrl(config, dev)

    const win = new BrowserWindow({
      title: config.title,
      url,
      frame: { x, y, width, height },
      titleBarStyle: config.titleBarStyle,
      transparent: config.transparent,
      passthrough: config.passthrough,
      hidden: !config.show,
      activate: config.activate,
      styleMask: config.styleMask,
      rpc: options.rpc,
    })

    if (config.alwaysOnTop) {
      win.setAlwaysOnTop(true)
    }

    if (config.visibleOnAllWorkspaces) {
      win.setVisibleOnAllWorkspaces(true)
    }

    this.windows.set(type, win)

    win.on('close', () => {
      this.windows.delete(type)
    })

    return win
  }

  get(type: WindowType): BrowserWindow | undefined {
    return this.windows.get(type)
  }

  show(type: WindowType): boolean {
    const win = this.get(type)
    if (!win) return false

    const config = WINDOW_CONFIGS[type]
    if (config?.activate === false) {
      win.showInactive()
    } else {
      win.show()
    }

    return true
  }

  hide(type: WindowType): boolean {
    const win = this.get(type)
    if (!win) return false

    win.hide()
    return true
  }

  toggle(type: WindowType): boolean {
    const win = this.get(type)
    if (!win) return false

    // Electrobun 没有 isVisible() API，用 try/catch 兼容
    // toggle 的语义：如果存在就切换显隐
    // 由调用方维护 visible 状态
    return true
  }

  destroy(type: WindowType): boolean {
    const win = this.get(type)
    if (!win) return false

    win.close()
    this.windows.delete(type)
    return true
  }

  exists(type: WindowType): boolean {
    return this.windows.has(type)
  }

  getAll(): Map<WindowType, BrowserWindow> {
    return new Map(this.windows)
  }

  destroyAll(): void {
    for (const [type] of this.windows) {
      this.destroy(type)
    }
  }
}

export const windowManager = new WindowManager()

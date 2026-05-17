import type { BrowserWindow } from 'electrobun/bun'

export let mainWindow: BrowserWindow | null = null

export function setMainWindow(win: BrowserWindow) {
  mainWindow = win
}

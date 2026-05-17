import { WindowType, type WindowConfig } from './types'

export const WINDOW_CONFIGS: Record<WindowType, WindowConfig> = {
  [WindowType.MAIN]: {
    title: 'Lyra',
    width: 1200,
    height: 800,
    position: 'center',
    titleBarStyle: 'hidden',
    transparent: false,
    passthrough: false,
    alwaysOnTop: false,
    visibleOnAllWorkspaces: false,
    show: true,
    activate: true,
    htmlPath: 'index.html',
  },

  [WindowType.LYRICS]: {
    title: 'Desktop Lyrics',
    width: 900,
    height: 160,
    position: 'bottom-center',
    titleBarStyle: 'hidden',
    transparent: true,
    passthrough: false,
    alwaysOnTop: true,
    visibleOnAllWorkspaces: true,
    show: false,
    activate: false,
    styleMask: {
      NonactivatingPanel: true,
    },
    htmlPath: 'lyrics.html',
    devPath: 'lyrics.html',
  },
}

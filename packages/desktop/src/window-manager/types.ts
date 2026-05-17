export enum WindowType {
  MAIN = 'main',
  LYRICS = 'lyrics',
}

export type WindowPosition =
  | 'center'
  | 'top-center'
  | 'bottom-center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | { x: number; y: number }

export interface WindowConfig {
  title: string
  width: number
  height: number
  position: WindowPosition

  titleBarStyle: 'hidden' | 'hiddenInset' | 'default'
  transparent: boolean
  passthrough: boolean
  alwaysOnTop: boolean
  visibleOnAllWorkspaces: boolean

  /** 创建后是否立即显示 */
  show: boolean
  /** 创建时是否激活（获取焦点） */
  activate: boolean

  styleMask?: Record<string, boolean>

  /** 生产模式 HTML 入口（相对于 views 目录） */
  htmlPath?: string
  /** 开发模式路径（相对于 dev server 根路径） */
  devPath?: string
}

export interface WindowCreateOptions {
  rpc?: any
  configOverride?: Partial<WindowConfig>
}

/** 窗口位置计算的边距常量（像素） */
export const POSITION_MARGINS = {
  standard: 20,
  topCenter: 50,
  bottomCenter: 100,
} as const

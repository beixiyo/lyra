import { Screen } from 'electrobun/bun'
import { POSITION_MARGINS, type WindowPosition } from './types'

export function calculatePosition(
  position: WindowPosition | undefined,
  width: number,
  height: number,
): { x: number; y: number } {
  const display = Screen.getPrimaryDisplay()
  const { x: sx, y: sy, width: sw, height: sh } = display.workArea

  if (typeof position === 'object' && position !== null) {
    return { x: position.x, y: position.y }
  }

  switch (position) {
    case 'center':
      return {
        x: Math.floor(sx + (sw - width) / 2),
        y: Math.floor(sy + (sh - height) / 2),
      }

    case 'top-center':
      return {
        x: Math.floor(sx + (sw - width) / 2),
        y: Math.floor(sy + POSITION_MARGINS.topCenter),
      }

    case 'bottom-center':
      return {
        x: Math.floor(sx + (sw - width) / 2),
        y: Math.floor(sy + sh - height - POSITION_MARGINS.bottomCenter),
      }

    case 'top-left':
      return {
        x: Math.floor(sx + POSITION_MARGINS.standard),
        y: Math.floor(sy + POSITION_MARGINS.standard),
      }

    case 'top-right':
      return {
        x: Math.floor(sx + sw - width - POSITION_MARGINS.standard),
        y: Math.floor(sy + POSITION_MARGINS.standard),
      }

    case 'bottom-left':
      return {
        x: Math.floor(sx + POSITION_MARGINS.standard),
        y: Math.floor(sy + sh - height - POSITION_MARGINS.standard),
      }

    case 'bottom-right':
      return {
        x: Math.floor(sx + sw - width - POSITION_MARGINS.standard),
        y: Math.floor(sy + sh - height - POSITION_MARGINS.standard),
      }

    default:
      return {
        x: Math.floor(sx + (sw - width) / 2),
        y: Math.floor(sy + (sh - height) / 2),
      }
  }
}

export function clampToScreen(
  width: number,
  height: number,
): { width: number; height: number } {
  const display = Screen.getPrimaryDisplay()
  const { width: sw, height: sh } = display.workArea

  return {
    width: Math.min(width, sw - POSITION_MARGINS.standard * 2),
    height: Math.min(height, sh - POSITION_MARGINS.standard * 2),
  }
}

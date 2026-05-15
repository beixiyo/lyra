const SAMPLE_SIZE = 64

/**
 * Extract a vibrant dominant color from an image URL via Canvas sampling.
 * Picks the most saturated pixel that isn't too dark or too light — ideal for
 * use as an accent color against a dark/light background.
 */
export async function extractVibrantColor(imageUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(null); return }

      canvas.width = SAMPLE_SIZE
      canvas.height = SAMPLE_SIZE
      ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)

      const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
      resolve(findVibrantColor(data))
    }

    img.onerror = () => resolve(null)
    img.src = imageUrl
  })
}

/** Score pixels by saturation, filtering extremes of lightness */
function findVibrantColor(data: Uint8ClampedArray): string | null {
  let bestScore = -1
  let bestR = 0
  let bestG = 0
  let bestB = 0

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const lightness = (max + min) / 510  // normalised 0–1

    // Reject very dark (<15%) or very light (>85%) pixels
    if (lightness < 0.15 || lightness > 0.85) continue

    // HSV saturation
    const saturation = max === 0 ? 0 : (max - min) / max

    // Prefer high saturation, penalise lightness extremes
    const score = saturation * (1 - Math.abs(lightness - 0.5) * 1.5)

    if (score > bestScore) {
      bestScore = score
      bestR = r
      bestG = g
      bestB = b
    }
  }

  // Return null if the image is too monochrome to yield a useful accent
  if (bestScore < 0.08) return null

  return `rgb(${bestR}, ${bestG}, ${bestB})`
}

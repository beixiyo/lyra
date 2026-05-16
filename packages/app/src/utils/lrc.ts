/** A single timestamped lyric line */
export type LyricLine = {
  /** Offset in seconds from the start of the track */
  time: number
  text: string
}

/** Parsed lyrics result — LRC with timestamps or unsynchronised plain text */
export type ParsedLyrics =
  | { type: 'lrc'; lines: LyricLine[] }
  | { type: 'plain'; text: string }

// Matches standard LRC timestamps: [mm:ss.xx] or [mm:ss.xxx]
const LRC_TIMESTAMP_RE = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/

/**
 * Parse a raw lyrics string into either a list of timestamped lines (LRC)
 * or plain text, depending on the content format.
 */
export function parseLyrics(raw: string): ParsedLyrics {
  const lines: LyricLine[] = []

  for (const line of raw.split('\n')) {
    const match = line.match(LRC_TIMESTAMP_RE)
    if (!match) continue

    const [, min, sec, msRaw, text] = match
    // Normalise to 3-digit milliseconds before parsing
    const ms = parseInt(msRaw.padEnd(3, '0'), 10)
    const time = parseInt(min, 10) * 60 + parseInt(sec, 10) + ms / 1000
    const trimmed = text.trim()

    if (trimmed) {
      lines.push({ time, text: trimmed })
    }
  }

  if (lines.length > 0) {
    return {
      type: 'lrc',
      lines: lines.sort((a, b) => a.time - b.time),
    }
  }

  return { type: 'plain', text: raw.trim() }
}

// CJK Unified Ideographs + Hiragana/Katakana + fullwidth lenticular brackets 【】
const CJK_RE = /[一-鿿぀-ヿ【】]/

/**
 * Split a bilingual lyric line (e.g. "Blow today 如今吹拂着大地") into
 * [latin, cjk]. Returns null when the line is monolingual or starts with CJK.
 *
 * Also handles the 【Chinese】 bracket notation used in some LRC files.
 */
export function splitBilingual(text: string): [string, string] | null {
  const idx = text.search(CJK_RE)
  if (idx <= 0) return null

  const latin = text.slice(0, idx).trim().replace(/[【】]+$/, '').trim()
  if (!latin || !/[a-zA-Z]/.test(latin)) return null

  const cjk = text.slice(idx).trim().replace(/^[【】]+/, '').replace(/[【】]+$/, '').trim()
  if (!cjk) return null

  return [latin, cjk]
}

/**
 * Binary-search for the currently active lyric line index.
 * Returns -1 before the first timestamped line.
 */
export function getActiveLyricIndex(lines: LyricLine[], currentTimeSec: number): number {
  let lo = 0
  let hi = lines.length - 1
  let result = -1

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1
    if (lines[mid].time <= currentTimeSec) {
      result = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  return result
}

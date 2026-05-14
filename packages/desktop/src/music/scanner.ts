import { readdir } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import { parseFile } from 'music-metadata'

const AUDIO_EXTS = new Set([
  '.mp3', '.flac', '.wav', '.ogg', '.m4a',
  '.aac', '.opus', '.wma', '.ape', '.wv',
])

const IGNORED_DIRS = new Set(['.thumbnails', '.cache', '@eaDir'])

export async function scanMusicFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true })

  return entries
    .filter(e => {
      if (!e.isFile()) return false
      if (!AUDIO_EXTS.has(extname(e.name).toLowerCase())) return false
      const rel = relative(dir, join(e.parentPath, e.name))
      return !rel.split('/').some(p => IGNORED_DIRS.has(p) || p.startsWith('.'))
    })
    .map(e => join(e.parentPath, e.name))
}

export async function parseMusicMetadata(filePath: string, scanRoot: string) {
  const metadata = await parseFile(filePath, {
    duration: true,
    skipCovers: true,
  })

  const { common, format } = metadata

  return {
    filePath,
    folder: extractFolder(filePath, scanRoot),
    title: common.title ?? extractFileName(filePath),
    artist: common.artist ?? '',
    artists: common.artists ?? [],
    album: common.album ?? '',
    albumArtist: common.albumartist ?? '',
    year: common.year ?? null,
    track: common.track ?? null,
    disk: common.disk ?? null,
    genre: common.genre ?? [],
    duration: format.duration ?? null,
    bitrate: format.bitrate ?? null,
    sampleRate: format.sampleRate ?? null,
    bitsPerSample: format.bitsPerSample ?? null,
    codec: format.codec ?? '',
    container: format.container ?? '',
    lossless: format.lossless ?? false,
    lyrics: extractLyrics(metadata),
  }
}

export async function scanAndParse(dir: string) {
  const files = await scanMusicFiles(dir)
  const total = files.length
  const results: Awaited<ReturnType<typeof parseMusicMetadata>>[] = []
  const errors: { file: string; error: string }[] = []

  const CONCURRENCY = Math.min(8, Math.max(2, navigator?.hardwareConcurrency ?? 4))

  const queue = files.map(file => async () => {
    try {
      const meta = await parseMusicMetadata(file, dir)
      results.push(meta)
    } catch (e) {
      errors.push({ file, error: String(e) })
    }
  })

  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    await Promise.all(queue.slice(i, i + CONCURRENCY).map(fn => fn()))
  }

  return { results, errors, total }
}

function extractFolder(filePath: string, scanRoot: string): string {
  const rel = relative(scanRoot, filePath)
  const parts = rel.split('/')
  return parts.length > 1 ? parts[0] : ''
}

function extractFileName(filePath: string): string {
  const name = filePath.split(/[/\\]/).pop() ?? ''
  return name.replace(/\.[^.]+$/, '')
}

function extractLyrics(metadata: Awaited<ReturnType<typeof parseFile>>): string | null {
  const lyrics = metadata.common.lyrics
  if (!lyrics?.length) return null

  const first = lyrics[0]
  if (typeof first === 'string') return first
  if (first && 'text' in first) return first.text ?? null

  return null
}

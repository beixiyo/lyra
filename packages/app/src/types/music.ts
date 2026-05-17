export type Track = {
  filePath: string
  folder: string
  title: string
  artist: string
  artists: string[]
  album: string
  albumArtist: string
  year: number | null
  track: { no: number | null; of: number | null } | null
  disk: { no: number | null; of: number | null } | null
  genre: string[]
  duration: number | null
  bitrate: number | null
  sampleRate: number | null
  bitsPerSample: number | null
  codec: string
  container: string
  lossless: boolean
  lyrics: string | null
}

export type ScanResult = {
  results: Track[]
  errors: { file: string; error: string }[]
  total: number
  removedPaths: string[]
}

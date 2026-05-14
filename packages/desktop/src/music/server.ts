const coverCache = new Map<string, { data: Uint8Array; type: string } | null>()

let _mm: typeof import('music-metadata') | null = null
async function getMM() {
  if (!_mm) _mm = await import('music-metadata')
  return _mm
}

export function startAudioServer(port = 1421) {
  return Bun.serve({
    port,

    async fetch(req) {
      const url = new URL(req.url)
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Range',
        'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
      }

      if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
      }

      const filePath = url.searchParams.get('path')
      if (!filePath) return new Response('Missing path', { status: 400, headers: corsHeaders })

      if (url.pathname === '/stream') {
        return serveAudio(req, filePath, corsHeaders)
      }

      if (url.pathname === '/cover') {
        return serveCover(filePath, corsHeaders)
      }

      return new Response('Not found', { status: 404, headers: corsHeaders })
    },
  })
}

async function serveAudio(
  req: Request,
  filePath: string,
  corsHeaders: Record<string, string>,
) {
  const file = Bun.file(filePath)
  const exists = await file.exists()
  if (!exists) return new Response('Not found', { status: 404, headers: corsHeaders })

  const size = file.size
  const range = req.headers.get('range')

  if (range) {
    const match = range.match(/bytes=(\d+)-(\d*)/)
    if (match) {
      const start = parseInt(match[1])
      const end = match[2] ? parseInt(match[2]) : size - 1

      return new Response(file.slice(start, end + 1), {
        status: 206,
        headers: {
          ...corsHeaders,
          'Content-Type': file.type || 'application/octet-stream',
          'Accept-Ranges': 'bytes',
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Content-Length': String(end - start + 1),
        },
      })
    }
  }

  return new Response(file, {
    headers: {
      ...corsHeaders,
      'Content-Type': file.type || 'application/octet-stream',
      'Accept-Ranges': 'bytes',
      'Content-Length': String(size),
    },
  })
}

async function serveCover(
  filePath: string,
  corsHeaders: Record<string, string>,
) {
  if (!coverCache.has(filePath)) {
    try {
      const mm = await getMM()
      const metadata = await mm.parseFile(filePath, { skipCovers: false, duration: false })
      const cover = mm.selectCover(metadata.common.picture)
      coverCache.set(
        filePath,
        cover
          ? { data: new Uint8Array(cover.data), type: cover.format }
          : null,
      )
    } catch {
      coverCache.set(filePath, null)
    }
  }

  const cached = coverCache.get(filePath)
  if (!cached) return new Response(null, { status: 404, headers: corsHeaders })

  return new Response(cached.data, {
    headers: {
      ...corsHeaders,
      'Content-Type': cached.type,
      'Cache-Control': 'public, max-age=86400',
    },
  })
}

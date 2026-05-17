import { useState, useEffect, useRef, useCallback } from 'react'
import { lyricsRpc } from '@/ipc/lyrics-client'
import { parseLyrics, getActiveLyricIndex, type LyricLine, type ParsedLyrics } from '@/utils/lrc'

const POLL_INTERVAL = 80

export interface LyricsSyncState {
  lines: LyricLine[]
  activeIndex: number
  fillPercent: number
  title: string
  artist: string
  isPlaying: boolean
  hasLyrics: boolean
  parsed: ParsedLyrics | null
}

export function useLyricsSync(): LyricsSyncState {
  const [state, setState] = useState<LyricsSyncState>({
    lines: [],
    activeIndex: -1,
    fillPercent: 0,
    title: '',
    artist: '',
    isPlaying: false,
    hasLyrics: false,
    parsed: null,
  })

  const lastTrackId = useRef('')
  const lastServerTime = useRef(0)
  const lastPollTs = useRef(0)
  const isPlayingRef = useRef(false)
  const linesRef = useRef<LyricLine[]>([])
  const rafId = useRef(0)

  const interpolate = useCallback(() => {
    if (!isPlayingRef.current || linesRef.current.length === 0) {
      rafId.current = requestAnimationFrame(interpolate)
      return
    }

    const elapsed = (performance.now() - lastPollTs.current) / 1000
    const estimatedTime = lastServerTime.current + elapsed
    const lines = linesRef.current
    const activeIndex = getActiveLyricIndex(lines, estimatedTime)

    let fillPercent = 0
    if (activeIndex >= 0) {
      const lineStart = lines[activeIndex].time
      const lineEnd = activeIndex < lines.length - 1
        ? lines[activeIndex + 1].time
        : lineStart + 5
      const lineDuration = lineEnd - lineStart
      fillPercent = lineDuration > 0
        ? Math.min(1, Math.max(0, (estimatedTime - lineStart) / lineDuration))
        : 1
    }

    setState(prev => {
      if (prev.activeIndex === activeIndex && Math.abs(prev.fillPercent - fillPercent) < 0.005) {
        return prev
      }
      return { ...prev, activeIndex, fillPercent }
    })

    rafId.current = requestAnimationFrame(interpolate)
  }, [])

  useEffect(() => {
    const poll = async () => {
      try {
        const s = await lyricsRpc.request.pollLyricsState({})

        lastServerTime.current = s.currentTime
        lastPollTs.current = performance.now()
        isPlayingRef.current = s.isPlaying

        if (s.trackId !== lastTrackId.current) {
          lastTrackId.current = s.trackId
          const parsed = s.lyrics ? parseLyrics(s.lyrics) : null
          const lines = parsed?.type === 'lrc' ? parsed.lines : []
          linesRef.current = lines

          setState(prev => ({
            ...prev,
            lines,
            parsed,
            title: s.title,
            artist: s.artist,
            isPlaying: s.isPlaying,
            hasLyrics: lines.length > 0,
          }))
        } else {
          setState(prev => ({
            ...prev,
            title: s.title,
            artist: s.artist,
            isPlaying: s.isPlaying,
          }))
        }
      } catch {
        // RPC not ready yet
      }
    }

    const timer = setInterval(poll, POLL_INTERVAL)
    poll()

    rafId.current = requestAnimationFrame(interpolate)

    return () => {
      clearInterval(timer)
      cancelAnimationFrame(rafId.current)
    }
  }, [interpolate])

  return state
}

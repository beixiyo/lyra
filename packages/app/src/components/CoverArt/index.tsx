import { cn } from 'utils'
import { memo, useState } from 'react'
import { Music } from 'lucide-react'
import { getCoverUrl } from '@/stores/player'

export const CoverArt = memo<CoverArtProps>(({
  filePath,
  size = 48,
  className,
  iconScale = 0.4,
}) => {
  const [error, setError] = useState(false)

  if (error || !filePath) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-raised/80 text-muted shrink-0',
          className,
        )}
        style={{ width: size, height: size }}
      >
        <Music style={{ width: size * iconScale, height: size * iconScale }} />
      </div>
    )
  }

  return (
    <img
      src={getCoverUrl(filePath)}
      alt="Cover"
      className={cn('object-cover shrink-0', className)}
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  )
})

CoverArt.displayName = 'CoverArt'

export type CoverArtProps = {
  filePath: string
  size?: number
  className?: string
  iconScale?: number
}

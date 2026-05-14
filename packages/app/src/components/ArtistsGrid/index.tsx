import { cn } from 'utils'
import { memo } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { useLatestCallback } from 'hooks'
import { folders, selectFolder } from '@/stores/library'
import { CoverArt } from '../CoverArt'

export const ArtistsGrid = memo<ArtistsGridProps>(({ style, className }) => {
  useSignals()

  return (
    <div
      className={cn('flex flex-col', className)}
      style={style}
    >
      <h1 className="text-[28px] font-bold tracking-tight mb-6">艺术家</h1>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {folders.value.map(folder => (
          <ArtistCard
            key={folder.name}
            name={folder.name}
            count={folder.count}
            coverFilePath={folder.firstTrack.filePath}
            onSelect={selectFolder}
          />
        ))}
      </div>
    </div>
  )
})

ArtistsGrid.displayName = 'ArtistsGrid'

const ArtistCard = memo<ArtistCardProps>(({
  name,
  count,
  coverFilePath,
  onSelect,
}) => {
  const handleClick = useLatestCallback(() => onSelect(name))

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex flex-col items-center gap-3 p-4 rounded-xl transition-colors',
        'hover:bg-white/[0.04] active:scale-[0.98] active:transition-transform',
      )}
    >
      <CoverArt
        filePath={coverFilePath}
        size={140}
        className="rounded-full"
        iconScale={0.3}
      />

      <div className="text-center w-full">
        <p className="text-[13px] font-medium truncate">{name}</p>
        <p className="text-[11px] text-neutral-500 mt-0.5">{count} 首歌曲</p>
      </div>
    </button>
  )
})

ArtistCard.displayName = 'ArtistCard'

export type ArtistsGridProps = {} & React.HTMLAttributes<HTMLElement>

type ArtistCardProps = {
  name: string
  count: number
  coverFilePath: string
  onSelect: (name: string) => void
}

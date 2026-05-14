import { cn } from 'utils'
import { memo } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { useLatestCallback } from 'hooks'
import { albums, selectAlbum } from '@/stores/library'
import { CoverArt } from '../CoverArt'

export const AlbumsGrid = memo<AlbumsGridProps>(({ style, className }) => {
  useSignals()

  return (
    <div
      className={cn('flex flex-col', className)}
      style={style}
    >
      <h1 className="text-[28px] font-bold tracking-tight mb-6">专辑</h1>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {albums.value.map(album => (
          <AlbumCard
            key={album.name}
            name={album.name}
            artist={album.artist}
            coverFilePath={album.firstTrack.filePath}
            onSelect={selectAlbum}
          />
        ))}
      </div>
    </div>
  )
})

AlbumsGrid.displayName = 'AlbumsGrid'

const AlbumCard = memo<AlbumCardProps>(({
  name,
  artist,
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
        className="rounded-lg"
        iconScale={0.3}
      />

      <div className="text-center w-full">
        <p className="text-[13px] font-medium truncate">{name}</p>
        <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{artist}</p>
      </div>
    </button>
  )
})

AlbumCard.displayName = 'AlbumCard'

export type AlbumsGridProps = {} & React.HTMLAttributes<HTMLElement>

type AlbumCardProps = {
  name: string
  artist: string
  coverFilePath: string
  onSelect: (name: string) => void
}

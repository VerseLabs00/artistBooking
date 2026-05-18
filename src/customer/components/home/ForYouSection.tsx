import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ArtistCard from './ArtistCard'
import { getArtists } from '../../services/discoveryService'
import type { ArtistCard as Artist } from '../../services/discoveryService'

export default function ForYouSection() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') ?? ''

  useEffect(() => {
    setLoading(true)
    getArtists(category ? { category } : undefined)
      .then(({ data }) => setArtists(data))
      .catch(() => setArtists([]))
      .finally(() => setLoading(false))
  }, [category])

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900">
          {category ? `${category} Artists` : 'For You'}
        </h2>
        <button className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium">See all</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-44" />
          ))}
        </div>
      ) : artists.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No artists found.</p>
      ) : (
        <div className="grid grid-cols-6 gap-4">
          {artists.slice(0, 6).map((artist) => (
            <ArtistCard
              key={artist.id}
              artistId={artist.id}
              name={artist.stage_name}
              role={artist.category}
              location={artist.location}
              avatarUrl={artist.avatar_url ?? undefined}
            />
          ))}
        </div>
      )}
    </section>
  )
}

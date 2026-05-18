import { useNavigate } from 'react-router-dom'

interface ArtistCardProps {
  name: string
  role?: string
  rating?: number
  location?: string
  artistId?: string | number
  avatarUrl?: string
}

export default function ArtistCard({ name, role = 'Musician', rating, location, artistId = 1, avatarUrl }: ArtistCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/artist/${artistId}`)}
      className="flex flex-col cursor-pointer group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Banner image */}
      <div className="relative">
        <img
          src={avatarUrl ?? '/artist-2.png'}
          alt={name}
          className="w-full h-[120px] object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Rating badge */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {rating ?? 4.7}
        </div>

        {/* Avatar overlapping bottom */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-md">
          <img src={avatarUrl ?? '/artist-2.png'} alt={name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Info */}
      <div className="pt-8 pb-4 px-2 text-center">
        <p className="text-xs font-bold text-gray-900 uppercase tracking-wide leading-tight">{name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{role}</p>
        {location && (
          <div className="flex items-center justify-center gap-0.5 mt-1.5">
            <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-gray-400">{location}</span>
          </div>
        )}
      </div>
    </div>
  )
}

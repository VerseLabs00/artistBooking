import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BookingModal from '../components/booking/BookingModal'
import { getArtist, submitReview } from '../services/discoveryService'
import type { ArtistDetail } from '../services/discoveryService'


// ── Media preview helpers ──────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/)
  return match ? match[1] : null
}

function getSpotifyEmbedUrl(url: string): string | null {
  // https://open.spotify.com/track/ID  →  https://open.spotify.com/embed/track/ID
  const match = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([^?]+)/)
  return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}` : null
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)
}

function MediaPreviewCard({ item }: { item: { id: string; url: string; media_type: string; is_external_link: boolean } }) {
  const ytId = getYouTubeId(item.url)
  const spotifyEmbed = getSpotifyEmbedUrl(item.url)

  if (ytId) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="relative block rounded-xl overflow-hidden group cursor-pointer"
      >
        <img
          src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
          alt=""
          className="w-full h-40 object-cover"
        />
        {/* dark overlay on hover */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
        {/* YouTube-style play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {/* YouTube logo badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 rounded px-1.5 py-0.5 flex items-center gap-1">
          <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
          </svg>
          <span className="text-white text-xs font-medium">YouTube</span>
        </div>
      </a>
    )
  }

  if (spotifyEmbed) {
    return (
      <div className="rounded-xl overflow-hidden">
        <iframe
          src={spotifyEmbed}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl border-0"
        />
      </div>
    )
  }

  if (isDirectVideo(item.url)) {
    return (
      <div className="rounded-xl overflow-hidden bg-black">
        <video
          src={item.url}
          controls
          className="w-full h-40 object-contain"
        />
      </div>
    )
  }

  // Generic link card fallback
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
    >
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-700 transition-colors">
        <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <p className="flex-1 text-sm text-gray-600 leading-snug truncate">{item.url}</p>
      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}

function StarRating({ filled, size = 'w-5 h-5' }: { filled: boolean; size?: string }) {
  return (
    <svg className={`${size} ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

export default function ArtistProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [artist, setArtist] = useState<ArtistDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [hoverStar, setHoverStar] = useState(0)
  const [selectedStar, setSelectedStar] = useState(0)
  const [review, setReview] = useState('')
  const [heroBgOpacity, setHeroBgOpacity] = useState(1)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getArtist(id)
      .then(setArtist)
      .catch(() => setArtist(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    const onScroll = () => {
      // fade out over the 220px hero height
      setHeroBgOpacity(Math.max(0, 1 - window.scrollY / 220))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (loading) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Artist not found.</p>
        </div>
      </div>
    )
  }

  const avgRating = artist.rating.average ?? 0
  const filledStars = Math.round(avgRating)

  const tagColors = [
    'bg-purple-100 text-purple-600',
    'bg-green-100 text-green-600',
    'bg-red-100 text-red-500',
    'bg-blue-100 text-blue-600',
  ]

  const bioBlocks = [artist.bio_1, artist.bio_2, artist.paragraph].filter(Boolean)

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <Header />

      <div className="pt-14">
        <div
          className="w-full h-[220px] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: artist.cover_url ? `url('${artist.cover_url}')` : "url('/artist-bg.png')",
            opacity: heroBgOpacity,
          }}
        />

        <div className="max-w-6xl mx-auto px-8 pb-16">
          <div className="flex gap-6 -mt-12">

            {/* Left Sidebar */}
            <div className="w-72 flex-shrink-0 flex flex-col gap-4 sticky top-20 self-start">

              {/* Profile card */}
              <div className="bg-white rounded-2xl shadow-sm pt-4 pb-6 px-5 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-md -mt-2 mb-3">
                  <img src={artist.avatar_url ?? '/artist-logo.png'} alt={artist.stage_name} className="w-full h-full object-cover" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900">{artist.stage_name}</h1>

                <div className="flex items-center gap-1 mt-1">
                  <StarRating filled size="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-700">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</span>
                  <span className="text-xs text-gray-400">({artist.rating.total} reviews)</span>
                </div>

                {artist.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                    {artist.tags.map((tag, i) => (
                      <span key={i} className={`text-xs px-2.5 py-1 rounded-full font-medium ${tagColors[i % tagColors.length]}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {artist.short_bio && (
                  <p className="text-xs text-gray-500 leading-relaxed mt-4 text-left">{artist.short_bio}</p>
                )}

                <div className="w-full mt-4 text-left">
                  {artist.starting_price && (
                    <p className="text-red-500 font-bold text-lg">
                      LKR {artist.starting_price.toLocaleString()}
                      <span className="text-gray-700 font-semibold text-sm"> starting price</span>
                    </p>
                  )}
                  {artist.starting_price && artist.max_price && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Range: LKR {artist.starting_price.toLocaleString()} – {artist.max_price.toLocaleString()} depending on event type and duration
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full mt-5">
                  <button
                    onClick={() => setShowBooking(true)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-full transition-colors text-sm"
                  >
                    Booking Now
                  </button>
                  <button className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Social links */}
              {(artist.spotify_link || artist.facebook_link || artist.instagram_link || artist.youtube_link) && (
                <div className="bg-white rounded-2xl shadow-sm py-5 px-5">
                  <h3 className="text-sm font-semibold text-gray-900 text-center mb-4">Social & Web</h3>
                  <div className="flex items-center justify-center gap-3">
                    {artist.spotify_link && (
                      <a href={artist.spotify_link} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                      </a>
                    )}
                    {artist.facebook_link && (
                      <a href={artist.facebook_link} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                        </svg>
                      </a>
                    )}
                    {artist.instagram_link && (
                      <a href={artist.instagram_link} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <rect x="2" y="2" width="20" height="20" rx="5" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                        </svg>
                      </a>
                    )}
                    {artist.youtube_link && (
                      <a href={artist.youtube_link} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Content */}
            <div className="flex-1 flex flex-col gap-5 mt-14">

              {/* Overview */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Overview</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {artist.category}
                  </div>
                  {artist.location && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {artist.location}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {bioBlocks.length > 0
                    ? bioBlocks.map((b, i) => (
                        <p key={i} className="text-sm text-gray-500 leading-relaxed">{b}</p>
                      ))
                    : <p className="text-sm text-gray-400">No bio available.</p>
                  }
                </div>
              </div>

              {/* Gallery */}
              {artist.gallery.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">Gallery</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {artist.gallery.slice(0, 3).map((item, i) => (
                      <div key={item.id} className="relative rounded-xl overflow-hidden h-28">
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                        {i === 2 && artist.gallery.length > 3 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                            <span className="text-white text-xs font-medium">+{artist.gallery.length - 3} more</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media */}
              {artist.media.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">Audio & Video</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {artist.media.map((item) => (
                      <MediaPreviewCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <p className="text-5xl font-bold text-gray-900">{avgRating > 0 ? avgRating.toFixed(2) : '—'}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarRating key={s} filled={s <= filledStars} size="w-6 h-6" />
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-1">{artist.rating.total} Reviews</p>

                {artist.rating.recent_reviews.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-4">Popular reviews & comments</h3>
                    <div className="space-y-3 text-left">
                      {artist.rating.recent_reviews.map((r) => (
                        <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-xs font-bold text-gray-900 uppercase">{r.reviewer_name}</p>
                              <p className="text-xs text-gray-400">{r.created_at}</p>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <StarRating key={s} filled={s <= r.rating} size="w-3 h-3" />
                              ))}
                            </div>
                          </div>
                          {r.body && <p className="text-xs text-gray-500 leading-relaxed">{r.body}</p>}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Leave a review */}
                <div className="mt-6 text-center">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Leave a Review</h3>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onMouseEnter={() => setHoverStar(s)}
                        onMouseLeave={() => setHoverStar(0)}
                        onClick={() => setSelectedStar(s)}
                      >
                        <svg
                          className={`w-6 h-6 transition-colors ${s <= (hoverStar || selectedStar) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill={s <= (hoverStar || selectedStar) ? 'currentColor' : 'none'}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="write review here"
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 placeholder-gray-400 outline-none focus:border-gray-400 resize-none transition-colors"
                  />

                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => { setReview(''); setSelectedStar(0) }}
                      className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-4 py-2"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedStar) return
                        submitReview(artist.id, { rating: selectedStar, body: review })
                          .then(() => { setReview(''); setSelectedStar(0) })
                          .catch(() => {})
                      }}
                      className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-sm px-8 py-2.5 rounded-full transition-colors"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />

      {showBooking && (
        <BookingModal
          artistProfileId={artist.id}
          artistName={artist.stage_name}
          startingPrice={artist.starting_price ?? 0}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  )
}

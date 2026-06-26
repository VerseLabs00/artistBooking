import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft, MapPin, Star, Phone, Mail, Calendar, AlertTriangle, Play, Music, Youtube } from 'lucide-react'
import { fetchArtist, verifyArtist, toggleArtistOnboard, deleteArtist, clearSelected } from '../features/artists/artistsSlice'
import StatusBadge from '../components/common/StatusBadge'

const FacebookIcon = () => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
const InstagramIcon = () => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
const SpotifyIcon = () => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>

function ConfirmModal({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4">
        <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary px-5 py-2 text-sm">Cancel</button>
          <button onClick={onConfirm} className={`${confirmClass} px-5 py-2 text-sm rounded-full font-semibold`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export default function ArtistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selected: artist, selectedLoading } = useSelector(s => s.artists)
  const [modal, setModal] = useState(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [activeGalleryImg, setActiveGalleryImg] = useState(0)

  useEffect(() => {
    dispatch(fetchArtist(id))
    return () => dispatch(clearSelected())
  }, [id, dispatch])

  if (selectedLoading || !artist) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="h-10 bg-gray-100 rounded w-32 animate-pulse mb-5" />
        <div className="relative mb-16">
          <div className="h-48 md:h-56 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 animate-pulse border-4 border-white shadow-xl" />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-72 shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="h-6 bg-gray-100 rounded w-32 animate-pulse mb-3" />
              <div className="h-4 bg-gray-100 rounded w-24 animate-pulse mb-2" />
              <div className="h-6 bg-gray-100 rounded w-16 animate-pulse mb-4" />
              <div className="h-8 bg-gray-100 rounded w-28 animate-pulse mb-3" />
              <div className="h-4 bg-gray-100 rounded w-20 animate-pulse" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="h-4 bg-gray-100 rounded w-16 animate-pulse mb-3" />
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded bg-gray-100 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="h-5 bg-gray-100 rounded w-32 animate-pulse mb-4" />
              {[1,2,3,4].map(i => (
                <div key={i} className="h-4 bg-gray-100 rounded w-full animate-pulse mb-2" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleVerify = async (status) => {
    const result = await dispatch(verifyArtist({ id: artist.id, status }))
    if (verifyArtist.fulfilled.match(result)) {
      status === 'approved' ? toast.success(`${artist.name} approved!`) : toast.error(`${artist.name} rejected.`)
    } else {
      toast.error(result.payload || 'Action failed')
    }
    setModal(null)
  }

  const handleDelete = async () => {
    const result = await dispatch(deleteArtist(artist.id))
    if (deleteArtist.fulfilled.match(result)) {
      toast.success('Artist deleted.')
      navigate('/artists')
    } else {
      toast.error(result.payload || 'Delete failed')
    }
    setModal(null)
  }

  const handleToggleOnboard = async () => {
    await dispatch(toggleArtistOnboard(artist.id))
    toast.success('Artist visibility toggled.')
  }

  const modalConfig = {
    approve: { title: 'Approve Artist', message: `Approve ${artist.name}?`, confirmLabel: 'Approve', confirmClass: 'bg-green-500 text-white hover:bg-green-600', onConfirm: () => handleVerify('approved') },
    reject: { title: 'Reject Artist', message: `Reject ${artist.name}?`, confirmLabel: 'Reject', confirmClass: 'bg-red-500 text-white hover:bg-red-600', onConfirm: () => handleVerify('rejected') },
    delete: { title: 'Delete Artist', message: `Permanently delete ${artist.name}? This cannot be undone.`, confirmLabel: 'Delete', confirmClass: 'bg-red-600 text-white hover:bg-red-700', onConfirm: handleDelete },
  }

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => navigate('/artists')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <ArrowLeft size={16} /> Back to Artists
      </button>

      {/* Cover + Avatar */}
      <div className="relative mb-16">
        <div className="h-48 md:h-56 rounded-2xl overflow-hidden bg-gray-200">
          {artist.coverImage
            ? <img src={artist.coverImage} alt="cover" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
          }
          {artist.status === 'suspended' && (
            <div className="absolute inset-0 rounded-2xl bg-gray-900/60 flex items-center justify-center">
              <span className="text-white font-bold text-lg tracking-widest uppercase opacity-80">⛔ Account Suspended</span>
            </div>
          )}
        </div>
        <div className="absolute -bottom-12 left-6">
          <img src={artist.avatar} alt={artist.name} className={`w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl ${artist.status === 'suspended' ? 'grayscale opacity-70' : ''}`} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT SIDEBAR */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 pt-5 pb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{artist.name}</h1>
            <div className="flex items-center gap-1 mb-3">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-gray-700 text-sm">{artist.rating}</span>
              <span className="text-gray-400 text-xs">({artist.reviewCount} reviews)</span>
            </div>
            <StatusBadge status={artist.status} />
            {artist.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 my-3">
                {artist.tags.map((t, i) => <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{t}</span>)}
              </div>
            )}
            {artist.bio && <p className="text-xs text-gray-500 leading-relaxed mb-4">{artist.bio}</p>}
            <div className="mb-5">
              <span className="text-2xl font-extrabold text-primary">LKR {Number(artist.fullPrice || 0).toLocaleString()}</span>
              <span className="text-xs text-gray-400 ml-2">full price</span>
            </div>
            {artist.advance && (
              <div className="text-sm text-gray-500">
                Advance: LKR {Number(artist.advance).toLocaleString()}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Contact</h3>
            <div className="flex items-center gap-3"><Mail size={14} className="text-gray-400 shrink-0" /><span className="text-sm text-gray-700 truncate">{artist.email}</span></div>
            <div className="flex items-center gap-3"><Phone size={14} className="text-gray-400 shrink-0" /><span className="text-sm text-gray-700">{artist.phone}</span></div>
            <div className="flex items-center gap-3"><MapPin size={14} className="text-gray-400 shrink-0" /><span className="text-sm text-gray-700">{artist.location}</span></div>
            <div className="flex items-center gap-3"><Calendar size={14} className="text-gray-400 shrink-0" /><span className="text-sm text-gray-700">Joined {artist.joinedDate}</span></div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Platform Stats</h3>
            <div className="flex justify-between"><span className="text-xs text-gray-500">Total Bookings</span><span className="text-sm font-bold text-gray-900">{artist.bookings}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500">Total Earnings</span><span className="text-sm font-bold text-gray-900">{artist.totalEarnings}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Completion Rate</span>
              <div className="flex items-center gap-1.5">
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${artist.completionRate}%` }} />
                </div>
                <span className="text-sm font-bold text-gray-900">{artist.completionRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Admin Controls</h3>
            <div className="space-y-2">
              {artist.status === 'pending' && (<>
                <button onClick={() => setModal('approve')} className="w-full bg-green-500 text-white text-sm py-2.5 rounded-xl font-semibold hover:bg-green-600 transition-colors">✓ Approve Artist</button>
                <button onClick={() => setModal('reject')} className="w-full bg-red-500 text-white text-sm py-2.5 rounded-xl font-semibold hover:bg-red-600 transition-colors">✗ Reject Artist</button>
              </>)}
              {artist.status === 'verified' && (
                <button onClick={() => setModal('reject')} className="w-full bg-red-500 text-white text-sm py-2.5 rounded-xl font-semibold hover:bg-red-600 transition-colors">⛔ Suspend Artist</button>
              )}
              {artist.status === 'suspended' && (
                <button onClick={() => setModal('approve')} className="w-full btn-success text-sm py-2.5 rounded-xl">✓ Reinstate Artist</button>
              )}
              <button onClick={handleToggleOnboard} className="w-full bg-gray-100 text-gray-600 text-sm py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                {artist.isOnboarded ? '🔒 Remove from Listings' : '📋 Add to Listings'}
              </button>
              <button onClick={() => setModal('delete')} className="w-full border border-red-200 text-red-500 text-sm py-2.5 rounded-xl font-semibold hover:bg-red-50 transition-colors">
                🗑 Delete Artist
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Overview</h2>
            <div className="flex items-center gap-4 mb-5 text-sm text-gray-500">
              <span>👤 {artist.category}</span>
              <span className="text-gray-200">|</span>
              <span>📍 {artist.location}</span>
            </div>
            {artist.overview && (
              <div className="space-y-3">
                {artist.overview.split('\n\n').map((p, i) => <p key={i} className="text-sm text-gray-600 leading-relaxed">{p}</p>)}
              </div>
            )}
            {artist.genres?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {artist.genres.map((g, i) => <span key={i} className="text-xs bg-primary-light text-primary px-3 py-1 rounded-full font-medium">{g}</span>)}
              </div>
            )}
          </div>

          {artist.gallery?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Gallery</h2>
              <div className="grid grid-cols-3 gap-2">
                {artist.gallery.map((img, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden cursor-pointer" style={{ paddingBottom: '66%' }} onClick={() => { setActiveGalleryImg(i); setGalleryOpen(true) }}>
                    <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {artist.media?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Audio &amp; Video</h2>
              <div className="space-y-3">
                {artist.media.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      {item.type === 'youtube' ? <Play size={16} className="text-gray-500" /> : <Music size={16} className="text-gray-500" />}
                    </div>
                    <p className="flex-1 text-sm text-gray-700">{item.title}</p>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === 'youtube' ? 'bg-red-100' : 'bg-green-100'}`}>
                      {item.type === 'youtube' ? <Youtube size={14} className="text-red-600" /> : <SpotifyIcon />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Socials */}
          {artist.socials && Object.keys(artist.socials).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Social Links</h2>
              <div className="flex gap-4">
                {artist.socials.facebook && <a href={artist.socials.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><FacebookIcon /></a>}
                {artist.socials.instagram && <a href={artist.socials.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><InstagramIcon /></a>}
                {artist.socials.spotify && <a href={artist.socials.spotify} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><SpotifyIcon /></a>}
              </div>
            </div>
          )}
        </div>
      </div>

      {galleryOpen && artist.gallery?.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setGalleryOpen(false)}>
          <img src={artist.gallery[activeGalleryImg]} alt="" className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain" />
        </div>
      )}

      {modal && modalConfig[modal] && (
        <ConfirmModal open={true} {...modalConfig[modal]} onCancel={() => setModal(null)} />
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { Play, ChevronDown, ChevronUp, X } from 'lucide-react'
import {
  fetchPendingArtists,
  approveArtist,
  rejectArtist,
  setFilter,
  toggleExpand,
  selectFilteredVerifications,
} from '../features/verification/verificationSlice'
import PageHeader from '../components/common/PageHeader'
import FilterTabs from '../components/common/FilterTabs'

const socialPlatforms = [
  {
    key: 'instagram', label: 'Instagram', color: 'text-pink-500 bg-pink-50',
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  },
  {
    key: 'facebook', label: 'Facebook', color: 'text-blue-600 bg-blue-50',
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  },
  {
    key: 'youtube', label: 'YouTube', color: 'text-red-500 bg-red-50',
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  },
  {
    key: 'spotify', label: 'Spotify', color: 'text-green-600 bg-green-50',
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>,
  },
]

function getDocumentPreviewUrl(doc, app) {
  if (doc?.url) return doc.url
  if (doc.label === 'Profile Photo') return app.avatar || null
  return null
}

function VerificationCard({ app }) {
  const dispatch = useDispatch()
  const expandedId = useSelector(s => s.verification.expandedId)
  const isExpanded = expandedId === app.id
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [actionLoading, setActionLoading] = useState(null)
  const [docLightbox, setDocLightbox] = useState(null)

  useEffect(() => {
    if (!docLightbox) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setDocLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [docLightbox])

  const handleApprove = async () => {
    setActionLoading('approve')
    const result = await dispatch(approveArtist(app.id))
    setActionLoading(null)
    if (approveArtist.fulfilled.match(result)) {
      toast.success(`${app.name} approved!`)
    } else {
      toast.error(result.payload || 'Approval failed')
    }
  }

  const handleReject = async () => {
    setActionLoading('reject')
    const result = await dispatch(rejectArtist(app.id))
    setActionLoading(null)
    if (rejectArtist.fulfilled.match(result)) {
      toast.success(`${app.name} rejected and profile deleted.`)
    } else {
      toast.error(result.payload || 'Rejection failed')
    }
  }

  const openDocumentPreview = (doc) => {
    const src = getDocumentPreviewUrl(doc, app)
    if (!src) {
      toast.error('Preview URL not available for this document yet.')
      return
    }
    setDocLightbox({ src, title: doc.label })
  }

  return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-3">
        <div className="flex items-center justify-between px-4 md:px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={app.avatar} alt="" className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{app.name}</p>
              <p className="text-xs text-gray-400 truncate">{app.category} · {app.location}</p>
            </div>
            {app.isToday && (
                <span className="shrink-0 text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Today</span>
            )}
            {app.isResubmitted && (
                <span className="shrink-0 text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Re-submitted</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button onClick={() => dispatch(toggleExpand(app.id))} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
              {isExpanded ? <><ChevronUp size={12} /> Collapse</> : <><ChevronDown size={12} /> Expand</>}
            </button>
            <button
                onClick={handleReject}
                disabled={!!actionLoading}
                className="btn-danger text-xs px-3 py-1.5 hidden sm:inline-flex disabled:opacity-50"
            >
              {actionLoading === 'reject' ? '...' : 'Reject'}
            </button>
            <button
                onClick={handleApprove}
                disabled={!!actionLoading}
                className="btn-success text-xs px-3 py-1.5 hidden sm:inline-flex disabled:opacity-50"
            >
              {actionLoading === 'approve' ? '...' : 'Approve'}
            </button>
          </div>
        </div>

        {isExpanded && (
            <div className="border-t border-gray-100 p-4 md:p-5">
              <div className="flex flex-col lg:flex-row gap-5">
                <div className="flex-1 space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-4 md:p-5">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Basic Info</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
                      {[
                        ['Full Name',     app.profile.fullName],
                        ['Stage Name',    app.profile.stageName],
                        ['Location',      app.profile.location],
                        ['Phone',         app.profile.phone],
                        ['Email',         app.profile.email],
                        ['Category',      app.profile.category],
                        ['Date of Birth', app.profile.dateOfBirth],
                        ['Genres',        app.profile.genres],
                      ].map(([label, value], i) => (
                          <div key={i} className="border-b border-gray-100 py-2.5 last:border-0">
                            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                            <p className="text-sm font-semibold text-gray-900">{value || '—'}</p>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 md:p-5">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Uploaded Documents</h3>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {app.documents.filter(d => d.uploaded).map((doc, i) => (
                          <button
                              type="button"
                              key={i}
                              onClick={() => openDocumentPreview(doc)}
                              className="flex flex-col items-center gap-1.5 px-3 md:px-4 py-3 rounded-2xl border-2 border-primary bg-primary-light text-left transition-transform hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          >
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                              <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                              </svg>
                            </div>
                            <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{doc.label}</span>
                            <span className="text-[10px] text-green-600 font-bold">✓ Uploaded · Tap to view</span>
                          </button>
                      ))}
                      {app.documents.filter(d => d.uploaded).length === 0 && (
                          <p className="text-sm text-gray-400">No documents uploaded yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 md:p-5">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Portfolio & Videos</h3>
                    {app.portfolio.images?.length > 0 || app.portfolio.video ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {app.portfolio.images.map((img, i) => (
                              <div
                                  key={i}
                                  className="relative rounded-xl overflow-hidden cursor-pointer"
                                  style={{ paddingBottom: '100%' }}
                                  onClick={() => { setActiveImg(i); setGalleryOpen(true) }}
                              >
                                <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform" />
                              </div>
                          ))}
                          {app.portfolio.video && (
                              <div className="relative rounded-xl overflow-hidden bg-gray-800" style={{ paddingBottom: '100%' }}>
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                                  <Play size={18} className="text-white" />
                                  <span className="text-white text-[10px] font-bold tracking-widest">VIDEO</span>
                                </div>
                              </div>
                          )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No portfolio uploaded.</p>
                    )}
                  </div>

                  {app.pricing && (
                      <div className="bg-gray-50 rounded-2xl p-4 md:p-5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Pricing</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0 mb-3">
                          {[
                            ['Base Price', `LKR ${app.pricing.basePrice.toLocaleString()}`],
                            ['Per Hour',   `LKR ${app.pricing.pricePerHour.toLocaleString()}`],
                            ['Travel Radius', `${app.travelRadius} km`],
                          ].map(([label, value], i) => (
                              <div key={i} className="border-b border-gray-100 py-2.5 last:border-0">
                                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                                <p className="text-sm font-semibold text-gray-900">{value}</p>
                              </div>
                          ))}
                        </div>
                        {app.pricing.addOns?.length > 0 && (
                            <>
                              <p className="text-xs text-gray-400 mb-2">Add-ons</p>
                              <div className="flex flex-wrap gap-2">
                                {app.pricing.addOns.map((a, i) => (
                                    <span key={i} className="text-xs bg-white text-gray-600 border border-gray-200 px-3 py-1 rounded-full">{a}</span>
                                ))}
                              </div>
                            </>
                        )}
                      </div>
                  )}

                  {app.socialLinks && (
                      <div className="bg-gray-50 rounded-2xl p-4 md:p-5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Social Media Links</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {socialPlatforms.map(({ key, label, icon, color }) => {
                            const url = app.socialLinks[key]
                            return (
                                <div key={key} className="flex items-center gap-2.5">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${url ? color : 'text-gray-300 bg-gray-100'}`}>
                                    {icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400">{label}</p>
                                    {url ? (
                                        <a href={url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline truncate block">
                                          {url.replace('https://', '')}
                                        </a>
                                    ) : (
                                        <p className="text-xs text-gray-300">Not provided</p>
                                    )}
                                  </div>
                                  {url && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full shrink-0">✓</span>}
                                </div>
                            )
                          })}
                        </div>
                      </div>
                  )}

                  <div className="flex gap-3 sm:hidden">
                    <button onClick={handleReject} disabled={!!actionLoading} className="flex-1 btn-danger py-2.5 text-sm rounded-xl disabled:opacity-50">
                      {actionLoading === 'reject' ? '...' : '✗ Reject'}
                    </button>
                    <button onClick={handleApprove} disabled={!!actionLoading} className="flex-1 bg-green-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-green-600 transition-colors disabled:opacity-50">
                      {actionLoading === 'approve' ? '...' : '✓ Approve'}
                    </button>
                  </div>
                </div>

                <div className="w-full lg:w-52 shrink-0 space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Documents</h3>
                    <div className="space-y-2.5">
                      {app.documents.map((doc, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">{doc.label}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${doc.uploaded ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-400'}`}>
                        {doc.uploaded ? '✓' : '—'}
                      </span>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">NIC</h3>
                    <p className="text-sm font-bold text-gray-900">{app.profile.nic || '—'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Applied</h3>
                    <p className="text-sm font-bold text-gray-900">{app.submittedDate}</p>
                  </div>

                  <div className="bg-gray-900 rounded-2xl p-4 space-y-2.5 hidden sm:block">
                    <p className="text-xs font-bold text-white">Decision</p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">Review all details before approving.</p>
                    <button
                        onClick={handleApprove}
                        disabled={!!actionLoading}
                        className="w-full bg-green-500 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'approve' ? 'Approving...' : '✓ Approve'}
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={!!actionLoading}
                        className="w-full bg-red-500/20 text-red-400 border border-red-500/30 font-semibold py-2.5 rounded-xl text-xs hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'reject' ? 'Rejecting...' : '✗ Reject'}
                    </button>
                  </div>
                </div>
              </div>

              {galleryOpen && app.portfolio.images?.length > 0 && (
                  <div
                      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                      onClick={() => setGalleryOpen(false)}
                  >
                    <img src={app.portfolio.images[activeImg]} alt="" className="max-h-[85vh] max-w-full rounded-xl object-contain" />
                    <div className="absolute bottom-8 flex gap-3">
                      {app.portfolio.images.map((_, i) => (
                          <button
                              key={i}
                              onClick={e => { e.stopPropagation(); setActiveImg(i) }}
                              className={`w-2 h-2 rounded-full transition-colors ${i === activeImg ? 'bg-white' : 'bg-white/40'}`}
                          />
                      ))}
                    </div>
                  </div>
              )}

              {docLightbox && (
                  <div
                      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-zinc-950/85 backdrop-blur-md"
                      role="dialog"
                      aria-modal="true"
                      aria-label={docLightbox.title}
                      onClick={() => setDocLightbox(null)}
                  >
                    <div
                        className="relative w-full max-w-5xl"
                        onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <p className="text-sm font-semibold text-white/90 drop-shadow-sm">{docLightbox.title}</p>
                        <button
                            type="button"
                            onClick={() => setDocLightbox(null)}
                            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                            aria-label="Close preview"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="rounded-2xl bg-black/40 ring-1 ring-white/10 shadow-2xl overflow-hidden">
                        <img
                            src={docLightbox.src}
                            alt={docLightbox.title}
                            className="block max-h-[78vh] w-full object-contain mx-auto"
                        />
                      </div>
                      <p className="mt-3 text-center text-xs text-white/50">Click outside or press Esc to close</p>
                    </div>
                  </div>
              )}
            </div>
        )}
      </div>
  )
}

export default function Verification() {
  const dispatch = useDispatch()
  const filter = useSelector(s => s.verification.filter)
  const filtered = useSelector(selectFilteredVerifications)
  const { list, loading, error } = useSelector(s => s.verification)

  useEffect(() => {
    dispatch(fetchPendingArtists())
  }, [dispatch])

  const total = list.length
  const todayCount = list.filter(v => v.isToday).length
  const resubmittedCount = list.filter(v => v.isResubmitted).length

  const filterTabs = [
    { label: `All (${total})`,             value: 'all' },
    { label: `Today (${todayCount})`,       value: 'today' },
    { label: `Re-Submitted (${resubmittedCount})`, value: 'resubmitted' },
  ]

  return (
      <div>
        <PageHeader
            title="Verification"
            subtitle={`${total} application${total !== 1 ? 's' : ''} awaiting review.`}
        />

        <div className="overflow-x-auto mb-5">
          <FilterTabs tabs={filterTabs} active={filter} onChange={v => dispatch(setFilter(v))} />
        </div>

        {loading && (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 text-sm border border-gray-100 shadow-sm">
              Loading applications...
            </div>
        )}

        {error && !loading && (
            <div className="bg-white rounded-2xl p-12 text-center text-red-400 text-sm border border-gray-100 shadow-sm">
              {error}
            </div>
        )}

        {!loading && (
            <div>
              {filtered.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center text-gray-400 text-sm border border-gray-100 shadow-sm">
                    No applications to review.
                  </div>
              ) : (
                  filtered.map(app => <VerificationCard key={app.id} app={app} />)
              )}
            </div>
        )}
      </div>
  )
}
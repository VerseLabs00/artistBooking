import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { 
  User, 
  Settings, 
  LogOut, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  Heart,
  Search,
  ArrowLeft,
  Loader2,
  X,
  CreditCard,
  FileText,
  Camera
} from 'lucide-react'
import { getBookings, getBooking, cancelBooking, retryBookingPayment } from '../services/bookingService'
import { toggleFavorite, getFavorites } from '../services/favoriteService'
import type { BookingSummary } from '../services/bookingService'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'
import api from '../lib/api'

// Submits a hidden form to PayHere checkout (same pattern as BookingModal)
function submitToPayHere(payhere: Record<string, string>) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = payhere.checkout_url
  Object.entries(payhere).forEach(([key, value]) => {
    if (key === 'checkout_url') return
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = String(value)
    form.appendChild(input)
  })
  document.body.appendChild(form)
  form.submit()
}

// --- Extended Booking Type for UI ---
interface DetailedBooking extends BookingSummary {
  artist_name: string
  artist_image: string
  event_date: string
  event_type: string
  venue: string
  event_start_time: string
  event_duration_hours?: number
  special_notes: string
  payment_status: string
}

// --- Normalization Helper (Inspired by Admin implementation) ---
function normalizeBooking(b: any): DetailedBooking {
  const artist = b.artist_profile || b.artistProfile || b.artist || {}
  
  return {
    ...b,
    artist_name: artist.stage_name || artist.full_name || b.artist_name || "Artist",
    artist_image: artist.avatar_url || artist.avatar || b.artist_image || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80",
    event_date: b.event_date || "N/A",
    event_type: b.event_type || "N/A",
    venue: b.venue || "To be shared",
    event_start_time: b.event_start_time || "TBD",
    special_notes: b.special_notes || "",
    payment_status: b.payment_status || "Pending"
  }
}

export default function CustomerAccount() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, setUser, logout } = useAuth()
  const [bookings, setBookings] = useState<DetailedBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'favorites' | 'settings'>(
    (location.state as any)?.tab === 'bookings' ? 'bookings' : 'overview'
  )
  const [uploading, setUploading] = useState(false)
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false)
  const [customerFavorites, setCustomerFavorites] = useState<Array<{ id: string; name: string; category: string; location: string; avatar_url: string }>>([])
  const [favoritesCount, setFavoritesCount] = useState(0)
  
  // Details Modal State
  const [selectedBooking, setSelectedBooking] = useState<DetailedBooking | null>(null)
  const [detailsLoading, setDetailsLoading] = useState<string | null>(null)
  const [retryingPayment, setRetryingPayment] = useState(false)

  useEffect(() => {
    fetchBookings()
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const data = await getFavorites()
      setCustomerFavorites(data)
      setFavoritesCount(data.length)
    } catch (err) {
      console.error("Failed to fetch favorites:", err)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUser(data.user)
    } catch (err: any) {
      console.error("Failed to upload avatar", err)
      const msg = err.response?.data?.message || "Failed to upload photo. Please try again."
      alert(msg)
    } finally {
      setUploading(false)
    }
  }

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const response = await getBookings()
      // Handle both { data: [...] } and directly [...]
      const raw = Array.isArray(response) ? response : (response.data || [])
      
      // Sort by created_at descending (newest first)
      const sorted = raw.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      const mapped = sorted.map(normalizeBooking)
      setBookings(mapped)
    } catch (err) {
      console.error("Failed to fetch bookings", err)
    } finally {
      setLoading(false)
    }
  }

  const handleShowDetails = async (id: string) => {
    setDetailsLoading(id)
    try {
      const data = await getBooking(id)
      const normalized = normalizeBooking(data)
      setSelectedBooking(normalized)
      // Sync fresh status back into the list so the card updates too
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...normalized } : b))
    } catch (err) {
      alert("Failed to fetch booking details.")
    } finally {
      setDetailsLoading(null)
    }
  }

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return
    
    setCancellingId(id)
    try {
      await cancelBooking(id)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, booking_status: 'cancelled' } : b))
      if (selectedBooking?.id === id) {
        setSelectedBooking(prev => prev ? { ...prev, booking_status: 'cancelled' } : null)
      }
    } catch (err) {
      alert("Failed to cancel booking. Please contact support.")
    } finally {
      setCancellingId(null)
    }
  }

  const handleRetryPayment = async (id: string) => {
    setRetryingPayment(true)
    try {
      const data = await retryBookingPayment(id)
      submitToPayHere(data.payhere as unknown as Record<string, string>)
      setRetryingPayment(false)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to retry payment. Please try again.')
      setRetryingPayment(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': 
      case 'pending_payment': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'awaiting_confirmation': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'rejected':
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusMessage = (status: string, paymentStatus?: string, balanceDue?: number) => {
    if (status?.toLowerCase() === 'confirmed' && paymentStatus === 'paid') {
      const due = typeof balanceDue === 'number' && balanceDue > 0
        ? ` Your due balance of Rs. ${balanceDue.toLocaleString()} must be paid at the event.`
        : ''
      return `✓ Advance payment successful!${due}`
    }
    switch (status?.toLowerCase()) {
      case 'awaiting_confirmation': return 'Waiting for the artist to accept your request.'
      case 'confirmed': return 'Artist accepted! Complete your advance payment to lock the booking.'
      case 'rejected': return 'The artist has declined this request. You can browse other artists.'
      case 'cancelled': return 'This booking has been cancelled.'
      case 'pending_payment': return 'Payment is pending. Please complete the advance payment.'
      case 'completed': return 'This event has been successfully completed.'
      default: return 'Your request is being processed.'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "'Fraunces', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700;800;900&display=swap');
        .pink-text { color: #E8194B; }
        .bg-pink { background-color: #E8194B; }
        .btn-pink { background: #E8194B; color: #fff; transition: all 0.2s; }
        .btn-pink:hover { background: #c8133b; transform: translateY(-1px); }
        .tab-active { color: #E8194B; border-bottom: 2px solid #E8194B; }
        .glass-card { background: rgba(255, 255, 255, 0.9); backdrop-blur-md; border: 1px solid rgba(255, 255, 255, 0.4); }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X size={24} className="text-gray-400" />
            </button>

            <div className="flex flex-col md:flex-row max-h-[90vh]">
              <div className="w-full md:w-1/3 bg-gray-100 sticky top-0 self-start h-64 md:h-[90vh] z-10">
                <img
                    src={selectedBooking.artist_image}
                    className="w-full h-full object-cover"
                    alt=""
                />
              </div>
              <div className="w-full md:w-2/3 p-8 overflow-y-auto max-h-[90vh]">
                <div className="mb-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(selectedBooking.booking_status)}`}>
                    {selectedBooking.booking_status}
                  </span>
                  <h2 className="text-3xl font-black text-gray-900 mt-3">{selectedBooking.artist_name}</h2>
                  <p className="text-pink font-bold text-sm">{selectedBooking.event_type}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Event Date</p>
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                      <Calendar size={16} className="text-pink" />
                      <span>{selectedBooking.event_date}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Start Time</p>
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                      <Clock size={16} className="text-pink" />
                      <span>{selectedBooking.event_start_time}</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Venue</p>
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                      <MapPin size={16} className="text-pink" />
                      <span>{selectedBooking.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 space-y-4">
                  <div className={`rounded-xl p-4 border flex items-center gap-3 mb-2 ${selectedBooking.booking_status === 'confirmed' && selectedBooking.payment_status === 'paid' ? 'bg-green-50 border-green-200' : 'bg-pink/5 border-pink/10'}`}>
                    {selectedBooking.booking_status === 'confirmed' && selectedBooking.payment_status === 'paid'
                      ? <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                      : <AlertCircle size={18} className="text-pink flex-shrink-0" />
                    }
                    <p className={`text-xs font-bold ${selectedBooking.booking_status === 'confirmed' && selectedBooking.payment_status === 'paid' ? 'text-green-700' : 'text-gray-700'}`}>
                      {getStatusMessage(selectedBooking.booking_status, selectedBooking.payment_status, (selectedBooking.agreed_price || 0) - (selectedBooking.advance_amount || 0))}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                      <CreditCard size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Total Price</span>
                    </div>
                    <span className="text-lg font-black text-gray-900">Rs. {selectedBooking.agreed_price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                      <FileText size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Advance</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">Rs. {selectedBooking.advance_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-pink">
                      <CreditCard size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Now to Pay</span>
                    </div>
                    <span className="text-lg font-black text-pink">Rs. {(selectedBooking.total_payment || selectedBooking.agreed_price).toLocaleString()}</span>
                  </div>
                </div>

                {selectedBooking.special_notes && (
                  <div className="mb-8">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Special Notes</p>
                    <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl italic">
                      "{selectedBooking.special_notes}"
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  {(selectedBooking.booking_status === 'confirmed' && selectedBooking.payment_status !== 'paid') && (
                    <button
                      onClick={() => !retryingPayment && handleRetryPayment(selectedBooking.id)}
                      disabled={retryingPayment}
                      className="flex-1 btn-pink px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {retryingPayment ? (
                        <><Loader2 size={16} className="animate-spin" /> Redirecting...</>
                      ) : (
                        <><CreditCard size={16} /> Complete Payment</>
                      )}
                    </button>
                  )}
                  {(selectedBooking.booking_status === 'awaiting_confirmation' || selectedBooking.booking_status === 'pending_payment') && (
                    <button 
                      onClick={() => handleCancelBooking(selectedBooking.id)}
                      disabled={cancellingId === selectedBooking.id}
                      className="flex-1 px-6 py-4 border border-red-200 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {cancellingId === selectedBooking.id ? 'Processing...' : 'Cancel Booking'}
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedBooking(null)}
                    className="flex-1 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-colors px-6 py-4"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="w-full flex items-center justify-between px-4 sm:px-6 md:px-12 py-3 sm:py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
        <Link to="/home" className="flex items-center shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/assets/logo/logo-navbar-light@3x.png" alt="Perfoma" className="h-8 sm:h-10 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => navigate('/home')} className="text-gray-600 hover:text-black transition-colors text-xs sm:text-sm font-semibold whitespace-nowrap">
            <span className="hidden sm:inline">Back to Discovery</span>
            <span className="sm:hidden">Back</span>
          </button>
          <button
            onClick={() => setFavoritesModalOpen(true)}
            className="relative text-gray-600 hover:text-red-500 transition-colors"
          >
            <Heart size={20} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="flex-grow max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-8 py-6 sm:py-10">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
          
          {/* SIDEBAR */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 md:sticky md:top-24">
              <div className="text-center mb-8">
                <div className="relative w-24 h-24 mx-auto mb-4 group">
                  <div className="w-24 h-24 rounded-full bg-pink/10 overflow-hidden flex items-center justify-center text-pink border-2 border-pink/20">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <User size={40} />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                        <Loader2 className="animate-spin text-white" size={24} />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group-hover:scale-110">
                    <Camera size={16} className="text-pink" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarChange}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <h2 className="font-bold text-xl text-gray-900">{user?.name || 'Customer'}</h2>
                <p className="text-gray-500 text-xs mt-1">{user?.email}</p>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'overview', icon: <Search size={18} />, label: 'Overview' },
                  { id: 'bookings', icon: <Calendar size={18} />, label: 'My Bookings' },
                  { id: 'favorites', icon: <Heart size={18} />, label: 'Favorites' },
                  { id: 'settings', icon: <Settings size={18} />, label: 'Settings' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === item.id 
                        ? 'bg-pink text-white shadow-lg shadow-pink/20' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all mt-8"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 min-w-0">
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                  <h1 className="text-xl font-black text-gray-900">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                  <p className="text-gray-500 mt-2">Manage your bookings and keep track of your favorite artists.</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Bookings</p>
                    <p className="text-3xl font-black text-gray-900">{bookings.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Upcoming</p>
                    <p className="text-3xl font-black text-pink">{bookings.filter(b => b.booking_status === 'confirmed' || b.booking_status === 'pending' || b.booking_status === 'pending_payment').length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Completed</p>
                    <p className="text-3xl font-black text-gray-900">{bookings.filter(b => b.booking_status === 'completed').length}</p>
                  </div>
                </div>

                {/* Recent Bookings */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
                    <button onClick={() => setActiveTab('bookings')} className="text-pink text-sm font-bold flex items-center gap-1 hover:underline">
                      View all <ChevronRight size={16} />
                    </button>
                  </div>
                  
                  {loading ? (
                    <div className="space-y-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                          <div className="w-20 h-20 rounded-2xl bg-gray-100 animate-pulse flex-shrink-0" />
                          <div className="flex-1 text-center sm:text-left">
                            <div className="h-5 bg-gray-100 rounded w-32 animate-pulse mb-2" />
                            <div className="h-4 bg-gray-100 rounded w-40 animate-pulse mb-3" />
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                              <div className="h-6 bg-gray-100 rounded-full w-20 animate-pulse" />
                              <div className="h-4 bg-gray-100 rounded w-16 animate-pulse" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="h-9 bg-gray-100 rounded-xl w-20 animate-pulse" />
                            <div className="h-9 bg-gray-100 rounded-xl w-16 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 px-6">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                        <Calendar size={32} />
                      </div>
                      <h4 className="font-bold text-gray-900">No bookings yet</h4>
                      <p className="text-gray-500 text-sm mt-2 mb-6">Start exploring Sri Lanka's best artists for your next event.</p>
                      <button onClick={() => navigate('/home')} className="btn-pink px-8 py-3 rounded-2xl font-bold text-sm">Explore Artists</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.slice(0, 3).map(booking => (
                        <div key={booking.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6 hover:shadow-md transition-shadow">
                          <img src={booking.artist_image} className="w-20 h-20 rounded-2xl object-cover" alt={booking.artist_name} />
                          <div className="flex-1 text-center sm:text-left">
                            <h4 className="font-bold text-gray-900 text-lg">{booking.artist_name}</h4>
                            <p className="text-gray-500 text-sm mt-1 flex items-center justify-center sm:justify-start gap-1">
                              <Calendar size={14} className="text-pink" /> {booking.event_date}
                            </p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(booking.booking_status)}`}>
                                {booking.booking_status}
                              </span>
                              <span className="text-xs font-bold text-gray-900">Rs. {(booking.total_payment || booking.agreed_price).toLocaleString()}</span>
                              {booking.booking_status === 'confirmed' && booking.payment_status === 'paid' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                                  ✓ Advance Paid
                                </span>
                              )}
                            </div>
                            <p className={`text-[10px] font-bold mt-2 ${booking.booking_status === 'confirmed' && booking.payment_status === 'paid' ? 'text-green-600' : 'text-pink animate-pulse'}`}>
                              {getStatusMessage(booking.booking_status, booking.payment_status, (booking.agreed_price || 0) - (booking.advance_amount || 0))}
                            </p>
                          </div>
                          <div className="flex gap-2">
                             <button 
                               onClick={() => handleShowDetails(booking.id)}
                               className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center gap-2"
                             >
                               {detailsLoading === booking.id && <Loader2 size={12} className="animate-spin" />}
                               Details
                             </button>
                             {(booking.booking_status === 'awaiting_confirmation' || booking.booking_status === 'pending_payment') && (
                               <button 
                                 onClick={() => handleCancelBooking(booking.id)}
                                 disabled={cancellingId === booking.id}
                                 className="px-5 py-2.5 border border-red-200 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                               >
                                 {cancellingId === booking.id ? '...' : 'Cancel'}
                               </button>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-black text-gray-900">My Bookings</h1>
                    <p className="text-gray-500 mt-1">Track and manage your history of event bookings.</p>
                  </div>
                  <button onClick={fetchBookings} className="p-2 text-gray-400 hover:text-pink transition-colors">
                    <Loader2 className={loading ? "animate-spin" : ""} size={20} />
                  </button>
                </header>

                <div className="space-y-4">
                  {loading ? (
                    [1,2,3].map(i => (
                      <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="w-full md:w-48 h-32 rounded-2xl bg-gray-100 animate-pulse flex-shrink-0" />
                          <div className="flex-1">
                            <div className="h-5 bg-gray-100 rounded w-32 animate-pulse mb-2" />
                            <div className="h-4 bg-gray-100 rounded w-24 animate-pulse mb-4" />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                            </div>
                            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-50">
                              <div className="h-9 bg-gray-100 rounded-xl w-24 animate-pulse" />
                              <div className="h-9 bg-gray-100 rounded-xl w-28 animate-pulse" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    bookings.map(booking => (
                    <div key={booking.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="relative w-full md:w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                          <img src={booking.artist_image} className="w-full h-full object-cover" alt={booking.artist_name} />
                          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase border glass-card ${getStatusColor(booking.booking_status)}`}>
                            {booking.booking_status}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{booking.artist_name}</h3>
                              <p className="text-pink text-sm font-semibold">{booking.event_type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Now to Pay</p>
                              <p className="text-xl font-black text-gray-900">Rs. {(booking.total_payment || booking.agreed_price).toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <Calendar size={16} />
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Date</p>
                                <p className="text-xs font-bold text-gray-900">{booking.event_date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <Clock size={16} />
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Advance</p>
                                <p className="text-xs font-bold text-gray-900">Rs. {booking.advance_amount.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <AlertCircle size={16} />
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Payment</p>
                                <p className="text-xs font-bold text-gray-900">{booking.payment_status}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-50">
                            <p className={`mr-auto text-[10px] font-bold ${booking.booking_status === 'confirmed' && booking.payment_status === 'paid' ? 'text-green-600' : 'text-pink animate-pulse'}`}>
                              {getStatusMessage(booking.booking_status, booking.payment_status, (booking.agreed_price || 0) - (booking.advance_amount || 0))}
                            </p>
                            {booking.booking_status !== 'cancelled' && booking.booking_status !== 'completed' && !(booking.booking_status === 'confirmed' && booking.payment_status === 'paid') && (
                              <button 
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={cancellingId === booking.id}
                                className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
                              >
                                {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                              </button>
                            )}
                            <button 
                              onClick={() => handleShowDetails(booking.id)}
                              className="btn-pink px-8 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                            >
                              {detailsLoading === booking.id && <Loader2 size={12} className="animate-spin" />}
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )))}
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                  <h1 className="text-3xl font-black text-gray-900">My Favorites</h1>
                  <p className="text-gray-500 mt-1">Artists you've saved for later.</p>
                </header>
                {customerFavorites.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                    <Heart size={40} className="text-gray-200 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900">No favorites yet</h3>
                    <p className="text-gray-500 text-sm mt-2">Explore artists and tap the heart to save them here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customerFavorites.map(artist => (
                      <div key={artist.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <img
                          src={artist.avatar_url || '/assets/default-avatar.png'}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                          alt={artist.name}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{artist.name}</p>
                          <p className="text-xs text-gray-500 truncate">{artist.category} · {artist.location}</p>
                        </div>
                        <Link to={`/artistProfile/${artist.id}`} className="text-pink hover:underline">
                          <ChevronRight size={18} />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(activeTab === 'settings') && (
              <div className="flex flex-col items-center justify-center py-40 bg-white rounded-3xl border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-pink/5 rounded-full flex items-center justify-center text-pink mb-4">
                  <Settings size={40} />
                </div>
                <h3 className="font-bold text-xl text-gray-900">Coming Soon</h3>
                <p className="text-gray-500 text-sm mt-2">This feature is currently under development.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/*<Footer />*/}

      {/* Favorites Modal */}
      {favoritesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setFavoritesModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Favorite Artists</h3>
              <button onClick={() => setFavoritesModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              {customerFavorites.length === 0 ? (
                <div className="text-center py-10">
                  <Heart size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No favorite artists yet.</p>
                  <p className="text-gray-400 text-xs mt-1">Explore artists and tap the heart to add them here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerFavorites.map(artist => (
                    <div key={artist.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                      <img
                        src={artist.avatar_url || '/assets/default-avatar.png'}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                        alt={artist.name}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{artist.name}</p>
                        <p className="text-xs text-gray-500 truncate">{artist.category} · {artist.location}</p>
                      </div>
                      <Link
                        to={`/artistProfile/${artist.id}`}
                        className="text-xs text-pink font-semibold hover:underline whitespace-nowrap"
                        onClick={() => setFavoritesModalOpen(false)}
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

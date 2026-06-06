import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
import { getBookings, getBooking, cancelBooking } from '../services/bookingService'
import type { BookingSummary } from '../services/bookingService'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'
import api from '../lib/api'

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
  const { user, setUser, logout } = useAuth()
  const [bookings, setBookings] = useState<DetailedBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'favorites' | 'settings'>('overview')
  const [uploading, setUploading] = useState(false)
  
  // Details Modal State
  const [selectedBooking, setSelectedBooking] = useState<DetailedBooking | null>(null)
  const [detailsLoading, setDetailsLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

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
      setSelectedBooking(normalizeBooking(data))
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

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': 
      case 'pending_payment': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'rejected':
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'The artist has accepted your booking! Get ready for the event.'
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
            
            <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto">
              <div className="w-full md:w-1/3 bg-gray-100">
                <img src={selectedBooking.artist_image} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="w-full md:w-2/3 p-8">
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
                  <div className="bg-pink/5 rounded-xl p-4 border border-pink/10 flex items-center gap-3 mb-2">
                    <AlertCircle size={18} className="text-pink flex-shrink-0" />
                    <p className="text-xs font-bold text-gray-700">{getStatusMessage(selectedBooking.booking_status)}</p>
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
                      <span className="text-xs font-bold uppercase tracking-wider">Paid Advance</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">Rs. {selectedBooking.advance_amount.toLocaleString()}</span>
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
                  {selectedBooking.booking_status !== 'cancelled' && selectedBooking.booking_status !== 'confirmed' && (
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
      <nav className="w-full flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
        <Link to="/" className="flex items-center">
          <img src="/assets/logo/logo-navbar-light@3x.png" alt="Perfoma" className="h-10 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/home')} className="text-gray-600 hover:text-black transition-colors text-sm font-semibold">Back to Discovery</button>
          {/*<div className="w-10 h-10 rounded-full bg-pink flex items-center justify-center text-white font-bold">*/}
          {/*  {user?.name?.[0] || 'C'}*/}
          {/*</div>*/}
        </div>
      </nav>

      <div className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
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
                  <h1 className="text-3xl font-black text-gray-900">Welcome back, {user?.name?.split(' ')[0]}!</h1>
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
                    <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
                      <Loader2 className="animate-spin text-pink" size={32} />
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
                              <span className="text-xs font-bold text-gray-900">Rs. {booking.agreed_price.toLocaleString()}</span>
                            </div>
                            <p className="text-[10px] font-bold mt-2 text-pink animate-pulse">{getStatusMessage(booking.booking_status)}</p>
                          </div>
                          <div className="flex gap-2">
                             <button 
                               onClick={() => handleShowDetails(booking.id)}
                               className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center gap-2"
                             >
                               {detailsLoading === booking.id && <Loader2 size={12} className="animate-spin" />}
                               Details
                             </button>
                             {booking.booking_status !== 'cancelled' && booking.booking_status !== 'confirmed' && (
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
                  {bookings.map(booking => (
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
                              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Price</p>
                              <p className="text-xl font-black text-gray-900">Rs. {booking.agreed_price.toLocaleString()}</p>
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
                            <p className="mr-auto text-[10px] font-bold text-pink animate-pulse">{getStatusMessage(booking.booking_status)}</p>
                            {booking.booking_status !== 'cancelled' && booking.booking_status !== 'confirmed' && booking.booking_status !== 'completed' && (
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
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'favorites' || activeTab === 'settings') && (
              <div className="flex flex-col items-center justify-center py-40 bg-white rounded-3xl border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-pink/5 rounded-full flex items-center justify-center text-pink mb-4">
                  {activeTab === 'favorites' ? <Heart size={40} /> : <Settings size={40} />}
                </div>
                <h3 className="font-bold text-xl text-gray-900">Coming Soon</h3>
                <p className="text-gray-500 text-sm mt-2">This feature is currently under development.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}

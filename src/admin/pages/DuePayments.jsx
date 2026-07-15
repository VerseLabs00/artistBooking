import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getDuePaymentsApi, markAdvanceSentApi } from '../api/bookingsApi'
import PageHeader from '../components/common/PageHeader'
import SearchBar from '../components/common/SearchBar'
import { CheckCircle, Clock, Banknote, Users, RefreshCw } from 'lucide-react'

function ArtistSummaryCard({ artist, bookingCount, totalDue }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <img
        src={artist.avatar}
        alt={artist.name}
        className="w-11 h-11 rounded-full object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{artist.name}</p>
        <p className="text-xs text-gray-400">{bookingCount} booking{bookingCount !== 1 ? 's' : ''} pending</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-gray-400">Total Due</p>
        <p className="text-sm font-extrabold text-primary">LKR {totalDue.toLocaleString()}</p>
      </div>
    </div>
  )
}

export default function DuePayments() {
  const [bookings, setBookings]     = useState([])
  const [byArtist, setByArtist]     = useState([])
  const [totalDue, setTotalDue]     = useState(0)
  const [loading, setLoading]       = useState(true)
  const [sending, setSending]       = useState(null)   // booking id currently being processed
  const [search, setSearch]         = useState('')
  const [tab, setTab]               = useState('bookings') // 'bookings' | 'artists'

  const load = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const { data } = await getDuePaymentsApi(q ? { search: q } : {})
      setBookings(data.bookings ?? [])
      setByArtist(data.by_artist ?? [])
      setTotalDue(data.total_due ?? 0)
    } catch {
      toast.error('Failed to load due payments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSearch = (v) => {
    setSearch(v)
    load(v)
  }

  const handleMarkSent = async (booking) => {
    if (sending) return
    setSending(booking.id)
    try {
      await markAdvanceSentApi(booking.id)
      toast.success(`✅ Advance sent to ${booking.artist.name} — artist notified by email`)
      // Remove from list
      setBookings(prev => prev.filter(b => b.id !== booking.id))
      setByArtist(prev =>
        prev
          .map(a =>
            a.artist.id === booking.artist.id
              ? { ...a, booking_count: a.booking_count - 1, total_due: a.total_due - booking.advance_amount_raw }
              : a
          )
          .filter(a => a.booking_count > 0)
      )
      setTotalDue(prev => Math.max(0, prev - booking.advance_amount_raw))
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to mark as sent')
    } finally {
      setSending(null)
    }
  }

  const statCards = [
    { label: 'Total Due',       value: `LKR ${totalDue.toLocaleString()}`, icon: <Banknote size={20} />, color: 'text-primary' },
    { label: 'Pending Payouts', value: bookings.length,                     icon: <Clock size={20} />,    color: 'text-amber-500' },
    { label: 'Artists Owed',    value: byArtist.length,                     icon: <Users size={20} />,    color: 'text-indigo-500' },
  ]

  return (
    <div>
      <PageHeader
        title="Due Payments"
        subtitle="Advance amounts the platform needs to send to artists."
        action={
          <button
            onClick={() => load(search)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {statCards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
            <div className={`${c.color} bg-gray-50 rounded-xl p-2.5`}>{c.icon}</div>
            <div>
              <p className="text-xs text-gray-400">{c.label}</p>
              <p className={`text-xl font-extrabold ${c.color}`}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-gray-100">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search artist or customer..."
          />
          <div className="flex gap-1">
            {['bookings', 'artists'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                  tab === t ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Artists summary tab */}
        {tab === 'artists' && (
          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-gray-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
                      <div className="h-3 bg-gray-100 rounded w-20 animate-pulse" />
                    </div>
                    <div className="h-5 bg-gray-100 rounded w-24 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : byArtist.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                <CheckCircle size={32} className="mx-auto mb-3 text-green-300" />
                No pending artist payouts.
              </div>
            ) : (
              <div className="space-y-3">
                {byArtist.map(a => (
                  <ArtistSummaryCard
                    key={a.artist.id}
                    artist={a.artist}
                    bookingCount={a.booking_count}
                    totalDue={a.total_due}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings tab */}
        {tab === 'bookings' && (
          <>
            {loading ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="table-header text-left">Artist</th>
                      <th className="table-header text-left">Customer</th>
                      <th className="table-header text-left hidden md:table-cell">Event</th>
                      <th className="table-header text-left hidden md:table-cell">Date</th>
                      <th className="table-header text-left">Advance Due</th>
                      <th className="table-header text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1,2,3,4,5].map(i => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="table-cell"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gray-100 animate-pulse" /><div className="h-4 bg-gray-100 rounded w-24 animate-pulse" /></div></td>
                        <td className="table-cell"><div className="h-4 bg-gray-100 rounded w-20 animate-pulse" /></td>
                        <td className="table-cell hidden md:table-cell"><div className="h-4 bg-gray-100 rounded w-16 animate-pulse" /></td>
                        <td className="table-cell hidden md:table-cell"><div className="h-4 bg-gray-100 rounded w-20 animate-pulse" /></td>
                        <td className="table-cell"><div className="h-4 bg-gray-100 rounded w-20 animate-pulse" /></td>
                        <td className="table-cell"><div className="h-8 bg-gray-100 rounded w-28 animate-pulse" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                <CheckCircle size={32} className="mx-auto mb-3 text-green-300" />
                All artist advances have been paid out. 🎉
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="table-header text-left">Artist</th>
                      <th className="table-header text-left">Customer</th>
                      <th className="table-header text-left hidden md:table-cell">Event</th>
                      <th className="table-header text-left hidden md:table-cell">Date</th>
                      <th className="table-header text-left">Advance Due</th>
                      <th className="table-header text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <img src={booking.artist.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate max-w-[80px] md:max-w-none">{booking.artist.name}</p>
                              <p className="text-[10px] text-gray-400 truncate max-w-[80px] md:max-w-none">{booking.artist.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell text-sm text-gray-700">{booking.customer_name}</td>
                        <td className="table-cell text-xs text-gray-500 hidden md:table-cell">{booking.event_type}</td>
                        <td className="table-cell text-xs text-gray-500 hidden md:table-cell">{booking.event_date}</td>
                        <td className="table-cell">
                          <div>
                            <p className="text-sm font-extrabold text-primary">{booking.advance_amount}</p>
                            <p className="text-[10px] text-gray-400">of {booking.agreed_price} total</p>
                          </div>
                        </td>
                        <td className="table-cell">
                          <button
                            onClick={() => handleMarkSent(booking)}
                            disabled={sending === booking.id}
                            className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <CheckCircle size={13} />
                            {sending === booking.id ? 'Sending...' : 'Mark Sent'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 text-xs text-gray-400">
                  {bookings.length} booking{bookings.length !== 1 ? 's' : ''} pending payout
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
        <strong>How this works:</strong> When a customer pays, the platform receives the advance + platform fee.
        The advance portion needs to be transferred to the artist's bank account.
        Click <strong>Mark Sent</strong> after you've made the transfer — the artist will be notified by email and in-app notification.
      </div>
    </div>
  )
}

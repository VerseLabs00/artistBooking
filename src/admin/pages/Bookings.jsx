import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  fetchBookings,
  updateBookingStatus,
  setFilter,
  setSearchQuery,
  selectFilteredBookings,
} from '../features/bookings/bookingsSlice'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import SearchBar from '../components/common/SearchBar'
import FilterTabs from '../components/common/FilterTabs'
import StatusBadge from '../components/common/StatusBadge'
import BookingModal from '../components/common/BookingModal'

const filterTabs = [
  { label: 'All', value: 'all' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
]

export default function Bookings() {
  const dispatch = useDispatch()
  const all = useSelector(s => s.bookings.list)
  const filter = useSelector(s => s.bookings.filter)
  const searchQuery = useSelector(s => s.bookings.searchQuery)
  const filtered = useSelector(selectFilteredBookings)
  const { loading, error } = useSelector(s => s.bookings)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchBookings())
  }, [dispatch])

  const confirmed = all.filter(b => b.status === 'confirmed').length
  const pending = all.filter(b => b.status === 'pending').length
  const completed = all.filter(b => b.status === 'completed').length
  const cancelled = all.filter(b => b.status === 'cancelled').length

  const handleCancel = async (booking) => {
    const result = await dispatch(updateBookingStatus({ id: booking.id, status: 'cancelled' }))
    if (updateBookingStatus.fulfilled.match(result)) {
      toast.error(`Booking #${booking.id} cancelled`)
    } else {
      toast.error(result.payload || 'Failed to cancel')
    }
  }

  return (
    <div>
      <PageHeader title="Bookings" subtitle="Track all bookings across the platform." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        <StatCard label="Confirmed" value={confirmed} />
        <StatCard label="Pending" value={pending} />
        <StatCard label="Completed" value={completed} />
        <StatCard label="Cancelled" value={cancelled} badge={cancelled > 0 ? String(cancelled) : null} badgeColor="red" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-gray-100">
          <SearchBar value={searchQuery} onChange={v => dispatch(setSearchQuery(v))} placeholder="Search booking..." />
          <div className="overflow-x-auto w-full sm:w-auto">
            <FilterTabs tabs={filterTabs} active={filter} onChange={v => dispatch(setFilter(v))} />
          </div>
        </div>

        {loading && <div className="text-center py-12 text-gray-400 text-sm">Loading bookings...</div>}
        {error && !loading && <div className="text-center py-12 text-red-400 text-sm">{error}</div>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header text-left">ID</th>
                  <th className="table-header text-left">Customer</th>
                  <th className="table-header text-left">Artist</th>
                  <th className="table-header text-left hidden md:table-cell">Event</th>
                  <th className="table-header text-left hidden md:table-cell">Date</th>
                  <th className="table-header text-left">Amount</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No bookings found.</td></tr>
                ) : (
                  filtered.map(booking => (
                    <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-mono text-xs text-gray-500">#{booking.id}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <img src={booking.customer?.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                          <span className="text-sm font-medium text-gray-700 truncate max-w-[80px] md:max-w-none">{booking.customer?.name}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <img src={booking.artist?.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[80px] md:max-w-none">{booking.artist?.name}</p>
                            <p className="text-xs text-gray-400 hidden sm:block">{booking.artist?.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-xs text-gray-500 hidden md:table-cell">{booking.eventType}</td>
                      <td className="table-cell text-xs text-gray-500 hidden md:table-cell">{booking.date}</td>
                      <td className="table-cell font-semibold text-sm text-gray-900">{booking.amount}</td>
                      <td className="table-cell"><StatusBadge status={booking.status} /></td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1 md:gap-2">
                          <button onClick={() => { setSelectedBooking(booking); setModalOpen(true) }} className="btn-secondary text-xs px-2 md:px-3 py-1.5">View</button>
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <button onClick={() => handleCancel(booking)} className="btn-danger text-xs px-2 md:px-3 py-1.5 hidden sm:inline-flex">Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && <div className="px-4 py-3 text-xs text-gray-400">Showing {filtered.length} of {all.length} bookings</div>}
      </div>

      {modalOpen && selectedBooking && (
        <BookingModal booking={selectedBooking} onClose={() => setModalOpen(false)} />
      )}
    </div>
  )
}

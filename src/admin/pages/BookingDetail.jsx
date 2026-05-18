import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft, MapPin, Calendar, Clock, Star, AlertTriangle, MessageSquare, CheckCircle, XCircle } from 'lucide-react'
import { fetchBooking, updateBookingStatus, clearSelected } from '../features/bookings/bookingsSlice'

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

function InfoRow({ label, value, valueClass = '' }) {
  return (
    <div className="flex justify-between items-start border-b border-gray-50 py-3 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm font-semibold text-gray-900 text-right ${valueClass}`}>{value || '—'}</span>
    </div>
  )
}

const statusConfig = {
  confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed', icon: <CheckCircle size={14} /> },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: <Clock size={14} /> },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed', icon: <CheckCircle size={14} /> },
  cancelled: { bg: 'bg-red-100', text: 'text-red-600', label: 'Cancelled', icon: <XCircle size={14} /> },
}

const paymentBadge = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  refunded: 'bg-purple-100 text-purple-700',
  'n/a': 'bg-gray-100 text-gray-400',
}

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selected: booking, selectedLoading } = useSelector(s => s.bookings)
  const [modal, setModal] = useState(false)

  useEffect(() => {
    dispatch(fetchBooking(id))
    return () => dispatch(clearSelected())
  }, [id, dispatch])

  const handleCancel = async () => {
    const result = await dispatch(updateBookingStatus({ id: booking.id, status: 'cancelled' }))
    if (updateBookingStatus.fulfilled.match(result)) {
      toast.error(`Booking #${booking.id} has been cancelled.`)
    } else {
      toast.error(result.payload || 'Failed to cancel')
    }
    setModal(false)
  }

  if (selectedLoading || !booking) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-400 text-sm">{selectedLoading ? 'Loading booking...' : 'Booking not found.'}</p>
        <button onClick={() => navigate('/bookings')} className="btn-primary">Back to Bookings</button>
      </div>
    )
  }

  const status = statusConfig[booking.status] || statusConfig.pending

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/bookings')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Bookings
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900">Booking #{booking.id}</h1>
            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${status.bg} ${status.text}`}>
              {status.icon} {status.label}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">Booked on {booking.bookedOn}</p>
        </div>
        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <button onClick={() => setModal(true)} className="bg-red-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-red-600 transition-colors">
            Cancel Booking
          </button>
        )}
      </div>

      {booking.status === 'cancelled' && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm font-bold text-red-800">Booking Cancelled</p>
        </div>
      )}

      <div className="flex gap-6">
        {/* LEFT */}
        <div className="flex-1 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Event Details</h2>
            <div className="grid grid-cols-2 gap-x-8">
              <InfoRow label="Event Type" value={booking.eventType} />
              <InfoRow label="Venue" value={booking.venue} />
              <InfoRow label="Location" value={booking.location} />
              <InfoRow label="Date" value={booking.date} />
              <InfoRow label="Time" value={booking.time} />
              <InfoRow label="Duration" value={booking.duration} />
            </div>
            {booking.specialNotes && (
              <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-1.5">Special Notes from Customer</p>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3">"{booking.specialNotes}"</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Customer</h2>
            <div className="flex items-center gap-4">
              <img src={booking.customer?.avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
              <div className="flex-1">
                <p className="text-base font-bold text-gray-900">{booking.customer?.name}</p>
                <p className="text-sm text-gray-400">{booking.customer?.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Artist</h2>
            <div className="flex items-center gap-4">
              <img src={booking.artist?.avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
              <div className="flex-1">
                <p className="text-base font-bold text-gray-900">{booking.artist?.name}</p>
                <p className="text-sm text-gray-400">{booking.artist?.category} · {booking.artist?.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-gray-600">{booking.artist?.rating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Payment</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between"><span className="text-xs text-gray-500">Total Amount</span><span className="text-sm font-extrabold text-gray-900">{booking.amount}</span></div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Deposit (30%)</span>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-800">{booking.deposit}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${paymentBadge[booking.depositStatus] || paymentBadge.pending}`}>{booking.depositStatus}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Balance</span>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-800">{booking.balance}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${paymentBadge[booking.balanceStatus] || paymentBadge.pending}`}>{booking.balanceStatus}</span>
                </div>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between"><span className="text-xs text-gray-500">Platform (15%)</span><span className="text-xs font-bold text-primary">{booking.commission}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Chat</h3>
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className={booking.chatUnlocked ? 'text-green-500' : 'text-gray-300'} />
              <span className="text-xs font-semibold text-gray-700">{booking.chatUnlocked ? 'Unlocked — deposit paid' : 'Locked — awaiting deposit'}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Quick Info</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500"><Calendar size={12} className="text-gray-400 shrink-0" /> Booked {booking.bookedOn}</div>
            <div className="flex items-center gap-2 text-xs text-gray-500"><Clock size={12} className="text-gray-400 shrink-0" /> {booking.time}</div>
            <div className="flex items-center gap-2 text-xs text-gray-500"><MapPin size={12} className="text-gray-400 shrink-0" /> {booking.location}</div>
          </div>

          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <button onClick={() => setModal(true)} className="w-full bg-red-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-red-600 transition-colors">
              ⛔ Cancel Booking
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={modal}
        title="Cancel Booking"
        message={`Cancel booking #${booking.id}? This action cannot be undone.`}
        confirmLabel="Yes, Cancel"
        confirmClass="bg-red-500 text-white hover:bg-red-600"
        onConfirm={handleCancel}
        onCancel={() => setModal(false)}
      />
    </div>
  )
}

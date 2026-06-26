import { X } from 'lucide-react'

export default function BookingModal({ booking, onClose }) {
  if (!booking) return null

  const safeFullPrice = parseFloat(booking.amount?.replace(/LKR|,/g, '') || 0)
  const safeAdvance = parseFloat(booking.deposit?.replace(/LKR|,/g, '') || 0)
  const platformFee = booking.platformFee ?? 0
  const commissionRate = booking.commissionRate ?? 15
  const totalPayment = safeAdvance + platformFee
  const balance = safeFullPrice - safeAdvance

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Artist</span><span className="font-medium text-gray-900">{booking.artist?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium text-gray-900">{booking.date}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium text-gray-900">{booking.time}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Venue</span><span className="font-medium text-gray-900 text-right max-w-[200px]">{booking.venue}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Event Type</span><span className="font-medium text-gray-900">{booking.eventType}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium text-gray-900">{booking.customer?.phone}</span></div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Total Price</span><span className="font-medium text-gray-900">{booking.amount}</span></div>
            <div className="flex justify-between text-red-600"><span>Advance</span><span className="font-bold">{booking.deposit}</span></div>
            <div className="flex justify-between text-blue-600"><span>Platform Booking Fee ({commissionRate}%)</span><span className="font-bold">LKR {platformFee.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200"><span>Total to Pay Now</span><span>LKR {totalPayment.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Balance Due</span><span className="font-medium text-gray-500">LKR {balance.toLocaleString()}</span></div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
          <button onClick={onClose} className="w-full btn-secondary py-2.5 rounded-xl font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
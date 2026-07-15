import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, Calendar, ArrowRight, Home, Loader2 } from 'lucide-react'
import { getBookings } from '../services/bookingService'

export default function BookingSuccess() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const orderId = searchParams.get('order_id')

    const [booking, setBooking] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch bookings and find the one matching order_id
        // Give the webhook a moment to process before fetching
        const timer = setTimeout(async () => {
            try {
                const res = await getBookings()
                const raw = Array.isArray(res) ? res : ((res as any).data || [])
                const match = orderId
                    ? raw.find((b: any) => b.order_id === orderId || b.payhere_order_id === orderId)
                    : raw[0]
                setBooking(match || null)
            } catch {
                // silently ignore — page still shows success
            } finally {
                setLoading(false)
            }
        }, 1500) // 1.5s grace for webhook to fire

        return () => clearTimeout(timer)
    }, [orderId])

    const artist = booking?.artist || booking?.artistProfile || booking?.artist_profile || {}
    const artistName = artist.stage_name || artist.full_name || booking?.artist_name || 'the artist'
    const eventDate = booking?.event_date || '—'
    const advance = booking?.advance_amount
        ? `LKR ${Number(booking.advance_amount).toLocaleString()}`
        : null

    return (
        <div
            className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4"
            style={{ fontFamily: "'Fraunces', serif" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;800;900&display=swap');
                @keyframes pop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
                .animate-pop { animation: pop 0.5s cubic-bezier(.175,.885,.32,1.275) forwards; }
            `}</style>

            <div className="w-full max-w-md bg-white rounded-[40px] shadow-xl border border-gray-100 p-10 text-center">

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center animate-pop">
                        <CheckCircle size={52} className="text-green-500" strokeWidth={1.8} />
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    Your advance payment has been received. The booking is now confirmed.
                </p>

                {/* Booking summary */}
                {loading ? (
                    <div className="flex justify-center py-4 mb-8">
                        <Loader2 size={24} className="animate-spin text-gray-300" />
                    </div>
                ) : booking ? (
                    <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left space-y-3">
                        {orderId && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
                                <span className="text-xs font-bold text-gray-700 font-mono">{orderId}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Artist</span>
                            <span className="text-sm font-bold text-gray-900">{artistName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Calendar size={12} /> Event Date
                            </span>
                            <span className="text-sm font-bold text-gray-900">{eventDate}</span>
                        </div>
                        {advance && (
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Advance Paid</span>
                                <span className="text-sm font-extrabold text-green-600">{advance}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-sm text-gray-500">
                        {orderId && <p className="font-mono text-xs text-gray-400 mb-1">Order: {orderId}</p>}
                        Your booking details will be visible in your account shortly.
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/customerAccount', { state: { tab: 'bookings' } })}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-white"
                        style={{ background: '#E8194B' }}
                    >
                        <Calendar size={16} /> View My Bookings <ArrowRight size={15} />
                    </button>
                    <Link
                        to="/home"
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        <Home size={16} /> Back to Home
                    </Link>
                </div>
            </div>

            <p className="text-xs text-gray-400 mt-6">Performa © {new Date().getFullYear()}</p>
        </div>
    )
}

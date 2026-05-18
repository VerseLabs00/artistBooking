import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft, Mail, Calendar, ShoppingBag, Star, AlertTriangle } from 'lucide-react'
import { fetchCustomer, banCustomer, unbanCustomer, clearSelected } from '../features/customers/customersSlice'

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

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selected: customer, selectedLoading } = useSelector(s => s.customers)
  const [modal, setModal] = useState(null)

  useEffect(() => {
    dispatch(fetchCustomer(id))
    return () => dispatch(clearSelected())
  }, [id, dispatch])

  const handleBan = () => {
    dispatch(banCustomer(customer.id))
    toast.error(`${customer.name} has been banned.`)
    setModal(null)
  }
  const handleUnban = () => {
    dispatch(unbanCustomer(customer.id))
    toast.success(`${customer.name} has been unbanned.`)
    setModal(null)
  }

  if (selectedLoading || !customer) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-400 text-sm">{selectedLoading ? 'Loading customer...' : 'Customer not found.'}</p>
        <button onClick={() => navigate('/customers')} className="btn-primary">Back to Customers</button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Customers
      </button>

      {customer.status === 'banned' && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1"><p className="text-sm font-bold text-red-800">Account Banned</p></div>
          <button onClick={() => setModal('unban')} className="btn-success text-xs px-3 py-1.5 shrink-0">Unban</button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT SIDEBAR */}
        <div className="w-full lg:w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
            <img src={customer.avatar} alt={customer.name} className={`w-20 h-20 rounded-full object-cover border-4 border-white shadow-md mb-3 ${customer.status === 'banned' ? 'grayscale opacity-60' : ''}`} />
            <h1 className="text-lg font-extrabold text-gray-900">{customer.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5 mb-3">{customer.email}</p>
            <span className={`text-xs font-bold px-3 py-1 rounded-full mb-4 ${customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {customer.status === 'active' ? '● Active' : '⛔ Banned'}
            </span>
            <div className="w-full space-y-2.5 border-t border-gray-100 pt-4">
              <div className="flex justify-between"><span className="text-xs text-gray-400">Member since</span><span className="text-xs font-semibold text-gray-800">{customer.joined}</span></div>
              <div className="flex justify-between"><span className="text-xs text-gray-400">Total bookings</span><span className="text-xs font-bold text-gray-900">{customer.bookings}</span></div>
              <div className="flex justify-between"><span className="text-xs text-gray-400">Total spent</span><span className="text-xs font-bold text-primary">{customer.totalSpent}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Account Info</h3>
            <div className="flex items-start gap-2.5">
              <Mail size={13} className="text-gray-400 shrink-0 mt-0.5" />
              <div><p className="text-xs text-gray-400">Email</p><p className="text-sm font-semibold text-gray-800">{customer.email}</p></div>
            </div>
            <div className="flex items-start gap-2.5">
              <Calendar size={13} className="text-gray-400 shrink-0 mt-0.5" />
              <div><p className="text-xs text-gray-400">Registered</p><p className="text-sm font-semibold text-gray-800">{customer.joined}</p></div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShoppingBag size={13} className="text-gray-400 shrink-0 mt-0.5" />
              <div><p className="text-xs text-gray-400">Total bookings</p><p className="text-sm font-semibold text-gray-800">{customer.bookings}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Admin Controls</h3>
            <div className="space-y-2">
              {customer.status === 'active' ? (
                <button onClick={() => setModal('ban')} className="w-full bg-gray-900 text-white text-sm py-2.5 rounded-xl font-semibold hover:bg-black transition-colors">⛔ Ban Customer</button>
              ) : (
                <button onClick={() => setModal('unban')} className="w-full btn-success text-sm py-2.5 rounded-xl">✓ Unban Customer</button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 mb-1">Total Bookings</p>
              <p className="text-2xl font-extrabold text-gray-900">{customer.bookings}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 mb-1">Total Spent</p>
              <p className="text-2xl font-extrabold text-primary">{customer.totalSpent}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 mb-1">Reviews Written</p>
              <p className="text-2xl font-extrabold text-gray-900">{customer.reviews?.length ?? 0}</p>
            </div>
          </div>

          {customer.bookingHistory?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-bold text-gray-900">Booking History</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="table-header text-left">Booking ID</th>
                    <th className="table-header text-left">Artist</th>
                    <th className="table-header text-left">Date</th>
                    <th className="table-header text-left">Amount</th>
                    <th className="table-header text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.bookingHistory.map((b, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-mono text-xs text-gray-500">#{b.id}</td>
                      <td className="table-cell text-sm font-medium text-gray-900">{b.artist_name || b.artist || '—'}</td>
                      <td className="table-cell text-xs text-gray-500">{b.event_date || b.date || '—'}</td>
                      <td className="table-cell font-semibold text-sm text-gray-900">{b.agreed_price ? `LKR ${Number(b.agreed_price).toLocaleString()}` : (b.amount || '—')}</td>
                      <td className="table-cell">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize bg-gray-100 text-gray-600">{b.booking_status || b.status || '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(!customer.bookingHistory || customer.bookingHistory.length === 0) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <ShoppingBag size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No booking history available.</p>
            </div>
          )}
        </div>
      </div>

      {modal === 'ban' && (
        <ConfirmModal open={true} title="Ban Customer" message={`Ban ${customer.name}?`} confirmLabel="Ban" confirmClass="bg-gray-900 text-white hover:bg-black" onConfirm={handleBan} onCancel={() => setModal(null)} />
      )}
      {modal === 'unban' && (
        <ConfirmModal open={true} title="Unban Customer" message={`Unban ${customer.name}?`} confirmLabel="Unban" confirmClass="bg-green-500 text-white hover:bg-green-600" onConfirm={handleUnban} onCancel={() => setModal(null)} />
      )}
    </div>
  )
}

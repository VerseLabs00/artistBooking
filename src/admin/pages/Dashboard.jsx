import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import { fetchDashboardStats } from '../features/dashboard/dashboardSlice'

export default function Dashboard() {
  const dispatch = useDispatch()
  const { stats, recentBookings, loading } = useSelector(s => s.dashboard)
  const commissionRate = useSelector(s => s.settings.commissionRate)
  const verificationPending = useSelector(s => s.verification.list.length)

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  const statusColor = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    pending_payment: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-600',
    rejected: 'bg-red-100 text-red-600',
  }

  const formatStatus = (s) => s?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '—'

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Here's what's happening on HireMe today." />

      {loading && !stats ? (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading dashboard...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <StatCard
              label="Total Revenue"
              value={stats?.bookings?.total_revenue != null
                ? `LKR ${Number(stats.bookings.total_revenue).toLocaleString()}`
                : '—'}
              badge="All time"
              badgeColor="green"
            />
            <StatCard
              label="Total Bookings"
              value={stats?.bookings?.total ?? '—'}
              badge="All time"
              badgeColor="green"
            />
            <StatCard
              label="Verified Artists"
              value={stats?.artists?.verified ?? '—'}
              badge={`${stats?.artists?.pending ?? 0} pending`}
              badgeColor="orange"
            />
            <StatCard
              label="Total Customers"
              value={stats?.customers?.total != null ? Number(stats.customers.total).toLocaleString() : '—'}
              badge="Registered"
              badgeColor="green"
            />
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Recent Bookings</h2>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full min-w-[560px] md:min-w-0">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="table-header text-left">ID</th>
                    <th className="table-header text-left">Customer</th>
                    <th className="table-header text-left">Artist</th>
                    <th className="table-header text-left">Date</th>
                    <th className="table-header text-left">Amount</th>
                    <th className="table-header text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No bookings yet.</td></tr>
                  ) : (
                    recentBookings.map(b => (
                      <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="table-cell font-mono text-xs text-gray-500">#{b.id}</td>
                        <td className="table-cell">
                          <span className="font-medium text-gray-700 text-sm">{b.customer_name || '—'}</span>
                        </td>
                        <td className="table-cell">
                          <span className="text-sm text-gray-700">{b.artist_name || '—'}</span>
                        </td>
                        <td className="table-cell text-xs text-gray-500">
                          {b.event_date ? new Date(b.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="table-cell font-semibold text-gray-900 text-sm">
                          {b.agreed_price ? `LKR ${Number(b.agreed_price).toLocaleString()}` : '—'}
                        </td>
                        <td className="table-cell">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${statusColor[b.status] || 'bg-gray-100 text-gray-500'}`}>
                            {formatStatus(b.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Pending Verifications</p>
              <p className="text-2xl font-extrabold text-gray-900">{stats?.artists?.pending ?? verificationPending}</p>
              <p className="text-xs text-orange-500 mt-1 font-medium">Needs attention</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Total Artists</p>
              <p className="text-2xl font-extrabold text-gray-900">{stats?.artists?.total ?? '—'}</p>
              <p className="text-xs text-green-600 mt-1 font-medium">↑ Growing</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Commission Rate</p>
              <p className="text-2xl font-extrabold text-gray-900">{commissionRate}%</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">Per booking</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

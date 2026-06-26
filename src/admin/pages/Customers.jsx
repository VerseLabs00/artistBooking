import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { X, Mail, Calendar, ShoppingBag, AlertTriangle } from 'lucide-react'
import {
  fetchCustomers,
  deleteCustomer,
  setFilter,
  setSearchQuery,
  selectFilteredCustomers,
  fetchCustomer,
} from '../features/customers/customersSlice'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import SearchBar from '../components/common/SearchBar'
import FilterTabs from '../components/common/FilterTabs'
import StatusBadge from '../components/common/StatusBadge'

const filterTabs = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Banned', value: 'banned' },
]

function CustomerModal({ customer, open, onClose, onDelete }) {
  if (!open || !customer) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Customer Details</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <img src={customer.avatar} alt={customer.name} className="w-16 h-16 rounded-full object-cover border-4 border-gray-100" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">{customer.name}</h3>
              <p className="text-sm text-gray-500">{customer.email}</p>
              <span className={`text-xs font-bold px-2 py-1 rounded-full mt-1 inline-block ${customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {customer.status === 'active' ? '● Active' : '⛔ Banned'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{customer.bookings}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-primary">{customer.totalSpent}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-semibold text-gray-800">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Joined</p>
                <p className="text-sm font-semibold text-gray-800">{customer.joined}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShoppingBag size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Total Bookings</p>
                <p className="text-sm font-semibold text-gray-800">{customer.bookings}</p>
              </div>
            </div>
          </div>

          {customer.bookingHistory?.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Recent Bookings</h4>
              <div className="space-y-2">
                {customer.bookingHistory.slice(0, 3).map((b, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">#{b.id}</p>
                        <p className="text-xs text-gray-500">{b.artist_name || b.artist || '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{b.agreed_price ? `LKR ${Number(b.agreed_price).toLocaleString()}` : (b.amount || '—')}</p>
                        <p className="text-xs text-gray-500 capitalize">{b.booking_status || b.status || '—'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn-secondary px-5 py-2 text-sm">Close</button>
          <button onClick={onDelete} className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-600 transition-colors">Delete Customer</button>
        </div>
      </div>
    </div>
  )
}

export default function Customers() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const all = useSelector(s => s.customers.list)
  const filter = useSelector(s => s.customers.filter)
  const searchQuery = useSelector(s => s.customers.searchQuery)
  const filtered = useSelector(selectFilteredCustomers)
  const { loading, error, selected } = useSelector(s => s.customers)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  useEffect(() => {
    dispatch(fetchCustomers())
  }, [dispatch])

  const handleView = async (customer) => {
    setSelectedCustomer(customer)
    await dispatch(fetchCustomer(customer.id))
    setModalOpen(true)
  }

  const handleDelete = async () => {
    if (selectedCustomer) {
      const result = await dispatch(deleteCustomer(selectedCustomer.id))
      if (deleteCustomer.fulfilled.match(result)) {
        toast.success(`${selectedCustomer.name} deleted successfully`)
        setModalOpen(false)
        setSelectedCustomer(null)
      } else {
        toast.error(result.payload || 'Delete failed')
      }
    }
  }

  const active = all.filter(c => c.status === 'active').length
  const banned = all.filter(c => c.status === 'banned').length

  return (
    <div>
      <PageHeader title="Users" subtitle={`${all.length.toLocaleString()} registered users.`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        <StatCard label="Total" value={all.length.toLocaleString()} badge="Active" badgeColor="green" />
        <StatCard label="Active" value={active} badge="Active" badgeColor="green" />
        <StatCard label="Banned" value={banned} badge="Active" badgeColor="red" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-gray-100">
          <SearchBar value={searchQuery} onChange={v => dispatch(setSearchQuery(v))} placeholder="Search user..." />
          <div className="overflow-x-auto w-full sm:w-auto">
            <FilterTabs tabs={filterTabs} active={filter} onChange={v => dispatch(setFilter(v))} />
          </div>
        </div>

        {loading && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header text-left">User</th>
                  <th className="table-header text-left hidden sm:table-cell">Joined</th>
                  <th className="table-header text-left">Bookings</th>
                  <th className="table-header text-left hidden md:table-cell">Total Spent</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4,5].map(i => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="table-cell"><div className="flex items-center gap-2 md:gap-3"><div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-100 animate-pulse shrink-0" /><div><div className="h-4 bg-gray-100 rounded w-20 animate-pulse mb-1" /><div className="h-3 bg-gray-100 rounded w-24 animate-pulse hidden sm:block" /></div></div></td>
                    <td className="table-cell hidden sm:table-cell"><div className="h-4 bg-gray-100 rounded w-20 animate-pulse" /></td>
                    <td className="table-cell"><div className="h-4 bg-gray-100 rounded w-8 animate-pulse" /></td>
                    <td className="table-cell hidden md:table-cell"><div className="h-4 bg-gray-100 rounded w-16 animate-pulse" /></td>
                    <td className="table-cell"><div className="h-6 bg-gray-100 rounded w-16 animate-pulse" /></td>
                    <td className="table-cell"><div className="flex items-center gap-1 md:gap-2"><div className="h-8 bg-gray-100 rounded w-12 animate-pulse" /><div className="h-8 bg-gray-100 rounded w-12 animate-pulse" /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {error && !loading && <div className="text-center py-12 text-red-400 text-sm">{error}</div>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header text-left">User</th>
                  <th className="table-header text-left hidden sm:table-cell">Joined</th>
                  <th className="table-header text-left">Bookings</th>
                  <th className="table-header text-left hidden md:table-cell">Total Spent</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No users found.</td></tr>
                ) : (
                  filtered.map(customer => (
                    <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-2 md:gap-3">
                          <img src={customer.avatar} alt="" className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{customer.name}</p>
                            <p className="text-xs text-gray-400 truncate hidden sm:block">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-gray-500 text-sm hidden sm:table-cell">{customer.joined}</td>
                      <td className="table-cell text-gray-700">{customer.bookings}</td>
                      <td className="table-cell font-semibold text-gray-900 text-sm hidden md:table-cell">{customer.totalSpent}</td>
                      <td className="table-cell"><StatusBadge status={customer.status} /></td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1 md:gap-2">
                          <button onClick={() => handleView(customer)} className="btn-secondary text-xs px-2 md:px-3 py-1.5">View</button>
                          <button onClick={() => { setSelectedCustomer(customer); setModalOpen(true); }} className="bg-red-500 text-white px-2 md:px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-red-600 transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && <div className="px-4 py-3 text-xs text-gray-400">Showing {filtered.length} of {all.length} users</div>}
      </div>

      <CustomerModal
        customer={selected || selectedCustomer}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedCustomer(null); }}
        onDelete={handleDelete}
      />
    </div>
  )
}

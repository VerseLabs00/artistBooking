import {Link, NavLink, useNavigate} from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  LayoutDashboard, Users, UserCheck, ShoppingBag, Settings, LogOut, X,
  Mic2, AlertCircle,
} from 'lucide-react'
import { logoutThunk } from '../../features/auth/authSlice'
import toast from 'react-hot-toast'

const navItems = [
  { label: 'Dashboard',    path: '.',             icon: <LayoutDashboard size={18} /> },
  { label: 'Artists',      path: 'artists',      icon: <Mic2 size={18} />,      countKey: 'artists' },
  { label: 'Verification', path: 'verification', icon: <UserCheck size={18} />, countKey: 'verification', urgent: true },
  { label: 'Customers',    path: 'customers',    icon: <Users size={18} /> },
  { label: 'Bookings',     path: 'bookings',     icon: <ShoppingBag size={18} />, countKey: 'bookings' },
  { label: 'Settings',     path: 'settings',     icon: <Settings size={18} /> },
]

export default function Sidebar({ open, onClose }) {
  const admin = useSelector(s => s.auth.admin)
  const artistCount      = useSelector(s => s.artists.list.length)
  const verificationCount = useSelector(s => s.verification.list.length)
  const bookingsCount    = useSelector(s => s.bookings.list.length)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const getCounts = (key) => {
    if (key === 'artists')      return artistCount
    if (key === 'verification') return verificationCount
    if (key === 'bookings')     return bookingsCount
    return null
  }

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    navigate('/admin/login')
    toast.success('Logged out successfully')
    onClose()
  }

  return (
    <aside className={`
      fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-gray-100
      flex flex-col z-40 transition-transform duration-300
      ${open ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0 lg:z-20
    `}>
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img
            src="/logoBlack.svg"
            alt="Perfoma"
            className="h-10 w-auto object-contain"
        />
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        {navItems.map(item => {
          const count = item.countKey ? getCounts(item.countKey) : null
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {count != null && count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  item.urgent ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count > 99 ? '99+' : count}
                  {item.urgent && <AlertCircle size={8} className="inline ml-0.5" />}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Admin profile + logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={admin?.avatar || `https://i.pravatar.cc/40?u=${admin?.id || 'admin'}`}
            alt="Admin"
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 truncate">{admin?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400 truncate capitalize">{admin?.role || 'Super Administrator'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

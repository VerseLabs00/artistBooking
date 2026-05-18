import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginThunk } from '../features/auth/authSlice'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((s) => s.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    const result = await dispatch(loginThunk({ email, password }))
    if (loginThunk.fulfilled.match(result)) {
      // Only allow admins
      if (result.payload.user?.role !== 'admin') {
        toast.error('Access denied. Admin accounts only.')
        dispatch({ type: 'auth/logout' })
        return
      }
      toast.success('Welcome back, Admin!')
      navigate('/admin')
    } else {
      toast.error(result.payload || 'Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT — branding panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <div>
            <span className="text-xl font-extrabold text-white">HireMe</span>
            <span className="ml-2 text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full">Admin</span>
          </div>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Manage your<br />
            <span className="text-primary">artist platform</span><br />
            with confidence.
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Full control over artists, bookings, verifications, customers, and platform revenue — all in one place.
          </p>
          <div className="flex gap-8 mt-8">
            {[
              { label: 'Artists', value: '400+' },
              { label: 'Bookings', value: '2.8K' },
              { label: 'Revenue', value: 'LKR 847K' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xl font-extrabold text-white">{value}</p>
                <p className="text-xs text-white/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <p className="text-white/20 text-xs">© 2026 HireMe. Super Admin Portal.</p>
        </div>
      </div>

      {/* ── RIGHT — login form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-gray-900">HireMe</span>
            <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Admin</span>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Sign in</h2>
          <p className="text-sm text-gray-400 mb-8">Enter your admin credentials to continue.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hireme.lk"
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 border border-gray-200 rounded-2xl text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

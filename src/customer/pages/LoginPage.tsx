import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import PasswordInput from '../components/PasswordInput'
import SocialLogins from '../components/SocialLogins'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/home')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard>
      <div className="flex items-center justify-between mb-10">
        <button className="text-black hover:opacity-70 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="flex items-center gap-1 text-sm text-black hover:opacity-70 transition-opacity"
        >
          <span className="text-lg leading-none">+</span>
          <span>create an account</span>
        </button>
      </div>

      <h1 className="text-3xl font-semibold text-black mb-8">Sign in</h1>

      <div className="mb-6">
        <label className="block text-sm text-black mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jhon@gmail.com"
          className="w-full bg-transparent border-b border-gray-400 pb-2 text-sm text-gray-500 placeholder-gray-400 outline-none focus:border-black transition-colors"
        />
      </div>

      <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="mb-8">
        <button className="text-sm text-red-500 hover:text-red-600 transition-colors">
          forgot password ?
        </button>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium text-base py-3 rounded-full transition-colors mb-6"
      >
        {loading ? 'Signing in...' : 'Login'}
      </button>

      <SocialLogins />
    </AuthCard>
  )
}

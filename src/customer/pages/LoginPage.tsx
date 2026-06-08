import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import stage from '../../../public/bg-login.png'
import artistImage from '../../../public/person.png'
import cover1 from '../../../public/Cover1.png'
import cover7 from '../../../public/Cover7.jpg'
import logo from '../../../public/logoBlack.svg'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const carouselData = [
    {
        image: artistImage,
        text: "Discover and book incredible talent for your next event with ease and confidence."
    },
    {
        image: cover1,
        text: "Browse through a curated selection of artists, from musicians to performers, all in one place."
    },
    {
        image: cover7,
        text: "Seamlessly manage your bookings and communicate directly with artists to ensure a perfect event."
    }
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState('')

  const [showForgot, setShowForgot] = useState(false)
  const [forgotStep, setForgotStep] = useState(1)
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [currentSlide, setCurrentSlide] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const width = rect.width
      const index = Math.floor((x / width) * carouselData.length)
      if (index >= 0 && index < carouselData.length && index !== currentSlide) {
          setCurrentSlide(index)
      }
  }

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

  const handleForgotPassword = async () => {
    setError('')
    setSuccess('')
    if (!forgotEmail) { setError('Please enter your email.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/forgot-password', { email: forgotEmail })
      setSuccess(data.message)
      setForgotStep(2)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setError('')
    setSuccess('')
    if (!otp || !newPassword || !confirmPassword) { setError('Please fill in all fields.'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/reset-password', {
        email: forgotEmail,
        token: otp,
        password: newPassword,
        password_confirmation: confirmPassword
      })
      setSuccess(data.message)
      setTimeout(() => {
        setShowForgot(false)
        setForgotStep(1)
        setSuccess('')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-cover bg-center" style={{ backgroundImage: `url(${stage})` }}>
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl border border-white/40 w-full max-w-4xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] grid grid-cols-1 lg:grid-cols-2 p-6 md:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none"></div>
          <div className="pr-0 lg:pr-10 relative z-10">
            <div className="flex items-center justify-between mb-10">
              <ArrowLeft 
                className="cursor-pointer text-gray-600 hover:text-black transition-colors" 
                size={20} 
                onClick={() => navigate('/')}
              />
              <button onClick={() => navigate('/signupCustomer')} className="text-sm text-gray-500 hover:text-black transition-colors">
                + create an account
              </button>
            </div>
            <h1 className="text-3xl font-semibold mb-10 text-black">
              {showForgot ? 'Reset Password' : 'Sign in'}
            </h1>
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>
            )}
            {success && (
              <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">{success}</div>
            )}

            {showForgot ? (
              <div className="space-y-6">
                {forgotStep === 1 ? (
                  <>
                    <div>
                      <p className="text-sm text-black mb-1">Email</p>
                      <input 
                        type="email" 
                        value={forgotEmail} 
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full border-b border-gray-300 bg-transparent outline-none py-2 text-black focus:border-black transition-all duration-300" 
                      />
                    </div>
                    <button onClick={handleForgotPassword} disabled={loading}
                      className="w-full bg-[#DB0000] text-white py-4 rounded-lg disabled:opacity-60 transition-colors">
                      {loading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-black mb-1">Reset Code (OTP)</p>
                      <input 
                        type="text" 
                        value={otp} 
                        onChange={e => setOtp(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="w-full border-b border-gray-300 bg-transparent outline-none py-2 text-black focus:border-black transition-all duration-300" 
                      />
                    </div>
                    <div>
                      <p className="text-sm text-black mb-1">New Password</p>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="w-full border-b border-gray-300 bg-transparent outline-none py-2 text-black focus:border-black transition-all duration-300" 
                      />
                    </div>
                    <div>
                      <p className="text-sm text-black mb-1">Confirm New Password</p>
                      <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full border-b border-gray-300 bg-transparent outline-none py-2 text-black focus:border-black transition-all duration-300" 
                      />
                    </div>
                    <button onClick={handleResetPassword} disabled={loading}
                      className="w-full bg-[#DB0000] text-white py-4 rounded-lg disabled:opacity-60 transition-colors">
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </>
                )}
                <button onClick={() => setShowForgot(false)} className="text-sm text-gray-500 hover:text-black transition-colors block w-full text-center">
                  Back to Login
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-black mb-1">Email</p>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    placeholder="john@gmail.com"
                    className="w-full border-b border-gray-300 bg-transparent outline-none py-2 text-black focus:border-black transition-all duration-300" 
                  />
                </div>
                <div className="relative">
                  <p className="text-sm text-black mb-1">Password</p>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className="w-full border-b border-gray-300 bg-transparent outline-none py-2 pr-8 text-black focus:border-black transition-all duration-300" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 bottom-2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                <div>
                  <button onClick={() => setShowForgot(true)} className="text-sm text-red-500 hover:text-red-600 transition-colors">forgot password ?</button>
                </div>
                <button onClick={handleLogin} disabled={loading}
                  className="w-full bg-[#DB0000] text-white py-4 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                  {loading ? 'Signing in...' : 'Login'}
                </button>
                <p className="text-center text-xs text-gray-400">or login with</p>
                <div className="flex justify-center gap-4">
                  {[
                    'https://cdn-icons-png.flaticon.com/512/124/124010.png',
                    'https://cdn-icons-png.flaticon.com/512/300/300221.png',
                    'https://cdn-icons-png.flaticon.com/512/0/747.png',
                  ].map((src, i) => (
                    <button key={i} className="w-11 h-11 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.12)] flex items-center justify-center hover:scale-110 transition-transform">
                      <img src={src} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center mt-10 lg:mt-0 relative z-10">
            <div 
              onMouseMove={handleMouseMove}
              className="relative w-full max-w-[280px] md:max-w-[320px] h-[450px] md:h-[520px] rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              {carouselData.map((slide, index) => (
                <img
                  key={index}
                  src={slide.image}
                  className={`absolute inset-0 w-full h-full object-cover grayscale transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}

              {/*logo  */}
                <div className="absolute top-[-40px] left-4 z-50 text-black text-xs">
                    <img src={logo} className="w-40 h-40" alt="Logo" />
                </div>
              <div className="absolute bottom-10 left-6 right-6 text-white text-xs leading-relaxed drop-shadow-lg">
                {carouselData[currentSlide].text}
              </div>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                {carouselData.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-white text-xs md:text-sm flex justify-center gap-4 pb-4 flex-wrap">
        <span className="cursor-pointer hover:opacity-70 transition">Contact</span>
        <span>|</span>
        <span className="cursor-pointer hover:opacity-70 transition">Privacy</span>
        <span>|</span>
        <span className="cursor-pointer hover:opacity-70 transition">Terms & Conditions</span>
      </div>
    </div>
  )
}

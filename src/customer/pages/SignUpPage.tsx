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

export default function SignUpPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpAttempts, setOtpAttempts] = useState(0)
  const [otpResendMsg, setOtpResendMsg] = useState('')

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

  const handleContinueBasic = async () => {
    setError('')
    if (!name) { setError('Please enter your full name.'); return; }
    if (!email) { setError('Please enter your email.'); return; }
    setLoading(true)
    try {
      await api.post('/auth/send-verification', { email })
      setStep(1)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to send verification code.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setOtpError('')
    setOtpResendMsg('')
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter the 6-digit code.')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/verify-code', { email, code: otp })
      setStep(2)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Verification failed.'
      const newAttempts = otpAttempts + 1
      setOtpAttempts(newAttempts)
      if (newAttempts >= 2) {
        await handleResendCode()
        setOtp('')
        setOtpResendMsg('Incorrect code again. A new code has been sent to your email.')
        setOtpAttempts(0)
      } else {
        setOtpError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    try {
      await api.post('/auth/send-verification', { email })
    } catch {
      // silent
    }
  }

  const handleSignUp = async () => {
    if (!password || !confirm) { setError('Please fill in all fields.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setError('')
    setLoading(true)
    try {
      await register(name, email, password, confirm)
      navigate('/home')
    } catch (err: any) {
      const msg = err?.response?.data?.message
        ?? Object.values(err?.response?.data?.errors ?? {})[0]
        ?? 'Registration failed. Please try again.'
      setError(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-cover bg-center font-['Fraunces']" style={{ backgroundImage: `url(${stage})`, fontFamily: "'Fraunces', serif" }}>
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400&display=swap');
      `}</style>
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl border border-white/40 w-full max-w-4xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] grid grid-cols-1 lg:grid-cols-2 p-4 sm:p-6 md:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none"></div>
          <div className="pr-0 lg:pr-10 relative z-10">
            <div className="flex items-center justify-between mb-10">
              <ArrowLeft 
                className="cursor-pointer text-gray-600 hover:text-black transition-colors" 
                size={20} 
                onClick={() => step === 0 ? navigate('/loginCustomer') : setStep(s => s - 1)}
              />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-black">Sign up</h1>
            <p className="text-sm text-gray-500 mb-8">Please enter a valid email address. We'll send a verification code to confirm your registration.</p>
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>
            )}
            <div className="space-y-6">
              {step === 0 && (
                <>
                  <div>
                    <p className="text-sm text-black mb-1 font-semibold">Full Name</p>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full border-b border-gray-300 bg-transparent outline-none py-2 text-black focus:border-[#E8194B] transition-all duration-300" 
                    />
                  </div>
                  <div>
                    <p className="text-sm text-black mb-1 font-semibold">Email</p>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      placeholder="john@gmail.com"
                      className="w-full border-b border-gray-300 bg-transparent outline-none py-2 text-black focus:border-[#E8194B] transition-all duration-300" 
                    />
                  </div>
                  <button onClick={handleContinueBasic} disabled={loading}
                    className="w-full bg-[#E8194B] hover:bg-[#c8133b] text-white py-4 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-bold shadow-lg shadow-pink-100">
                    {loading ? 'Sending...' : 'Continue'}
                  </button>
                </>
              )}

              {step === 1 && (
                <>
                  <div>
                    <p className="text-sm text-black mb-1 font-semibold">Verification Code</p>
                    <p className="text-xs text-gray-500 mb-3">Enter the 6-digit code sent to <span className="font-medium">{email}</span></p>
                    <input 
                      type="text" 
                      value={otp} 
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      inputMode="numeric"
                      className="w-full border-b border-gray-300 bg-transparent outline-none py-2 text-black focus:border-[#E8194B] transition-all duration-300 text-center text-2xl tracking-[0.5em]" 
                    />
                  </div>
                  {otpError && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{otpError}</div>
                  )}
                  {otpResendMsg && (
                    <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">{otpResendMsg}</div>
                  )}
                  <button onClick={handleVerifyOtp} disabled={loading}
                    className="w-full bg-[#E8194B] hover:bg-[#c8133b] text-white py-4 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-bold shadow-lg shadow-pink-100">
                    {loading ? 'Verifying...' : 'Continue'}
                  </button>
                  <div className="text-center">
                    <button onClick={() => handleResendCode()} className="text-sm text-gray-600 hover:text-[#E8194B] transition-colors underline">
                      Resend code
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="relative">
                    <p className="text-sm text-black mb-1 font-semibold">Password</p>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={e => setPassword(e.target.value)}
                      className="w-full border-b border-gray-300 bg-transparent outline-none py-2 pr-8 text-black focus:border-[#E8194B] transition-all duration-300" 
                    />
                     <button type="button" onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-0 bottom-2 text-gray-400 hover:text-gray-600 transition-colors">
                       {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                     </button>
                  </div>
                  {password && (
                    <div className="space-y-1.5">
                      {[
                        { label: 'At least 8 characters', valid: password.length >= 8 },
                        { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
                        { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
                        { label: 'One number', valid: /\d/.test(password) },
                        { label: 'One special character', valid: /[^A-Za-z0-9]/.test(password) },
                      ].map((rule, idx) => (
                        <p key={idx} className={`text-xs flex items-center gap-2 transition-colors duration-300 ${rule.valid ? 'text-green-600' : 'text-red-500'}`}>
                          <span className="inline-block w-3 h-3 rounded-full border flex items-center justify-center text-[8px] leading-none">{rule.valid ? '✓' : ''}</span>
                          {rule.label}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <p className="text-sm text-black mb-1 font-semibold">Confirm Password</p>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={confirm} 
                      onChange={e => setConfirm(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSignUp()}
                      className="w-full border-b border-gray-300 bg-transparent outline-none py-2 pr-8 text-black focus:border-[#E8194B] transition-all duration-300" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 bottom-2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                  <button onClick={handleSignUp} disabled={loading}
                    className="w-full bg-[#E8194B] hover:bg-[#c8133b] text-white py-4 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-bold shadow-lg shadow-pink-100">
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </>
              )}

              <div className="text-center space-y-2">
                  <p className="text-xs text-gray-400">or</p>
                  <button onClick={() => navigate('/loginCustomer')} className="text-sm text-gray-600 hover:text-[#E8194B] transition-colors">
                      already have an account
                  </button>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center mt-10 lg:mt-0 relative z-10">
            <div 
              onMouseMove={handleMouseMove}
              className="relative w-full max-w-[280px] md:max-w-[320px] h-[450px] md:h-[520px] rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              {carouselData.map((slide, index) => (
                <img
                  key={index}
                  src={slide.image}
                  loading={index === 0 ? "eager" : "lazy"}
                  {...(index === 0 ? { fetchPriority: "high" } : {})}
                  className={`absolute inset-0 w-full h-full object-cover grayscale transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}

              {/*logo  */}
                <div className="absolute top-[-40px] left-4 z-50 text-black text-xs">
                    <img src={logo} className="w-40 h-40" alt="Logo" />
                </div>
              <div className="absolute bottom-10 left-6 right-6 text-white text-xs font-semibold leading-relaxed drop-shadow-lg">
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
        <span className="cursor-pointer hover:opacity-70 transition">About Us</span>
        <span>|</span>
        <span className="cursor-pointer hover:opacity-70 transition">Privacy Policy</span>
        <span>|</span>
        <span className="cursor-pointer hover:opacity-70 transition">Terms & Conditions</span>
      </div>
    </div>
  )
}

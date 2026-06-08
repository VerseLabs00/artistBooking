import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const carouselData = [
    {
        image: '/person.png',
        text: "Join our community of world-class performers and showcase your talent to a global audience."
    },
    {
        image: '/Cover1.png',
        text: "Manage your bookings, track your performance, and grow your artistic career with ease."
    },
    {
        image: '/Cover7.jpg',
        text: "Connect with event organizers and secure high-quality gigs that match your unique style."
    }
]

export default function LoginPage() {
    const navigate = useNavigate()
    const { setAuth } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    
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
        setError('')

        if (!email || !password) {
            setError('Please enter both email and password.')
            return
        }

        setLoading(true)

        try {
            const { data } = await api.post('/login', { email, password })

            if (data.user.role !== 'artist') {
                setError('You are not authorized to access the artist dashboard.')
                setLoading(false)
                return
            }

            setAuth(data.user, data.access_token)
            window.scrollTo(0, 0)
            navigate('/account')

        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Invalid email or password. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-cover bg-center" style={{ backgroundImage: `url(/bg-login.png)` }}>
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl border border-white/40 w-full max-w-4xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 lg:p-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none"></div>
                    <div className="pr-0 lg:pr-10 relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <ArrowLeft
                                onClick={() => navigate('/')}
                                className="cursor-pointer text-gray-600 hover:text-black transition-colors" size={20} />
                            <button onClick={() => navigate('/signup')} className="text-sm text-gray-500 hover:text-black transition-colors">
                                + create an account
                            </button>
                        </div>
                        <h1 className="text-3xl font-semibold mb-10 text-black">Sign in</h1>
                        {error && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>
                        )}
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-black mb-1">Email</p>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="john@gmail.com"
                                    className="w-full border-b border-gray-300 bg-transparent outline-none py-2 text-black focus:border-black transition-all duration-300" />
                            </div>
                            <div className="relative">
                                <p className="text-sm text-black mb-1">Password</p>
                                <input type={showPassword ? 'text' : 'password'} value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                    className="w-full border-b border-gray-300 bg-transparent outline-none py-2 pr-8 text-black focus:border-black transition-all duration-300" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 bottom-2 text-gray-400 hover:text-gray-600 transition-colors">
                                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>
                            <div>
                                <button className="text-sm text-red-500 hover:text-red-600 transition-colors">forgot password ?</button>
                            </div>
                            <button onClick={handleLogin} disabled={loading}
                                className="bg-[#DB0000] text-white px-40 py-4 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed">
                                {loading ? 'Signing in...' : 'Login'}
                            </button>
                            <p className="text-center text-xs text-gray-400">or login with</p>
                            <div className="flex justify-center gap-4">
                                {[
                                    'https://cdn-icons-png.flaticon.com/512/124/124010.png',
                                    'https://cdn-icons-png.flaticon.com/512/300/300221.png',
                                    'https://cdn-icons-png.flaticon.com/512/0/747.png',
                                ].map((src, i) => (
                                    <button key={i} className="w-11 h-11 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.12)] flex items-center justify-center hover:scale-110 transition-transform" aria-label={`login-with-${i}`}>
                                        <img src={src} className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center mt-10 lg:mt-0 relative z-10">
                        <div 
                            onMouseMove={handleMouseMove}
                            className="relative w-full max-w-[280px] md:max-w-[320px] h-[450px] md:h-[520px] rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform">
                            {carouselData.map((slide, index) => (
                                <img
                                    key={index}
                                    src={slide.image}
                                    className={`absolute inset-0 w-full h-full object-cover grayscale transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                                />
                            ))}
                            {/*logo*/}
                            <div className="absolute top-[-40px] left-4 z-50 text-black text-xs">
                                <img src="/logoBlack.svg" className="w-40 h-40" alt="Logo" />
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

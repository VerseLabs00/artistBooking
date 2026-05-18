import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import stage from '../../../../public/bg-login.png'
import artistImage from '../../../../public/person.png'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
    const navigate = useNavigate()
    const { setAuth } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async () => {
        setError('')
        if (!email || !password) { setError('Please enter your email and password.'); return }
        setLoading(true)
        try {
            const { data } = await api.post('/login', { email, password })
            
            if (data.user.role !== 'artist') {
                setError('Access denied. This login is for artists only.')
                setLoading(false)
                return
            }

            setAuth(data.user, data.access_token)
            window.scrollTo(0, 0)
            navigate('/account')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.')
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
                            <ArrowLeft className="cursor-pointer text-gray-600 hover:text-black transition-colors" size={20} />
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
                                    <button key={i} className="w-11 h-11 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.12)] flex items-center justify-center hover:scale-110 transition-transform">
                                        <img src={src} className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center mt-10 lg:mt-0 relative z-10">
                        <div className="relative w-full max-w-[280px] md:max-w-[320px] h-[360px] md:h-[420px] rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:scale-105 transition-all duration-300">
                            <img src={artistImage} className="w-full h-full object-cover grayscale" />
                            <div className="absolute top-4 left-4 text-white font-bold text-lg">M</div>
                            <div className="absolute bottom-6 left-6 right-6 text-white text-xs">
                                Lorem ipsum dolor sit amet, consectetur scing elit. Proin fringilla diam vitae ex posuere ultricies.
                            </div>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
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

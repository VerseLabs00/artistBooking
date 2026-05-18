import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import stage from "../../../../public/bg-login.png";
import artistImage from "../../../../public/person.png";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function SignUp() {
    const navigate = useNavigate();
    const { setAuth } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreate = async () => {
        setError("");
        if (!name || !email || !password || !passwordConfirmation) {
            setError("Please fill in all fields."); return;
        }
        if (password !== passwordConfirmation) {
            setError("Passwords do not match."); return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters."); return;
        }
        setLoading(true);
        try {
            const { data } = await api.post("/register", {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                role: "artist",
            });
            setAuth(data.user, data.access_token);
            window.scrollTo(0, 0);
            navigate("/information");
        } catch (err: any) {
            const errors = err.response?.data?.errors;
            if (errors) {
                setError(Object.values(errors).flat().join(" "));
            } else {
                setError(err.response?.data?.message || "Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-cover bg-center" style={{ backgroundImage: `url(${stage})` }}>
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl border border-white/40 w-full max-w-4xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] grid grid-cols-1 lg:grid-cols-2 p-6 md:p-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none"></div>
                    <div className="pr-0 lg:pr-10 relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <ArrowLeft className="cursor-pointer text-gray-600 hover:text-black transition-colors" size={20} />
                            <Link to="/login" className="text-sm text-gray-500 hover:text-black transition-colors">
                                + already have an account
                            </Link>
                        </div>
                        <h1 className="text-3xl font-semibold mb-10 text-black">Sign up</h1>
                        {error && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>
                        )}
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-black mb-1">Full Name</p>
                                <input type="text" value={name} onChange={e => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full border-b border-gray-300 bg-transparent outline-none py-2 text-black focus:border-black transition-all duration-300" />
                            </div>
                            <div>
                                <p className="text-sm text-black mb-1">Email</p>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="john@gmail.com"
                                    className="w-full border-b border-gray-300 bg-transparent outline-none py-2 text-black focus:border-black transition-all duration-300" />
                            </div>
                            <div>
                                <p className="text-sm text-black mb-1">Password</p>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full border-b border-gray-300 bg-transparent outline-none py-2 text-black focus:border-black transition-all duration-300" />
                            </div>
                            <div>
                                <p className="text-sm text-black mb-1">Confirm Password</p>
                                <input type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                    className="w-full border-b border-gray-300 bg-transparent outline-none py-2 text-black focus:border-black transition-all duration-300" />
                            </div>
                            <button onClick={handleCreate} disabled={loading}
                                className="bg-[#DB0000] text-white px-40 py-4 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed">
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-center mt-10 lg:mt-0 relative z-10">
                        <div className="relative w-full max-w-[280px] md:max-w-[320px] h-[360px] md:h-[420px] rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:scale-105 transition-all duration-300">
                            <img src={artistImage} className="w-full h-full object-cover grayscale" />
                            <div className="absolute top-4 left-4 text-white font-bold text-lg">M</div>
                            <div className="absolute bottom-6 left-6 right-6 text-white text-xs">
                                Lorem ipsum dolor sit amet, consectetur scing elit.
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
    );
}

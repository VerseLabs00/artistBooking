import React, { useState } from "react";
import { MapPin, Calendar, Music2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import stage from "../../../../public/bg-login.png";
import api from "../../api/axios";

const Information: React.FC = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        full_name: "",
        stage_name: "",
        location: "",
        phone_number: "",
        dob: "",
        email: "",
        category: "Musician",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleContinue = async () => {
        setError("");
        if (!form.full_name || !form.location || !form.phone_number || !form.email) {
            setError("Please fill in all required fields."); return;
        }
        setLoading(true);
        try {
            await api.post("/onboarding/basic-info", form);
            window.scrollTo(0, 0);
            navigate("/verification");
        } catch (err: any) {
            const errors = err.response?.data?.errors;
            if (errors) {
                setError(Object.values(errors).flat().join(" "));
            } else {
                setError(err.response?.data?.message || "Failed to save. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center p-6 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${stage})` }}>
            <div className="w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden relative">
                <div onClick={() => navigate("/login")} className="absolute top-6 right-8 text-red-500 text-sm font-medium cursor-pointer z-20">
                    Back to Home
                </div>
                <div className="grid grid-cols-2 h-full">
                    {/* LEFT */}
                    <div className="relative p-16 flex flex-col justify-center h-full">
                        <div className="absolute inset-0 bg-white"></div>
                        <div className="relative z-10">
                            <h1 className="text-5xl font-semibold leading-tight">Let's get<br />started</h1>
                            <p className="mt-6 max-w-sm leading-relaxed">Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor amet, consectetur Lorem ipsum</p>
                            <div className="flex items-center gap-4 mt-8">
                                <div className="flex -space-x-3">
                                    <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-10 h-10 rounded-full border-2 border-white" />
                                    <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-10 h-10 rounded-full border-2 border-white" />
                                    <img src="https://randomuser.me/api/portraits/men/76.jpg" className="w-10 h-10 rounded-full border-2 border-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">600+ artist already joined</p>
                                    <div className="text-yellow-400 text-sm">★★★★★</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="relative p-16 h-full overflow-y-auto scroll-smooth">
                        <div className="flex items-center gap-6 text-sm mb-8">
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                                <div className="w-5 h-5 rounded-full border border-green-600 flex items-center justify-center text-xs">✓</div>
                                Basic Info
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <div className="w-5 h-5 rounded-full border flex items-center justify-center text-xs">2</div>
                                Verification
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <div className="w-5 h-5 rounded-full border flex items-center justify-center text-xs">3</div>
                                Talent Show Case
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
                                <input name="full_name" value={form.full_name} onChange={handleChange}
                                    type="text" placeholder="Enter your full name"
                                    className="mt-2 w-full h-12 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-black" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Stage Name (Optional)</label>
                                <input name="stage_name" value={form.stage_name} onChange={handleChange}
                                    type="text" placeholder="your artistic name"
                                    className="mt-2 w-full h-12 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-black" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Location <span className="text-red-500">*</span></label>
                                <div className="relative mt-2">
                                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input name="location" value={form.location} onChange={handleChange}
                                        type="text" placeholder="city, state"
                                        className="w-full h-12 rounded-xl border border-gray-300 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-black" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
                                    <input name="phone_number" value={form.phone_number} onChange={handleChange}
                                        type="text" placeholder="+94 (555) 123-456"
                                        className="mt-2 w-full h-12 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-black" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Date Of Birth</label>
                                    <div className="relative mt-2">
                                        <Calendar className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                                        <input name="dob" value={form.dob} onChange={handleChange}
                                            type="date"
                                            className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-black" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                                <input name="email" value={form.email} onChange={handleChange}
                                    type="email" placeholder="john@gmail.com"
                                    className="mt-2 w-full h-12 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-black" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Category <span className="text-red-500">*</span></label>
                                <div className="relative mt-2">
                                    <Music2 className="absolute right-10 top-3.5 w-5 h-5 text-gray-400" />
                                    <select name="category" value={form.category} onChange={handleChange}
                                        className="w-full h-12 rounded-xl border border-gray-300 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-black">
                                        <option>Singer</option>
                                        <option>Rapper</option>
                                        <option>Live Band</option>
                                        <option>Dance Group</option>
                                        <option>Producer</option>
                                        <option>DJ</option>
                                        <option>Sound System</option>
                                        <option>Lightning System</option>
                                        <option>Photographers</option>
                                        <option>Videographers</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-10">
                            <div>
                                <p className="text-sm font-medium">Step 1 of 3</p>
                                <p className="text-xs text-gray-500">Fill in your basic details to continue</p>
                            </div>
                            <button onClick={handleContinue} disabled={loading}
                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium transition disabled:opacity-60 disabled:cursor-not-allowed">
                                {loading ? 'Saving...' : 'Continue →'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Information;

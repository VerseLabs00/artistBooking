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
        category: "Singer",
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
        <div
            className="h-screen overflow-hidden flex items-center justify-center p-2 sm:p-6 bg-cover bg-center"
            style={{ backgroundImage: `url(${stage})`, fontFamily: "'Fraunces', serif" }}
        >
            <div className="w-full max-w-6xl h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden relative">
                <div onClick={() => navigate("/login")} className="absolute top-4 right-5 sm:top-6 sm:right-8 text-red-500 text-xs sm:text-sm font-medium cursor-pointer z-20">
                    Back to Home
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                    {/* LEFT - hidden on mobile, visible from md breakpoint up */}
                    <div className="hidden md:flex relative p-10 lg:p-16 flex-col justify-center h-full">
                        <div className="absolute inset-0 bg-white"></div>
                        <div className="relative z-10">
                            <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">
                                Let's get<br />started
                            </h1>
                            <p className="mt-6 max-w-sm leading-relaxed text-gray-600">
                                Join Performa's growing roster of artists. Set up your profile in three
                                quick steps and start getting booked for the events that matter to you.
                            </p>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                                        <Music2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Showcase your talent</p>
                                        <p className="text-xs text-gray-500">Build a profile that highlights your category and skills</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Get discovered locally</p>
                                        <p className="text-xs text-gray-500">Clients in your area find you faster with verified info</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Start booking events</p>
                                        <p className="text-xs text-gray-500">Manage requests and grow your schedule with ease</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-10">
                                <div className="flex -space-x-3">
                                    <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-10 h-10 rounded-full border-2 border-white" />
                                    <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-10 h-10 rounded-full border-2 border-white" />
                                    <img src="https://randomuser.me/api/portraits/men/76.jpg" className="w-10 h-10 rounded-full border-2 border-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">600+ artists already joined</p>
                                    <div className="text-yellow-400 text-sm">★★★★★</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT - form, full width on mobile */}
                    <div className="relative p-6 sm:p-10 lg:p-16 pb-10 sm:pb-12 h-full overflow-y-auto scroll-smooth col-span-1">
                        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm mb-6 sm:mb-8 mt-6 md:mt-0 flex-wrap">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        <option>Lighting System</option>
                                        <option>Photographer</option>
                                        <option>Videographer</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-10">
                            <div>
                                <p className="text-sm font-medium">Step 1 of 3</p>
                                <p className="text-xs text-gray-500">Fill in your basic details to continue</p>
                            </div>
                            <button onClick={handleContinue} disabled={loading}
                                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium transition disabled:opacity-60 disabled:cursor-not-allowed">
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
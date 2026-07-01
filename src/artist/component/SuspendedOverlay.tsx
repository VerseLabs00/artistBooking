import React from 'react';
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Phone, Mail, LogOut } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface SuspendedOverlayProps {
    show: boolean;
}

const SuspendedOverlay: React.FC<SuspendedOverlayProps> = ({ show }) => {
    const navigate = useNavigate();
    const { clearAuth } = useAuth();

    if (!show) return null;

    const handleLogout = async () => {
        try { await api.post("/logout"); } catch { /* ignore */ }
        clearAuth();
        navigate("/login");
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center relative overflow-hidden my-auto">
                <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
                
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={40} className="text-red-600" />
                </div>
                
                <h2 className="text-3xl font-black text-gray-900 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>Account Suspended</h2>
                
                <p className="text-gray-600 mb-8 leading-relaxed text-sm md:text-base">
                    Your artist account has been suspended by the administration. You can no longer receive new bookings or be seen in public listings.
                </p>
                
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contact to Reactivate</p>
                    
                    <div className="space-y-4">
                        <a href="mailto:admin@perfoma.lk" className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                                <Mail size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Email</p>
                                <p className="text-sm font-bold text-gray-900">infoperforma.lk@gmail.com</p>
                            </div>
                        </a>
                        
                        <a href="tel:+94771234567" className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                                <Phone size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Phone / WhatsApp</p>
                                <p className="text-sm font-bold text-gray-900">+94 70 403 5236</p>
                            </div>
                        </a>
                    </div>
                </div>
                
                <button
                    onClick={handleLogout}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                    <LogOut size={16} /> Logout from Account
                </button>
            </div>
        </div>
    );
};

export default SuspendedOverlay;

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Calendar,
    Clock,
    MapPin,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronRight,
    User,
    Search,
    Loader2,
    X,
    CreditCard,
    FileText,
    TrendingUp,
    Phone,
    Mail,
    ArrowLeft,
    Landmark,
    DollarSign,
    Save
} from 'lucide-react'
import api from "../../api/axios";

// --- Extended Booking Type for UI ---
interface DetailedBooking {
    id: string;
    booking_status: string;
    payment_status: string;
    advance_payment_status: string; // 'pending' | 'sent' — whether admin has sent the advance
    event_date: string;
    event_start_time: string;
    event_end_time?: string | null;
    event_type: string;
    venue: string;
    agreed_price: number;
    advance_amount: number;
    balance_due: number;
    platform_fee: number;
    artist_amount: number;
    customer_name: string;
    created_at: string;
    customer?: any;
    event_duration_hours?: number;
    special_notes?: string;
    customer_email?: string;
    customer_phone?: string;
    customer_avatar?: string;
}

// --- Normalization Helper ---
function normalizeBooking(b: any): DetailedBooking {
    // Check multiple locations for customer data (inspired by Admin logic)
    const customer = b.customer || b.user || b.customer_profile || {};

    return {
        ...b,
        id: String(b.id),
        customer_name: b.customer_name || customer.name || customer.full_name || "Customer",
        customer_avatar: b.customer_avatar || customer.avatar_url || customer.avatar || `https://i.pravatar.cc/150?u=c${customer.id || b.customer_id || b.id}`,
        customer_email: b.customer_email || customer.email || "N/A",
        event_date: b.event_date || "N/A",
        event_type: b.event_type || "N/A",
        venue: b.venue || "N/A",
        event_duration_hours: b.event_duration_hours ?? undefined,
        event_start_time: b.event_start_time || "TBD",
        event_end_time: b.event_end_time ?? null,
        special_notes: b.special_notes || "",
        customer_phone: b.customer_phone || customer.phone || "N/A",
        payment_status: b.payment_status || "Pending",
        advance_payment_status: b.advance_payment_status || "pending",
    };
}

export default function BookingRequests() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<DetailedBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<DetailedBooking | null>(null);
    const [detailsLoading, setDetailsLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'cancelled' | 'confirmed' | 'completed'>('all');

    const [earningsModalOpen, setEarningsModalOpen] = useState(false);
    const [bankDetails, setBankDetails] = useState<any>(null);
    const [bankLoading, setBankLoading] = useState(false);
    const [bankFormData, setBankFormData] = useState({
        account_holder_name: '',
        bank_name: '',
        branch: '',
        account_number: '',
        account_type: 'savings',
        ifsc_code: ''
    });

    const handleViewEarnings = async () => {
        setEarningsModalOpen(true);
        fetchBookings(); // refresh so admin-sent advances are reflected live
        setBankLoading(true);
        try {
            const { data } = await api.get('/profile/bank');
            if (data.bank_details) {
                setBankDetails(data.bank_details);
                setBankFormData(data.bank_details);
            }
        } catch (err) {
            console.error("Failed to load bank details", err);
        } finally {
            setBankLoading(false);
        }
    };

    const handleSaveBankDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        setBankLoading(true);
        try {
            const { data } = await api.post('/profile/bank', bankFormData);
            setBankDetails(data.bank_details);
            alert("Bank details saved successfully!");
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to save bank details.");
        } finally {
            setBankLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/artist/bookings");
            // Robust check for data location (handle wrapped or direct array)
            const raw = Array.isArray(data) ? data : (data.data || []);
            
            // Sort by created_at descending (newest first)
            const sorted = raw.sort((a: any, b: any) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            
            setBookings(sorted.map(normalizeBooking));
        } catch (err: any) {
            console.error("Failed to load bookings", err);
        } finally {
            setLoading(false);
        }
    };

    const handleShowDetails = async (id: string) => {
        setDetailsLoading(id);
        try {
            const { data } = await api.get(`/artist/bookings/${id}`);
            // Robust check for details
            const detailData = data.data || data;
            setSelectedBooking(normalizeBooking(detailData));
        } catch {
            setSelectedBooking(bookings.find(b => b.id === id) || null);
        } finally {
            setDetailsLoading(null);
        }
    };

    const updateStatus = async (id: string, status: "rejected" | "completed" | "confirmed") => {
        setActionLoading(id);
        try {
            const { data } = await api.put(`/artist/bookings/${id}/status`, { status });
            const updated = normalizeBooking(data.data || data);
            
            setBookings(prev => prev.map(b => b.id === id ? updated : b));
            if (selectedBooking?.id === id) {
                setSelectedBooking(updated);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Action failed.");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'all') return true;
        if (activeTab === 'cancelled') return b.booking_status === 'rejected' || b.booking_status === 'cancelled';
        if (activeTab === 'confirmed') return b.booking_status === 'confirmed' || b.booking_status === 'awaiting_confirmation';
        return b.booking_status === activeTab;
    });

    // Advances the artist is still owed (excludes ones the admin has already sent)
    const pendingAdvanceBookings = bookings.filter(
        b => (b.booking_status === 'confirmed' || b.booking_status === 'completed') && Number(b.advance_amount) > 0 && b.advance_payment_status !== 'sent'
    );
    const totalExpectedAdvances = pendingAdvanceBookings.reduce((acc, b) => acc + Number(b.advance_amount || 0), 0);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'pending_payment': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'awaiting_confirmation': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "'Fraunces', serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700;800;900&display=swap');
                .pink-text { color: #E8194B; }
                .bg-pink { background-color: #E8194B; }
                .btn-pink { background: #E8194B; color: #fff; transition: all 0.2s; }
                .btn-pink:hover { background: #c8133b; transform: translateY(-1px); }
                .tab-active { color: #E8194B; border-bottom: 2px solid #E8194B; }
                .glass-card { background: rgba(255, 255, 255, 0.9); backdrop-blur-md; border: 1px solid rgba(255, 255, 255, 0.4); }
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>

            {/* Earnings Modal */}
            {earningsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
                        <button
                            onClick={() => setEarningsModalOpen(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                        >
                            <X size={24} className="text-gray-400" />
                        </button>
                        
                        <div className="p-8 border-b border-gray-100">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                <Landmark className="text-green-500" /> Earnings & Payouts
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Manage your bank details and track your advances.</p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                            {bankLoading && !bankDetails ? (
                                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
                            ) : !bankDetails ? (
                                <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-4">
                                            <Landmark size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Add Bank Details</h3>
                                        <p className="text-sm text-gray-500 mt-1">Please provide your bank details to receive advance payments and view your earnings.</p>
                                    </div>
                                    <form onSubmit={handleSaveBankDetails} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Account Holder Name</label>
                                            <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink/50" 
                                                value={bankFormData.account_holder_name} onChange={e => setBankFormData({...bankFormData, account_holder_name: e.target.value})} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bank Name</label>
                                                <input required type="text" list="sri-lanka-banks" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink/50" 
                                                    value={bankFormData.bank_name} onChange={e => setBankFormData({...bankFormData, bank_name: e.target.value})} placeholder="Select or type your bank" />
                                                <datalist id="sri-lanka-banks">
                                                    <option value="Commercial Bank of Ceylon" />
                                                    <option value="Bank of Ceylon (BOC)" />
                                                    <option value="Sampath Bank" />
                                                    <option value="Hatton National Bank (HNB)" />
                                                    <option value="People's Bank" />
                                                    <option value="Seylan Bank" />
                                                    <option value="National Development Bank (NDB)" />
                                                    <option value="Nations Trust Bank (NTB)" />
                                                    <option value="DFCC Bank" />
                                                    <option value="Pan Asia Bank" />
                                                    <option value="Union Bank" />
                                                    <option value="Amana Bank" />
                                                    <option value="Cargills Bank" />
                                                    <option value="Sanasa Development Bank (SDB)" />
                                                </datalist>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Branch Name</label>
                                                <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink/50" 
                                                    value={bankFormData.branch} onChange={e => setBankFormData({...bankFormData, branch: e.target.value})} placeholder="e.g. Colombo 03" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Account Number</label>
                                                <input required type="text" pattern="\d+" title="Please enter only numeric digits for your account number" 
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink/50" 
                                                    value={bankFormData.account_number} 
                                                    onChange={e => setBankFormData({...bankFormData, account_number: e.target.value.replace(/\D/g, '')})} 
                                                    minLength={6} maxLength={20} placeholder="e.g. 1002345678" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Account Type</label>
                                                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink/50" 
                                                    value={bankFormData.account_type} onChange={e => setBankFormData({...bankFormData, account_type: e.target.value})}>
                                                    <option value="savings">Savings Account</option>
                                                    <option value="current">Current Account</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button type="submit" disabled={bankLoading} className="w-full btn-pink py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-2">
                                            {bankLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            Save Details
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Expected Advances</p>
                                            <h3 className="text-3xl font-black text-green-600 flex items-center gap-1">
                                                Rs. {totalExpectedAdvances.toLocaleString()}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 font-bold uppercase">Payout Account</p>
                                            <p className="font-semibold text-gray-900 text-sm">{bankDetails.bank_name}</p>
                                            <p className="text-xs text-gray-500">{bankDetails.account_number_masked || bankDetails.account_number}</p>
                                            <button onClick={() => setBankDetails(null)} className="text-[10px] font-bold text-pink mt-1 hover:underline uppercase">Edit Account</button>
                                        </div>
                                    </div>
                                    
                                    <h3 className="font-bold text-gray-900 text-lg">Advance Payments</h3>
                                    <div className="space-y-3">
                                        {pendingAdvanceBookings.map(booking => (
                                            <div key={booking.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                                        <DollarSign size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{booking.customer_name}</p>
                                                        <p className="text-xs text-gray-500">{booking.event_date} &bull; {booking.event_type}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-gray-900">Rs. {Number(booking.advance_amount || 0).toLocaleString()}</p>
                                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                        booking.advance_payment_status === 'sent'
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    }`}>
                                                        {booking.advance_payment_status === 'sent' ? '✓ Payment Done' : 'Payment Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {pendingAdvanceBookings.length === 0 && (
                                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-500">
                                                <DollarSign size={24} className="mx-auto mb-2 text-gray-300" />
                                                <p className="text-sm">No advance payments recorded yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]">
                        <button
                            onClick={() => setSelectedBooking(null)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                        >
                            <X size={24} className="text-gray-400" />
                        </button>

                        <div className="w-full md:w-1/3 bg-gray-100 shrink-0">
                            <img
                                src={selectedBooking.customer_avatar}
                                className="w-full h-64 md:h-full object-cover"
                                alt=""
                            />
                        </div>
                        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[90vh]">
                            <div className="mb-6">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(selectedBooking.booking_status)}`}>
                                    {selectedBooking.booking_status}
                                </span>
                                <h2 className="text-3xl font-black text-gray-900 mt-3">{selectedBooking.customer_name}</h2>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 mb-8">
                                <div className="flex-1 flex flex-col gap-5">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Event Type</p>
                                        <div className="flex items-center gap-2 text-gray-900 font-bold">
                                            <FileText size={16} className="text-pink" />
                                            <span>{selectedBooking.event_type}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Venue</p>
                                        <div className="flex items-center gap-2 text-gray-900 font-bold">
                                            <MapPin size={16} className="text-pink" />
                                            <span>{selectedBooking.venue}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Event Date</p>
                                        <div className="flex items-center gap-2 text-gray-900 font-bold">
                                            <Calendar size={16} className="text-pink" />
                                            <span>{selectedBooking.event_date}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col gap-5">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Start Time</p>
                                        <div className="flex items-center gap-2 text-gray-900 font-bold">
                                            <Clock size={16} className="text-pink" />
                                            <span>{selectedBooking.event_start_time}</span>
                                        </div>
                                    </div>
                                    {selectedBooking.event_end_time && (
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">End Time</p>
                                            <div className="flex items-center gap-2 text-gray-900 font-bold">
                                                <Clock size={16} className="text-pink" />
                                                <span>{selectedBooking.event_end_time}</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedBooking.event_duration_hours != null && (
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Duration</p>
                                            <div className="flex items-center gap-2 text-gray-900 font-bold">
                                                <Clock size={16} className="text-pink" />
                                                <span>{selectedBooking.event_duration_hours} hrs</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedBooking.special_notes && (
                                <div className="mb-8">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Special Notes</p>
                                    <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl italic">
                                        "{selectedBooking.special_notes}"
                                    </p>
                                </div>
                            )}

                            <div className="mb-8 p-6 bg-pink/5 rounded-2xl border border-pink/10">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">Customer Contact</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-pink shadow-sm">
                                            <Mail size={14} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-700">{selectedBooking.customer_email}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-pink shadow-sm">
                                            <Phone size={14} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-700">{selectedBooking.customer_phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 mb-8 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <CreditCard size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Total Price</span>
                                    </div>
                                    <span className="text-lg font-black text-gray-900">Rs. {selectedBooking.agreed_price.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <FileText size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Advance</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">Rs. {selectedBooking.advance_amount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <AlertCircle size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Balance Due</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">Rs. {selectedBooking.balance_due.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {(selectedBooking.booking_status === "pending" || selectedBooking.booking_status === "pending_payment" || selectedBooking.booking_status === "awaiting_confirmation") && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(selectedBooking.id, "confirmed")}
                                            disabled={actionLoading === selectedBooking.id}
                                            className="flex-1 btn-pink py-4 rounded-2xl font-bold text-sm disabled:opacity-50"
                                        >
                                            {actionLoading === selectedBooking.id ? 'Accepting...' : 'Accept Request'}
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedBooking.id, "rejected")}
                                            disabled={actionLoading === selectedBooking.id}
                                            className="flex-1 px-6 py-4 border border-red-200 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === selectedBooking.id ? 'Declining...' : 'Decline Request'}
                                        </button>
                                    </>
                                )}
                                {selectedBooking.booking_status === "confirmed" && (
                                    <button
                                        onClick={() => updateStatus(selectedBooking.id, "completed")}
                                        disabled={actionLoading === selectedBooking.id}
                                        className="flex-1 btn-pink py-4 rounded-2xl font-bold text-sm disabled:opacity-50"
                                    >
                                        {actionLoading === selectedBooking.id ? 'Updating...' : 'Mark Completed'}
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="flex-1 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-colors px-6 py-4"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* NAVBAR */}
            <nav className="w-full flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-pink-600"
                        title="Go back"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <Link to="/artistHome" className="flex items-center">
                        <img src="/assets/logo/logo-navbar-light@3x.png" alt="Perfoma" className="h-10 w-auto object-contain" />
                    </Link>
                </div>
                {/*<div className="flex items-center gap-4">*/}
                {/*    <button*/}
                {/*        onClick={() => navigate('/account')}*/}
                {/*        className="text-gray-600 hover:text-black transition-colors text-sm font-semibold">*/}
                {/*        My Account*/}
                {/*    </button>*/}

                {/*</div>*/}
            </nav>

            <div className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-8 py-10">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* SIDEBAR */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 rounded-full bg-pink/10 flex items-center justify-center text-pink mx-auto mb-4 border-2 border-pink/20">
                                    <User size={32} />
                                </div>
                                <h2 className="font-bold text-xl text-gray-900">Artist Panel</h2>
                                <p className="text-gray-500 text-xs mt-1">Manage Requests</p>
                            </div>

                            <nav className="space-y-2">
                                {[
                                    { id: 'all', icon: <Search size={18} />, label: 'All Requests' },
                                    { id: 'cancelled', icon: <XCircle size={18} />, label: 'Cancel' },
                                    { id: 'confirmed', icon: <CheckCircle size={18} />, label: 'Confirmed' },
                                    { id: 'completed', icon: <TrendingUp size={18} />, label: 'Completed' },
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id as any)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                            activeTab === item.id
                                                ? 'bg-pink text-white shadow-lg shadow-pink/20'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === item.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                                            {bookings.filter(b => {
                                                if (item.id === 'all') return true;
                                                if (item.id === 'cancelled') return b.booking_status === 'rejected' || b.booking_status === 'cancelled';
                                                return b.booking_status === item.id;
                                            }).length}
                                        </span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* MAIN CONTENT */}
                    <main className="flex-1 min-w-0">
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <header className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-xl font-black text-gray-900">Booking Requests</h1>
                                    <p className="text-gray-500 mt-2">View and manage your incoming booking requests.</p>
                                </div>
                                <button 
                                    onClick={() => handleViewEarnings()}
                                    className="px-5 py-2.5 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-200 hover:bg-green-100 transition-colors flex items-center gap-2"
                                >
                                    <Landmark size={18} />
                                    Earnings
                                </button>
                            </header>

                            {loading ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {[1,2,3,4,5,6].map(i => (
                                        <div key={i} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="w-full md:w-32 h-32 rounded-[20px] bg-gray-100 animate-pulse flex-shrink-0" />
                                                <div className="flex-1 flex flex-col justify-between py-1 flex-1">
                                                    <div>
                                                        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                                                            <div>
                                                                <div className="h-5 bg-gray-100 rounded w-32 animate-pulse mb-2" />
                                                                <div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
                                                            </div>
                                                            <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                                                <div className="h-3 bg-gray-100 rounded w-12 animate-pulse mb-1" />
                                                                <div className="h-5 bg-gray-100 rounded w-20 animate-pulse" />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
                                                                <div>
                                                                    <div className="h-3 bg-gray-100 rounded w-8 animate-pulse mb-1" />
                                                                    <div className="h-4 bg-gray-100 rounded w-16 animate-pulse" />
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
                                                                <div>
                                                                    <div className="h-3 bg-gray-100 rounded w-8 animate-pulse mb-1" />
                                                                    <div className="h-4 bg-gray-100 rounded w-16 animate-pulse" />
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
                                                                <div>
                                                                    <div className="h-3 bg-gray-100 rounded w-8 animate-pulse mb-1" />
                                                                    <div className="h-4 bg-gray-100 rounded w-20 animate-pulse" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
                                                        <div className="h-9 bg-gray-100 rounded-xl w-24 animate-pulse" />
                                                        <div className="h-9 bg-gray-100 rounded-xl w-20 animate-pulse" />
                                                        <div className="h-9 bg-gray-100 rounded-xl w-20 animate-pulse" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredBookings.length === 0 ? (
                                <div className="text-center py-40 bg-white rounded-[40px] border border-gray-100 shadow-sm px-6">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                                        <Calendar size={40} />
                                    </div>
                                    <h4 className="font-bold text-gray-900">No {activeTab !== 'all' ? activeTab : ''} bookings found</h4>
                                    <p className="text-gray-500 text-sm mt-2">New requests will appear here once customers book you.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {filteredBookings.map(booking => (
                                        <div key={booking.id} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="relative w-full md:w-32 h-32 rounded-[20px] overflow-hidden flex-shrink-0 shadow-inner">
                                                    <img src={booking.customer_avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={booking.customer_name} />
                                                    <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border glass-card ${getStatusColor(booking.booking_status)}`}>
                                                        {booking.booking_status}
                                                    </div>
                                                </div>

                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                    <div>
                                                        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                                                            <div>
                                                                <h3 className="text-lg font-black text-gray-900">{booking.customer_name}</h3>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-pink font-bold text-xs">{booking.event_type}</span>
                                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">ID: #{booking.id.slice(0, 8)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                                                <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider mb-0.5">Advance</p>
                                                                <p className="text-lg font-black text-gray-900">Rs. {booking.advance_amount.toLocaleString()}</p>
                                                                {(booking.booking_status === 'confirmed' || booking.booking_status === 'completed') && booking.advance_amount > 0 && (
                                                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                                                        booking.advance_payment_status === 'sent'
                                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                    }`}>
                                                                        {booking.advance_payment_status === 'sent' ? '✓ Advance Paid' : 'Advance Pending'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-pink/5 flex items-center justify-center text-pink">
                                                                    <Calendar size={16} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Date</p>
                                                                    <p className="text-xs font-bold text-gray-900">{booking.event_date}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-pink/5 flex items-center justify-center text-pink">
                                                                    <Clock size={16} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Start</p>
                                                                    <p className="text-xs font-bold text-gray-900">{booking.event_start_time}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-pink/5 flex items-center justify-center text-pink">
                                                                    <MapPin size={16} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Venue</p>
                                                                    <p className="text-xs font-bold text-gray-900 truncate">{booking.venue}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
                                                        <button
                                                            onClick={() => handleShowDetails(booking.id)}
                                                            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center gap-2"
                                                        >
                                                            {detailsLoading === booking.id && <Loader2 size={12} className="animate-spin" />}
                                                            View Request
                                                        </button>
                                                        {(booking.booking_status === "pending" || booking.booking_status === "pending_payment" || booking.booking_status === "awaiting_confirmation") && (
                                                            <>
                                                                <button
                                                                    onClick={() => updateStatus(booking.id, "confirmed")}
                                                                    disabled={actionLoading === booking.id}
                                                                    className="btn-pink px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                                                                >
                                                                    {actionLoading === booking.id && <Loader2 size={12} className="animate-spin" />}
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => updateStatus(booking.id, "rejected")}
                                                                    disabled={actionLoading === booking.id}
                                                                    className="px-6 py-2.5 border border-red-200 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
                                                                >
                                                                    {actionLoading === booking.id && <Loader2 size={12} className="animate-spin" />}
                                                                    Decline
                                                                </button>
                                                            </>
                                                        )}
                                                        {booking.booking_status === "confirmed" && (
                                                            <button
                                                                onClick={() => updateStatus(booking.id, "completed")}
                                                                disabled={actionLoading === booking.id}
                                                                className="btn-pink px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                                                            >
                                                                {actionLoading === booking.id && <Loader2 size={12} className="animate-spin" />}
                                                                Mark Completed
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

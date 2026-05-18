import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

interface Booking {
    id: number;
    booking_status: string;
    payment_status: string;
    event_date: string;
    event_start_time: string;
    event_type: string;
    venue: string;
    agreed_price: number;
    advance_amount: number;
    balance_due: number;
    customer_name: string;
    created_at: string;
    // Detailed fields
    event_duration_hours?: number;
    special_notes?: string;
    customer_email?: string;
    customer_phone?: string;
}

const STATUS_COLORS: Record<string, string> = {
    pending: "border-yellow-400",
    confirmed: "border-green-500",
    rejected: "border-red-400",
    completed: "border-blue-400",
    cancelled: "border-gray-400",
    pending_payment: "border-orange-400",
};

export default function BookingRequests() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selected, setSelected] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError] = useState("");

    useEffect(() => { fetchBookings(); }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/bookings");
            setBookings(data.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load bookings.");
        } finally {
            setLoading(false);
        }
    };

    const openBooking = async (id: number) => {
        try {
            const { data } = await api.get(`/bookings/${id}`);
            setSelected(data.data);
        } catch { /* fallback to list data */ setSelected(bookings.find(b => b.id === id) || null); }
    };

    const updateStatus = async (id: number, status: "rejected" | "completed") => {
        setActionLoading(true);
        try {
            await api.put(`/bookings/${id}/status`, { status });
            setSuccessMsg(status === "rejected" ? "Booking declined." : "Booking marked as completed.");
            setSelected(null);
            await fetchBookings();
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Action failed.");
        } finally {
            setActionLoading(false);
        }
    };

    const pendingBookings = bookings.filter(b => b.booking_status === "pending" || b.booking_status === "confirmed");
    const otherBookings = bookings.filter(b => !["pending", "confirmed"].includes(b.booking_status));

    const formatDate = (dateStr: string): { month: string; day: number } => {
        if (!dateStr) return { month: "", day: 0 };
        const d = new Date(dateStr);
        return { month: d.toLocaleString("en", { month: "short" }).toUpperCase(), day: d.getDate() };
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
            <div className="w-full max-w-6xl grid grid-cols-3 gap-6 relative">

                {/* LEFT PROFILE CARD */}
                <div className={`col-span-1 space-y-6 transition ${selected ? "opacity-30 pointer-events-none" : ""}`}>
                    <div className="bg-white rounded-2xl shadow p-6 text-center">
                        <div className="mt-4">
                            <h2 className="text-xl font-semibold">My Bookings</h2>
                            <p className="text-gray-500 text-sm">Manage your booking requests</p>
                        </div>
                        <div className="mt-6 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Pending</span>
                                <span className="text-yellow-500 font-medium">{bookings.filter(b => b.booking_status === "pending").length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Confirmed</span>
                                <span className="text-green-500 font-medium">{bookings.filter(b => b.booking_status === "confirmed").length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Completed</span>
                                <span className="font-medium">{bookings.filter(b => b.booking_status === "completed").length}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-red-500">
                        <p className="text-sm font-medium">Respond within 48h</p>
                        <p className="text-xs text-gray-500 mt-1">Late response lowers your profile ranking and visibility.</p>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm text-gray-500">
                            Pending Requests · {pendingBookings.length}
                        </h3>
                        <button onClick={() => navigate("/account")} className="text-red-500 text-sm">Back to Profile</button>
                    </div>

                    {successMsg && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">{successMsg}</div>
                    )}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>
                    )}

                    {loading ? (
                        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400 text-sm">Loading bookings...</div>
                    ) : bookings.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400 text-sm">No booking requests yet.</div>
                    ) : (
                        <div className="space-y-3">
                            {[...pendingBookings, ...otherBookings].map(b => {
                                const { month, day } = formatDate(b.event_date);
                                return (
                                    <div key={b.id} className={`bg-white rounded-2xl shadow p-4 flex items-center justify-between border-l-4 ${STATUS_COLORS[b.booking_status] || "border-gray-300"}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="text-center min-w-[40px]">
                                                <p className="text-xs text-gray-400">{month}</p>
                                                <p className="text-lg font-semibold">{day}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium">{b.customer_name}</p>
                                                <p className="text-xs text-gray-500">{b.event_type} · {b.event_start_time}</p>
                                                <p className="text-xs text-gray-500">{b.venue}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">${b.agreed_price}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                b.booking_status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                b.booking_status === "confirmed" ? "bg-green-100 text-green-700" :
                                                b.booking_status === "completed" ? "bg-blue-100 text-blue-700" :
                                                "bg-gray-100 text-gray-600"
                                            }`}>
                                                {b.booking_status}
                                            </span>
                                            <br />
                                            <button onClick={() => openBooking(b.id)} className="text-xs text-red-500 mt-1">View Request</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* SLIDE OVER PANEL */}
                {selected && (
                    <div className="fixed inset-0 flex justify-end bg-black/20 z-40">
                        <div className="w-full max-w-md bg-white h-full shadow-xl p-6 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-semibold">{selected.customer_name}</h2>
                                <button onClick={() => setSelected(null)}>✕</button>
                            </div>
                            <div className="border-t pt-4 space-y-4">
                                <p className="text-xs text-gray-400">Event Details</p>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-gray-100 p-3 rounded-lg">
                                        <p className="text-gray-400 text-xs">Date</p>
                                        <p>{selected.event_date}</p>
                                    </div>
                                    <div className="bg-gray-100 p-3 rounded-lg">
                                        <p className="text-gray-400 text-xs">Time</p>
                                        <p>{selected.event_start_time}</p>
                                    </div>
                                    {selected.event_duration_hours && (
                                        <div className="bg-gray-100 p-3 rounded-lg">
                                            <p className="text-gray-400 text-xs">Duration</p>
                                            <p>{selected.event_duration_hours} hours</p>
                                        </div>
                                    )}
                                    <div className="bg-gray-100 p-3 rounded-lg">
                                        <p className="text-gray-400 text-xs">Event Type</p>
                                        <p>{selected.event_type}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-2">Venue</p>
                                    <div className="bg-gray-100 p-3 rounded-lg text-sm">{selected.venue}</div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-2">Client Info</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="bg-gray-100 p-3 rounded-lg">{selected.customer_name}</div>
                                        {selected.customer_phone && <div className="bg-gray-100 p-3 rounded-lg">{selected.customer_phone}</div>}
                                        {selected.customer_email && <div className="bg-gray-100 p-3 rounded-lg">{selected.customer_email}</div>}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-2">Payment</p>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="bg-gray-100 p-3 rounded-lg">
                                            <p className="text-gray-400 text-xs">Agreed Price</p>
                                            <p>${selected.agreed_price}</p>
                                        </div>
                                        <div className="bg-gray-100 p-3 rounded-lg">
                                            <p className="text-gray-400 text-xs">Balance Due</p>
                                            <p>${selected.balance_due}</p>
                                        </div>
                                    </div>
                                </div>
                                {selected.special_notes && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-2">Notes</p>
                                        <div className="bg-gray-100 p-3 rounded-lg text-sm">{selected.special_notes}</div>
                                    </div>
                                )}
                                {(selected.booking_status === "pending" || selected.booking_status === "confirmed") && (
                                    <div className="flex gap-3 pt-4">
                                        {selected.booking_status === "confirmed" && (
                                            <button onClick={() => updateStatus(selected.id, "completed")} disabled={actionLoading}
                                                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-60">
                                                {actionLoading ? "..." : "Mark Completed"}
                                            </button>
                                        )}
                                        <button onClick={() => updateStatus(selected.id, "rejected")} disabled={actionLoading}
                                            className="flex-1 border border-red-400 text-red-500 py-2 rounded-lg hover:bg-red-50 transition disabled:opacity-60">
                                            {actionLoading ? "..." : "Decline"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* SUCCESS POPUP */}
                {successMsg && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 pointer-events-none">
                        <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 text-center animate-scaleIn">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">✓</div>
                            <h3 className="text-lg font-semibold">Done!</h3>
                            <p className="text-sm text-gray-500 mt-1">{successMsg}</p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
                .animate-scaleIn { animation: scaleIn 0.25s ease; }
            `}</style>
        </div>
    );
}

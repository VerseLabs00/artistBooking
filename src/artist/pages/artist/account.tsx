import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Heart, MoreHorizontal, Play, Music, MapPin, Users, Star,
    Instagram, Facebook, Twitter, Mail, Youtube, Music2, Home, LogOut
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

interface Profile {
    full_name?: string;
    stage_name?: string;
    location?: string;
    category?: string;
    short_bio?: string;
    bio_1?: string;
    bio_2?: string;
    paragraph?: string;
    starting_price?: number;
    max_price?: number;
    avatar_url?: string;
    cover_url?: string;
    youtube_link?: string;
    facebook_link?: string;
    instagram_link?: string;
    spotify_link?: string;
    tags?: string[];
}

interface Media {
    id: number;
    url: string;
    title?: string;
    media_type: string;
    purpose: string;
    is_external_link: boolean;
}

interface Rating {
    average: number | null;
    total: number;
    distribution: Record<number, number>;
    recent_reviews: {
        id: number;
        rating: number;
        reviewer_name: string;
        reviewer_avatar?: string;
        body: string;
        created_at: string;
    }[];
}

export default function ArtistProfile() {
    const navigate = useNavigate();
    const { clearAuth } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [media, setMedia] = useState<Media[]>([]);
    const [rating, setRating] = useState<Rating | null>(null);
    const [artistStats, setArtistStats] = useState<{ total: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProfile();
        fetchStats();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get("/profile");
            setProfile(data.profile);
            setMedia(data.media || []);
            setRating(data.rating);
        } catch (err: any) {
            if (err.response?.status === 404) {
                navigate("/information");
            } else {
                setError("Failed to load profile.");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await api.get("/bookings/dashboard");
            setArtistStats(data.stats);
        } catch (err) {
            console.error("Failed to load stats", err);
        }
    };

    const handleLogout = async () => {
        try { await api.post("/logout"); } catch { /* ignore */ }
        clearAuth();
        navigate("/login");
    };

    const handleDeleteVideo = async (id: number) => {
        try {
            await api.delete(`/profile/gallery/${id}`);
            setMedia(prev => prev.filter(m => m.id !== id));
        } catch { /* ignore */ }
    };

    const galleryImages = media.filter(
        m => m.media_type === "image" &&
            m.purpose !== "verification_front" &&
            m.purpose !== "verification_back" &&
            m.purpose !== "selfie"
    );
    const videoLinks = media.filter(m => m.media_type === "video");

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
            Loading profile...
        </div>
    );
    if (error) return (
        <div className="min-h-screen flex items-center justify-center text-red-500 text-sm">{error}</div>
    );

    const displayName = profile?.stage_name || profile?.full_name || "Artist";

    return (
        <div className="min-h-screen bg-[#F4F1F5] pb-20">

            {/* HERO — overflow-visible so avatar can bleed below */}
            <div className="relative h-[220px] w-full overflow-visible">
                <img
                    src={profile?.cover_url || "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e"}
                    className="w-full h-[220px] object-cover"
                    alt="cover"
                />
                <div className="absolute inset-0 h-[220px] bg-black/20" />

                {/* TOP BUTTONS */}
                <button
                    onClick={() => navigate("/artistHome")}
                    className="absolute top-5 left-5 w-10 h-10 bg-white/90 backdrop-blur-sm text-black rounded-full flex items-center justify-center shadow-md hover:scale-110 transition z-20"
                    title="Go Back"
                >
                    <Home size={20} />
                </button>

                <div className="absolute top-5 right-5 flex gap-3 z-20">
                    <button
                        onClick={handleLogout}
                        className="bg-black/80 backdrop-blur-sm text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

                {/* AVATAR — half inside hero, half below */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 lg:left-[calc((100%-72rem)/2+120px)] lg:translate-x-0 z-30">
                    <img
                        src={profile?.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"}
                        className="w-32 h-32 rounded-full border-[5px] border-white object-cover shadow-lg"
                        alt="avatar"
                    />
                </div>
            </div>

            {/* MAIN WRAPPER — mt-4 (no negative margin; hero overlap handled by avatar position) */}
            <div className="max-w-6xl mx-auto px-4 mt-4 relative z-20">

                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

                    {/* LEFT PANEL */}
                    <div className="space-y-5">

                        {/* Main card — rounded-2xl, pt-20 to clear the overlapping avatar */}
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

                            <div className="px-6 pb-7 text-center pt-20">
                                <h1 className="text-[42px] font-bold text-black leading-none mt-4">
                                    {displayName}
                                </h1>

                                {/* RATING */}
                                {rating?.average && (
                                    <div className="flex items-center justify-center gap-1 mt-2 text-[13px]">
                                        <Star size={14} className="text-yellow-500 fill-yellow-400" />
                                        <span className="font-semibold text-gray-700">
                                            {rating.average}
                                        </span>
                                        <span className="text-gray-400">
                                            ({rating.total} reviews)
                                        </span>
                                    </div>
                                )}

                                {/* TAGS */}
                                {profile?.tags && profile.tags.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                                        {profile.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="bg-[#EEE8FF] text-[#7A57F2] text-[10px] px-3 py-1 rounded-full capitalize"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* BIO */}
                                {profile?.short_bio && (
                                    <p className="text-[13px] text-gray-500 leading-6 mt-6 text-left">
                                        {profile.short_bio}
                                    </p>
                                )}

                                {/* PRICE */}
                                {profile?.starting_price && (
                                    <div className="mt-7 text-left">
                                        <div className="text-[#FF2B6B] font-bold text-[28px] leading-none">
                                            ${profile.starting_price}
                                            <span className="text-gray-600 text-[15px] font-medium ml-2">
                                                starting price
                                            </span>
                                        </div>
                                        {profile.max_price && (
                                            <p className="text-[11px] text-gray-400 mt-1">
                                                Range: ${profile.starting_price} - ${profile.max_price} depending on event type and duration
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* BUTTONS */}
                                <div className="flex gap-3 mt-7">
                                    <button
                                        onClick={() => navigate("/bookingRequests")}
                                        className="flex-1 bg-[#FF2B6B] hover:bg-[#ff1b60] transition text-white py-3 rounded-full font-semibold text-sm shadow-md"
                                    >
                                        My Bookings ({artistStats?.total ?? 0})
                                    </button>
                                    <button
                                        onClick={() => navigate("/editProfile")}
                                        className="flex-1 border border-gray-300 py-3 rounded-full font-semibold text-sm hover:bg-gray-50 transition"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* SOCIAL — rounded-2xl */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm text-center">
                            <h3 className="text-[20px] font-semibold text-gray-700 mb-5">
                                Social & Web
                            </h3>
                            <div className="flex justify-center gap-4">
                                {profile?.instagram_link && (
                                    <a href={profile.instagram_link} target="_blank" rel="noreferrer"
                                       className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">
                                        <Instagram size={18} />
                                    </a>
                                )}
                                {profile?.facebook_link && (
                                    <a href={profile.facebook_link} target="_blank" rel="noreferrer"
                                       className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">
                                        <Facebook size={18} />
                                    </a>
                                )}
                                {profile?.youtube_link && (
                                    <a href={profile.youtube_link} target="_blank" rel="noreferrer"
                                       className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">
                                        <Youtube size={18} />
                                    </a>
                                )}
                                {profile?.spotify_link && (
                                    <a href={profile.spotify_link} target="_blank" rel="noreferrer"
                                       className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">
                                        <Music2 size={18} />
                                    </a>
                                )}
                                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 cursor-pointer">
                                    <Mail size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL — rounded-2xl */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

                        {/* TOP SECTION */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-[26px] font-bold text-gray-900">
                                    Overview
                                </h2>
                                <div className="flex flex-wrap gap-5 mt-2 text-[13px] text-gray-500">
                                    {profile?.category && (
                                        <span className="flex items-center gap-1">
                                            <Music size={13} /> {profile.category}
                                        </span>
                                    )}
                                    {profile?.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin size={13} /> {profile.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 rounded-full border flex items-center justify-center text-gray-400 hover:bg-gray-50">
                                    <Heart size={18} />
                                </button>
                                <button className="w-10 h-10 rounded-full border flex items-center justify-center text-gray-400 hover:bg-gray-50">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>

                        {/* DESCRIPTION */}
                        <div className="mt-7 space-y-5 text-[14px] text-gray-500 leading-7">
                            {profile?.short_bio && <p>{profile.short_bio}</p>}
                            {profile?.bio_1 && <p>{profile.bio_1}</p>}
                            {profile?.bio_2 && <p>{profile.bio_2}</p>}
                            {profile?.paragraph && <p>{profile.paragraph}</p>}
                            {!profile?.short_bio && !profile?.bio_1 && !profile?.bio_2 && !profile?.paragraph && (
                                <p className="text-gray-400 italic">No biography added yet.</p>
                            )}
                        </div>

                        {/* GALLERY — images rounded-xl */}
                        {galleryImages.length > 0 && (
                            <>
                                <h3 className="text-[24px] font-bold mt-10 mb-5">Gallery</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {galleryImages.slice(0, 3).map((img) => (
                                        <img
                                            key={img.id}
                                            src={img.url}
                                            alt="gallery"
                                            className="w-full h-[180px] object-cover rounded-xl"
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* AUDIO & VIDEO */}
                        {videoLinks.length > 0 && (
                            <>
                                <h3 className="text-[24px] font-bold mt-10 mb-5">Audio & Video</h3>
                                <div className="space-y-4">
                                    {videoLinks.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between border-b pb-4">
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-4 hover:opacity-80 transition flex-1 min-w-0"
                                            >
                                                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                    <Play size={16} className="text-gray-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[14px] font-medium text-gray-700">
                                                        {item.title || "Untitled"}
                                                    </p>
                                                    <p className="text-[12px] text-gray-400 truncate max-w-[220px]">
                                                        {item.url}
                                                    </p>
                                                </div>
                                            </a>
                                            <button
                                                onClick={() => handleDeleteVideo(item.id)}
                                                className="ml-4 shrink-0 text-[12px] text-red-500 hover:text-red-700 font-medium transition"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* REVIEWS */}
                        <h3 className="text-lg font-bold mt-12 mb-6">Reviews</h3>
                        {rating && (
                            <div className="grid md:grid-cols-2 gap-8 mb-10">
                                <div className="text-center">
                                    <h2 className="text-4xl font-bold">{rating.average ?? "—"}</h2>
                                    <div className="flex justify-center text-yellow-400 mt-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={20} fill="currentColor" />
                                        ))}
                                    </div>
                                    <p className="text-gray-400 text-xs mt-1">{rating.total} Reviews</p>
                                </div>
                                <div className="space-y-2">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <div key={star} className="flex items-center gap-2 text-sm">
                                            <span>{star}</span>
                                            <Star size={14} />
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                                <div
                                                    className="h-2 bg-yellow-400 rounded-full"
                                                    style={{ width: `${rating.total ? (rating.distribution[star] / rating.total) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {rating?.recent_reviews.map(r => (
                                <div key={r.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                    <div className="flex justify-between">
                                        <div className="flex gap-3 items-center">
                                            <img
                                                src={r.reviewer_avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"}
                                                className="w-8 h-8 rounded-full object-cover"
                                                alt={r.reviewer_name}
                                            />
                                            <div>
                                                <p className="text-xs font-bold uppercase">{r.reviewer_name}</p>
                                                <p className="text-[10px] text-gray-400">{r.created_at}</p>
                                            </div>
                                        </div>
                                        <div className="flex text-yellow-400">
                                            {[...Array(r.rating)].map((_, i) => (
                                                <Star key={i} size={12} fill="currentColor" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3">{r.body}</p>
                                </div>
                            ))}
                            {(!rating?.recent_reviews || rating.recent_reviews.length === 0) && (
                                <p className="text-sm text-gray-400 text-center py-6">No reviews yet.</p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Heart, Play, Music, MapPin, Users, Star,
    Instagram, Facebook, Twitter, Mail, Youtube, Music2, Home, LogOut, X
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import ArtistOwnCalendar from "../../../components/ArtistOwnCalendar";

interface Profile {
    full_name?: string;
    stage_name?: string;
    location?: string;
    category?: string;
    short_bio?: string;
    bio_1?: string;
    bio_2?: string;
    paragraph?: string;
    full_price?: number;
    advance?: number;
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

// ── Media preview helpers ──────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([^&?/]+)/);
    return match ? match[1] : null;
}

function getSpotifyEmbedUrl(url: string): string | null {
    const match = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([^?]+)/);
    return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}` : null;
}

function isDirectVideo(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

// ── Fetch YouTube title via oEmbed (no API key required) ──────────────────
async function fetchYouTubeTitle(ytId: string): Promise<string> {
    const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`
    );
    if (!res.ok) throw new Error("oEmbed fetch failed");
    const data = await res.json();
    return data.title as string;
}

function MediaPreviewCard({ item, onDelete, isPlaying, onPlay }: { 
    item: Media; 
    onDelete: (id: number) => void;
    isPlaying: boolean;
    onPlay: () => void;
}) {
    const [resolvedTitle, setResolvedTitle] = useState<string>(item.title || "");

    const ytId = getYouTubeId(item.url);
    const spotifyEmbed = getSpotifyEmbedUrl(item.url);

    // Auto-fetch YouTube title if not provided by the backend
    useEffect(() => {
        if (ytId && !item.title) {
            fetchYouTubeTitle(ytId)
                .then(setResolvedTitle)
                .catch(() => setResolvedTitle("YouTube Video"));
        }
    }, [ytId, item.title]);

    // Keep resolvedTitle in sync if item.title changes
    useEffect(() => {
        if (item.title) setResolvedTitle(item.title);
    }, [item.title]);

    const renderFooter = () => (
        <div className="flex items-center justify-between mt-2 px-1">
            <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-gray-700 truncate">
                    {resolvedTitle || (ytId ? "YouTube Video" : spotifyEmbed ? "Spotify" : "Media")}
                </p>
                <p className="text-[11px] text-gray-400">
                    {ytId ? "YouTube" : spotifyEmbed ? "Spotify" : "External Link"}
                </p>
            </div>
            <button
                onClick={() => onDelete(item.id)}
                className="ml-4 shrink-0 text-[11px] text-red-500 hover:text-red-700 font-medium transition"
            >
                Remove
            </button>
        </div>
    );

    if (ytId) {
        return (
            <div className="flex flex-col h-full group">
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="aspect-video w-full bg-black relative group cursor-pointer" onClick={onPlay}>
                        {!isPlaying ? (
                            <>
                                <img
                                    src={`https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`}
                                    className="w-full h-full object-cover"
                                    alt={resolvedTitle || "YouTube Video"}
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
                                        (e.currentTarget as HTMLImageElement).onerror = (ev) => {
                                            (ev.currentTarget as HTMLImageElement).src = `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`;
                                        };
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg group-hover:scale-110 transition-transform">
                                        <Play size={24} fill="currentColor" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                        )}
                    </div>
                </div>
                {renderFooter()}
            </div>
        );
    }

    if (spotifyEmbed) {
        return (
            <div className="flex flex-col h-full">
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="w-full h-[152px]">
                        <iframe
                            src={spotifyEmbed}
                            width="100%"
                            height="100%"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            className="border-0"
                        />
                    </div>
                </div>
                {renderFooter()}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex-grow"
            >
                <div className="aspect-video w-full bg-gray-100 flex items-center justify-center">
                    <Play size={32} className="text-gray-400" />
                </div>
            </a>
            {renderFooter()}
        </div>
    );

    // Favorited By Modal
    if (showFavModal) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Favorited By ({favCount})</h3>
                        <button onClick={() => setShowFavModal(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-5 overflow-y-auto max-h-[60vh]">
                        {favCustomers.length === 0 ? (
                            <div className="text-center py-10">
                                <Heart size={40} className="text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No customers have favorited you yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {favCustomers.map((c, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50">
                                        <div className="w-10 h-10 rounded-full bg-pink/10 flex items-center justify-center text-pink font-bold">
                                            {c.name?.[0] || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{c.email}</p>
                                        </div>
                                        <span className="text-[10px] text-gray-400">{c.favorited_at}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
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
    const [playingVideoId, setPlayingVideoId] = useState<number | null>(null);
    const [showFavModal, setShowFavModal] = useState(false)
    const [favCustomers, setFavCustomers] = useState<Array<{ name: string; email: string; favorited_at: string }>>([])
    const [favCount, setFavCount] = useState(0)

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProfile();
        fetchStats();
        fetchFavoritedBy();
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

    const fetchFavoritedBy = async () => {
        try {
            const { data } = await api.get("/profile");
            const artistId = data.profile?.id;
            if (!artistId) return;
            const favData = await api.get(`/favorites/customers/${artistId}`);
            setFavCustomers(favData.data.customers || []);
            setFavCount(favData.data.total || 0);
        } catch (err) {
            console.error("Failed to load favorited by", err);
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
    const videoLinks = media.filter(m => m.media_type === "video" && !(m.purpose === "talent_media" && !m.is_external_link));

    if (loading) return (
        <div className="min-h-screen bg-[#F4F1F5] pb-20 overflow-x-hidden">
            {/* HERO SKELETON */}
            <div className="relative h-[220px] w-full">
                <div className="w-full h-[220px] bg-gray-200 animate-pulse" />
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 lg:left-[calc((100%-72rem)/2+120px)] lg:translate-x-0 z-30">
                    <div className="w-32 h-32 rounded-full border-[5px] border-white bg-gray-200 animate-pulse" />
                </div>
            </div>

            {/* MAIN WRAPPER */}
            <div className="max-w-6xl mx-auto px-4 mt-4 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

                    {/* LEFT PANEL SKELETON */}
                    <div className="space-y-5">
                        {/* Main card skeleton */}
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-6 pb-7 text-center pt-20">
                                <div className="h-10 bg-gray-200 rounded animate-pulse mx-auto w-3/4 mt-4" />
                                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-1/3 mt-3" />
                                <div className="h-3 bg-gray-200 rounded animate-pulse mx-auto w-1/2 mt-4" />
                                <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto w-2/3 mt-7" />
                                <div className="flex gap-3 mt-7">
                                    <div className="flex-1 h-12 bg-gray-200 rounded-full animate-pulse" />
                                    <div className="flex-1 h-12 bg-gray-200 rounded-full animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Social skeleton */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm text-center">
                            <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-1/3 mb-5" />
                            <div className="flex justify-center gap-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="w-11 h-11 rounded-full bg-gray-200 animate-pulse" />
                                ))}
                            </div>
                        </div>

                        {/* Calendar skeleton */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3 mb-4" />
                            <div className="h-40 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>

                    {/* RIGHT PANEL SKELETON */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                        {/* Top section skeleton */}
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
                                <div className="flex gap-5 mt-2">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                            </div>
                        </div>

                        {/* Description skeleton */}
                        <div className="mt-7 space-y-3">
                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        </div>

                        {/* Gallery skeleton */}
                        <div className="mt-10">
                            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4 mb-5" />
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-[180px] bg-gray-200 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        </div>

                        {/* Audio & Video skeleton */}
                        <div className="mt-10">
                            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3 mb-5" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2].map((i) => (
                                    <div key={i} className="bg-gray-200 rounded-2xl h-[200px] animate-pulse" />
                                ))}
                            </div>
                        </div>

                        {/* Reviews skeleton */}
                        <div className="mt-12">
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/5 mb-6" />
                            <div className="grid md:grid-cols-2 gap-8 mb-10">
                                <div className="text-center space-y-2">
                                    <div className="h-10 bg-gray-200 rounded animate-pulse mx-auto w-16" />
                                    <div className="flex justify-center gap-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                                        ))}
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded animate-pulse mx-auto w-20" />
                                </div>
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="h-2 bg-gray-200 rounded animate-pulse w-4" />
                                            <div className="w-3.5 h-3.5 bg-gray-200 rounded animate-pulse" />
                                            <div className="flex-1 h-2 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                        <div className="flex justify-between">
                                            <div className="flex gap-3 items-center">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                                                <div className="space-y-1">
                                                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                                                    <div className="h-2 bg-gray-200 rounded animate-pulse w-16" />
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((j) => (
                                                    <div key={j} className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mt-3 h-3 bg-gray-200 rounded animate-pulse w-full" />
                                        <div className="mt-1 h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    if (error) return (
        <div className="min-h-screen flex items-center justify-center text-red-500 text-sm">{error}</div>
    );

    const displayName = profile?.stage_name || profile?.full_name || "Artist";

    return (
        <>
            <div className="min-h-screen bg-[#F4F1F5] pb-20 overflow-x-hidden" style={{ fontFamily: "'Fraunces', serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400&display=swap');
            `}</style>

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
                                {profile?.full_price && (
                                    <div className="mt-7 text-left">
                                        <div className="text-[#FF2B6B] font-bold text-[28px] leading-none">
                                            Rs. {profile.full_price}
                                            <span className="text-gray-600 text-[15px] font-medium ml-2">
                                                {/*full price*/}
                                            </span>
                                        </div>
                                        {profile.advance && (
                                            <p className="text-md text-black-400 mt-1">
                                                Advance:  Rs. {profile.advance}
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

                        <ArtistOwnCalendar />
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
                            <button
                                onClick={() => setShowFavModal(true)}
                                className="relative w-10 h-10 rounded-full border flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
                            >
                                <Heart size={18} />
                                {favCount > 0 && (
                                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {favCount}
                                  </span>
                                )}
                            </button>
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
                                     {galleryImages.map((img) => (
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {videoLinks.map((item) => (
                                        <MediaPreviewCard
                                            key={item.id}
                                            item={item}
                                            onDelete={handleDeleteVideo}
                                            isPlaying={playingVideoId === item.id}
                                            onPlay={() => setPlayingVideoId(item.id)}
                                        />
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

        {showFavModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Favorited By ({favCount})</h3>
                        <button onClick={() => setShowFavModal(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-5 overflow-y-auto max-h-[60vh]">
                        {favCustomers.length === 0 ? (
                            <div className="text-center py-10">
                                <Heart size={40} className="text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No customers have favorited you yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {favCustomers.map((c, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50">
                                        <div className="w-10 h-10 rounded-full bg-pink/10 flex items-center justify-center text-pink font-bold">
                                            {c.name?.[0] || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{c.email}</p>
                                        </div>
                                        <span className="text-[10px] text-gray-400">{c.favorited_at}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </>
);
}
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Heart, MoreHorizontal, Play, Music, MapPin, Users, Star,
    Instagram, Facebook, Twitter, Mail,
    LogOut, CalendarCheck
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

interface Profile {
    full_name?: string;
    stage_name?: string;
    location?: string;
    category?: string;
    short_bio?: string;
    starting_price?: number;
    max_price?: number;
    avatar_url?: string;
    cover_url?: string;
    youtube_link?: string;
    facebook_link?: string;
    instagram_link?: string;
    tags?: string[];
}

interface Media {
    id: number;
    url: string;
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
        body: string;
        created_at: string;
    }[];
}

const HERO_HEIGHT = 280; // px — matches the tallest hero breakpoint

export default function ArtistProfile() {
    const navigate = useNavigate();
    const { clearAuth } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [media, setMedia] = useState<Media[]>([]);
    const [rating, setRating] = useState<Rating | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Scroll-driven hero/avatar values
    const [scrollY, setScrollY] = useState(0);
    const leftColRef = useRef<HTMLDivElement>(null);
    const [leftTop, setLeftTop] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProfile();
    }, []);

    // Track scroll for hero parallax + sticky left panel
    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Calculate sticky offset for left column
    useEffect(() => {
        const measure = () => {
            if (leftColRef.current) {
                const rect = leftColRef.current.getBoundingClientRect();
                // initial distance from viewport top when scroll=0
                setLeftTop(rect.top + window.scrollY);
            }
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [loading]);

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

    const handleLogout = async () => {
        try { await api.post("/logout"); } catch { /* ignore */ }
        clearAuth();
        navigate("/login");
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

    // Hero parallax: scroll fraction 0→1 over first HERO_HEIGHT px
    const heroFraction = Math.min(scrollY / HERO_HEIGHT, 1);
    // Avatar: starts fading a little later, disappears by 60% of hero
    const avatarFraction = Math.min(scrollY / (HERO_HEIGHT * 0.6), 1);

    const heroStyle: React.CSSProperties = {
        opacity: 1 - heroFraction,
        transform: `translateY(${-scrollY * 0.35}px)`,
        willChange: "transform, opacity",
        transition: "opacity 0.05s linear",
    };

    const avatarStyle: React.CSSProperties = {
        opacity: 1 - avatarFraction,
        transform: `translateY(${-scrollY * 0.2}px) scale(${1 - avatarFraction * 0.25})`,
        willChange: "transform, opacity",
        transition: "opacity 0.05s linear",
        pointerEvents: avatarFraction >= 1 ? "none" : "auto",
    };

    // Sticky left: once scroll passes the initial top offset, fix it
    const isLeftSticky = scrollY >= leftTop - 24; // 24px breathing room from top

    return (
        <div className="min-h-screen bg-[#F8F9FB] pb-16">

            {/* ── HERO (sticky so parallax works while scrolling over it) ── */}
            <div
                className="sticky top-0 z-0 h-[200px] sm:h-[230px] lg:h-[280px] w-full overflow-hidden"
            >
                <div style={heroStyle} className="absolute inset-0">
                    <img
                        src={profile?.cover_url || "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e"}
                        className="w-full h-full object-cover"
                        alt="Artist cover"
                    />
                    {/* gradient overlay that intensifies on scroll */}
                    <div
                        className="absolute inset-0 bg-black"
                        style={{ opacity: heroFraction * 0.4 }}
                    />
                </div>

                {/* Action buttons — always on top */}
                <div className="absolute top-4 right-4 flex gap-3 z-10">
                    <button
                        onClick={() => navigate("/bookingRequests")}
                        className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-md text-sm font-medium text-gray-800 hover:bg-white transition"
                    >
                        <CalendarCheck size={16} className="text-indigo-500" />
                        Booking
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500/90 px-4 py-2 rounded-xl shadow-md text-sm font-medium text-white hover:bg-red-600 transition"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>

            {/* ── AVATAR — positioned absolutely over the hero ── */}
            <div
                className="fixed z-10 left-1/2 -translate-x-1/2 lg:left-[calc(25%_-_64px)]"
                style={{
                    top: `calc(${HERO_HEIGHT}px - 4rem)`,   // sits at hero bottom edge
                    ...avatarStyle,
                }}
            >
                <img
                    src={profile?.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[6px] border-white object-cover shadow-lg"
                    alt="Artist avatar"
                />
            </div>

            {/* ── MAIN CONTENT (negative margin-top pulls it up under the hero) ── */}
            <div
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-2rem] pt-20 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10"
            >
                {/* ── LEFT (sticky) ── */}
                <div
                    ref={leftColRef}
                    className="lg:col-span-5 xl:col-span-4 space-y-6 self-start"
                    style={
                        isLeftSticky
                            ? {
                                position: "sticky",
                                top: "24px",
                                // max-height so it never exceeds the viewport
                                maxHeight: "calc(100vh - 48px)",
                                overflowY: "auto",
                                // hide scrollbar visually
                                scrollbarWidth: "none",
                            }
                            : {}
                    }
                >
                    {/* hide webkit scrollbar */}
                    <style>{`.left-scroll::-webkit-scrollbar{display:none}`}</style>

                    <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md text-center">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{displayName}</h1>
                        {rating?.average && (
                            <div className="flex justify-center items-center mt-2 text-yellow-500 font-medium">
                                <Star size={16} fill="currentColor" />
                                <span className="ml-1 text-gray-800 text-sm sm:text-base">
                                    {rating.average} ({rating.total} reviews)
                                </span>
                            </div>
                        )}
                        {profile?.tags && profile.tags.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                {profile.tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-purple-50 text-purple-600 text-xs rounded-full font-medium capitalize">{tag}</span>
                                ))}
                            </div>
                        )}
                        <p className="mt-6 text-gray-500 text-sm leading-relaxed">
                            {profile?.short_bio || "Professional live performer delivering unforgettable musical experiences."}
                        </p>
                        {profile?.starting_price && (
                            <div className="mt-8 text-left border-t pt-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl sm:text-2xl font-bold text-red-500">${profile.starting_price}</span>
                                    <span className="text-gray-500 text-sm font-medium">starting price</span>
                                </div>
                                {profile.max_price && (
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                                        Range: ${profile.starting_price} - ${profile.max_price} depending on event type
                                    </p>
                                )}
                            </div>
                        )}
                        <div className="mt-6 flex gap-2">
                            <button onClick={() => navigate("/editProfile")} className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-black/80 transition shadow-lg shadow-red-200">
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Location */}
                    {profile?.location && (
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-4 text-center border-t">
                                <p className="text-xs font-bold text-gray-400 uppercase">Location</p>
                                <p className="text-sm font-semibold text-gray-800 flex items-center justify-center gap-1 mt-1">
                                    <MapPin size={14} className="text-red-500" /> {profile.location}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Social */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-4">Social & Web</p>
                        <div className="flex justify-center gap-3">
                            {profile?.instagram_link && (
                                <a href={profile.instagram_link} target="_blank" rel="noreferrer" className="p-3 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 cursor-pointer"><Instagram size={18} /></a>
                            )}
                            {profile?.facebook_link && (
                                <a href={profile.facebook_link} target="_blank" rel="noreferrer" className="p-3 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 cursor-pointer"><Facebook size={18} /></a>
                            )}
                            {profile?.youtube_link && (
                                <a href={profile.youtube_link} target="_blank" rel="noreferrer" className="p-3 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 cursor-pointer"><Twitter size={18} /></a>
                            )}
                            <div className="p-3 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 cursor-pointer"><Mail size={18} /></div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT (scrolls normally) ── */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Overview</h2>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                                    {profile?.category && <span className="flex items-center gap-1"><Music size={14} /> {profile.category}</span>}
                                    {profile?.location && <span className="flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>}
                                    {rating && <span className="flex items-center gap-1"><Users size={14} /> {rating.total}+ Events</span>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 border rounded-full text-gray-400"><Heart size={18} /></button>
                                <button className="p-2 border rounded-full text-gray-400"><MoreHorizontal size={18} /></button>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            {profile?.short_bio || `${displayName} is a dynamic performer known for electrifying stage presence and musical excellence across private events and luxury venues.`}
                        </p>

                        {/* Gallery */}
                        {galleryImages.length > 0 && (
                            <>
                                <h3 className="text-lg font-bold mt-10 mb-4">Gallery</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {galleryImages.map(img => (
                                        <img key={img.id} className="rounded-xl aspect-[3/4] object-cover" src={img.url} alt="" />
                                    ))}
                                </div>
                            </>
                        )}

                        {videoLinks.length > 0 && (
                            <>
                                <h3 className="text-lg font-bold mt-10 mb-4">Audio & Video</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {videoLinks.map((item, i) => {
                                        const isYouTube = item.url.includes("youtube.com") || item.url.includes("youtu.be");
                                        const getYouTubeId = (url: string) => {
                                            const match = url.match(
                                                /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/
                                            );
                                            return match ? match[1] : null;
                                        };
                                        const ytId = isYouTube ? getYouTubeId(item.url) : null;

                                        return (
                                            <div key={item.id} className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                                                {isYouTube && ytId ? (
                                                    <iframe
                                                        className="w-full h-72 sm:h-80 lg:h-96"
                                                        src={`https://www.youtube.com/embed/${ytId}`}
                                                        title={`video-${i}`}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                ) : item.media_type === "video" && !item.is_external_link ? (
                                                    <video className="w-full h-56 sm:h-64 object-cover" controls>
                                                        <source src={item.url} />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                ) : (
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center justify-between p-4 hover:bg-gray-50"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                                <Play size={18} />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {item.url.substring(0, 40)}...
                                                            </span>
                                                        </div>
                                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Reviews */}
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
                                <div key={r.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                    <div className="flex justify-between">
                                        <div className="flex gap-3 items-center">
                                            <div className="w-8 h-8 bg-gray-300 rounded-full" />
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
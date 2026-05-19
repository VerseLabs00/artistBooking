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
        <div className="min-h-screen bg-[#F4F1F5] pb-20">

            {/* HERO */}
            <div className="relative h-[220px] w-full overflow-hidden">
                <img
                    src={profile?.cover_url || "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e"}
                    className="w-full h-full object-cover"
                    alt="cover"
                />

                <div className="absolute inset-0 bg-black/20"></div>

                {/* TOP RIGHT BUTTONS */}
                <div className="absolute top-5 right-5 flex gap-3 z-20">
                    <button
                        onClick={handleLogout}
                        className="bg-black text-white rounded-full px-4 py-2 text-sm font-semibold shadow-md hover:scale-105 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* MAIN WRAPPER */}
            <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-20">

                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

                    {/* LEFT PANEL */}
                    <div className="space-y-5">

                        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">

                            {/* AVATAR */}
                            <div className="flex justify-center pt-6">
                                <img
                                    src={profile?.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"}
                                    className="w-32 h-32 rounded-full border-[5px] border-white object-cover shadow-lg"
                                    alt="avatar"
                                />
                            </div>

                            <div className="px-6 pb-7 text-center">
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
                                                className="bg-[#EEE8FF] text-[#7A57F2] text-[10px] px-2 py-1 rounded-sm capitalize"
                                            >
                                            {tag}
                                        </span>
                                        ))}
                                    </div>
                                )}

                                {/* BIO */}
                                <p className="text-[13px] text-gray-500 leading-6 mt-6 text-left">
                                    {profile?.short_bio ||
                                        "Professional performer creating unforgettable experiences for luxury events and private functions."}
                                </p>

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
                                        className="flex-1 bg-[#FF2B6B] hover:bg-[#ff1b60] transition text-white py-3 rounded-full font-semibold text-sm shadow-md">
                                        Booking({rating?.total || 2})
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

                        {/* SOCIAL */}
                        <div className="bg-white border border-gray-200 rounded-sm p-7 shadow-sm text-center">
                            <h3 className="text-[20px] font-semibold text-gray-700 mb-5">
                                Social & Web
                            </h3>

                            <div className="flex justify-center gap-4">
                                {profile?.instagram_link && (
                                    <a
                                        href={profile.instagram_link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200"
                                    >
                                        <Instagram size={18} />
                                    </a>
                                )}

                                {profile?.facebook_link && (
                                    <a
                                        href={profile.facebook_link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200"
                                    >
                                        <Facebook size={18} />
                                    </a>
                                )}

                                {profile?.youtube_link && (
                                    <a
                                        href={profile.youtube_link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200"
                                    >
                                        <Twitter size={18} />
                                    </a>
                                )}

                                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 cursor-pointer">
                                    <Mail size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="bg-white border border-gray-200 rounded-sm p-8 shadow-sm">

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

                                    <span className="flex items-center gap-1">
                                    <Users size={13} /> 13+
                                </span>
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
                            <p>
                                {profile?.short_bio ||
                                    `${displayName} is known for creating energetic performances and unforgettable experiences for events and private shows.`}
                            </p>

                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            </p>

                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            </p>
                        </div>

                        {/* GALLERY */}
                        {galleryImages.length > 0 && (
                            <>
                                <h3 className="text-[24px] font-bold mt-10 mb-5">
                                    Gallery
                                </h3>

                                <div className="grid grid-cols-3 gap-3">
                                    {galleryImages.slice(0, 3).map((img) => (
                                        <img
                                            key={img.id}
                                            src={img.url}
                                            alt="gallery"
                                            className="w-full h-[180px] object-cover rounded-sm"
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* AUDIO VIDEO */}
                        {videoLinks.length > 0 && (
                            <>
                                <h3 className="text-[24px] font-bold mt-10 mb-5">
                                    Audio & Video
                                </h3>

                                <div className="space-y-4">
                                    {videoLinks.map((item) => (
                                        <a
                                            key={item.id}
                                            href={item.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between border-b pb-4 hover:opacity-80 transition"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <Play size={16} className="text-gray-600" />
                                                </div>

                                                <div>
                                                    <p className="text-[14px] font-medium text-gray-700">
                                                        Live in Concert Colombo
                                                    </p>
                                                    <p className="text-[12px] text-gray-400">
                                                        Lorem ipsum dolor sit amet
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </a>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Heart, Play, Music, MapPin, Star,
    Instagram, Facebook, Twitter, Mail, X, Loader2, User
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BookingModal from "../components/booking/BookingModal";
import toast from "react-hot-toast";
import { getArtist, submitReview } from "../services/discoveryService";
import { toggleFavorite, getFavorites } from "../services/favoriteService";
import type { ArtistDetail } from "../services/discoveryService";
import { useAuth } from "../context/AuthContext";
import { PublicArtistCalendar } from "../../components/PublicArtistCalendar";

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

function MediaPreviewCard({
                              item,
                              isActive,
                              onActivate
                          }: {
    item: { id: string; url: string; media_type: string; is_external_link: boolean; title?: string | null };
    isActive: boolean;
    onActivate: () => void;
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

    if (ytId) {
        return (
            <div className="flex flex-col h-full">
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="aspect-video w-full bg-black relative group cursor-pointer" onClick={onActivate}>
                        {!isActive ? (
                            <>
                                <img
                                    src={`https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`}
                                    className="w-full h-full object-cover"
                                    alt={resolvedTitle || "YouTube Video"}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
                                        (e.target as HTMLImageElement).onerror = (ev) => {
                                            (ev.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`;
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
                <div className="mt-2 px-1">
                    <p className="text-[14px] font-medium text-gray-700 truncate">
                        {resolvedTitle || "YouTube Video"}
                    </p>
                    <p className="text-[11px] text-gray-400">YouTube Video</p>
                </div>
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
                <div className="mt-2 px-1">
                    <p className="text-[14px] font-medium text-gray-700 truncate">
                        {resolvedTitle || "Spotify"}
                    </p>
                    <p className="text-[11px] text-gray-400">Spotify</p>
                </div>
            </div>
        );
    }

    if (isDirectVideo(item.url)) {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="aspect-video w-full bg-gray-100 flex items-center justify-center">
                    <Play size={32} className="text-gray-400" />
                </div>
            </div>
        );
    }

    return (
        <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col h-full"
        >
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full block">
                <div className="aspect-video w-full bg-gray-100 flex items-center justify-center">
                    <Play size={32} className="text-gray-400" />
                </div>
            </div>
            <div className="p-3">
                <p className="text-[14px] font-medium text-gray-700 truncate">
                    {resolvedTitle || item.url}
                </p>
                <p className="text-[11px] text-gray-400 truncate">{item.url}</p>
            </div>
        </a>
    );
}

export default function ArtistProfile({ id: propId, onClose }: { id?: string; onClose?: () => void }) {
    const { id: paramId } = useParams<{ id: string }>();
    const id = propId || paramId;

    const navigate = useNavigate();
    const [artist, setArtist] = useState<ArtistDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);
    const [hoverStar, setHoverStar] = useState(0);
    const [selectedStar, setSelectedStar] = useState(0);
    const [review, setReview] = useState("");

    const [likedArtists, setLikedArtists] = useState<Set<string | number>>(new Set());
    const [favoriteLoadingIds, setFavoriteLoadingIds] = useState<Set<string | number>>(new Set());

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState("");
    const [lightboxType, setLightboxType] = useState<"image" | "youtube" | "spotify" | "video" | "link">("image");

    const openLightbox = (url: string, type: "image" | "youtube" | "spotify" | "video" | "link" = "image") => {
        setLightboxUrl(url);
        setLightboxType(type);
        setLightboxOpen(true);
    };

    const getLightboxType = (item: { url: string; media_type: string; is_external_link: boolean }): "youtube" | "spotify" | "video" | "link" => {
        if (getYouTubeId(item.url)) return "youtube";
        if (getSpotifyEmbedUrl(item.url)) return "spotify";
        if (isDirectVideo(item.url)) return "video";
        return "link";
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setLightboxUrl("");
        setLightboxType("image");
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeLightbox();
        };
        if (lightboxOpen) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [lightboxOpen]);

    const { token, user } = useAuth();

    useEffect(() => {
        if (!id) return;
        if (!propId) window.scrollTo(0, 0);
        setLoading(true);
        getArtist(id)
            .then(setArtist)
            .catch(() => setArtist(null))
            .finally(() => setLoading(false));
    }, [id, propId]);

    useEffect(() => {
        getFavorites()
            .then(data => {
                setLikedArtists(new Set(data.map(f => f.id)));
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const refresh = () => {
            getFavorites()
                .then(data => setLikedArtists(new Set(data.map(f => f.id))))
                .catch(() => {});
        };
        window.addEventListener('favorites-changed', refresh);
        window.addEventListener('storage', refresh);
        return () => {
            window.removeEventListener('favorites-changed', refresh);
            window.removeEventListener('storage', refresh);
        };
    }, []);

    const toggleLike = async (artistId: string | number) => {
        setFavoriteLoadingIds(prev => new Set(prev).add(artistId));
        try {
            const result = await toggleFavorite(String(artistId));
            setLikedArtists(prev => {
                const next = new Set(prev);
                result.is_favorited ? next.add(artistId) : next.delete(artistId);
                return next;
            });
        } catch (err) {
            console.error("Failed to toggle favorite:", err);
            toast.error("Failed to update favorite. Please try again.");
        } finally {
            setFavoriteLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(artistId);
                return next;
            });
        }
    };

    // FAILSAFE REDIRECT: If the booking modal is about to open but we are not logged in as a customer
    useEffect(() => {
        if (showBooking) {
            const hasToken = localStorage.getItem('auth_token');
            const userStr = localStorage.getItem('auth_user');
            let isClient = false;
            try {
                if (userStr) {
                    const userData = JSON.parse(userStr);
                    isClient = userData.role === 'client';
                }
            } catch (e) {
                isClient = false;
            }

            if (!hasToken || !isClient) {
                setShowBooking(false);
                navigate("/loginCustomer");
            }
        }
    }, [showBooking, navigate]);

    const handleBookNow = () => {
        const hasToken = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');
        let isClient = false;
        try {
            if (userStr) {
                const userData = JSON.parse(userStr);
                isClient = userData.role === 'client';
            }
        } catch (e) {
            isClient = false;
        }

        if (!hasToken || !isClient) {
            navigate("/loginCustomer");
            return;
        }

        setShowBooking(true);
    };

    const handleSubmitReview = () => {
        const hasToken = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');
        let isClient = false;
        try {
            if (userStr) {
                const userData = JSON.parse(userStr);
                isClient = userData.role === 'client';
            }
        } catch (e) {
            isClient = false;
        }

        if (!hasToken || !isClient) {
            navigate("/loginCustomer");
            return;
        }

if (!selectedStar) return;
         submitReview(artist!.id, { rating: selectedStar, body: review })
             .then(() => {
                 setReview("");
                 setSelectedStar(0);
                 getArtist(id!).then(setArtist);
             })
             .catch((err) => {
                 if (err.response?.status === 422) {
                     toast.error(err.response.data.message || "You have already reviewed this artist.");
                 } else {
                     toast.error("Failed to submit review. Please try again.");
                 }
             });
    };

    if (loading) {
        const skeletonClass = "animate-pulse bg-gray-200";
        return (
            <div className="min-h-screen bg-[#F4F1F5]">
                {/* Skeleton Hero + Avatar — same positioning as real component */}
                <div className={`relative h-[160px] sm:h-[200px] md:h-[220px] w-full overflow-visible`}>
                    <div className={`w-full h-full ${skeletonClass}`} />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute -bottom-12 sm:-bottom-16 left-1/2 -translate-x-1/2 lg:left-[calc((100%-72rem)/2+200px)] lg:translate-x-0 z-30">
                        <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-[4px] sm:border-[5px] border-white shadow-lg ${skeletonClass}`} />
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-3 sm:px-4 mt-2 sm:mt-4 relative z-20 pb-12 sm:pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

                        {/* Skeleton Left Panel */}
                        <div className="space-y-5">
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="px-4 sm:px-6 pb-5 sm:pb-7 text-center pt-16 sm:pt-20">
                                    <div className={`h-8 w-40 rounded ${skeletonClass} mx-auto mb-3`} />
                                    <div className="flex items-center justify-center gap-1">
                                        <div className={`h-4 w-24 rounded ${skeletonClass}`} />
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                                        <div className={`h-6 w-20 rounded-full ${skeletonClass}`} />
                                        <div className={`h-6 w-24 rounded-full ${skeletonClass}`} />
                                    </div>
                                    <div className="space-y-2 mt-6 text-left">
                                        <div className={`h-4 w-full rounded ${skeletonClass}`} />
                                        <div className={`h-4 w-5/6 rounded ${skeletonClass}`} />
                                    </div>
                                    <div className="mt-6 text-left">
                                        <div className={`h-8 w-24 rounded ${skeletonClass} mb-2`} />
                                        <div className={`h-4 w-16 rounded ${skeletonClass}`} />
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <div className={`h-10 bg-gray-100 rounded-full flex-1 ${skeletonClass}`} />
                                        <div className={`h-10 bg-gray-100 rounded-full flex-1 ${skeletonClass}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Social Skeleton */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-sm">
                                <div className={`h-5 w-24 rounded ${skeletonClass} mx-auto mb-5`} />
                                <div className="flex justify-center gap-4">
                                    <div className={`w-11 h-11 rounded-full ${skeletonClass}`} />
                                    <div className={`w-11 h-11 rounded-full ${skeletonClass}`} />
                                    <div className={`w-11 h-11 rounded-full ${skeletonClass}`} />
                                    <div className={`w-11 h-11 rounded-full ${skeletonClass}`} />
                                </div>
                            </div>
                        </div>

                        {/* Right Panel Skeleton */}
                        <div className="space-y-4">
                            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className={`h-7 w-28 rounded ${skeletonClass} mb-2`} />
                                        <div className="flex flex-wrap gap-5">
                                            <div className={`h-4 w-20 rounded ${skeletonClass}`} />
                                            <div className={`h-4 w-24 rounded ${skeletonClass}`} />
                                        </div>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full border border-gray-100 ${skeletonClass}`} />
                                </div>
                                <div className="space-y-3 mt-7">
                                    <div className={`h-4 w-full rounded ${skeletonClass}`} />
                                    <div className={`h-4 w-5/6 rounded ${skeletonClass}`} />
                                    <div className={`h-4 w-4/6 rounded ${skeletonClass}`} />
                                </div>
                            </div>

                            {/* Media Skeleton */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
                                <div className={`h-5 w-32 rounded ${skeletonClass} mb-4`} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[1,2].map(i => (
                                        <div key={i} className={`rounded-2xl ${skeletonClass}`}>
                                            <div className="aspect-video w-full bg-gray-200" />
                                            <div className="p-3">
                                                <div className={`h-4 w-3/4 rounded ${skeletonClass}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reviews Skeleton */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
                                <div className={`h-5 w-24 rounded ${skeletonClass} mb-6`} />
                                <div className="space-y-4">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                            <div className="flex justify-between">
                                                <div className="flex gap-3 items-center">
                                                    <div className={`w-8 h-8 rounded-full ${skeletonClass}`} />
                                                    <div>
                                                        <div className={`h-4 w-24 rounded ${skeletonClass} mb-1`} />
                                                        <div className={`h-3 w-16 rounded ${skeletonClass}`} />
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    {[1,2,3,4,5].map(j => (
                                                        <div key={j} className={`w-3 h-3 rounded-full ${skeletonClass}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className={`h-4 w-full rounded ${skeletonClass} mt-3`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!artist) return (
        <div className="min-h-screen bg-[#F4F1F5] flex items-center justify-center">
            <div className="text-gray-500 font-medium">Artist not found.</div>
        </div>
    );

    const avgRating = artist.rating.average ?? 0;
    const galleryImages = artist.gallery;

    const mediaLinks = [...artist.media];

    return (
        <div className={`${onClose ? 'relative h-full overflow-y-auto custom-scrollbar' : 'min-h-screen'} bg-[#F4F1F5] transition-all duration-500`}>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
            `}</style>
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[110] w-9 h-9 sm:w-10 sm:h-10 bg-black/10 hover:bg-black/20 backdrop-blur-xl rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
                >
                    <X size={20} className="text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>
            )}
            {/*<Header />*/}

            <div>
                {/* HERO */}
                <div className="relative h-[160px] sm:h-[200px] md:h-[220px] w-full overflow-visible">
                    {artist.cover_url ? (
                        <img
                            src={artist.cover_url}
                            className="w-full h-full object-cover"
                            alt="cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                    )}
                    <div className="absolute inset-0 bg-black/20" />

                    {/* AVATAR */}
                    <div className="absolute -bottom-12 sm:-bottom-16 left-1/2 -translate-x-1/2 lg:left-[calc((100%-72rem)/2+200px)] lg:translate-x-0 z-30">
                        {artist.avatar_url ? (
                            <img
                                src={artist.avatar_url}
                                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-[4px] sm:border-[5px] border-white object-cover shadow-lg"
                                alt="avatar"
                            />
                        ) : (
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-[4px] sm:border-[5px] border-white bg-gray-200 flex items-center justify-center shadow-lg">
                                <User size={44} className="text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>

                {/* MAIN WRAPPER */}
                <div className="max-w-6xl mx-auto px-3 sm:px-4 mt-2 sm:mt-4 relative z-20 pb-12 sm:pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

                        {/* LEFT PANEL */}
                        <div className="space-y-5">
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="px-4 sm:px-6 pb-5 sm:pb-7 text-center pt-16 sm:pt-20">
                                    <h1 className="text-2xl sm:text-3xl md:text-[42px] font-bold text-black leading-none mt-2 sm:mt-4">
                                        {artist.stage_name}
                                    </h1>

                                    {/* RATING */}
                                    <div className="flex items-center justify-center gap-1 mt-2 text-[13px]">
                                        <Star size={14} className="text-yellow-500 fill-yellow-400" />
                                        <span className="font-semibold text-gray-700">
                                            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                                        </span>
                                        <span className="text-gray-400">
                                            ({artist.rating.total} reviews)
                                        </span>
                                    </div>

                                    {/* TAGS */}
                                    {artist.tags.length > 0 && (
                                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                                            {artist.tags.map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="bg-[#EEE8FF] text-[#7A57F2] text-[10px] px-3 py-1 rounded-full capitalize font-bold"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bio/Short Bio */}
                                    {artist.short_bio && (
                                        <p className="text-[13px] text-gray-500 leading-6 mt-6 text-left">
                                            {artist.short_bio}
                                        </p>
                                    )}

                                    {/* PRICE */}
                                    {artist.full_price && (
                                        <div className="mt-7 text-left">
                                            <div className="text-[#FF2B6B] font-bold text-[28px] leading-none">
                                                LKR {artist.full_price.toLocaleString()}
                                                <span className="text-gray-600 text-[15px] font-medium ml-2">
                                                    {/*full price*/}
                                                </span>
                                            </div>
                                            {artist.advance && (
                                                <p className="text-md text-black-400 mt-1">
                                                    Advance: LKR {artist.advance.toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* BOOK BUTTON */}
                                    <div className="mt-7">
                                        <button
                                            onClick={handleBookNow}
                                            className="w-full bg-[#FF2B6B] hover:bg-[#ff1b60] transition text-white py-3 rounded-full font-bold text-sm shadow-md"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* SOCIAL */}
                            {(artist.spotify_link || artist.facebook_link || artist.instagram_link || artist.youtube_link) && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm text-center">
                                    <h3 className="text-[20px] font-semibold text-gray-700 mb-5">
                                        Social & Web
                                    </h3>
                                    <div className="flex justify-center gap-4">
                                        {artist.instagram_link && (
                                            <a href={artist.instagram_link} target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">
                                                <Instagram size={18} />
                                            </a>
                                        )}
                                        {artist.facebook_link && (
                                            <a href={artist.facebook_link} target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">
                                                <Facebook size={18} />
                                            </a>
                                        )}
                                        {artist.youtube_link && (
                                            <a href={artist.youtube_link} target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">
                                                <Play size={18} />
                                            </a>
                                        )}
                                        <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 cursor-pointer">
                                            <Mail size={18} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <PublicArtistCalendar artistId={artist.id} />
                        </div>

                        {/* RIGHT PANEL */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
                            {/* TOP SECTION */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="text-xl sm:text-2xl md:text-[26px] font-bold text-gray-900">
                                        Overview
                                    </h2>
                                    <div className="flex flex-wrap gap-5 mt-2 text-[13px] text-gray-500">
                                        {artist.category && (
                                            <span className="flex items-center gap-1">
                                                <Music size={13} /> {artist.category}
                                            </span>
                                        )}
                                        {artist.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin size={13} /> {artist.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => artist && toggleLike(artist.id)}
                                    className="w-10 h-10 rounded-full border flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors relative self-start"
                                >
                                    <Heart
                                        size={18}
                                        className={artist && likedArtists.has(artist.id) ? "text-red-500" : "text-gray-400"}
                                        fill={artist && likedArtists.has(artist.id) ? "#ef4444" : "none"}
                                    />
                                    {favoriteLoadingIds.has(artist?.id) && <Loader2 size={10} className="animate-spin absolute" />}
                                </button>
                            </div>

                            {/* DESCRIPTION */}
                            <div className="mt-7 space-y-5 text-[14px] text-gray-500 leading-7">
                                {artist.bio_1 && <p>{artist.bio_1}</p>}
                                {artist.bio_2 && <p>{artist.bio_2}</p>}
                                {artist.paragraph && <p>{artist.paragraph}</p>}
                                {!artist.bio_1 && !artist.bio_2 && !artist.paragraph && (
                                    <p className="text-gray-400 italic">No biography available.</p>
                                )}
                            </div>

                            {/* GALLERY */}
                            {galleryImages.length > 0 && (
                                <>
                                    <h3 className="text-[24px] font-bold mt-10 mb-5">Gallery</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {galleryImages.slice(0, 3).map((img) => (
                                            <button
                                                key={img.id}
                                                onClick={() => openLightbox(img.url, "image")}
                                                className="w-full h-[180px] rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#FF2B6B] focus:ring-offset-2"
                                            >
                                                <img
                                                    src={img.url}
                                                    alt="gallery"
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* AUDIO & VIDEO */}
                            {mediaLinks.length > 0 && (
                                <>
                                    <h3 className="text-[24px] font-bold mt-10 mb-5">Media</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {mediaLinks.map((item) => (
                                            <MediaPreviewCard
                                                key={item.id}
                                                item={item}
                                                isActive={false}
                                                onActivate={() => {
                                                    const type = getLightboxType(item);
                                                    openLightbox(item.url, type);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* REVIEWS */}
                            <h3 className="text-[24px] font-bold mt-12 mb-6">Reviews</h3>
                            <div className="grid md:grid-cols-2 gap-8 mb-10">
                                <div className="text-center">
                                    <h2 className="text-4xl font-bold">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</h2>
                                    <div className="flex justify-center text-yellow-400 mt-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={20} fill={i < Math.round(avgRating) ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <p className="text-gray-400 text-xs mt-1">{artist.rating.total} Reviews</p>
                                </div>
                                <div className="space-y-2">
                                    {[5, 4, 3, 2, 1].map((star) => {
                                        const count = artist.rating.distribution[star] || 0;
                                        const percent = artist.rating.total > 0 ? (count / artist.rating.total) * 100 : 0;
                                        return (
                                            <div key={star} className="flex items-center gap-2 text-sm">
                                                <span className="w-2">{star}</span>
                                                <Star size={14} className="text-gray-400" />
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-2 bg-yellow-400 rounded-full"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {artist.rating.recent_reviews.map((r) => (
                                    <div key={r.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                        <div className="flex justify-between">
<div className="flex gap-3 items-center">
                                                 {r.reviewer_avatar ? (
                                                     <img
                                                         src={r.reviewer_avatar}
                                                         className="w-8 h-8 rounded-full object-cover"
                                                         alt={r.reviewer_name}
                                                     />
                                                 ) : (
                                                     <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                         <User size={16} className="text-gray-400" />
                                                     </div>
                                                 )}
                                                 <div>
                                                     <p className="text-xs font-bold uppercase text-gray-900">{r.reviewer_name}</p>
                                                     <p className="text-[10px] text-gray-400">{r.created_at}</p>
                                                 </div>
                                             </div>
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} fill={i < r.rating ? "currentColor" : "none"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-3 leading-relaxed">{r.body}</p>
                                    </div>
                                ))}
                                {artist.rating.recent_reviews.length === 0 && (
                                    <p className="text-sm text-gray-400 text-center py-6">No reviews yet.</p>
                                )}
                            </div>

                            {/* LEAVE A REVIEW */}
                            <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Leave a Review</h3>
                                <p className="text-xs text-gray-400 mb-6">Share your experience with the community</p>

                                <div className="flex items-center justify-center gap-1 mb-6">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            onMouseEnter={() => setHoverStar(s)}
                                            onMouseLeave={() => setHoverStar(0)}
                                            onClick={() => setSelectedStar(s)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={32}
                                                className={`transition-colors ${s <= (hoverStar || selectedStar) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    placeholder="Write your review here..."
                                    rows={4}
                                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-600 placeholder-gray-400 outline-none focus:border-[#FF2B6B] focus:ring-1 focus:ring-[#FF2B6B] resize-none transition-all"
                                />

                                <div className="flex items-center justify-between mt-6">
                                    <button
                                        onClick={() => { setReview(""); setSelectedStar(0); }}
                                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-6 py-2"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={handleSubmitReview}
                                        className="bg-[#FF2B6B] hover:bg-[#ff1b60] text-white font-bold text-sm px-10 py-3 rounded-full shadow-md transition-all active:scale-95 disabled:opacity-50"
                                        disabled={!selectedStar}
                                    >
                                        Submit Review
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/*<Footer />*/}

            {showBooking && (
                <BookingModal
                    artistProfileId={artist.id}
                    artistName={artist.stage_name}
                    fullPrice={artist.full_price ?? 0}
                    advance={artist.advance ?? 0}
                    onClose={() => setShowBooking(false)}
                />
            )}

            {lightboxOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={closeLightbox}>
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <div className="relative z-10 flex items-center justify-center w-full max-w-5xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
                        {/* Close button — only shown for non-image media */}
                        {lightboxType !== "image" && (
                            <button onClick={closeLightbox} className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                                <X size={18} className="text-white" />
                            </button>
                        )}
                        <div className="flex items-center justify-center w-full">
                            {lightboxType === "image" ? (
                                <div onClick={closeLightbox} className="cursor-pointer">
                                    <img src={lightboxUrl} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
                                </div>
                            ) : (
                                <>
                                    {lightboxType === "youtube" && (() => {
                                        const ytId = getYouTubeId(lightboxUrl);
                                        return ytId ? (
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                                className="aspect-video w-full max-h-[85vh]"
                                            />
                                        ) : null;
                                    })()}
                                    {lightboxType === "spotify" && (() => {
                                        const spotifyUrl = getSpotifyEmbedUrl(lightboxUrl);
                                        return spotifyUrl ? (
                                            <iframe
                                                src={spotifyUrl}
                                                width="100%"
                                                height="100%"
                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                className="border-0 w-full h-[380px] max-h-[85vh] rounded-lg bg-white"
                                            />
                                        ) : null;
                                    })()}
                                    {lightboxType === "video" && (
                                        <video src={lightboxUrl} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" />
                                    )}
                                    {lightboxType === "link" && (
                                        <iframe
                                            src={lightboxUrl}
                                            width="100%"
                                            height="100%"
                                            className="border-0 w-full h-[600px] max-h-[85vh] bg-white rounded-lg shadow-2xl"
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
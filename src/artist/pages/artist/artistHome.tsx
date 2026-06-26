import { useState, useEffect, useCallback, useRef } from "react";
import {Link, useNavigate} from "react-router-dom";
import api from "../../api/axios";
import { getArtists, getCategories, getNearYou, getStats } from "../../../customer/services/discoveryService";
import type { ArtistCard as DiscoveryArtist, ArtistSearchParams } from "../../../customer/services/discoveryService";
import {
    Search, MapPin, Calendar, DollarSign, Heart, CheckCircle,
    ArrowRight, ChevronRight, ChevronLeft, Star, Users, Zap, Shield, TrendingUp,
    Mic2, Music2, PersonStanding, Radio, Camera, Lightbulb, Globe,
    Play, RefreshCw, GitCompare, BookOpen, X, Loader2, LogOut, Menu
} from "lucide-react";
import ArtistProfileLanding from "../../../customer/pages/ArtistProfileLanding";
import Footer from "../../../customer/components/Footer.tsx";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Artist {
    id: string | number;
    name: string;
    type: string;
    location: string;
    rating: number;
    reviews: number;
    price: string;
    image: string;
    verified: boolean;
    startingPrice: number | null;
    maxPrice: number | null;
    fullPrice: number | null;
    advance: number | null;
}

interface ArtistSearchFilters {
    search?: string;
    category?: string;
    location?: string;
    eventDate?: string;
    budget?: number;
}

interface Profile {
    avatar_url?: string;
    stage_name?: string;
    full_name?: string;
}

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    read: boolean;
    time?: string;
}

// ── Status Notification Modal Component ─────────────────────────────────────
function StatusNotificationModal({
                                     notification,
                                     onClose
                                 }: {
    notification: Notification;
    onClose: () => void
}) {
    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
                        notification.title.includes('Approved') || notification.title.includes('Re-activated')
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                    }`}>
                        {notification.title.includes('Approved') || notification.title.includes('Re-activated')
                            ? <CheckCircle size={32} />
                            : <Shield size={32} />
                        }
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mb-3">{notification.title}</h3>
                    <p className="text-gray-500 leading-relaxed mb-8">
                        {notification.message}
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full btn-pink py-4 rounded-2xl font-bold text-lg"
                    >
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── FIX: Added CategoryData interface (was missing in ArtistHome) ─────────────
interface CategoryData {
    name: string;
    description: string;
    image: string;
}

const FALLBACK_ARTIST_IMAGE =
    "https://images.unsplash.com/photo-1571935441008-e42d7f4a8f65?w=400&q=80";

// ── FIX: Added DEFAULT_CAT_IMAGE constant (was missing in ArtistHome) ────────
const DEFAULT_CAT_IMAGE = "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=600&q=80";

function formatArtistPrice(starting: number | null, max: number | null): string {
    if (starting != null) return `Rs. ${starting.toLocaleString("en-LK")}+`;
    if (max != null) return `Rs. ${max.toLocaleString("en-LK")}+`;
    return "Contact for price";
}

function parseBudget(value: string): number | null {
    const parsed = parseFloat(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function buildArtistSearchParams(filters: ArtistSearchFilters, page: number): ArtistSearchParams {
    const params: ArtistSearchParams = { per_page: 50, page };
    if (filters.search?.trim()) params.search = filters.search.trim();
    if (filters.category) params.category = filters.category;
    if (filters.location?.trim()) params.location = filters.location.trim();
    if (filters.eventDate) params.event_date = filters.eventDate;
    if (filters.budget != null) params.max_budget = filters.budget;
    return params;
}

function applyClientSearchFilters(artists: Artist[], filters: ArtistSearchFilters): Artist[] {
    let result = artists;
    const query = filters.search?.trim().toLowerCase();

    if (query) {
        result = result.filter(
            a =>
                a.name.toLowerCase().includes(query) ||
                a.type.toLowerCase().includes(query) ||
                a.location.toLowerCase().includes(query),
        );
    }

    const loc = filters.location?.trim().toLowerCase();
    if (loc) {
        result = result.filter(a => a.location.toLowerCase().includes(loc));
    }

    if (filters.category) {
        result = result.filter(a => a.type === filters.category);
    }

    if (filters.budget != null) {
        result = result.filter(
            a => a.startingPrice == null || a.startingPrice <= filters.budget!,
        );
    }

    return result;
}

function mapDiscoveryArtist(a: DiscoveryArtist): Artist {
    const extra = a as DiscoveryArtist & {
        average_rating?: number;
        reviews_count?: number;
        verification_status?: string;
        rating?: { average?: number | null; total?: number };
    };

    return {
        id: a.id,
        name: a.stage_name || "Artist",
        type: a.category || "Performer",
        location: a.location || "Sri Lanka",
        rating: extra.average_rating ?? extra.rating?.average ?? 4.8,
        reviews: extra.reviews_count ?? extra.rating?.total ?? 0,
        price: formatArtistPrice(a.starting_price, a.max_price),
        image: a.avatar_url || a.cover_url || FALLBACK_ARTIST_IMAGE,
        verified: extra.verification_status === "verified" || extra.verification_status === "approved",
        startingPrice: a.starting_price,
        maxPrice: a.max_price,
        fullPrice: a.full_price,
        advance: a.advance,
    };
}

async function fetchArtistsWithFilters(filters: ArtistSearchFilters = {}): Promise<Artist[]> {
    const byId = new Map<string | number, Artist>();

    const addArtists = (items: DiscoveryArtist[]) => {
        for (const item of items) {
            const mapped = mapDiscoveryArtist(item);
            byId.set(mapped.id, mapped);
        }
    };

    if (filters.location?.trim()) {
        try {
            const { data } = await getNearYou(filters.location.trim(), 50);
            addArtists(data);
        } catch {
            /* fall back to main listing */
        }
    }

    let page = 1;
    let lastPage = 1;
    do {
        const { data, meta } = await getArtists(buildArtistSearchParams(filters, page));
        addArtists(data);
        lastPage = meta?.last_page ?? 1;
        page++;
    } while (page <= lastPage);

    return applyClientSearchFilters(Array.from(byId.values()), filters);
}

// ── FIX: ALL_CATEGORIES_DATA now defined as CategoryData[] (same as Landing) ─
const ALL_CATEGORIES_DATA: CategoryData[] = [
    {
        name: "Singer",
        description: "Powerful vocalists covering a wide range of genres and styles.",
        image: "https://images.unsplash.com/photo-1526218626217-dc65a29bb444?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        name: "Rapper",
        description: "Dynamic hip-hop artists and lyricists for high-energy performances.",
        image: "https://images.unsplash.com/photo-1623531249239-07774b804ac8?q=80&w=412&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        name: "Live Band",
        description: "Full musical ensembles providing an immersive live experience.",
        image: "https://images.unsplash.com/photo-1550219363-d0adfaa43d0f?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        name: "Dance Group",
        description: "Professional choreographies and high-energy dance routines.",
        image: "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        name: "Producer",
        description: "Creative minds behind the beats and sound engineering.",
        image: "https://images.unsplash.com/photo-1610716632424-4d45990bcd48?q=80&w=726&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        name: "DJ",
        description: "Expert curators of energy and rhythm for every dance floor.",
        image: "https://images.unsplash.com/photo-1541126274323-dbac58d14741?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        name: "Sound System",
        description: "Premium audio equipment and technicians for crystal clear sound.",
        image: "https://images.unsplash.com/photo-1504904126298-3fde501c9b31?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        name: "Lightning System",
        description: "Atmospheric and stage lighting to set the perfect visual mood.",
        image: "https://images.unsplash.com/photo-1670028514318-0ac718c0590d?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        name: "Photographers",
        description: "Professional photographers to freeze your precious event moments in time.",
        image: "https://images.unsplash.com/photo-1612548403247-aa2873e9422d?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        name: "Videographers",
        description: "Cinematic storytellers capturing your most precious moments.",
        image: "https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
];

const PARTNER_LOGOS = ["TAJ", "Shangri-La", "Cinnamon", "Hilton", "MOVENPICK", "Liga Escapes", "atogals"];

export default function ArtistHome() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [stats, setStats] = useState<{ total_artists: number; sample_avatars: string[] }>({
        total_artists: 0,
        sample_avatars: []
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [location, setLocation] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [budget, setBudget] = useState("");
    const [defaultPopularArtists, setDefaultPopularArtists] = useState<Artist[]>([]);
    const [popularArtists, setPopularArtists] = useState<Artist[]>([]);
    const [selectedSearchCategory, setSelectedSearchCategory] = useState<string | null>(null);
    const [hasActiveSearch, setHasActiveSearch] = useState(false);
    const [popularArtistsLoading, setPopularArtistsLoading] = useState(false);

    // ── FIX: State is now CategoryData[] initialized with ALL_CATEGORIES_DATA ──
    const [browseCategories, setBrowseCategories] = useState<CategoryData[]>(ALL_CATEGORIES_DATA);
    const [browseCategoriesLoading, setBrowseCategoriesLoading] = useState(true);

    const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
    const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

    const [likedArtists, setLikedArtists] = useState<Set<string | number>>(new Set());
    const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
    const [isClosingProfile, setIsClosingProfile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const popularArtistsRef = useRef<HTMLDivElement>(null);

    const handleCloseProfile = () => {
        setIsClosingProfile(true);
        setTimeout(() => {
            setSelectedArtistId(null);
            setIsClosingProfile(false);
        }, 500); // Matches animation duration
    };

    // Prevent body scroll when overlay is open
    useEffect(() => {
        if (selectedArtistId || activeNotification) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedArtistId, activeNotification]);

    useEffect(() => {
        fetchProfile();
        fetchNotifications();

        getStats()
            .then(data => {
                if (data && typeof data === 'object' && Array.isArray(data.sample_avatars)) {
                    setStats(data);
                }
            })
            .catch(() => {});

        // Load Discovery Data
        getArtists({ per_page: 50 })
            .then(({ data }) => {
                const artists = data.map(mapDiscoveryArtist);
                setDefaultPopularArtists(artists);
                setPopularArtists(artists);
            })
            .catch(() => {
                setDefaultPopularArtists([]);
                setPopularArtists([]);
            });

        // ── FIX: Merge API categories into CategoryData objects (same as Landing) ─
        setBrowseCategoriesLoading(true);
        getCategories()
            .then(cats => {
                const existingNames = ALL_CATEGORIES_DATA.map(c => c.name);
                const newCats = cats
                    .filter(c => !existingNames.includes(c))
                    .map(c => ({
                        name: c,
                        description: `Explore professional ${c.toLowerCase()} for your next event.`,
                        image: DEFAULT_CAT_IMAGE,
                    }));
                setBrowseCategories([...ALL_CATEGORIES_DATA, ...newCats]);
            })
            .catch(() => setBrowseCategories(ALL_CATEGORIES_DATA))
            .finally(() => setBrowseCategoriesLoading(false));
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get("/notifications");
            const unread = data.filter((n: any) => !n.read);
            setUnreadNotifications(unread);

            // Show the first unread status_change notification as a popup
            const statusChange = unread.find((n: any) => n.type === 'status_change');
            if (statusChange) {
                setActiveNotification(statusChange);
            }
        } catch (err) {
            console.error("Failed to load notifications", err);
        }
    };

    const handleDismissNotification = async () => {
        if (!activeNotification) return;
        try {
            await api.put(`/notifications/${activeNotification.id}/read`);
            setActiveNotification(null);
            setUnreadNotifications(prev => prev.filter(n => n.id !== activeNotification.id));
        } catch (err) {
            console.error("Failed to mark notification as read", err);
            setActiveNotification(null);
        }
    };

    const fetchProfile = async () => {
        try {
            const { data } = await api.get("/profile");
            setProfile(data.profile);
        } catch (err) {
            console.error("Failed to load profile", err);
        } finally {
            setLoadingProfile(false);
        }
    };

    const runSearch = useCallback(async () => {
        const filters: ArtistSearchFilters = {
            search: searchQuery,
            category: selectedSearchCategory ?? undefined,
            location: location,
            eventDate: eventDate || undefined,
            budget: parseBudget(budget) ?? undefined,
        };

        const hasCriteria =
            Boolean(filters.search?.trim()) ||
            Boolean(filters.category) ||
            Boolean(filters.location?.trim()) ||
            Boolean(filters.eventDate) ||
            filters.budget != null;

        setHasActiveSearch(hasCriteria);
        setPopularArtistsLoading(true);

        try {
            if (!hasCriteria) {
                setPopularArtists(defaultPopularArtists);
                return;
            }
            const artists = await fetchArtistsWithFilters(filters);
            setPopularArtists(artists);
        } catch {
            setPopularArtists([]);
        } finally {
            setPopularArtistsLoading(false);
        }
    }, [searchQuery, selectedSearchCategory, location, eventDate, budget, defaultPopularArtists]);

    const handleSearchCategoryClick = async (category: string | null) => {
        if (category === null) {
            setSelectedSearchCategory(null);
            setHasActiveSearch(false);
            setPopularArtistsLoading(true);
            setSearchQuery("");
            setLocation("");
            setEventDate("");
            setBudget("");
            setPopularArtists(defaultPopularArtists);
            setPopularArtistsLoading(false);
            return;
        }
        setSelectedSearchCategory(prev => prev === category ? null : category);
    };

    const toggleLike = (id: string | number) => {
        setLikedArtists(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const scrollPopular = (direction: 'left' | 'right') => {
        if (!popularArtistsRef.current) return;
        const container = popularArtistsRef.current;
        const scrollAmount = container.clientWidth * 0.8;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    const filterBrowseArtistsByCategory = (category: string) => {
        window.open(`/category?name=${encodeURIComponent(category)}`, '_blank');
    };

    const scrollToSection = (id: string) => {
        setMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const renderArtistCard = (artist: Artist) => (
        <div key={artist.id} className="flex-shrink-0 w-[130px] sm:w-[170px] md:w-[190px] artist-card cursor-pointer bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100" onClick={() => setSelectedArtistId(artist.id.toString())}>
            <div className="relative" style={{ aspectRatio: "3/4" }}>
                <img src={artist.image} className="w-full h-full object-cover" alt={artist.name} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)" }} />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(artist.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:scale-110"
                >
                    <Heart
                        size={15}
                        className={likedArtists.has(artist.id) ? "text-red-500" : "text-gray-500"}
                        fill={likedArtists.has(artist.id) ? "#ef4444" : "none"}
                    />
                </button>
                {artist.verified && (
                    <div className="verified-dot" />
                )}
            </div>
            <div className="p-2.5">
                <h3 className="font-800 text-gray-900 text-[14px] leading-tight truncate">{artist.name}</h3>
                <p className="text-gray-400 text-[11px] mt-0.5">{artist.type}</p>
                <div className="flex items-center gap-1 mt-1">
                    <MapPin size={10} className="text-gray-400" />
                    <span className="text-gray-400 text-[10px]">{artist.location}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <div className="rating-row">
                        <Star size={10} fill="#facc15" className="text-yellow-400" />
                        <span className="text-[10px] font-700 text-gray-800">{artist.rating}</span>
                        <span className="text-[10px] text-gray-400">({artist.reviews})</span>
                    </div>
                    {artist.fullPrice != null ? (
                        <span className="text-[10px] font-800 pink-text">Rs. {artist.fullPrice.toLocaleString("en-LK")}</span>
                    ) : (
                        <span className="text-[10px] font-800 pink-text">{artist.price}</span>
                    )}
                </div>
            </div>
        </div>
    );

    const renderArtistSkeleton = (index: number) => (
        <div key={index} className="flex-shrink-0 w-[130px] sm:w-[170px] md:w-[190px] animate-pulse bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="relative bg-gray-100" style={{ aspectRatio: "3/4" }} />
            <div className="p-2.5 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-2 bg-gray-100 rounded w-1/2" />
                <div className="flex items-center gap-1 mt-1">
                    <div className="w-2.5 h-2.5 bg-gray-100 rounded-full" />
                    <div className="h-2 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 bg-gray-100 rounded-full" />
                        <div className="h-2 bg-gray-100 rounded w-6" />
                    </div>
                    <div className="h-2 bg-gray-100 rounded w-10" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: "'Fraunces', serif" }}>
            <style>{`
                 @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400&display=swap');
                .btn-pink { background: #E8194B; color: white; transition: all 0.2s ease; }
                .btn-pink:hover { background: #d11643; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(232, 25, 75, 0.2); }
                .nav-link { color: #444; font-weight: 500; font-size: 15px; transition: color 0.15s; cursor: pointer; }
                .nav-link:hover { color: #E8194B; }
                .section-title { font-size: clamp(22px, 3vw, 28px); font-weight: 800; color: #111; }
                .cat-card-modern { 
                    position: relative; 
                    aspect-ratio: 3/4; 
                    border-radius: 20px; 
                    overflow: hidden; 
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                #how-it-works,
                #contact-section {
                    scroll-margin-top: 71px;
                }
                
                .cat-card-modern:hover { transform: scale(1.03); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
                .cat-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
                .cat-card-modern:hover .cat-img { transform: scale(1.1); }
                .cat-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 20px; }
                .carousel-btn { width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid #eee; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: white; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                .carousel-btn:hover { border-color: #E8194B; color: #E8194B; transform: scale(1.1); }
                .search-bar-wrap { background: #1a1a1a; border-radius: 20px; }
                .tag-pill { background: #f5f5f5; border-radius: 100px; padding: 6px 16px; font-size: 13px; font-weight: 600; color: #222; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: background 0.15s, color 0.15s; border: 1.5px solid #eee; }
                .tag-pill:hover { background: #fff0f3; color: #E8194B; border-color: #E8194B; }
                .tag-pill-active { background: #fff0f3 !important; color: #E8194B !important; border-color: #E8194B !important; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .pink-text { color: #E8194B; }
                .verified-dot { position: absolute; bottom: 8px; left: 8px; background: #ff0000; border-radius: 50%; width: 10px; height: 10px; border: 1.5px solid white; box-shadow: 0 0 4px rgba(255,0,0,0.5); }
                .rating-row { display: flex; align-items: center; gap: 4px; }
                .artist-card { transition: transform 0.2s, box-shadow 0.2s; }
                .artist-card:hover { transform: translateY(-4px); }
                .search-input { outline: none; border: none; }
                .search-input:focus { outline: none; }
                .section[id] { scroll-margin-top: 90px; }
                .dark-section { background: #111; }
                .cta-card { background: #1a1a1a; border-radius: 20px; }
                .checklist-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #ddd; margin-bottom: 8px; }
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                
                @keyframes slideDown {
                    from { transform: translateY(0); }
                    to { transform: translateY(100%); }
                }
                .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0, 0, 0.2, 1) forwards; }
                .animate-slide-down { animation: slideDown 0.5s cubic-bezier(0, 0, 0.2, 1) forwards; }
                .blur-bg { filter: blur(8px); transition: filter 0.5s ease; }

                @media (max-width: 640px) {
                    .cat-overlay { padding: 12px; }
                    .cat-overlay h3 { font-size: 14px; }
                    section[id] { scroll-margin-top: 72px; }
                    .tag-pill { padding: 5px 10px; font-size: 11px; gap: 4px; }
                    .search-bar-wrap { padding: 12px !important; border-radius: 20px; }
                    .carousel-btn { width: 34px; height: 34px; }
                    .checklist-item { font-size: 12px; margin-bottom: 6px; }

                    .mobile-search-grid { 
                        display: grid !important; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 8px !important; 
                        background: transparent !important;
                        border-radius: 0 !important;
                        overflow: visible !important;
                    }
                    .mobile-search-grid > div { 
                        background: #fff !important;
                        border: 1px solid #e5e7eb !important; 
                        border-radius: 12px !important; 
                        padding: 10px 14px !important;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.02) !important;
                    }
                    .search-field-label { 
                        display: block !important; 
                        font-size: 9px !important; 
                        color: #9ca3af !important; 
                        font-weight: 700 !important; 
                        text-transform: uppercase !important; 
                        letter-spacing: 0.05em !important;
                        margin-bottom: 2px !important;
                    }
                    .search-input {
                        font-size: 13px !important;
                    }
                    .mobile-search-grid .search-submit-btn {
                        grid-column: 1 / -1; 
                        width: 100%;
                        border-radius: 12px !important;
                        padding: 12px !important;
                        margin-top: 4px !important;
                        box-shadow: 0 4px 14px rgba(232, 25, 75, 0.25) !important;
                    }

                    .search-category-pills { display: none !important; }
                    .cta-image-block { display: none !important; }
                }
                @media (max-width: 768px) {
                    .section-title { font-size: 20px; }
                }
            `}</style>

            {/* Profile Overlay */}
            {selectedArtistId && (
                <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-500 ${isClosingProfile ? 'opacity-0' : 'opacity-100'}`}>
                    <div className={`max-w-5xl w-full h-full md:h-[95vh] md:max-h-[900px] md:rounded-2xl md:my-4 bg-white shadow-[0_0_60px_rgba(0,0,0,0.3)] overflow-hidden ${isClosingProfile ? 'animate-slide-down' : 'animate-slide-up'}`}>
                        <ArtistProfileLanding
                            id={selectedArtistId}
                            onClose={handleCloseProfile}
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className={`transition-all duration-500 ${selectedArtistId ? 'blur-bg scale-[0.98]' : ''}`}>

                {/* NAVBAR */}
                <nav className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-4 sm:px-6 md:px-12 py-3 md:py-4 bg-white border-b border-gray-100">
                    <div className="flex items-center cursor-pointer" onClick={() => navigate("/artistHome")}>
                        <Link to="/" className="flex items-center" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <img
                                src="/assets/logo/logo-navbar-light@3x.png"
                                alt="Perfoma"
                                className="h-8 sm:h-10 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-7 absolute left-1/2 transform -translate-x-1/2">
                        <button onClick={() => scrollToSection('categories-section')} className="nav-link">Categories</button>
                        <button onClick={() => scrollToSection('artists-section')} className="nav-link">Explore</button>
                        <button onClick={() => scrollToSection('how-it-works')} className="nav-link">How it works</button>
                        <button onClick={() => scrollToSection('contact-section')} className="nav-link">Contact Us</button>
                        <button className="nav-link">Events</button>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div
                            onClick={() => navigate("/account")}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-gray-100 overflow-hidden cursor-pointer hover:border-[#E8194B] transition-all"
                        >
                            <img
                                src={profile?.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80"}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button
                            onClick={() => navigate("/login")}
                            className="p-2 text-gray-400 hover:text-[#E8194B] transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                        <button
                            type="button"
                            className="md:hidden p-2 text-gray-600 hover:text-[#E8194B] transition-colors"
                            onClick={() => setMobileMenuOpen(prev => !prev)}
                            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        >
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>

                    {mobileMenuOpen && (
                        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-50 py-4 px-6 flex flex-col gap-1">
                            <button onClick={() => scrollToSection('categories-section')} className="nav-link text-left py-3 border-b border-gray-50">Categories</button>
                            <button onClick={() => scrollToSection('artists-section')} className="nav-link text-left py-3 border-b border-gray-50">Explore</button>
                            <button onClick={() => scrollToSection('how-it-works')} className="nav-link text-left py-3 border-b border-gray-50">How it works</button>
                            <button onClick={() => scrollToSection('contact-section')} className="nav-link text-left py-3 border-b border-gray-50">Contact Us</button>
                            <button className="nav-link text-left py-3">Events</button>
                        </div>
                    )}
                </nav>

                {/* HERO */}
                <section className="relative w-full overflow-hidden bg-cover bg-center pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 md:px-12 lg:px-20 min-h-[480px] sm:min-h-[540px] flex items-center"
                         style={{ backgroundImage: "url('/new_cover.jpeg')" }}>
                    <div className="absolute inset-0 bg-black/40 z-0" />
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10 w-full">
                        <div>
                            <p className="text-gray-200 text-base font-600 mb-1">Welcome Back</p>
                            <h1 className="font-black leading-tight text-white mb-2" style={{ fontSize: "clamp(38px, 5vw, 62px)", lineHeight: 1.1 }}>
                                Hey, <span className="text-[#E8194B]">{profile?.stage_name || profile?.full_name || "Artist"}</span>
                            </h1>
                            <p className="text-gray-300 text-base">Explore the community and see what's trending.</p>
                            <div className="flex items-center gap-3 mt-7">
                                <div className="flex -space-x-2">
                                    {((stats?.sample_avatars && Array.isArray(stats.sample_avatars) && stats.sample_avatars.length > 0) ? stats.sample_avatars : []).slice(0, 5).map((src, i) => (
                                        <img key={i} src={src} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-300 font-500">
                                    {(stats?.total_artists ?? 0) > 100 ? "100+" : (stats?.total_artists ?? 0)} artists already joined
                                </p>
                            </div>
                        </div>
                        <div className="hidden lg:flex relative h-[350px] lg:h-[420px] items-center justify-end" />
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                BROWSE CATEGORIES
            ══════════════════════════════════════════════════ */}
                <section id="categories-section" className="w-full px-4 sm:px-6 md:px-12 lg:px-20 py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="section-title">Browse Categories</h2>
                        </div>

                        {browseCategoriesLoading ? (
                            <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                                {Array.from({ length: ALL_CATEGORIES_DATA.length }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-full aspect-[3/4] rounded-2xl bg-gray-100 animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : (
                            // ── FIX: Now iterates CategoryData objects — cat.name, cat.image, cat.description all work ──
                            <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                                {browseCategories.map(cat => (
                                    <div
                                        key={cat.name}
                                        className="cat-card-modern group w-full"
                                        onClick={() => filterBrowseArtistsByCategory(cat.name)}
                                    >
                                        <img
                                            src={cat.image}
                                            className="cat-img"
                                            alt={cat.name}
                                        />
                                        <div className="cat-overlay">
                                            <h3 className="text-white font-900 text-lg leading-tight">{cat.name}</h3>
                                            <p className="text-white/80 text-[10px] mt-1 line-clamp-2 leading-relaxed">{cat.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                ARTISTS / SEARCH
            ══════════════════════════════════════════════════ */}
                <section id="artists-section" className="w-full px-4 sm:px-6 md:px-12 lg:px-20 py-16 sm:py-24 overflow-hidden">
                    <div className="max-w-7xl mx-auto relative group">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="section-title">
                                {hasActiveSearch ? "Search Results" : "Artists"}
                            </h2>
                            <div className="flex items-center gap-3">
                                <button onClick={() => scrollPopular('left')} className="carousel-btn" aria-label="Previous">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={() => scrollPopular('right')} className="carousel-btn" aria-label="Next">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        <form
                            className="search-bar-wrap p-3 sm:p-5 mb-6 sm:mb-10"
                            onSubmit={e => {
                                e.preventDefault();
                                runSearch();
                            }}
                        >
                            {/* Inputs row */}
                            <div className="flex flex-col md:flex-row items-stretch gap-0 bg-white rounded-xl overflow-hidden mobile-search-grid">
                                {/* What */}
                                <div className="flex items-center gap-3 flex-1 px-5 py-3.5 border-b md:border-b-0 md:border-r border-gray-200">
                                    <Search size={18} className="text-gray-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400 font-600 search-field-label">What are you looking for?</p>
                                        <input
                                            type="text"
                                            placeholder="DJs, Singers, Bands..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="search-input w-full text-sm text-gray-700 font-600 placeholder-gray-300 bg-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-3 flex-1 px-5 py-3.5 border-b md:border-b-0 md:border-r border-gray-200">
                                    <MapPin size={18} className="text-gray-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400 font-600 search-field-label">Location</p>
                                        <input
                                            type="text"
                                            placeholder="All Sri Lanka"
                                            value={location}
                                            onChange={e => setLocation(e.target.value)}
                                            className="search-input w-full text-sm text-gray-700 font-600 placeholder-gray-300 bg-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="flex items-center gap-3 flex-1 px-5 py-3.5 border-b md:border-b-0 md:border-r border-gray-200">
                                    <Calendar size={18} className="text-gray-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400 font-600 search-field-label">Event Date</p>
                                        <input
                                            type="date"
                                            value={eventDate}
                                            min={new Date().toISOString().split("T")[0]}
                                            onChange={e => setEventDate(e.target.value)}
                                            className="search-input w-full text-sm text-gray-700 font-600 placeholder-gray-300 bg-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Budget */}
                                <div className="flex items-center gap-3 flex-1 px-5 py-3.5">
                                    <DollarSign size={18} className="text-gray-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400 font-600 search-field-label">Budget</p>
                                        <input
                                            type="text"
                                            placeholder="Any Budget"
                                            value={budget}
                                            onChange={e => setBudget(e.target.value)}
                                            className="search-input w-full text-sm text-gray-700 font-600 placeholder-gray-300 bg-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Search Button */}
                                <button
                                    type="submit"
                                    className="search-submit-btn btn-pink font-bold text-sm px-8 py-4 flex-shrink-0 md:rounded-r-xl"
                                >
                                    Search
                                </button>
                            </div>

                            {/* Category tag pills */}
                            <div className="flex flex-wrap gap-2 mt-4 px-1 search-category-pills">
                                {browseCategoriesLoading ? (
                                    <div className="flex flex-wrap gap-2 animate-pulse">
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <div key={i} className="h-8 w-20 bg-gray-100 rounded-full" />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleSearchCategoryClick(null)}
                                            className={`tag-pill${selectedSearchCategory === null ? " tag-pill-active" : ""}`}
                                        >
                                            <span className="w-4 h-4 rounded-full inline-block" style={{ background: "rgba(232,25,75,0.15)" }} />
                                            All
                                        </button>
                                        {/* ── FIX: use cat.name for key, onClick, and label ── */}
                                        {browseCategories.map(cat => (
                                            <button
                                                key={cat.name}
                                                type="button"
                                                onClick={() => handleSearchCategoryClick(cat.name)}
                                                className={`tag-pill${selectedSearchCategory === cat.name ? " tag-pill-active" : ""}`}
                                            >
                                                <span className="w-4 h-4 rounded-full inline-block" style={{ background: "rgba(232,25,75,0.15)" }} />
                                                {cat.name}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </form>

                        {popularArtistsLoading ? (
                            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-8 pt-2">
                                {[1, 2, 3, 4, 5, 6].map(i => renderArtistSkeleton(i))}
                            </div>
                        ) : popularArtists.length === 0 ? (
                            <p className="text-sm text-gray-400 py-6 text-center">
                                {hasActiveSearch
                                    ? "No artists match your search. Try different filters."
                                    : "No artists found."}
                            </p>
                        ) : (
                            <div
                                ref={popularArtistsRef}
                                className="flex gap-4 overflow-x-auto hide-scrollbar pb-8 pt-2"
                            >
                                {popularArtists.map(renderArtistCard)}
                            </div>
                        )}
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section
                    id="how-it-works"
                    className="w-full px-4 sm:px-6 md:px-12 lg:px-20 py-16 sm:py-24"
                    style={{ background: '#111' }}
                >
                    <div className="max-w-5xl mx-auto">
                        <h2
                            className="text-center text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3"
                            style={{ fontFamily: 'Georgia, serif' }}
                        >
                            Manage Bookings in 4 Simple Steps
                        </h2>

                        <p className="text-center text-gray-400 text-xs sm:text-sm mb-10 sm:mb-16 px-2">
                            Receive requests, connect with clients, and grow your bookings.
                        </p>

                        <div className="relative flex flex-row items-start justify-between">
                            {/* Dashed connector line */}
                            <div
                                className="block absolute top-5 sm:top-8 left-0 right-0 h-px"
                                style={{
                                    backgroundImage:
                                        'repeating-linear-gradient(to right, #E8194B 0, #E8194B 8px, transparent 8px, transparent 18px)',
                                    zIndex: 0,
                                    marginLeft: '10%',
                                    marginRight: '10%',
                                }}
                            />

                            {[
                                {
                                    num: 1,
                                    title: 'Receive Request',
                                    desc: 'Get booking inquiries from customers interested in your services.',
                                },
                                {
                                    num: 2,
                                    title: 'Review Details',
                                    desc: 'Check event date, location, budget, and customer requirements.',
                                },
                                {
                                    num: 3,
                                    title: 'Contact Client',
                                    desc: 'Chat directly with the customer to discuss availability and expectations.',
                                },
                                {
                                    num: 4,
                                    title: 'Accept Booking',
                                    desc: 'Confirm the booking and prepare to deliver an amazing performance.',
                                },
                            ].map((step) => (
                                <div
                                    key={step.num}
                                    className="flex flex-col items-center text-center flex-1 px-1 sm:px-4 relative"
                                    style={{ zIndex: 1 }}
                                >
                                    <div
                                        className="w-9 h-9 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-5 text-white text-xs sm:text-xl font-bold"
                                        style={{ background: '#E8194B' }}
                                    >
                                        {step.num}
                                    </div>

                                    <h3 className="font-bold text-white text-[11px] sm:text-base mb-1 sm:mb-2">
                                        {step.title}
                                    </h3>

                                    <p className="text-gray-400 text-[9px] sm:text-sm leading-snug sm:leading-relaxed hidden sm:block">
                                        {step.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA SECTION - FOR ARTISTS */}
                <section id="join-section" className="dark-section w-full px-4 sm:px-6 md:px-12 lg:px-20 py-16 sm:py-24" style={{ background: '#0a0a0a' }}>
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <p className="pink-text text-xs font-bold uppercase tracking-widest mb-2">
                                For Artists
                            </p>

                            <h2 className="text-white font-black text-2xl md:text-3xl leading-tight mb-3">
                                Turn Your Talent<br />Into Opportunities
                            </h2>

                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Showcase your skills, connect with clients, and get booked for
                                weddings, parties, corporate events, and more.
                            </p>

                            <button
                                onClick={() => navigate('/account')}
                                className="btn-pink flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-bold text-sm w-full sm:w-auto"
                            >
                                <span className="sm:hidden">Complete Account</span>
                                <span className="hidden sm:inline">Complete making your Account</span>
                                <ArrowRight size={15} />
                            </button>
                        </div>

                        <div className="relative flex flex-col items-stretch sm:block cta-image-block">
                            <div
                                className="relative rounded-2xl overflow-hidden w-full"
                                style={{ height: '220px' }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80"
                                    className="w-full h-full object-cover object-center"
                                    alt="Artist Performance"
                                    style={{ filter: 'brightness(0.75)' }}
                                />
                            </div>

                            <div className="cta-card static sm:absolute sm:bottom-4 sm:right-4 p-3 sm:p-4 w-full sm:min-w-[180px] sm:w-auto mt-3 sm:mt-0">
                                <p className="text-white font-800 text-sm mb-2 sm:mb-3">
                                    Why Join Us
                                </p>

                                {[
                                    'More Booking Requests',
                                    'Verified Client Network',
                                    'Secure Payments',
                                    'Grow Your Audience'
                                ].map(item => (
                                    <div key={item} className="checklist-item">
                                        <CheckCircle
                                            size={15}
                                            style={{ color: '#E8194B', flexShrink: 0 }}
                                        />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/*    /!* ══════════════════════════════════════════════════*/}
                {/*    PARTNER LOGOS*/}
                {/*══════════════════════════════════════════════════ *!/*/}
                {/*    <section className="w-full h-1 py-10 px-6 md:px-12 lg:px-20 bg-white border-t border-gray-100">*/}
                {/*        <div className="max-w-7xl mx-auto">*/}
                {/*            <p className="text-center text-gray-400 text-sm mb-6 font-500">*/}
                {/*                Trusted by event planners and companies across Sri Lanka*/}
                {/*            </p>*/}
                {/*            /!*<div className="flex flex-wrap justify-center gap-10 opacity-40">*!/*/}
                {/*            /!*    {PARTNER_LOGOS.map(l => (*!/*/}
                {/*            /!*        <span key={l} className="font-black text-sm uppercase tracking-widest">{l}</span>*!/*/}
                {/*            /!*    ))}*!/*/}
                {/*            /!*</div>*!/*/}
                {/*        </div>*/}
                {/*    </section>*/}

                <Footer />
            </div>

            {/* Status Change Notification Popup */}
            {activeNotification && (
                <StatusNotificationModal
                    notification={activeNotification}
                    onClose={handleDismissNotification}
                />
            )}
        </div>
    );
}
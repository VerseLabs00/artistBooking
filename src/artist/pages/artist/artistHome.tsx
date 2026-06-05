import { useState, useEffect, useCallback, useRef } from "react";
import {Link, useNavigate} from "react-router-dom";
import api from "../../api/axios";
import { getArtists, getCategories, getNearYou, getStats } from "../../../customer/services/discoveryService";
import type { ArtistCard as DiscoveryArtist, ArtistSearchParams } from "../../../customer/services/discoveryService";
import {
    Search, MapPin, Calendar, DollarSign, Heart, CheckCircle,
    ArrowRight, ChevronRight, ChevronLeft, Star, Users, Zap, Shield, TrendingUp,
    Mic2, Music2, PersonStanding, Radio, Camera, Lightbulb, Globe,
    Play, RefreshCw, GitCompare, BookOpen, X, Loader2, LogOut
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
        name: "Musician",
        description: "Elegant solo instrumentalists and performers for ambient atmosphere.",
        image: "./assets/categories/musician.webp"
    },
    {
        name: "Solo Singer",
        description: "Powerful vocalists covering a wide range of genres and styles.",
        image: "./assets/categories/solosinger.webp"
    },
    {
        name: "Rapper",
        description: "Dynamic hip-hop artists and lyricists for high-energy performances.",
        image: "./assets/categories/rapper.webp"
    },
    {
        name: "Live Band",
        description: "Full musical ensembles providing an immersive live experience.",
        image: "./assets/categories/liveband.webp"
    },
    {
        name: "Dance Group",
        description: "Professional choreographies and high-energy dance routines.",
        image: "./assets/categories/dancegroups.webp"
    },
    {
        name: "Producer",
        description: "Creative minds behind the beats and sound engineering.",
        image: "./assets/categories/producer.webp"
    },
    {
        name: "DJ",
        description: "Expert curators of energy and rhythm for every dance floor.",
        image: "./assets/categories/dj.webp"
    },
    {
        name: "Sound System",
        description: "Premium audio equipment and technicians for crystal clear sound.",
        image: "./assets/categories/soundsystem.webp"
    },
    {
        name: "Lightning System",
        description: "Atmospheric and stage lighting to set the perfect visual mood.",
        image: "./assets/categories/lightningsystem.webp"
    },
    {
        name: "Videographers",
        description: "Cinematic storytellers capturing your most precious moments.",
        image: "./assets/categories/videographers.webp"
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

    const [likedArtists, setLikedArtists] = useState<Set<string | number>>(new Set());
    const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
    const [isClosingProfile, setIsClosingProfile] = useState(false);
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
        if (selectedArtistId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedArtistId]);

    useEffect(() => {
        fetchProfile();

        getStats()
            .then(data => setStats(data))
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
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const renderArtistCard = (artist: Artist) => (
        <div key={artist.id} className="flex-shrink-0 w-[150px] sm:w-[170px] md:w-[190px] artist-card cursor-pointer bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100" onClick={() => setSelectedArtistId(artist.id.toString())}>
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
                    <span className="text-[10px] font-800 pink-text">{artist.price}</span>
                </div>
            </div>
        </div>
    );

    const renderArtistSkeleton = (index: number) => (
        <div key={index} className="flex-shrink-0 w-[150px] sm:w-[170px] md:w-[190px] animate-pulse bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
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
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Fraunces', serif" }}>
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
                section[id] { scroll-margin-top: 90px; }
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
            `}</style>

            {/* Profile Overlay */}
            {selectedArtistId && (
                <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-500 ${isClosingProfile ? 'opacity-0' : 'opacity-100'}`}>
                    <div className={`max-w-5xl w-full h-full bg-white shadow-[0_0_60px_rgba(0,0,0,0.3)] overflow-hidden ${isClosingProfile ? 'animate-slide-down' : 'animate-slide-up'}`}>
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
                <nav className="w-full flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-gray-100 sticky top-0 z-50 relative">
                    <div className="flex items-center cursor-pointer" onClick={() => navigate("/artistHome")}>
                        <Link to="/" className="flex items-center">
                            <img
                                src="/logoBlack.svg"
                                alt="Perfoma"
                                className="h-10 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-7 absolute left-1/2 transform -translate-x-1/2">
                        <button onClick={() => scrollToSection('categories-section')} className="nav-link">Categories</button>
                        <button onClick={() => scrollToSection('artists-section')} className="nav-link">Explore</button>
                        <button onClick={() => scrollToSection('how-it-works')} className="nav-link">How it works</button>
                        <button className="nav-link">Events</button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => navigate("/account")}
                            className="w-10 h-10 rounded-full border-2 border-gray-100 overflow-hidden cursor-pointer hover:border-[#E8194B] transition-all"
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
                    </div>
                </nav>

                {/* HERO */}
                <section className="relative w-full overflow-hidden bg-cover bg-center py-6 px-6 md:px-12 lg:px-20"
                         style={{ backgroundImage: "url('/Cover7.jpg')" }}>
                    <div className="absolute inset-0 bg-black/40 z-0" />
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
                        <div>
                            <p className="text-gray-200 text-base font-600 mb-1">Welcome Back</p>
                            <h1 className="font-black leading-tight text-white mb-2" style={{ fontSize: "clamp(38px, 5vw, 62px)", lineHeight: 1.1 }}>
                                Hey, <span className="text-[#E8194B]">{profile?.stage_name || profile?.full_name || "Artist"}</span>
                            </h1>
                            <p className="text-gray-300 text-base">Explore the community and see what's trending.</p>
                            <div className="flex items-center gap-3 mt-7">
                                <div className="flex -space-x-2">
                                    {(stats.sample_avatars.length > 0 ? stats.sample_avatars : [
                                        // "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&q=80",
                                        // "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&q=80",
                                        // "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
                                        // "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=48&q=80",
                                        // "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&q=80",
                                    ]).slice(0, 5).map((src, i) => (
                                        <img key={i} src={src} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-300 font-500">
                                    {stats.total_artists > 100 ? "100+" : stats.total_artists} artists already joined
                                </p>
                            </div>
                        </div>
                        <div className="relative h-[350px] lg:h-[420px] flex items-center justify-end" />
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                BROWSE CATEGORIES
            ══════════════════════════════════════════════════ */}
                <section id="categories-section" className="w-full px-6 md:px-12 lg:px-20 mt-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="section-title">Browse Categories</h2>
                        </div>

                        {browseCategoriesLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {Array.from({ length: ALL_CATEGORIES_DATA.length }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-full aspect-[3/4] rounded-2xl bg-gray-100 animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : (
                            // ── FIX: Now iterates CategoryData objects — cat.name, cat.image, cat.description all work ──
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                <section id="artists-section" className="w-full px-6 md:px-12 lg:px-20 mt-14 overflow-hidden">
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
                            className="search-bar-wrap p-5 mb-10"
                            onSubmit={e => {
                                e.preventDefault();
                                runSearch();
                            }}
                        >
                            {/* Inputs row */}
                            <div className="flex flex-col md:flex-row items-stretch gap-0 bg-white rounded-xl overflow-hidden">
                                {/* What */}
                                <div className="flex items-center gap-3 flex-1 px-5 py-3.5 border-b md:border-b-0 md:border-r border-gray-200">
                                    <Search size={18} className="text-gray-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400 font-600">What are you looking for?</p>
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
                                        <p className="text-xs text-gray-400 font-600">Location</p>
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
                                        <p className="text-xs text-gray-400 font-600">Event Date</p>
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
                                        <p className="text-xs text-gray-400 font-600">Budget</p>
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
                                    className="btn-pink font-bold text-sm px-8 py-4 flex-shrink-0 md:rounded-r-xl"
                                >
                                    Search
                                </button>
                            </div>

                            {/* Category tag pills */}
                            <div className="flex flex-wrap gap-2 mt-4 px-1">
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

                {/* ══════════════════════════════════════════════════
                HOW IT WORKS
            ══════════════════════════════════════════════════ */}
                <section id="how-it-works" className="w-full px-6 md:px-12 lg:px-20 mt-16 py-14 bg-gray-50">
                    <div className="max-w-5xl mx-auto text-center">
                        <h2 className="section-title mb-14">How It Works</h2>
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="flex flex-col items-center flex-1">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-pink-50 border border-pink-100">
                                    <RefreshCw size={26} className="pink-text" />
                                </div>
                                <h3 className="font-800 text-gray-900 text-[17px] mb-2">Search</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Find the perfect artists for your event.</p>
                            </div>
                            <div className="flex flex-col items-center flex-1">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-pink-50 border border-pink-100">
                                    <GitCompare size={26} className="pink-text" />
                                </div>
                                <h3 className="font-800 text-gray-900 text-[17px] mb-2">Compare</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">View profiles, reviews and prices.</p>
                            </div>
                            <div className="flex flex-col items-center flex-1">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-pink-50 border border-pink-100">
                                    <BookOpen size={26} className="pink-text" />
                                </div>
                                <h3 className="font-800 text-gray-900 text-[17px] mb-2">Book</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Contact and book your favourite artist.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA SECTION - FOR ARTISTS */}
                <section id="join-section" className="dark-section w-full px-6 md:px-12 lg:px-20 py-14">
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
                                className="btn-pink flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                            >
                                Complete making your Account <ArrowRight size={15} />
                            </button>
                        </div>

                        <div className="relative flex justify-center">
                            <div
                                className="relative rounded-2xl overflow-hidden"
                                style={{ height: '260px', width: '100%' }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80"
                                    className="w-full h-full object-cover object-center"
                                    alt="Artist Performance"
                                    style={{ filter: 'brightness(0.75)' }}
                                />
                            </div>

                            <div className="cta-card absolute bottom-4 right-4 p-4 min-w-[180px]">
                                <p className="text-white font-800 text-sm mb-3">
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

                {/* ══════════════════════════════════════════════════
                PARTNER LOGOS
            ══════════════════════════════════════════════════ */}
                <section className="w-full h-1 py-10 px-6 md:px-12 lg:px-20 bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto">
                        <p className="text-center text-gray-400 text-sm mb-6 font-500">
                            Trusted by event planners and companies across Sri Lanka
                        </p>
                        {/*<div className="flex flex-wrap justify-center gap-10 opacity-40">*/}
                        {/*    {PARTNER_LOGOS.map(l => (*/}
                        {/*        <span key={l} className="font-black text-sm uppercase tracking-widest">{l}</span>*/}
                        {/*    ))}*/}
                        {/*</div>*/}
                    </div>
                </section>

                <Footer />
            </div>
        </div>
    );
}
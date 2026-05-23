import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getArtists, getCategories, getNearYou } from "../../customer/services/discoveryService";
import type { ArtistCard as DiscoveryArtist, ArtistSearchParams } from "../../customer/services/discoveryService";
import {
    Search, MapPin, Calendar, DollarSign, Heart, CheckCircle,
    ArrowRight, ChevronRight, ChevronLeft, Star, Users, Zap, Shield, TrendingUp,
    Mic2, Music2, PersonStanding, Radio, Camera, Lightbulb, Globe,
    Play, RefreshCw, GitCompare, BookOpen, X, Loader2
} from "lucide-react";

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

const FALLBACK_ARTIST_IMAGE =
    "https://images.unsplash.com/photo-1571935441008-e42d7f4a8f65?w=400&q=80";

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

async function fetchAllArtists(category?: string): Promise<Artist[]> {
    const artists: Artist[] = [];
    let page = 1;
    let lastPage = 1;

    do {
        const { data, meta } = await getArtists({
            per_page: 50,
            page,
            ...(category ? { category } : {}),
        });
        artists.push(...data.map(mapDiscoveryArtist));
        lastPage = meta?.last_page ?? 1;
        page++;
    } while (page <= lastPage);

    return artists;
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
        verified: extra.verification_status ? extra.verification_status === "approved" : true,
        startingPrice: a.starting_price,
        maxPrice: a.max_price,
    };
}

function getCategoryIcon(label: string): React.ReactNode {
    const key = label.toLowerCase();
    if (key.includes("dj")) return <Radio size={28} />;
    if (key.includes("sing") || key.includes("vocal")) return <Mic2 size={28} />;
    if (key.includes("band") || key.includes("music") || key.includes("producer")) return <Music2 size={28} />;
    if (key.includes("danc")) return <PersonStanding size={28} />;
    if (key.includes("sound")) return <Zap size={28} />;
    if (key.includes("host") || key.includes("mc") || key.includes("emcee")) return <Globe size={28} />;
    if (key.includes("light")) return <Lightbulb size={28} />;
    if (key.includes("photo") || key.includes("camera")) return <Camera size={28} />;
    if (key.includes("cultural") || key.includes("show") || key.includes("comed")) return <Star size={28} />;
    return <Music2 size={28} />;
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const NAV_LINKS = ["Explore", "Categories", "Artist", "Events", "How it works", "Join as Artist"];

const PARTNER_LOGOS = ["TAJ", "Shangri-La", "Cinnamon", "Hilton", "MOVENPICK", "Liga Escapes", "atogals"];

const CATEGORY_IMAGES: Record<string, string> = {
    "Musician": "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600&q=80",
    "Band & Duo": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80",
    "DJ": "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=600&q=80",
    "Dancer": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80",
    "Comedian": "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=600&q=80",
    "Photographer": "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80",
    "Producer": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80",
    "Singer": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80",
    "Sound System": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80"
};

const DEFAULT_CAT_IMAGE = "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=600&q=80";

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function HomePage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [location, setLocation] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [budget, setBudget] = useState("");
    const [defaultPopularArtists, setDefaultPopularArtists] = useState<Artist[]>([]);
    const [popularArtists, setPopularArtists] = useState<Artist[]>([]);
    const [selectedSearchCategory, setSelectedSearchCategory] = useState<string | null>(null);
    const [hasActiveSearch, setHasActiveSearch] = useState(false);
    const [popularArtistsLoading, setPopularArtistsLoading] = useState(false);
    const [browseCategories, setBrowseCategories] = useState<string[]>([]);
    const [browseCategoriesLoading, setBrowseCategoriesLoading] = useState(true);
    const [browseArtists, setBrowseArtists] = useState<Artist[]>([]);
    const [selectedBrowseCategory, setSelectedBrowseCategory] = useState<string | null>(null);
    const [browseArtistsLoading, setBrowseArtistsLoading] = useState(false);
    const [likedArtists, setLikedArtists] = useState<Set<string | number>>(new Set());
    const popularArtistsRef = useRef<HTMLDivElement>(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const scrollPopular = (direction: 'left' | 'right') => {
        if (!popularArtistsRef.current) return;
        const container = popularArtistsRef.current;
        const scrollAmount = container.clientWidth * 0.8;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
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
    }, []);

    useEffect(() => {
        setBrowseCategoriesLoading(true);
        getCategories()
            .then(setBrowseCategories)
            .catch(() => setBrowseCategories([]))
            .finally(() => setBrowseCategoriesLoading(false));
    }, []);

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

        // Clear entered data
        setSearchQuery("");
        setLocation("");
        setEventDate("");
        setBudget("");

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
            // "All" logic - immediate reset to default/all artists
            setSelectedSearchCategory(null);
            setHasActiveSearch(false);
            setPopularArtistsLoading(true);

            // Clear entered data
            setSearchQuery("");
            setLocation("");
            setEventDate("");
            setBudget("");

            try {
                setPopularArtists(defaultPopularArtists);
            } catch {
                setPopularArtists([]);
            } finally {
                setPopularArtistsLoading(false);
            }
            return;
        }

        // For other categories, just toggle the selection state
        // User must click "Search" button to see results
        setSelectedSearchCategory(prev => prev === category ? null : category);
    };

    const showAllPopularArtists = async () => {
        setHasActiveSearch(false);
        setSelectedSearchCategory(null);
        setSearchQuery("");
        setLocation("");
        setEventDate("");
        setBudget("");
        setPopularArtistsLoading(true);
        try {
            const artists = await fetchAllArtists();
            setPopularArtists(artists);
        } catch {
            setPopularArtists(defaultPopularArtists);
        } finally {
            setPopularArtistsLoading(false);
        }
    };

    const filterBrowseArtistsByCategory = (category: string) => {
        window.open(`/category?name=${encodeURIComponent(category)}`, '_blank');
    };

    const toggleLike = (id: string | number) => {
        setLikedArtists(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const renderArtistCard = (artist: Artist) => (
        <div key={artist.id} className="flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px] artist-card cursor-pointer" onClick={() => navigate(`/artist/${artist.id}`)}>
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "3/4" }}>
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
                    <div className="verified-dot">
                        <CheckCircle size={10} fill="white" strokeWidth={0} />
                    </div>
                )}
            </div>
            <div className="mt-2.5 px-0.5">
                <h3 className="font-800 text-gray-900 text-[15px] leading-tight truncate">{artist.name}</h3>
                <p className="text-gray-400 text-xs mt-0.5">{artist.type}</p>
                <div className="flex items-center gap-1 mt-1">
                    <MapPin size={11} className="text-gray-400" />
                    <span className="text-gray-400 text-xs">{artist.location}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <div className="rating-row">
                        <Star size={12} fill="#facc15" className="text-yellow-400" />
                        <span className="text-xs font-700 text-gray-800">{artist.rating}</span>
                        <span className="text-xs text-gray-400">({artist.reviews})</span>
                    </div>
                    <span className="text-xs font-800 pink-text">{artist.price}</span>
                </div>
            </div>
        </div>
    );

    const renderArtistSkeleton = (index: number) => (
        <div key={index} className="flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px] animate-pulse">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100" style={{ aspectRatio: "3/4" }} />
            <div className="mt-2.5 px-0.5 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="flex items-center gap-1 mt-1">
                    <div className="w-3 h-3 bg-gray-100 rounded-full" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-100 rounded-full" />
                        <div className="h-3 bg-gray-100 rounded w-8" />
                    </div>
                    <div className="h-3 bg-gray-100 rounded w-12" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Nunito', 'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        .pink { color: #E8194B; }
        .bg-pink { background-color: #E8194B; }
        .border-pink { border-color: #E8194B; }
        .btn-pink { background: #E8194B; color: #fff; transition: background 0.18s; }
        .btn-pink:hover { background: #c8133b; }
        .btn-dark { background: #111; color: #fff; transition: background 0.18s; }
        .btn-dark:hover { background: #222; }
        .artist-card { transition: transform 0.2s, box-shadow 0.2s; }
        .artist-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.13); }
        .cat-card-modern { 
            position: relative; 
            border-radius: 20px; 
            overflow: hidden; 
            aspect-ratio: 4/5;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cat-card-modern:hover {
            transform: scale(1.03);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .cat-card-modern:hover .cat-img {
            transform: scale(1.1);
        }
        .cat-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        .cat-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%);
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 20px;
        }
        .search-input { outline: none; }
        .search-input:focus { outline: none; }
        .hero-image-card { border-radius: 16px; overflow: hidden; }
        .nav-link { color: #444; font-weight: 500; font-size: 15px; transition: color 0.15s; }
        .nav-link:hover { color: #E8194B; }
        .search-bar-wrap { background: #1a1a1a; border-radius: 20px; }
        .divider-v { width: 1px; background: rgba(255,255,255,0.12); height: 36px; margin: auto 0; }
        .tag-pill { background: #f5f5f5; border-radius: 100px; padding: 6px 16px; font-size: 13px; font-weight: 600; color: #222; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: background 0.15s, color 0.15s; border: 1.5px solid #eee; }
        .tag-pill:hover { background: #fff0f3; color: #E8194B; border-color: #E8194B; }
        .tag-pill-active { background: #fff0f3; color: #E8194B; border-color: #E8194B; }
        .step-connector { flex: 1; height: 2px; background: repeating-linear-gradient(90deg, #E8194B 0, #E8194B 8px, transparent 8px, transparent 16px); margin: 0 8px; }
        .dark-section { background: #111; }
        .cta-card { background: #1a1a1a; border-radius: 20px; }
        .checklist-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #ddd; margin-bottom: 8px; }
        .verified-dot { position: absolute; bottom: 6px; left: 6px; background: #E8194B; border-radius: 100px; padding: 2px 6px; display: flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 700; color: #fff; }
        .rating-row { display: flex; align-items: center; gap: 4px; }
        .logo-strip { border-top: 1px solid #f0f0f0; }
        .section-title { font-size: clamp(22px, 3vw, 28px); font-weight: 800; color: #111; }
        .pink-text { color: #E8194B; }
        .card-see-all { color: #E8194B; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 2px; cursor: pointer; }
        .card-see-all:hover { text-decoration: underline; }
        .floating-badge { background: #fff; border-radius: 14px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); padding: 12px 18px; display: flex; align-items: center; gap: 10px; }
        .hero-bg-dots { background-image: radial-gradient(circle, #E8194B22 1.5px, transparent 1.5px); background-size: 24px 24px; }
        
        /* Offset for sticky navbar */
        section[id] {
            scroll-margin-top: 90px;
        }

        /* Carousel Styles */
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .carousel-btn {
            background: white;
            border: 1.5px solid #eee;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            z-index: 10;
        }
        .carousel-btn:hover {
            border-color: #E8194B;
            color: #E8194B;
            transform: scale(1.1);
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(232,25,75,0.3);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(232,25,75,0.5);
        }
      `}</style>

            {/* ══════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════ */}
            <nav className="w-full flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
                {/*/!* Logo *!/*/}
                {/*<Link to="/" className="flex items-center">*/}
                {/*    <img src="/Perfoma.png" alt="Perfoma" className="h-10 w-auto object-contain" />*/}
                {/*</Link>*/}

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 btn-pink rounded-xl flex items-center justify-center font-black text-white text-lg select-none">M</div>
                </div>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-7">
                    <button onClick={() => scrollToSection('categories-section')} className="nav-link">Categories</button>
                    <button onClick={() => scrollToSection('artists-section')} className="nav-link">Artist</button>
                    <button onClick={() => scrollToSection('artists-section')} className="nav-link">Explore</button>
                    <button onClick={() => scrollToSection('how-it-works')} className="nav-link">How it works</button>
                    <button onClick={() => scrollToSection('join-section')} className="nav-link">Join as Artist</button>
                    <button className="nav-link">Events</button>
                </div>

                {/* Auth */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/loginCustomer"
                        className="nav-link font-semibold text-sm px-3 py-1.5"
                    >
                        Log in
                    </Link>

                    <Link
                        to="/signupCustomer"
                        className="btn-pink text-sm font-bold px-5 py-2.5 rounded-xl"
                    >
                        Sign up
                    </Link>
                </div>
            </nav>

            {/* ══════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════ */}
            <section
                className="relative w-full overflow-hidden bg-cover bg-center py-12 px-6 md:px-12 lg:px-20"
                style={{ backgroundImage: "url('/Cover3.png')" }}
            >
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40 z-0" />

                {/* Pink dot background - top right */}
                <div className="hero-bg-dots absolute top-0 right-0 w-72 h-72 opacity-30 pointer-events-none z-10" />

                <div className="max-w-7xl mx-auto relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        {/* Left: Copy */}
                        <div className="z-10">
                            <p className="text-gray-200 text-base font-600 mb-1">Find & Book</p>
                            <h1 className="font-black leading-tight text-white" style={{ fontSize: "clamp(38px, 5vw, 62px)", lineHeight: 1.1 }}>
                                Sri Lanka's<br />
                                <span style={{ color: "#E8194B" }}>Best Artists</span>
                            </h1>
                            <p className="text-gray-300 mt-4 text-base leading-relaxed max-w-sm">
                                DJs, musicians, dancers, MCs, sound systems<br className="hidden sm:block" />
                                and event professionals – all in one platform.
                            </p>

                            <div className="flex flex-wrap gap-3 mt-8">
                                <button
                                    onClick={() => scrollToSection('artists-section')}
                                    className="btn-pink flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                                >
                                    Explore Artists <ArrowRight size={16} />
                                </button>

                                <Link
                                    to="/login"
                                    //className="btn-dark flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border border-gray-700"
                                    className="bg-white text-black flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border border-white hover:bg-gray-100 transition"
                                >
                                    Join as Artist
                                </Link>
                            </div>

                            {/* Social proof */}
                            <div className="flex items-center gap-3 mt-7">
                                <div className="flex -space-x-2">
                                    {[
                                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&q=80",
                                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&q=80",
                                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&q=80",
                                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=48&q=80",
                                        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&q=80",
                                    ].map((src, i) => (
                                        <img key={i} src={src} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-300 font-500">1,200+ artists already joined</p>
                            </div>
                        </div>

                        {/* Right: Collage */}
                        <div className="relative h-[420px] lg:h-[480px] flex items-center justify-end">
                            {/* Main large image */}
                            <div className="absolute right-0 top-0 w-[58%] h-[75%] hero-image-card z-10" style={{ borderRadius: "20px", overflow: "hidden" }}>
                                <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80" className="w-full h-full object-cover" alt="DJ" />
                            </div>

                            {/* Top right image */}
                            <div className="absolute right-[30%] top-[2%] w-[36%] h-[46%] hero-image-card z-20" style={{ borderRadius: "16px", overflow: "hidden" }}>
                                <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80" className="w-full h-full object-cover" alt="Singer" />
                            </div>

                            {/* Middle right image */}
                            <div className="absolute right-[28%] top-[48%] w-[34%] h-[42%] hero-image-card z-20" style={{ borderRadius: "16px", overflow: "hidden" }}>
                                <img src="https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&q=80" className="w-full h-full object-cover" alt="Dancer" />
                            </div>

                            {/* Bottom right image */}
                            <div className="absolute right-0 bottom-0 w-[40%] h-[35%] hero-image-card z-10" style={{ borderRadius: "16px", overflow: "hidden" }}>
                                <img src="https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&q=80" className="w-full h-full object-cover" alt="Band" />
                            </div>

                            {/* Floating badge – Rating */}
                            <div className="floating-badge absolute left-2 top-[10%] z-30 min-w-[130px]">
                                <Star size={18} fill="#facc15" className="text-yellow-400 flex-shrink-0" />
                                <div>
                                    <p className="font-black text-gray-900 text-base leading-none">4.9</p>
                                    <p className="text-gray-400 text-xs mt-0.5">Average Rating</p>
                                </div>
                            </div>

                            {/* Floating badge – Artists */}
                            <div className="floating-badge absolute left-2 top-[42%] z-30 min-w-[140px]">
                                <div className="w-8 h-8 btn-pink rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Users size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-base leading-none">1,200+</p>
                                    <p className="text-gray-400 text-xs mt-0.5">Professional Artists</p>
                                </div>
                            </div>

                            {/* Floating badge – Events */}
                            <div className="floating-badge absolute left-2 bottom-[12%] z-30 min-w-[140px]">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#f0f0f0" }}>
                                    <TrendingUp size={16} className="text-gray-700" />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-base leading-none">3,400+</p>
                                    <p className="text-gray-400 text-xs mt-0.5">Events Booked</p>
                                </div>
                            </div>
                        </div>
                    </div>
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="aspect-[3/4] rounded-[30px] bg-gray-100 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {browseCategories.map(cat => (
                                <div
                                    key={cat}
                                    className="cat-card-modern group"
                                    onClick={() => filterBrowseArtistsByCategory(cat)}
                                >
                                    <img
                                        src={CATEGORY_IMAGES[cat] || DEFAULT_CAT_IMAGE}
                                        className="cat-img"
                                        alt={cat}
                                    />
                                    <div className="cat-overlay">
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 group-hover:bg-pink transition-colors">
                                            {getCategoryIcon(cat)}
                                        </div>
                                        <h3 className="text-white font-900 text-lg leading-tight">{cat}</h3>
                                        <p className="text-white/60 text-xs mt-1 font-600">Explore Artists</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>


            {/* ══════════════════════════════════════════════════
          POPULAR ARTISTS
      ══════════════════════════════════════════════════ */}
            <section id="artists-section" className="w-full px-6 md:px-12 lg:px-20 mt-14 overflow-hidden">
                <div className="max-w-7xl mx-auto relative group">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="section-title">
                            {hasActiveSearch ? "Search Results" : "Artist"}
                        </h2>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => scrollPopular('left')}
                                className="carousel-btn"
                                aria-label="Previous"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => scrollPopular('right')}
                                className="carousel-btn"
                                aria-label="Next"
                            >
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
                                        className="search-input w-full text-sm text-gray-700 font-600 placeholder-gray-300 bg-transparent border-none"
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
                                        placeholder="All Sri Lanka ˅"
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        className="search-input w-full text-sm text-gray-700 font-600 placeholder-gray-300 bg-transparent border-none"
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
                                        className="search-input w-full text-sm text-gray-700 font-600 placeholder-gray-300 bg-transparent border-none"
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
                                        placeholder="Any Budget ˅"
                                        value={budget}
                                        onChange={e => setBudget(e.target.value)}
                                        className="search-input w-full text-sm text-gray-700 font-600 placeholder-gray-300 bg-transparent border-none"
                                    />
                                </div>
                            </div>

                            {/* Button */}
                            <button
                                type="submit"
                                className="btn-pink font-bold text-sm px-8 py-4 flex-shrink-0 md:rounded-r-xl"
                            >
                                Search
                            </button>
                        </div>

                        {/* Category tags */}
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
                                    {browseCategories.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => handleSearchCategoryClick(cat)}
                                            className={`tag-pill${selectedSearchCategory === cat ? " tag-pill-active" : ""}`}
                                        >
                                            <span className="w-4 h-4 rounded-full inline-block" style={{ background: "rgba(232,25,75,0.15)" }} />
                                            {cat}
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    </form>

                    {popularArtistsLoading ? (
                        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-8 pt-2">
                            {[1, 2, 3, 4, 5].map(i => renderArtistSkeleton(i))}
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
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-center section-title mb-14">How It Works</h2>

                    <div className="flex flex-col md:flex-row items-center gap-0">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center flex-1 px-4">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(232,25,75,0.10)", border: "2px solid rgba(232,25,75,0.2)" }}>
                                <RefreshCw size={26} style={{ color: "#E8194B" }} />
                            </div>
                            <h3 className="font-800 text-gray-900 text-[17px] mb-2">Search</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Find the perfect artists for your event.</p>
                        </div>

                        {/* Connector */}
                        <div className="step-connector hidden md:block" />

                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center flex-1 px-4 mt-8 md:mt-0">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(232,25,75,0.10)", border: "2px solid rgba(232,25,75,0.2)" }}>
                                <GitCompare size={26} style={{ color: "#E8194B" }} />
                            </div>
                            <h3 className="font-800 text-gray-900 text-[17px] mb-2">Compare</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">View profiles, reviews and prices.</p>
                        </div>

                        {/* Connector */}
                        <div className="step-connector hidden md:block" />

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center flex-1 px-4 mt-8 md:mt-0">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(232,25,75,0.10)", border: "2px solid rgba(232,25,75,0.2)" }}>
                                <BookOpen size={26} style={{ color: "#E8194B" }} />
                            </div>
                            <h3 className="font-800 text-gray-900 text-[17px] mb-2">Book</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Contact and book your favourite artist.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
          CTA SECTION (dark)
      ══════════════════════════════════════════════════ */}
            <section id="join-section" className="dark-section w-full px-6 md:px-12 lg:px-20 py-14 mt-0">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

                    {/* Left: Artists CTA */}
                    <div>
                        <p className="pink-text text-xs font-700 uppercase tracking-widest mb-2">For Artists</p>
                        <h2 className="text-white font-black text-2xl md:text-3xl leading-tight mb-3">
                            Turn Your Talent<br />Into a Business
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Join thousands of artists and grow your brand, reach more clients and get booked.
                        </p>

                        <button
                            onClick={() => navigate("/login")}
                            className="btn-pink flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm">
                            Join as Artist <ArrowRight size={15} />
                        </button>
                    </div>

                    {/* Center: Hero image + checklist card */}
                    <div className="relative flex justify-center">
                        <div className="relative rounded-2xl overflow-hidden" style={{ height: "260px", width: "100%" }}>
                            <img
                                src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80"
                                className="w-full h-full object-cover object-top"
                                alt="Artist"
                                style={{ filter: "brightness(0.75)" }}
                            />
                        </div>
                        {/* Checklist floating card */}
                        <div className="cta-card absolute bottom-4 right-4 p-4 min-w-[180px]">
                            <p className="text-white font-800 text-sm mb-3">Get More Bookings</p>
                            {["Verified Profile", "Direct Leads", "Secure Payments", "Grow Your Fanbase"].map(item => (
                                <div key={item} className="checklist-item">
                                    <CheckCircle size={15} style={{ color: "#E8194B", flexShrink: 0 }} />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Customers CTA */}
                    <div>
                        <p className="pink-text text-xs font-700 uppercase tracking-widest mb-2">For Customers</p>
                        <h2 className="text-white font-black text-2xl md:text-3xl leading-tight mb-3">
                            Make Every Event<br />Unforgettable
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Book the best local talent for weddings, parties, corporate events and more.
                        </p>
                        <button
                            onClick={() => navigate("/loginCustomer")}
                            className="btn-pink flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm">
                            Find Artists <ArrowRight size={15} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
          PARTNER LOGOS
      ══════════════════════════════════════════════════ */}
            <section className="logo-strip w-full px-6 md:px-12 lg:px-20 py-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <p className="text-center text-gray-400 text-sm mb-6 font-500">
                        Trusted by event planners and companies across Sri Lanka
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                        {PARTNER_LOGOS.map(logo => (
                            <span key={logo} className="text-gray-400 font-800 text-sm md:text-base tracking-wide uppercase opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                {logo}
              </span>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
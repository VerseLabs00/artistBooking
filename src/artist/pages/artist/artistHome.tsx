import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getArtists, getCategories, getNearYou } from "../../../customer/services/discoveryService";
import type { ArtistCard as DiscoveryArtist, ArtistSearchParams } from "../../../customer/services/discoveryService";
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

interface Profile {
    avatar_url?: string;
    stage_name?: string;
    full_name?: string;
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
const PARTNER_LOGOS = ["TAJ", "Shangri-La", "Cinnamon", "Hilton", "MOVENPICK", "Liga Escapes", "atogals"];

export default function ArtistHome() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

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
    const [likedArtists, setLikedArtists] = useState<Set<string | number>>(new Set());
    const popularArtistsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchProfile();
        
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

        setBrowseCategoriesLoading(true);
        getCategories()
            .then(setBrowseCategories)
            .catch(() => setBrowseCategories([]))
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

    const getCategoryIcon = (label: string): React.ReactNode => {
        const key = label.toLowerCase();
        if (key.includes("dj")) return <Radio size={18} className="text-white" />;
        if (key.includes("sing") || key.includes("vocal")) return <Mic2 size={18} className="text-white" />;
        if (key.includes("band") || key.includes("music")) return <Music2 size={18} className="text-white" />;
        if (key.includes("danc")) return <PersonStanding size={18} className="text-white" />;
        if (key.includes("mc") || key.includes("host")) return <Mic2 size={18} className="text-white" />;
        return <Star size={18} className="text-white" />;
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

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
            <style>{`
                .btn-pink { background: #E8194B; color: white; transition: all 0.2s ease; }
                .btn-pink:hover { background: #d11643; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(232, 25, 75, 0.2); }
                .nav-link { font-size: 0.875rem; font-weight: 500; color: #4b5563; transition: color 0.2s; cursor: pointer; }
                .nav-link:hover { color: #E8194B; }
                .section-title { font-size: 24px; font-weight: 900; color: #111827; letter-spacing: -0.02em; }
                .cat-card-modern { position: relative; aspect-ratio: 3/4; border-radius: 30px; overflow: hidden; cursor: pointer; }
                .cat-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
                .cat-card-modern:hover .cat-img { transform: scale(1.1); }
                .cat-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%); display: flex; flex-direction: column; justify-content: flex-end; padding: 20px; }
                .carousel-btn { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #f3f4f6; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: white; text-gray-400 hover:text-[#E8194B] transition-all shadow-sm; }
                .search-bar-wrap { background: #1a1a1a; border-radius: 20px; }
                .tag-pill { background: #f5f5f5; border-radius: 100px; padding: 6px 16px; font-size: 13px; font-weight: 600; color: #222; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: background 0.15s, color 0.15s; border: 1.5px solid #eee; }
                .tag-pill:hover { background: #fff0f3; color: #E8194B; border-color: #E8194B; }
                .tag-pill-active { background: #fff0f3; color: #E8194B; border-color: #E8194B; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .pink-text { color: #E8194B; }
                .verified-dot { position: absolute; bottom: 8px; right: 8px; background: #3b82f6; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; border: 2px solid white; }
                .rating-row { display: flex; align-items: center; gap: 4px; }
                .hero-bg-dots { background-image: radial-gradient(#E8194B 1px, transparent 1px); background-size: 20px 20px; }
                .search-input { outline: none; }
                .search-input:focus { outline: none; }
            `}</style>

            {/* NAVBAR */}
            <nav className="w-full flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/artistHome")}>
                    <div className="w-9 h-9 btn-pink rounded-xl flex items-center justify-center font-black text-white text-lg select-none">M</div>
                </div>

                <div className="hidden md:flex items-center gap-7">
                    <button onClick={() => scrollToSection('categories-section')} className="nav-link">Categories</button>
                    <button onClick={() => scrollToSection('artists-section')} className="nav-link">Artist</button>
                    <button onClick={() => scrollToSection('artists-section')} className="nav-link">Explore</button>
                    <button onClick={() => scrollToSection('how-it-works')} className="nav-link">How it works</button>
                    <button className="nav-link">Events</button>
                </div>

                <div className="flex items-center gap-3">
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
                </div>
            </nav>

            {/*hero*/}
            <section className="relative w-full overflow-hidden bg-cover bg-center py-12 px-6 md:px-12 lg:px-20"
                     style={{ backgroundImage: "url('/Cover7.jpg')" }}>
                <div className="hero-bg-dots absolute top-0 right-0 w-72 h-72 opacity-60 pointer-events-none" />
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div className="z-10">
                        <h1 className="font-black leading-tight text-gray-900 mb-2" style={{ fontSize: "clamp(28px, 3vw, 42px)" }}>
                            Welcome Back, <span className="text-[#E8194B]">{profile?.stage_name || profile?.full_name || "Artist"}</span>
                        </h1>
                        <p className="text-gray-500 text-base">Explore the community and see what's trending.</p>
                        <div className="flex items-center gap-3 mt-7">
                            <div className="flex -space-x-2">
                                {[
                                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&q=80",
                                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&q=80",
                                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
                                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=48&q=80",
                                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&q=80",
                                ].map((src, i) => (
                                    <img key={i} src={src} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 font-500">1,200+ artists already joined</p>
                        </div>
                    </div>
                    <div className="relative h-[420px] lg:h-[480px] flex items-center justify-end">
                        {/*<div className="absolute right-0 top-0 w-[58%] h-[75%] z-10" style={{ borderRadius: "20px", overflow: "hidden" }}>*/}
                        {/*    <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80" className="w-full h-full object-cover" alt="DJ" />*/}
                        {/*</div>*/}
                        {/*<div className="absolute right-[30%] top-[2%] w-[36%] h-[46%] z-20" style={{ borderRadius: "16px", overflow: "hidden" }}>*/}
                        {/*    <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80" className="w-full h-full object-cover" alt="Singer" />*/}
                        {/*</div>*/}
                        {/*<div className="absolute right-[28%] top-[48%] w-[34%] h-[42%] z-20" style={{ borderRadius: "16px", overflow: "hidden" }}>*/}
                        {/*    <img src="https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&q=80" className="w-full h-full object-cover" alt="Dancer" />*/}
                        {/*</div>*/}
                        {/*<div className="absolute right-0 bottom-0 w-[40%] h-[35%] z-10" style={{ borderRadius: "16px", overflow: "hidden" }}>*/}
                        {/*    <img src="https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&q=80" className="w-full h-full object-cover" alt="Band" />*/}
                        {/*</div>*/}
                        {/*<div className="bg-white p-3 rounded-2xl shadow-xl absolute left-2 top-[10%] z-30 flex items-center gap-3 min-w-[130px]">*/}
                        {/*    <Star size={18} fill="#facc15" className="text-yellow-400" />*/}
                        {/*    <div><p className="font-black text-gray-900 text-base leading-none">4.9</p><p className="text-gray-400 text-xs mt-0.5">Average Rating</p></div>*/}
                        {/*</div>*/}
                        {/*<div className="bg-white p-3 rounded-2xl shadow-xl absolute left-2 top-[42%] z-30 flex items-center gap-3 min-w-[140px]">*/}
                        {/*    <div className="w-8 h-8 btn-pink rounded-lg flex items-center justify-center"><Users size={16} className="text-white" /></div>*/}
                        {/*    <div><p className="font-black text-gray-900 text-base leading-none">1,200+</p><p className="text-gray-400 text-xs mt-0.5">Professional Artists</p></div>*/}
                        {/*</div>*/}
                        {/*<div className="bg-white p-3 rounded-2xl shadow-xl absolute left-2 bottom-[12%] z-30 flex items-center gap-3 min-w-[140px]">*/}
                        {/*    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100"><TrendingUp size={16} className="text-gray-700" /></div>*/}
                        {/*    <div><p className="font-black text-gray-900 text-base leading-none">3,400+</p><p className="text-gray-400 text-xs mt-0.5">Events Booked</p></div>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </section>

            <section id="categories-section" className="w-full px-6 md:px-12 lg:px-20 mt-16">
                <div className="max-w-7xl mx-auto">
                    <h2 className="section-title mb-8">Browse Categories</h2>
                    {browseCategoriesLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="aspect-[3/4] rounded-[30px] bg-gray-100 animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {browseCategories.map(cat => (
                                <div key={cat} className="cat-card-modern group" onClick={() => filterBrowseArtistsByCategory(cat)}>
                                    <img src={CATEGORY_IMAGES[cat] || DEFAULT_CAT_IMAGE} className="cat-img" alt={cat} />
                                    <div className="cat-overlay">
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 group-hover:bg-pink transition-colors">{getCategoryIcon(cat)}</div>
                                        <h3 className="text-white font-900 text-lg leading-tight">{cat}</h3>
                                        <p className="text-white/60 text-xs mt-1 font-600">Explore Artists</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

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
                                <span className="text-xs text-gray-500">Loading categories...</span>
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
                        <p className="text-sm text-gray-400 py-6 text-center">Loading artists...</p>
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

            <section id="how-it-works" className="w-full px-6 md:px-12 lg:px-20 mt-16 py-14 bg-gray-50">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="section-title mb-14">How It Works</h2>
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-pink-50 border border-pink-100"><RefreshCw size={26} className="pink-text" /></div>
                            <h3 className="font-800 text-gray-900 text-[17px] mb-2">Search</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Find the perfect artists for your event.</p>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-pink-50 border border-pink-100"><GitCompare size={26} className="pink-text" /></div>
                            <h3 className="font-800 text-gray-900 text-[17px] mb-2">Compare</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">View profiles, reviews and prices.</p>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-pink-50 border border-pink-100"><BookOpen size={26} className="pink-text" /></div>
                            <h3 className="font-800 text-gray-900 text-[17px] mb-2">Book</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Contact and book your favourite artist.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full py-10 px-6 md:px-12 lg:px-20 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-10 opacity-40">
                    {PARTNER_LOGOS.map(l => <span key={l} className="font-black text-sm uppercase tracking-widest">{l}</span>)}
                </div>
            </section>
        </div>
    );
}

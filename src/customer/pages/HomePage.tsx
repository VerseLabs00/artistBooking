import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Search, MapPin, Calendar, DollarSign, Heart, CheckCircle,
    ArrowRight, ChevronRight, ChevronLeft, Star, Users, Zap, Shield, TrendingUp,
    Mic2, Music2, PersonStanding, Radio, Camera, Lightbulb, Globe,
    Play, RefreshCw, GitCompare, BookOpen, X, Loader2
} from "lucide-react";
import Footer from "../components/Footer";
import { getArtists, getCategories, getNearYou } from "../services/discoveryService";
import type { ArtistCard as DiscoveryArtist, ArtistSearchParams } from "../services/discoveryService";
import ArtistProfile from "./ArtistProfile";

// ─── TYPES & CONSTANTS ───────────────────────────────────────────────────────
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

interface CategoryData {
    name: string;
    description: string;
    image: string;
}

const FALLBACK_ARTIST_IMAGE =
    "https://images.unsplash.com/photo-1571935441008-e42d7f4a8f65?w=400&q=80";

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

const CATEGORY_IMAGES: Record<string, string> = {
    "DJ": "https://images.unsplash.com/photo-1571266028243-e4bb33392c64?q=80&w=800&auto=format&fit=crop",
    "Live Band": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop",
    "Solo Singer": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800&auto=format&fit=crop",
    "Dance Group": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop",
    "Videographers": "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=800&auto=format&fit=crop",
    "Musician": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
    "Rapper": "https://images.unsplash.com/photo-1508919892451-4b8495b46321?q=80&w=800&auto=format&fit=crop",
    "Producer": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80"
};

const DEFAULT_CAT_IMAGE = "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=600&q=80";

const PARTNER_LOGOS = ["TAJ", "Shangri-La", "Cinnamon", "Hilton", "MOVENPICK", "Liga Escapes", "atogals"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
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

function applyClientSearchFilters(artists: Artist[], filters: ArtistSearchFilters): Artist[] {
    let result = artists;
    if (filters.category) {
        result = result.filter(a => a.type === filters.category);
    }
    if (filters.location?.trim()) {
        const loc = filters.location.trim().toLowerCase();
        result = result.filter(a => a.location.toLowerCase().includes(loc));
    }
    if (filters.budget != null) {
        result = result.filter(a => a.startingPrice === null || a.startingPrice <= filters.budget!);
    }
    return result;
}

async function fetchArtistsWithFilters(filters: ArtistSearchFilters): Promise<Artist[]> {
    const byId = new Map<string | number, Artist>();
    const addArtists = (list: DiscoveryArtist[]) => {
        list.forEach(a => {
            if (!byId.has(a.id)) byId.set(a.id, mapDiscoveryArtist(a));
        });
    };

    if (filters.search?.trim()) {
        const { data } = await getArtists({ search: filters.search.trim(), per_page: 50 });
        addArtists(data);
    }

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
        }, 500);
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

    const scrollPopular = (direction: 'left' | 'right') => {
        if (!popularArtistsRef.current) return;
        const container = popularArtistsRef.current;
        const scrollAmount = container.clientWidth * 0.8;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    useEffect(() => {
        setPopularArtistsLoading(true);
        getArtists({ per_page: 50 })
            .then(({ data }) => {
                const mapped = data.map(mapDiscoveryArtist);
                setDefaultPopularArtists(mapped);
                setPopularArtists(mapped);
            })
            .catch(() => {
                setDefaultPopularArtists([]);
                setPopularArtists([]);
            })
            .finally(() => setPopularArtistsLoading(false));
    }, []);

    useEffect(() => {
        setBrowseCategoriesLoading(true);
        getCategories()
            .then(cats => {
                const existingNames = ALL_CATEGORIES_DATA.map(c => c.name);
                const newCats = cats
                    .filter(c => !existingNames.includes(c))
                    .map(c => ({
                        name: c,
                        description: `Explore professional ${c.toLowerCase()} for your next event.`,
                        image: DEFAULT_CAT_IMAGE
                    }));
                setBrowseCategories([...ALL_CATEGORIES_DATA, ...newCats]);
            })
            .catch(() => setBrowseCategories(ALL_CATEGORIES_DATA))
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
            try {
                setPopularArtists(defaultPopularArtists);
            } catch {
                setPopularArtists([]);
            } finally {
                setPopularArtistsLoading(false);
            }
            return;
        }
        setSelectedSearchCategory(prev => prev === category ? null : category);
    };

    const filterBrowseArtistsByCategory = (category: string) => {
        window.open(`/categoryCustomer?name=${encodeURIComponent(category)}`, '_blank');
    };

    const toggleLike = (id: string | number) => {
        setLikedArtists(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
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
                    <div className="verified-dot">
                        <CheckCircle size={10} fill="white" strokeWidth={0} />
                    </div>
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
            aspect-ratio: 3/4;
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
        .search-input { outline: none; background: transparent; border: none; width: 100%; }
        .hero-image-card { border-radius: 16px; overflow: hidden; }
        .search-bar-wrap { background: #1a1a1a; border-radius: 20px; }
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
        .floating-badge { background: #fff; border-radius: 14px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); padding: 12px 18px; display: flex; align-items: center; gap: 10px; }
        .hero-bg-dots { background-image: radial-gradient(circle, #E8194B22 1.5px, transparent 1.5px); background-size: 24px 24px; }
        
        .nav-link { color: #444; font-weight: 500; font-size: 15px; transition: color 0.15s; cursor: pointer; }
        .nav-link:hover { color: #E8194B; }

        /* Carousel Styles */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
        .carousel-btn:hover { border-color: #E8194B; color: #E8194B; transform: scale(1.1); }
        
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideDown { from { transform: translateY(0); } to { transform: translateY(100%); } }
        .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0, 0, 0.2, 1) forwards; }
        .animate-slide-down { animation: slideDown 0.5s cubic-bezier(0, 0, 0.2, 1) forwards; }
        .blur-bg { filter: blur(8px); transition: filter 0.5s ease; }
      `}</style>

            {/* Profile Overlay */}
            {selectedArtistId && (
                <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-500 ${isClosingProfile ? 'opacity-0' : 'opacity-100'}`}>
                    <div className={`max-w-5xl w-full h-full bg-white shadow-[0_0_60px_rgba(0,0,0,0.3)] overflow-hidden ${isClosingProfile ? 'animate-slide-down' : 'animate-slide-up'}`}>
                        <ArtistProfile id={selectedArtistId} onClose={handleCloseProfile} />
                    </div>
                </div>
            )}

            <div className={`transition-all duration-500 ${selectedArtistId ? 'blur-bg scale-[0.98]' : ''}`}>
                {/* NAVBAR */}
                <nav className="w-full flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <img src="/logoBlack.svg" alt="Perfoma" className="h-10 w-auto object-contain" />
                    </Link>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-7">
                        <button onClick={() => scrollToSection('categories-section')} className="nav-link">Categories</button>
                        <button onClick={() => scrollToSection('artists-section')} className="nav-link">Explore</button>
                        <button onClick={() => scrollToSection('how-it-works')} className="nav-link">How it works</button>
                        <button onClick={() => scrollToSection('join-section')} className="nav-link">Join as Artist</button>
                        <button className="nav-link">Events</button>
                    </div>

                    {/* Auth / Account */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/customerAccount')} className="nav-link font-semibold text-sm px-3 py-1.5">Account</button>
                        <button onClick={() => navigate('/loginCustomer')} className="btn-pink text-sm font-bold px-5 py-2.5 rounded-xl">Sign out</button>
                    </div>
                </nav>

                {/* HERO SECTION */}
                <section
                    className="relative w-full overflow-hidden bg-cover bg-center py-24 px-6 md:px-12 lg:px-20"
                    style={{ backgroundImage: "url('/Cover7.jpg')" }}
                >
                    <div className="absolute inset-0 bg-black/40 z-0" />
                    <div className="hero-bg-dots absolute top-0 right-0 w-72 h-72 opacity-30 pointer-events-none z-10" />

                    <div className="max-w-7xl mx-auto relative z-20">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
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
                                    <p className="text-sm text-gray-200 font-500">1,200+ artists already joined</p>
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {Array.from({ length: ALL_CATEGORIES_DATA.length }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-full aspect-[3/4] rounded-2xl bg-gray-100 animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : (
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
                                            {/*<p className="text-white/60 text-[9px] mt-2 font-600 uppercase tracking-wider">Explore Artists</p>*/}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* POPULAR ARTISTS */}
                <section id="artists-section" className="w-full px-6 md:px-12 lg:px-20 mt-14 overflow-hidden">
                    <div className="max-w-7xl mx-auto relative group">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="section-title">
                                {hasActiveSearch ? "Search Results" : "Artist"}
                            </h2>
                            <div className="flex items-center gap-3">
                                <button onClick={() => scrollPopular('left')} className="carousel-btn"><ChevronLeft size={20} /></button>
                                <button onClick={() => scrollPopular('right')} className="carousel-btn"><ChevronRight size={20} /></button>
                            </div>
                        </div>

                        <form
                            className="search-bar-wrap p-5 mb-10"
                            onSubmit={e => {
                                e.preventDefault();
                                runSearch();
                            }}
                        >
                            <div className="flex flex-col md:flex-row items-stretch gap-0 bg-white rounded-xl overflow-hidden">
                                <div className="flex items-center gap-3 flex-1 px-5 py-3.5 border-b md:border-b-0 md:border-r border-gray-200">
                                    <Search size={18} className="text-gray-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400 font-600">What are you looking for?</p>
                                        <input
                                            type="text"
                                            placeholder="DJs, Singers, Bands..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="search-input text-sm text-gray-700 font-600 placeholder-gray-300"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-1 px-5 py-3.5 border-b md:border-b-0 md:border-r border-gray-200">
                                    <MapPin size={18} className="text-gray-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400 font-600">Location</p>
                                        <input
                                            type="text"
                                            placeholder="All Sri Lanka"
                                            value={location}
                                            onChange={e => setLocation(e.target.value)}
                                            className="search-input text-sm text-gray-700 font-600 placeholder-gray-300"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-1 px-5 py-3.5 border-b md:border-b-0 md:border-r border-gray-200">
                                    <Calendar size={18} className="text-gray-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400 font-600">Event Date</p>
                                        <input
                                            type="date"
                                            value={eventDate}
                                            min={new Date().toISOString().split("T")[0]}
                                            onChange={e => setEventDate(e.target.value)}
                                            className="search-input text-sm text-gray-700 font-600 placeholder-gray-300"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-1 px-5 py-3.5">
                                    <DollarSign size={18} className="text-gray-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400 font-600">Budget</p>
                                        <input
                                            type="text"
                                            placeholder="Any Budget"
                                            value={budget}
                                            onChange={e => setBudget(e.target.value)}
                                            className="search-input text-sm text-gray-700 font-600 placeholder-gray-300"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-pink font-bold text-sm px-8 py-4">Search</button>
                            </div>

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
                                {hasActiveSearch ? "No artists match your search." : "No artists found."}
                            </p>
                        ) : (
                            <div ref={popularArtistsRef} className="flex gap-4 overflow-x-auto hide-scrollbar pb-8 pt-2">
                                {popularArtists.map(renderArtistCard)}
                            </div>
                        )}
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section id="how-it-works" className="w-full px-6 md:px-12 lg:px-20 mt-16 py-14 bg-gray-50">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-center section-title mb-14">How It Works</h2>
                        <div className="flex flex-col md:flex-row items-center">
                            {[
                                { icon: <RefreshCw size={26} style={{ color: '#E8194B' }} />, title: 'Search', desc: 'Find the perfect artists for your event.' },
                                { icon: <GitCompare size={26} style={{ color: '#E8194B' }} />, title: 'Compare', desc: 'View profiles, reviews and prices.' },
                                { icon: <BookOpen size={26} style={{ color: '#E8194B' }} />, title: 'Book', desc: 'Contact and book your favourite artist.' },
                            ].map((step, i) => (
                                <div key={step.title} className="flex flex-col md:flex-row items-center flex-1">
                                    <div className="flex flex-col items-center text-center flex-1 px-4 mt-8 md:mt-0">
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: 'rgba(232,25,75,0.10)', border: '2px solid rgba(232,25,75,0.2)' }}>
                                            {step.icon}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-[17px] mb-2">{step.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                    {i < 2 && <div className="step-connector hidden md:block" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA SECTION */}
                <section id="join-section" className="dark-section w-full px-6 md:px-12 lg:px-20 py-14">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <p className="pink-text text-xs font-bold uppercase tracking-widest mb-2">For Customers</p>
                            <h2 className="text-white font-black text-2xl md:text-3xl leading-tight mb-3">
                                Make Every Event<br />Unforgettable
                            </h2>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Book the best local talent for weddings, parties, corporate events and more.
                            </p>
                            <button onClick={() => navigate('/home')} className="btn-pink flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm">
                                Find Artists <ArrowRight size={15} />
                            </button>
                        </div>

                        <div className="relative flex justify-center">
                            <div className="relative rounded-2xl overflow-hidden" style={{ height: '260px', width: '100%' }}>
                                <img
                                    src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80"
                                    className="w-full h-full object-cover object-top"
                                    alt="Artist"
                                    style={{ filter: 'brightness(0.75)' }}
                                />
                            </div>
                            <div className="cta-card absolute bottom-4 right-4 p-4 min-w-[180px]">
                                <p className="text-white font-bold text-sm mb-3">Why Book With Us</p>
                                {['Verified Artists', 'Secure Payments', 'Easy Booking', '24/7 Support'].map(item => (
                                    <div key={item} className="checklist-item">
                                        <CheckCircle size={15} style={{ color: '#E8194B', flexShrink: 0 }} />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* PARTNER LOGOS */}
                <section className="logo-strip w-full px-6 md:px-12 lg:px-20 py-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <p className="text-center text-gray-400 text-sm mb-6">Trusted by event planners and companies across Sri Lanka</p>
                        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                            {PARTNER_LOGOS.map(logo => (
                                <span key={logo} className="text-gray-400 font-bold text-sm md:text-base tracking-wide uppercase opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                                {logo}
                            </span>
                            ))}
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </div>
    );
}

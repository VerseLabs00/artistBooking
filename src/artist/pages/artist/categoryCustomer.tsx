import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getArtists } from "../../../customer/services/discoveryService";
import {
    MapPin, Heart, CheckCircle, Star, Search, ChevronDown
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
    startingPrice: number | null;
    image: string;
    verified: boolean;
}

const categoryImages: Record<string, string> = {
    "DJs": "https://images.unsplash.com/photo-1571266028243-e4bb33392c64?q=80&w=800&auto=format&fit=crop",
    "Bands": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop",
    "Singers": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800&auto=format&fit=crop",
    "Dancers": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop",
    "Photography": "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=800&auto=format&fit=crop",
};

const locations = ["All Sri Lanka", "Colombo", "Kandy", "Galle", "Negombo", "Jaffna"];

export default function DJsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const categoryName = searchParams.get("name") || "DJs";

    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLocations, setSelectedLocations] = useState<string[]>(["All Sri Lanka"]);
    const [priceMin, setPriceMin] = useState("0");
    const [priceMax, setPriceMax] = useState("200,000");
    const [rating, setRating] = useState("any");
    const [favs, setFavs] = useState<Set<string | number>>(new Set());
    const [sortBy, setSortBy] = useState("Most Popular");

    useEffect(() => {
        setLoading(true);
        getArtists({ category: categoryName, per_page: 50 })
            .then(({ data }) => {
                const mapped = data.map((a) => {
                    const extra = a as any;
                    const defaultImg = categoryImages[categoryName] || categoryImages["DJs"];
                    return {
                        id: a.id,
                        name: a.stage_name || "Artist",
                        type: a.category || categoryName,
                        location: a.location || "Sri Lanka",
                        rating: extra.average_rating ?? extra.rating?.average ?? 4.8,
                        reviews: extra.reviews_count ?? extra.rating?.total ?? 0,
                        price: a.starting_price ? `Rs. ${a.starting_price.toLocaleString()}+` : "Contact",
                        startingPrice: a.starting_price,
                        image: a.avatar_url || a.cover_url || defaultImg,
                        verified: extra.verification_status === "approved" || true,
                    };
                });
                setArtists(mapped);
            })
            .catch(err => {
                console.error("Failed to fetch artists:", err);
                setArtists([]);
            })
            .finally(() => setLoading(false));
    }, [categoryName]);

    useEffect(() => {
        if (artists.length === 0) return;

        const sorted = [...artists].sort((a, b) => {
            switch (sortBy) {
                case "Most Popular":
                    return (b.reviews || 0) - (a.reviews || 0);
                case "Price: Low to High":
                    return (a.startingPrice ?? Infinity) - (b.startingPrice ?? Infinity);
                case "Price: High to Low":
                    return (b.startingPrice ?? 0) - (a.startingPrice ?? 0);
                case "Highest Rated":
                    return (b.rating || 0) - (a.rating || 0);
                default:
                    return 0;
            }
        });

        const ids = sorted.map(a => a.id).join(",");
        const currentIds = artists.map(a => a.id).join(",");
        if (ids !== currentIds) {
            setArtists(sorted);
        }
    }, [sortBy, artists]);

    const toggleFav = (id: string | number) => {
        setFavs(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleLocation = (loc: string) => {
        setSelectedLocations((prev) => {
            if (loc === "All Sri Lanka") return ["All Sri Lanka"];
            const filtered = prev.filter(l => l !== "All Sri Lanka");
            if (filtered.includes(loc)) {
                const next = filtered.filter((l) => l !== loc);
                return next.length === 0 ? ["All Sri Lanka"] : next;
            }
            return [...filtered, loc];
        });
    };

    const handleApplyFilters = () => {
        setLoading(true);
        const params: any = {
            category: categoryName,
            per_page: 50,
        };

        const activeLocations = selectedLocations.filter(l => l !== "All Sri Lanka");
        if (activeLocations.length > 0) {
            params.location = activeLocations.join(",");
        }

        const maxBudget = parseInt(priceMax.replace(/,/g, ""));
        if (!isNaN(maxBudget)) {
            params.max_budget = maxBudget;
        }

        getArtists(params)
            .then(({ data }) => {
                let mapped = data.map((a) => {
                    const extra = a as any;
                    const defaultImg = categoryImages[categoryName] || categoryImages["DJs"];
                    return {
                        id: a.id,
                        name: a.stage_name || "Artist",
                        type: a.category || categoryName,
                        location: a.location || "Sri Lanka",
                        rating: extra.average_rating ?? extra.rating?.average ?? 4.8,
                        reviews: extra.reviews_count ?? extra.rating?.total ?? 0,
                        price: a.starting_price ? `Rs. ${a.starting_price.toLocaleString()}+` : "Contact",
                        startingPrice: a.starting_price,
                        image: a.avatar_url || a.cover_url || defaultImg,
                        verified: extra.verification_status === "approved" || true,
                    };
                });

                if (activeLocations.length > 0) {
                    mapped = mapped.filter(a =>
                        activeLocations.some(loc => a.location.toLowerCase().includes(loc.toLowerCase()))
                    );
                }

                const minPrice = parseInt(priceMin.replace(/,/g, ""));
                const maxPrice = parseInt(priceMax.replace(/,/g, ""));

                if (!isNaN(minPrice)) {
                    mapped = mapped.filter(a => a.startingPrice === null || a.startingPrice >= minPrice);
                }
                if (!isNaN(maxPrice)) {
                    mapped = mapped.filter(a => a.startingPrice === null || a.startingPrice <= maxPrice);
                }

                if (rating !== "any") {
                    const minRating = parseFloat(rating);
                    mapped = mapped.filter(a => a.rating >= minRating);
                }

                setArtists(mapped);
            })
            .catch(err => {
                console.error("Failed to filter artists:", err);
                setArtists([]);
            })
            .finally(() => setLoading(false));
    };

    const renderArtistCard = (artist: Artist) => (
        <div key={artist.id} className="w-full artist-card cursor-pointer bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100" onClick={() => navigate(`/artistProfile/${artist.id}`)}>
            <div className="relative" style={{ aspectRatio: "3/4" }}>
                <img src={artist.image} className="w-full h-full object-cover" alt={artist.name} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)" }} />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFav(artist.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:scale-110"
                >
                    <Heart
                        size={15}
                        className={favs.has(artist.id) ? "text-red-500" : "text-gray-500"}
                        fill={favs.has(artist.id) ? "#ef4444" : "none"}
                    />
                </button>
                {artist.verified && (
                    <div className="verified-dot-simple">
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
                    <div className="rating-row-simple">
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
        <div key={index} className="w-full animate-pulse bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
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
        <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900">
            <style>{`
                .pink-text { color: #E8194B; }
                .bg-primary { background-color: #E8194B; }
                .text-primary { color: #E8194B; }
                .artist-card { transition: transform 0.2s, box-shadow 0.2s; }
                .artist-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.13); }
                .verified-dot-simple { position: absolute; bottom: 6px; left: 6px; background: #E8194B; border-radius: 100px; padding: 2px; display: flex; align-items: center; justify-content: center; }
                .rating-row-simple { display: flex; align-items: center; gap: 4px; }
            `}</style>
            {/* Elegant Header */}
            <div className="px-12 pt-16 pb-12">
                <div className="flex items-end justify-between">
                    <div>
                        <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">
                            <span>Home</span>
                            <span>/</span>
                            <span className="text-primary font-bold">Discovery</span>
                        </nav>
                        <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none">{categoryName}</h1>
                        <p className="text-slate-500 mt-4 text-lg max-w-2xl font-medium">
                            Discover {artists.length} premium {categoryName.toLowerCase()} curated for exceptional events.
                        </p>
                    </div>
                    <div className="hidden lg:flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <div className="px-6 py-2 border-r border-slate-100 text-center">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Top Rated</p>
                            <p className="text-xl font-black text-slate-900">4.9/5</p>
                        </div>
                        <div className="px-6 py-2 text-center">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Verified</p>
                            <p className="text-xl font-black text-slate-900">100%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex px-12 pb-24 gap-12">
                {/* Modern Sidebar */}
                <aside className="w-64 shrink-0">
                    <div className="sticky top-8 space-y-10">
                        {/* Location */}
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Location</h3>
                            <div className="space-y-3">
                                {locations.map((loc) => (
                                    <label key={loc} className="flex items-center gap-3 group cursor-pointer">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedLocations.includes(loc)}
                                                onChange={() => toggleLocation(loc)}
                                                className="peer appearance-none w-5 h-5 rounded-md border-2 border-slate-200 checked:border-primary checked:bg-primary transition-all duration-200"
                                            />
                                            <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-600 group-hover:text-primary transition-colors">{loc}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Budget */}
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Budget Range</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Min</label>
                                        <input
                                            type="text"
                                            value={priceMin}
                                            onChange={(e) => setPriceMin(e.target.value)}
                                            className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Max</label>
                                        <input
                                            type="text"
                                            value={priceMax}
                                            onChange={(e) => setPriceMax(e.target.value)}
                                            className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rating Selection */}
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Minimum Rating</h3>
                            <div className="flex flex-wrap gap-2">
                                {[["any", "All"], ["4.0", "4.0+"], ["4.5", "4.5+"]].map(([val, label]) => (
                                    <button
                                        key={val}
                                        onClick={() => setRating(val)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                                            rating === val
                                                ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleApplyFilters}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            <span>Refine Search</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between mb-10 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-slate-900">{artists.length} results</span>
                            <div className="h-4 w-[1px] bg-slate-100"></div>
                            <div className="flex gap-2">
                                {selectedLocations.filter(l => l !== "All Sri Lanka").map(l => (
                                    <span key={l} className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-full border border-primary/10">{l}</span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort by</span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-slate-50 border-0 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-primary/10 outline-none"
                                >
                                    <option>Most Popular</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                    <option>Highest Rated</option>
                                </select>
                                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <ChevronDown />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content States */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => renderArtistSkeleton(i))}
                        </div>
                    ) : artists.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-96 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No matches found</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your filters to discover more artists in this category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {artists.map(renderArtistCard)}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
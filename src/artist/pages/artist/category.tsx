import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getArtists } from "../../../customer/services/discoveryService";

const HeadphonesIcon = ({ color = "#94a3b8" }: { color?: string }) => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
        <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
);

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#f43f5e" : "none"} stroke={filled ? "#f43f5e" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.046 3 5.5L12 21l7-7z" />
    </svg>
);

const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const LocationIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const VerifiedBadge = () => (
    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow-sm">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>Verified</span>
    </div>
);

const ChevronDown = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

const categoryImages: Record<string, string> = {
    "DJs": "https://images.unsplash.com/photo-1571266028243-e4bb33392c64?q=80&w=800&auto=format&fit=crop",
    "Bands": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop",
    "Singers": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800&auto=format&fit=crop",
    "Dancers": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop",
    "Photography": "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=800&auto=format&fit=crop",
};

const cardGradients = [
    "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)",
];

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
    gradient: string;
    hpColor: string;
}

const locations = ["All Sri Lanka", "Colombo", "Kandy", "Galle", "Negombo", "Jaffna"];
const genres = ["EDM / Club", "Hip Hop", "Wedding", "Commercial", "Retro / Classics"];

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
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [availability, setAvailability] = useState<string[]>([]);
    const [favs, setFavs] = useState<string | number[]>([]);
    const [sortBy, setSortBy] = useState("Most Popular");

    useEffect(() => {
        setLoading(true);
        getArtists({ category: categoryName, per_page: 50 })
            .then(({ data }) => {
                const mapped = data.map((a, i) => {
                    const extra = a as any;
                    const defaultImg = categoryImages[categoryName] || categoryImages["DJs"];
                    return {
                        id: a.id,
                        name: a.stage_name || "Artist",
                        type: a.category || categoryName,
                        location: a.location || "Sri Lanka",
                        rating: extra.average_rating ?? extra.rating?.average ?? 4.8,
                        reviews: extra.reviews_count ?? extra.rating?.total ?? 0,
                        price: a.starting_price ? `Rs. ${a.starting_price.toLocaleString()}` : "Contact",
                        startingPrice: a.starting_price,
                        image: a.avatar_url || a.cover_url || defaultImg,
                        verified: extra.verification_status === "approved",
                        gradient: cardGradients[i % cardGradients.length],
                        hpColor: "#94a3b8",
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
        setFavs((prev: any) => prev.includes(id) ? prev.filter((f: any) => f !== id) : [...prev, id]);
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

    const toggleGenre = (g: string) => {
        setSelectedGenres((prev) =>
            prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
        );
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
                let mapped = data.map((a, i) => {
                    const extra = a as any;
                    const defaultImg = categoryImages[categoryName] || categoryImages["DJs"];
                    return {
                        id: a.id,
                        name: a.stage_name || "Artist",
                        type: a.category || categoryName,
                        location: a.location || "Sri Lanka",
                        rating: extra.average_rating ?? extra.rating?.average ?? 4.8,
                        reviews: extra.reviews_count ?? extra.rating?.total ?? 0,
                        price: a.starting_price ? `Rs. ${a.starting_price.toLocaleString()}` : "Contact",
                        startingPrice: a.starting_price,
                        image: a.avatar_url || a.cover_url || defaultImg,
                        verified: extra.verification_status === "approved",
                        gradient: cardGradients[i % cardGradients.length],
                        hpColor: "#94a3b8",
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

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900">
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
                        <div className="flex flex-col items-center justify-center h-96 gap-4">
                            <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Finding best talent...</p>
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
                            {artists.map((artist) => (
                                <div 
                                    key={artist.id} 
                                    className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
                                    onClick={() => navigate(`/artist/${artist.id}`)}
                                >
                                    {/* Card Header / Image */}
                                    <div className="relative aspect-[4/5] overflow-hidden m-2 rounded-[1.75rem]">
                                        {artist.image ? (
                                            <img 
                                                src={artist.image} 
                                                alt={artist.name} 
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center" style={{ background: artist.gradient }}>
                                                <HeadphonesIcon color={artist.hpColor} />
                                            </div>
                                        )}
                                        
                                        {/* Overlays */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFav(artist.id);
                                            }}
                                            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-slate-400 hover:text-rose-500"
                                        >
                                            <HeartIcon filled={favs.includes(artist.id as never)} />
                                        </button>

                                        {artist.verified && (
                                            <div className="absolute bottom-4 left-4">
                                                <VerifiedBadge />
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6 pt-2">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-black text-slate-900 text-lg group-hover:text-primary transition-colors truncate pr-2">{artist.name}</h3>
                                            <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-1 rounded-lg">
                                                <StarIcon />
                                                <span className="text-xs font-black text-amber-700">{artist.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">{artist.type}</p>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <LocationIcon />
                                                <span className="text-[11px] font-bold">{artist.location}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-300 uppercase leading-none mb-1">Starting from</p>
                                                <span className="text-slate-900 font-black text-sm tracking-tight">{artist.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
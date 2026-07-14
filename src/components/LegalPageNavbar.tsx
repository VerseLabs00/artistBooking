import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import artistApi from "../artist/api/axios";
import customerApi from "../customer/lib/api";
import { useAuth } from "../customer/context/AuthContext";

export type LegalPageNavbarVariant = "landing" | "artist" | "customer";

const HOME_PATHS: Record<LegalPageNavbarVariant, string> = {
    landing: "/",
    artist: "/artistHome",
    customer: "/home",
};

type LegalPageNavbarProps = {
    variant: LegalPageNavbarVariant;
};

export default function LegalPageNavbar({ variant }: LegalPageNavbarProps) {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [artistProfile, setArtistProfile] = useState<{ avatar_url?: string; stage_name?: string; full_name?: string } | null>(null);
    const [customerProfile, setCustomerProfile] = useState<{ avatar_url?: string } | null>(null);

    const homePath = HOME_PATHS[variant];

    useEffect(() => {
        if (variant === "artist") {
            artistApi.get("/profile")
                .then(({ data }) => setArtistProfile(data.profile))
                .catch(() => {});
        } else if (variant === "customer") {
            customerApi.get("/profile")
                .then(({ data }) => setCustomerProfile(data.user))
                .catch(() => {});
        }
    }, [variant]);

    const goBack = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        navigate(-1);
    };

    const landingLinks = [
        { label: "Categories", sectionId: "categories-section" },
        { label: "Explore", sectionId: "artists-section" },
        { label: "How it works", sectionId: "how-it-works" },
        { label: "Join as Artist", sectionId: "join-section" },
        { label: "Contact Us", sectionId: "contact-section" },
    ];

    const authenticatedLinks = [
        { label: "Categories", sectionId: "categories-section" },
        { label: "Explore", sectionId: "artists-section" },
        { label: "How it works", sectionId: "how-it-works" },
        { label: "Contact Us", sectionId: "contact-section" },
    ];

    const navLinks = variant === "landing" ? landingLinks : authenticatedLinks;
    const displayUser = authUser || customerProfile;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400&display=swap');
                
                .legal-page-nav { font-family: 'Fraunces', serif; }
                .legal-page-nav .nav-link { color: #444; font-weight: 500; font-size: 15px; transition: color 0.15s; cursor: pointer; }
                .legal-page-nav .nav-link:hover { color: #E8194B; }
                .legal-page-nav .btn-pink { background: #E8194B; color: #fff; transition: background 0.18s; }
                .legal-page-nav .btn-pink:hover { background: #c8133b; }
            `}</style>

            <nav className="legal-page-nav fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-4 sm:px-6 md:px-12 py-3 md:py-4 bg-white border-b border-gray-100">
                <div className="flex items-center cursor-pointer" onClick={goBack}>
                    <div className="flex items-center">
                        <img
                            src="/assets/logo/logo-navbar-light@3x.png"
                            alt="Perfoma"
                            className="h-8 sm:h-10 w-auto object-contain"
                        />
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-7 absolute left-1/2 transform -translate-x-1/2">
                    {navLinks.map(({ label }) => (
                        <button key={label} onClick={goBack} className="nav-link">
                            {label}
                        </button>
                    ))}
                    <button onClick={goBack} className="nav-link">Events</button>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {variant === "landing" && (
                        <>
                            <button
                                onClick={goBack}
                                className="btn-pink text-xs sm:text-sm font-bold px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-pink-100"
                            >
                                <span className="hidden sm:inline">Explore Talent</span>
                                <span className="sm:hidden">Explore</span>
                            </button>
                            <button
                                type="button"
                                className="md:hidden p-2 text-gray-600 hover:text-[#E8194B] transition-colors"
                                onClick={() => setMobileMenuOpen(prev => !prev)}
                                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                            >
                                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </>
                    )}

                    {variant === "artist" && (
                        <>
                            <div
                                onClick={() => navigate("/account")}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-gray-100 overflow-hidden cursor-pointer hover:border-[#E8194B] transition-all bg-gray-200 flex items-center justify-center"
                            >
                                {artistProfile?.avatar_url ? (
                                    <img src={artistProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-gray-400" />
                                )}
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
                        </>
                    )}

                    {variant === "customer" && (
                        <>
                            <div
                                onClick={() => navigate("/customerAccount")}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-gray-100 overflow-hidden cursor-pointer hover:border-[#E8194B] transition-all flex items-center justify-center bg-gray-50"
                            >
                                {displayUser?.avatar_url ? (
                                    <img src={displayUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-gray-400" />
                                )}
                            </div>
                            <button
                                onClick={() => navigate("/loginCustomer")}
                                className="p-2 text-gray-400 hover:text-[#E8194B] transition-colors"
                                title="Sign out"
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
                        </>
                    )}
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-50 py-4 px-6 flex flex-col gap-1">
                        {navLinks.map(({ label }) => (
                            <button key={label} onClick={goBack} className="nav-link text-left py-3 border-b border-gray-50">
                                {label}
                            </button>
                        ))}
                        <button onClick={goBack} className="nav-link text-left py-3">Events</button>
                    </div>
                )}
            </nav>
        </>
    );
}

export function getLegalPageVariant(from: string | null): LegalPageNavbarVariant {
    if (from === "artist") return "artist";
    if (from === "customer") return "customer";
    return "landing";
}


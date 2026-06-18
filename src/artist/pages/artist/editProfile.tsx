import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { 
    User, FileText, DollarSign, Image, Music, Music2, 
    Link, Youtube, Facebook, Instagram, Check, AlertCircle, 
    ArrowLeft, Save, X 
} from "lucide-react";
import toast from "react-hot-toast";

interface ProfileForm {
    stage_name: string;
    category: string;
    location: string;
    phone_number: string;
    email: string;
    short_bio: string;
    bio_1: string;
    bio_2: string;
    paragraph: string;
    starting_price: string;
    max_price: string;
    youtube_link: string;
    facebook_link: string;
    instagram_link: string;
    spotify_link: string;
}

interface MediaEntry {
    link: string;
    title: string;
}

const defaultForm: ProfileForm = {
    stage_name: "", category: "Musician", location: "", phone_number: "",
    email: "", short_bio: "", bio_1: "", bio_2: "", paragraph: "",
    starting_price: "", max_price: "", youtube_link: "", facebook_link: "",
    instagram_link: "", spotify_link: "",
};

const sections = [
    { id: "basic", label: "Basic Information", icon: <User size={18} /> },
    { id: "overview", label: "Overview & Bio", icon: <FileText size={18} /> },
    { id: "pricing", label: "Pricing", icon: <DollarSign size={18} /> },
    { id: "gallery", label: "Photo Gallery", icon: <Image size={18} /> },
    { id: "media", label: "Audio & Video", icon: <Music size={18} /> },
    { id: "social", label: "Social & Web", icon: <Link size={18} /> },
];

export default function EditProfile() {
    const navigate = useNavigate();
    const [form, setForm] = useState<ProfileForm>(defaultForm);
    const [gallery, setGallery] = useState<{ id?: number; url: string; isNew?: boolean; file?: File }[]>([]);
    const [mediaEntries, setMediaEntries] = useState<MediaEntry[]>([
        { link: "", title: "" },
        { link: "", title: "" },
        { link: "", title: "" },
    ]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState("basic");
    const [isDirty, setIsDirty] = useState(false);

    const avatarRef = useRef<HTMLInputElement>(null);
    const coverRef = useRef<HTMLInputElement>(null);
    const galleryRef = useRef<HTMLInputElement>(null);
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get("/profile");
                const p = data.profile;
                setForm({
                    stage_name: p.stage_name || "",
                    category: p.category || "Musician",
                    location: p.location || "",
                    phone_number: p.phone_number || "",
                    email: p.email || "",
                    short_bio: p.short_bio || "",
                    bio_1: p.bio_1 || "",
                    bio_2: p.bio_2 || "",
                    paragraph: p.paragraph || "",
                    starting_price: p.starting_price || "",
                    max_price: p.max_price || "",
                    youtube_link: p.youtube_link || "",
                    facebook_link: p.facebook_link || "",
                    instagram_link: p.instagram_link || "",
                    spotify_link: p.spotify_link || "",
                });

                const avatarUrl = p.avatar_url || p.avatar || p.profile_image || null;
                if (avatarUrl) setAvatarPreview(avatarUrl);

                const coverUrl = p.cover_url || p.cover || p.cover_image || null;
                if (coverUrl) setCoverPreview(coverUrl);

                const imgs = (data.media || []).filter((m: any) =>
                    m.media_type === "image" &&
                    !["avatar", "profile", "cover", "banner", "verification_front", "verification_back", "selfie"].includes(m.purpose)
                );
                setGallery(imgs.map((m: any) => ({ id: m.id, url: m.url })));

                const vids = (data.media || []).filter((m: any) => m.media_type === "video" && m.purpose === "talent_media" && m.is_external_link);
                const loaded: MediaEntry[] = vids.map((m: any) => ({ link: m.url, title: m.title || "" }));
                while (loaded.length < 3) loaded.push({ link: "", title: "" });
                setMediaEntries(loaded);
            } catch (err) {
                toast.error("Failed to load profile data");
            } finally {
                setFetchLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setIsDirty(true);
    };

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleSave = async () => {
        setLoading(true);
        const saveToast = toast.loading("Saving your changes...");
        try {
            const payload: Record<string, any> = {};
            Object.entries(form).forEach(([k, v]) => { if (v !== "") payload[k] = v; });
            await api.put("/profile", payload);

            // Audio & Video
            const validLinks = mediaEntries.filter(e => e.link.trim()).map(e => ({ url: e.link, title: e.title }));
            await api.post("/profile/sync-links", { links: validLinks });

            // Gallery
            const newImages = gallery.filter(g => g.isNew && g.file);
            for (const img of newImages) {
                const fd = new FormData();
                fd.append("purpose", "performance");
                fd.append("file", img.file!);
                await api.post("/profile/gallery", fd, { headers: { "Content-Type": "multipart/form-data" } });
            }

            toast.success("Profile updated successfully!", { id: saveToast });
            setIsDirty(false);
            
            // Refresh gallery to get real IDs
            const { data } = await api.get("/profile");
            const imgs = (data.media || []).filter((m: any) =>
                m.media_type === "image" &&
                !["avatar", "profile", "cover", "banner", "verification_front", "verification_back", "selfie"].includes(m.purpose)
            );
            setGallery(imgs.map((m: any) => ({ id: m.id, url: m.url })));
            
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save profile.", { id: saveToast });
        } finally {
            setLoading(false);
        }
    };

    const handleMediaUpload = async (type: "avatar" | "cover", file: File) => {
        const previewUrl = URL.createObjectURL(file);
        if (type === "avatar") setAvatarPreview(previewUrl);
        if (type === "cover") setCoverPreview(previewUrl);

        const uploadToast = toast.loading(`Uploading ${type}...`);
        const fd = new FormData();
        fd.append("type", type);
        fd.append("file", file);
        try {
            await api.post("/profile/media", fd, { headers: { "Content-Type": "multipart/form-data" } });
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated!`, { id: uploadToast });
        } catch {
            toast.error(`Failed to upload ${type}`, { id: uploadToast });
        }
    };

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.map(file => ({ url: URL.createObjectURL(file), isNew: true, file }));
        setGallery(prev => [...prev, ...newImages]);
        setIsDirty(true);
    };

    const deleteGalleryItem = async (item: { id?: number; url: string; isNew?: boolean }) => {
        if (item.id) {
            const delToast = toast.loading("Removing photo...");
            try { 
                await api.delete(`/profile/gallery/${item.id}`); 
                toast.success("Photo removed", { id: delToast });
            } catch { 
                toast.error("Failed to remove photo", { id: delToast });
                return;
            }
        }
        setGallery(prev => prev.filter(g => g.url !== item.url));
        setIsDirty(true);
    };

    const updateMediaEntry = (index: number, field: keyof MediaEntry, value: string) => {
        setMediaEntries(prev => prev.map((entry, i) => i === index ? { ...entry, [field]: value } : entry));
        setIsDirty(true);
    };

    const addMediaEntry = () => {
        setMediaEntries(prev => [...prev, { link: "", title: "" }]);
        setIsDirty(true);
    };

    const removeMediaEntry = (index: number) => {
        setMediaEntries(prev => prev.filter((_, i) => i !== index));
        setIsDirty(true);
    };

    if (fetchLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-medium">Loading your profile...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1A202C] font-sans">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                * { font-family: 'Inter', sans-serif; }
                .glass-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.2); }
                .input-field { 
                    width: 100%; padding: 12px 16px; border-radius: 12px; border: 1.5px solid #E2E8F0;
                    transition: all 0.2s; outline: none; background: #fff;
                }
                .input-field:focus { border-color: #DB0000; box-shadow: 0 0 0 4px rgba(219,0,0,0.1); }
                .section-card { background: #fff; border-radius: 24px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01); }
                @media (min-width: 640px) {
                    .section-card { padding: 32px; }
                }
                @media (min-width: 1024px) {
                    .section-card { padding: 40px; }
                }
                .sidebar-btn { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                .sidebar-btn:hover { background: #F1F5F9; transform: translateX(4px); }
                .sidebar-active { background: #fff !important; color: #DB0000 !important; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .sticky-save-bar { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 50; width: calc(100% - 32px); max-width: 400px; }
                @media (min-width: 640px) {
                    .sticky-save-bar { bottom: 32px; width: auto; min-width: 320px; }
                }
            `}</style>

            {/* TOP HEADER */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-[#EDF2F7] px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <button onClick={() => navigate("/account")} className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">Profile Editor</h1>
                        <p className="text-xs text-gray-500 font-medium hidden sm:block">Manage your public artist identity</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button 
                        onClick={() => navigate("/account")}
                        className="hidden sm:inline-flex px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        Exit
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={loading || !isDirty}
                        className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                            isDirty 
                            ? "bg-[#DB0000] text-white shadow-lg shadow-red-200 hover:scale-105 active:scale-95" 
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        <Save size={16} />
                        <span className="hidden sm:inline">{loading ? "Saving..." : "Save All Changes"}</span>
                        <span className="sm:hidden">{loading ? "..." : "Save"}</span>
                    </button>
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-12 p-4 sm:p-6 lg:p-10">
                
                {/* LEFT SIDEBAR NAVIGATION */}
                <aside className="lg:sticky lg:top-32 h-fit">
                    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 hide-scrollbar">
                        <p className="hidden lg:block px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Edit Sections</p>
                        {sections.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => scrollToSection(s.id)}
                                className={`sidebar-btn flex-shrink-0 lg:w-full flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl text-sm font-semibold text-gray-500 text-left ${
                                    activeSection === s.id ? "sidebar-active" : ""
                                }`}
                            >
                                <span className={activeSection === s.id ? "text-red-600" : "text-gray-300"}>{s.icon}</span>
                                {s.label}
                            </button>
                        ))}
                    </div>

                    <div className="hidden lg:block mt-12 p-6 bg-red-50 rounded-3xl border border-red-100">
                        <p className="text-xs font-bold text-red-600 uppercase mb-2">Live Status</p>
                        <p className="text-[13px] text-red-800 leading-relaxed font-medium">
                            Changes saved here appear immediately on your public profile.
                        </p>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="pb-40">
                    
                    {/* MEDIA HEADER (Avatar & Cover) */}
                    <div className="mb-12 relative group">
                        <div className="h-48 sm:h-64 rounded-[24px] sm:rounded-[32px] overflow-hidden relative">
                            <img 
                                src={coverPreview ?? "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1400"} 
                                className="w-full h-full object-cover" 
                                alt="cover"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
                            <button 
                                onClick={() => coverRef.current?.click()}
                                className="absolute bottom-6 right-8 bg-white/90 backdrop-blur shadow-xl border-0 rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-2 hover:bg-white transition-all"
                            >
                                <Image size={14} /> Change Cover
                            </button>
                            <input ref={coverRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleMediaUpload("cover", e.target.files[0])} />
                        </div>

                        <div className="absolute -bottom-8 sm:-bottom-10 left-4 sm:left-12 flex items-end gap-4 sm:gap-6">
                            <div className="relative group/avatar">
                                <img 
                                    src={avatarPreview ?? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"} 
                                    className="w-20 h-20 sm:w-32 sm:h-32 rounded-[28px] sm:rounded-[40px] border-[4px] sm:border-[6px] border-[#F8F9FA] object-cover shadow-2xl" 
                                    alt="avatar"
                                />
                                <button 
                                    onClick={() => avatarRef.current?.click()}
                                    className="absolute bottom-1 right-1 bg-red-600 text-white p-2.5 rounded-2xl border-4 border-[#F8F9FA] shadow-lg hover:scale-110 transition-all"
                                >
                                    <Image size={14} />
                                </button>
                                <input ref={avatarRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleMediaUpload("avatar", e.target.files[0])} />
                            </div>
                            <div className="pb-8 sm:pb-12 min-w-0">
                                <h2 className="text-lg sm:text-2xl font-black tracking-tight truncate">{form.stage_name || "New Artist"}</h2>
                                <p className="text-sm text-gray-500 font-semibold">{form.category} · {form.location}</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTIONS */}
                    <div className="space-y-8 mt-20">
                        
                        {/* Basic Info */}
                        <div ref={el => sectionRefs.current["basic"] = el} className="section-card">
                            <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
                                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></span>
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                <Field label="Stage Name">
                                    <input className="input-field" name="stage_name" value={form.stage_name} onChange={handleChange} placeholder="Alex Jean" />
                                </Field>
                                <Field label="Category">
                                    <select className="input-field cursor-pointer" name="category" value={form.category} onChange={handleChange}>
                                        <option>Musician</option>
                                        <option>Producer</option>
                                        <option>DJ</option>
                                        <option>Singer</option>
                                        <option>Live Band</option>
                                        <option>Dancer</option>
                                        <option>MC</option>
                                        <option>Photographer</option>
                                    </select>
                                </Field>
                                <Field label="Performance Location">
                                    <input className="input-field" name="location" value={form.location} onChange={handleChange} placeholder="Colombo, Sri Lanka" />
                                </Field>
                                <Field label="Contact Phone">
                                    <input className="input-field" name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="+94 777 123 456" />
                                </Field>
                                <Field label="Business Email" className="col-span-2">
                                    <input className="input-field" name="email" value={form.email} onChange={handleChange} placeholder="alex@email.com" />
                                </Field>
                                <Field label="Short Catchphrase (Tagline)" className="col-span-2">
                                    <input className="input-field font-medium" name="short_bio" value={form.short_bio} onChange={handleChange} placeholder="Bringing life to your events with premium sound..." />
                                </Field>
                            </div>
                        </div>

                        {/* Overview & Bio */}
                        <div ref={el => sectionRefs.current["overview"] = el} className="section-card">
                            <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
                                <span className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FileText size={20} /></span>
                                Biography & Experience
                            </h3>
                            <div className="space-y-6">
                                <Field label="The Introduction (Part 1)">
                                    <textarea className="input-field min-h-[140px]" name="bio_1" value={form.bio_1} onChange={handleChange} placeholder="Describe your journey and what makes you unique..." />
                                </Field>
                                <Field label="The Details (Part 2)">
                                    <textarea className="input-field min-h-[140px]" name="bio_2" value={form.bio_2} onChange={handleChange} placeholder="Talk about your achievements, famous gigs, and musical style..." />
                                </Field>
                                <Field label="Extra Information">
                                    <textarea className="input-field min-h-[100px]" name="paragraph" value={form.paragraph} onChange={handleChange} placeholder="Equipment list, special requirements, or anything else..." />
                                </Field>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div ref={el => sectionRefs.current["pricing"] = el} className="section-card">
                            <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
                                <span className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></span>
                                Pricing Structure
                            </h3>
                            <div className="grid grid-cols-2 gap-8">
                                <Field label="Starting Price (LKR)">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rs.</span>
                                        <input className="input-field pl-12" name="starting_price" value={form.starting_price} onChange={handleChange} placeholder="35,000" />
                                    </div>
                                </Field>
                                <Field label="Maximum Price (LKR)">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rs.</span>
                                        <input className="input-field pl-12" name="max_price" value={form.max_price} onChange={handleChange} placeholder="75,000" />
                                    </div>
                                </Field>
                            </div>
                            <div className="mt-8 p-6 bg-gray-50 rounded-2xl flex gap-4">
                                <div className="text-xl">💡</div>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Your pricing will be displayed as a range (e.g. <b>Rs. 35,000 - 75,000</b>). This helps customers understand your value before reaching out.
                                </p>
                            </div>
                        </div>

                        {/* Gallery */}
                        <div ref={el => sectionRefs.current["gallery"] = el} className="section-card">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold flex items-center gap-3">
                                    <span className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Image size={20} /></span>
                                    Performance Gallery
                                </h3>
                                <button 
                                    onClick={() => galleryRef.current?.click()}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
                                >
                                    Upload Photos
                                </button>
                                <input ref={galleryRef} type="file" multiple className="hidden" onChange={handleGalleryUpload} />
                            </div>

                            {gallery.length > 0 ? (
                                <div className="grid grid-cols-3 gap-6">
                                    {gallery.map((img, i) => (
                                        <div key={i} className="group relative aspect-square rounded-[24px] overflow-hidden shadow-sm">
                                            <img src={img.url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="gallery" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button 
                                                    onClick={() => deleteGalleryItem(img)}
                                                    className="bg-white text-red-600 p-3 rounded-2xl hover:bg-red-50 transition-all"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            {img.isNew && (
                                                <div className="absolute top-4 left-4 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
                                                    New
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 border-2 border-dashed border-gray-100 rounded-[32px] text-center">
                                    <p className="text-sm text-gray-400 font-medium">No photos yet. Showcase your past events here.</p>
                                </div>
                            )}
                        </div>

                        {/* Audio & Video */}
                        <div ref={el => sectionRefs.current["media"] = el} className="section-card">
                            <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
                                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Music size={20} /></span>
                                Audio & Video Samples
                            </h3>
                            <div className="space-y-4">
                                {mediaEntries.map((entry, i) => (
                                    <div key={i} className="p-6 bg-gray-50 rounded-[24px] border border-gray-100 relative group">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Entry #{i + 1}</p>
                                            <button 
                                                onClick={() => removeMediaEntry(i)}
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <Field label="Sample Title">
                                                <input className="input-field" value={entry.title} onChange={e => updateMediaEntry(i, "title", e.target.value)} placeholder="e.g. Live at Coke Red" />
                                            </Field>
                                            <Field label="Link (YouTube / Spotify)">
                                                <input className="input-field" value={entry.link} onChange={e => updateMediaEntry(i, "link", e.target.value)} placeholder="https://..." />
                                            </Field>
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    onClick={addMediaEntry}
                                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-[24px] text-gray-400 text-sm font-bold hover:border-red-200 hover:text-red-600 transition-all"
                                >
                                    + Add More Samples
                                </button>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div ref={el => sectionRefs.current["social"] = el} className="section-card">
                            <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
                                <span className="p-2 bg-red-50 text-red-600 rounded-lg"><Link size={20} /></span>
                                Social & Web Presence
                            </h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600"><Youtube size={24} /></div>
                                    <Field label="YouTube" className="flex-1">
                                        <input className="input-field" name="youtube_link" value={form.youtube_link} onChange={handleChange} placeholder="@handle" />
                                    </Field>
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600"><Facebook size={24} /></div>
                                    <Field label="Facebook" className="flex-1">
                                        <input className="input-field" name="facebook_link" value={form.facebook_link} onChange={handleChange} placeholder="fb.com/..." />
                                    </Field>
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600"><Instagram size={24} /></div>
                                    <Field label="Instagram" className="flex-1">
                                        <input className="input-field" name="instagram_link" value={form.instagram_link} onChange={handleChange} placeholder="@username" />
                                    </Field>
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600"><Music2 size={24} /></div>
                                    <Field label="Spotify" className="flex-1">
                                        <input className="input-field" name="spotify_link" value={form.spotify_link} onChange={handleChange} placeholder="artist url" />
                                    </Field>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}

function Field({ label, children, className = "", style }: { label: string; children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <div className={className} style={style}>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                {label}
            </label>
            {children}
        </div>
    );
}

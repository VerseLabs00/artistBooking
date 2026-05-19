import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

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

const tabs = [
    { id: "Basic Information", icon: "👤" },
    { id: "Overview", icon: "📝" },
    { id: "Pricing", icon: "💰" },
    { id: "Gallery", icon: "🖼️" },
    { id: "Audio & Video", icon: "🎵" },
    { id: "Social & Web", icon: "🔗" },
];

export default function EditProfile() {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Basic Information");
    const [form, setForm] = useState<ProfileForm>(defaultForm);
    const [gallery, setGallery] = useState<{ id?: number; url: string; isNew?: boolean; file?: File }[]>([]);
    const [mediaEntries, setMediaEntries] = useState<MediaEntry[]>([
        { link: "", title: "" },
        { link: "", title: "" },
        { link: "", title: "" },
    ]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const avatarRef = useRef<HTMLInputElement>(null);
    const coverRef = useRef<HTMLInputElement>(null);
    const galleryRef = useRef<HTMLInputElement>(null);

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

                const avatarUrl =
                    p.avatar_url || p.avatar || p.profile_image ||
                    (data.media || []).find((m: any) =>
                        ["avatar", "profile", "profile_picture", "profile_image"].includes(m.purpose)
                    )?.url || null;
                if (avatarUrl) setAvatarPreview(avatarUrl);

                const coverUrl =
                    p.cover_url || p.cover || p.cover_image ||
                    (data.media || []).find((m: any) =>
                        ["cover", "cover_photo", "cover_image", "banner"].includes(m.purpose)
                    )?.url || null;
                if (coverUrl) setCoverPreview(coverUrl);

                const imgs = (data.media || []).filter((m: any) =>
                    m.media_type === "image" &&
                    !["verification_front", "verification_back", "selfie", "avatar", "profile", "profile_picture", "profile_image", "cover", "cover_photo", "cover_image", "banner"].includes(m.purpose)
                );
                setGallery(imgs.map((m: any) => ({ id: m.id, url: m.url })));

                const vids = (data.media || []).filter((m: any) => m.media_type === "video" && m.purpose === "talent_media" && m.is_external_link);
                const loaded: MediaEntry[] = vids.map((m: any) => ({ link: m.url, title: m.title || "" }));
                while (loaded.length < 3) loaded.push({ link: "", title: "" });
                setMediaEntries(loaded.slice(0, Math.max(loaded.length, 3)));
            } catch { /* silently fail */ }
            finally { setFetchLoading(false); }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setLoading(true); setError(""); setSuccess("");
        try {
            const payload: Record<string, any> = {};
            Object.entries(form).forEach(([k, v]) => { if (v !== "") payload[k] = v; });
            await api.put("/profile", payload);

            if (activeTab === "Audio & Video") {
                const validLinks = mediaEntries.filter(e => e.link.trim()).map(e => ({ link: e.link, title: e.title }));
                if (validLinks.length > 0) {
                    await api.post("/profile/sync-links", { links: validLinks.map(e => e.link) });
                }
            }

            if (activeTab === "Gallery") {
                const newImages = gallery.filter(g => g.isNew && g.file);
                for (const img of newImages) {
                    const fd = new FormData();
                    fd.append("purpose", "performance");
                    fd.append("file", img.file!);
                    await api.post("/profile/gallery", fd, { headers: { "Content-Type": "multipart/form-data" } });
                }
            }

            setSuccess("Profile saved successfully!");
            setTimeout(() => { setSuccess(""); navigate("/account"); }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleMediaUpload = async (type: "avatar" | "cover", file: File) => {
        const previewUrl = URL.createObjectURL(file);
        if (type === "avatar") setAvatarPreview(previewUrl);
        if (type === "cover") setCoverPreview(previewUrl);
        const fd = new FormData();
        fd.append("type", type);
        fd.append("file", file);
        try {
            await api.post("/profile/media", fd, { headers: { "Content-Type": "multipart/form-data" } });
        } catch { /* ignore */ }
    };

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.map(file => ({ url: URL.createObjectURL(file), isNew: true, file }));
        setGallery(prev => [...prev, ...newImages]);
    };

    const deleteGalleryItem = async (item: { id?: number; url: string; isNew?: boolean }) => {
        if (item.id) {
            try { await api.delete(`/profile/gallery/${item.id}`); } catch { /* ignore */ }
        }
        setGallery(prev => prev.filter(g => g.url !== item.url));
    };

    const updateMediaEntry = (index: number, field: keyof MediaEntry, value: string) => {
        setMediaEntries(prev => prev.map((entry, i) => i === index ? { ...entry, [field]: value } : entry));
    };

    const addMediaEntry = () => {
        setMediaEntries(prev => [...prev, { link: "", title: "" }]);
    };

    const removeMediaEntry = (index: number) => {
        setMediaEntries(prev => prev.filter((_, i) => i !== index));
    };

    if (fetchLoading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{
                    width: 48, height: 48, border: "3px solid #DB0000",
                    borderTopColor: "transparent", borderRadius: "50%",
                    animation: "spin 0.8s linear infinite", margin: "0 auto 16px"
                }} />
                <p style={{ color: "#666", fontSize: 14, fontFamily: "sans-serif" }}>Loading your profile...</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "#F5F5F7", fontFamily: "'Inter', -apple-system, sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; }
                .tab-item { transition: all 0.2s ease; }
                .tab-item:hover { background: #f9f9f9; }
                .tab-active { background: #fff0f0 !important; color: #DB0000 !important; font-weight: 600; }
                .field-input {
                    width: 100%; border: 1.5px solid #E8E8E8; border-radius: 10px;
                    padding: 11px 14px; font-size: 14px; outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    background: #FAFAFA; color: #1a1a1a; font-family: inherit;
                }
                .field-input:focus { border-color: #DB0000; box-shadow: 0 0 0 3px rgba(219,0,0,0.08); background: #fff; }
                .field-input::placeholder { color: #bbb; }
                .gallery-card { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 1; }
                .gallery-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
                .gallery-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); opacity: 0; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
                .gallery-card:hover .gallery-overlay { opacity: 1; }
                .media-card { background: #fff; border: 1.5px solid #EBEBEB; border-radius: 14px; padding: 18px; margin-bottom: 12px; }
                .btn-primary {
                    background: linear-gradient(135deg, #DB0000, #a50000);
                    color: white; border: none; padding: 11px 28px;
                    border-radius: 10px; font-size: 14px; font-weight: 600;
                    cursor: pointer; transition: all 0.2s; font-family: inherit;
                }
                .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(219,0,0,0.3); }
                .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
                .btn-ghost { background: none; border: 1.5px solid #E0E0E0; color: #666; padding: 11px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: inherit; }
                .btn-ghost:hover { border-color: #ccc; color: #333; }
                .btn-danger { background: #fff0f0; border: 1.5px solid #ffd4d4; color: #DB0000; padding: 7px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: inherit; }
                .btn-danger:hover { background: #ffe4e4; }
                .btn-add { background: #f8f8f8; border: 1.5px dashed #D0D0D0; color: #888; padding: 11px; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: inherit; width: 100%; }
                .btn-add:hover { border-color: #DB0000; color: #DB0000; background: #fff8f8; }
                .select-field {
                    width: 100%; border: 1.5px solid #E8E8E8; border-radius: 10px;
                    padding: 11px 14px; font-size: 14px; outline: none; background: #FAFAFA;
                    color: #1a1a1a; font-family: inherit; appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
                    background-repeat: no-repeat; background-position: right 14px center;
                    cursor: pointer;
                }
                .select-field:focus { border-color: #DB0000; box-shadow: 0 0 0 3px rgba(219,0,0,0.08); }
                .upload-zone { border: 2px dashed #E0E0E0; border-radius: 12px; padding: 28px; text-align: center; cursor: pointer; transition: all 0.2s; }
                .upload-zone:hover { border-color: #DB0000; background: #fff8f8; }
                .cover-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5)); }
                .avatar-ring { border: 4px solid #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
                @media (max-width: 768px) {
                    .sidebar { display: none; }
                    .mobile-tabs { display: flex !important; }
                }
                .mobile-tabs { display: none; overflow-x: auto; gap: 8px; padding-bottom: 4px; }
                .mobile-tab { white-space: nowrap; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; border: 1.5px solid #E0E0E0; background: #fff; color: #666; cursor: pointer; }
                .mobile-tab-active { background: #DB0000; color: #fff; border-color: #DB0000; }
            `}</style>

            {/* HERO / COVER */}
            <div style={{ position: "relative", height: 280, width: "100%" }}>
                <img
                    src={coverPreview ?? "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1400"}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    alt="cover"
                />
                <div className="cover-overlay" />

                {/* Cover change button */}
                <button
                    onClick={() => coverRef.current?.click()}
                    style={{
                        position: "absolute", top: 20, right: 20,
                        background: "rgba(255,255,255,0.95)", border: "none",
                        borderRadius: 10, padding: "9px 18px", fontSize: 13,
                        fontWeight: 600, cursor: "pointer", display: "flex",
                        alignItems: "center", gap: 7, color: "#222",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                        fontFamily: "inherit"
                    }}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                    </svg>
                    Change Cover
                </button>
                <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }}
                       onChange={e => { const f = e.target.files?.[0]; if (f) handleMediaUpload("cover", f); }} />

                {/* Avatar */}
                <div
                    onClick={() => avatarRef.current?.click()}
                    style={{
                        position: "absolute", bottom: -52, left: 40,
                        cursor: "pointer", zIndex: 10
                    }}
                >
                    <div style={{ position: "relative" }}>
                        <img
                            src={avatarPreview ?? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"}
                            className="avatar-ring"
                            style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", display: "block" }}
                            alt="avatar"
                        />
                        <div style={{
                            position: "absolute", bottom: 4, right: 4,
                            background: "#DB0000", borderRadius: "50%",
                            width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                            border: "2.5px solid #fff"
                        }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                            </svg>
                        </div>
                    </div>
                    <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }}
                           onChange={e => { const f = e.target.files?.[0]; if (f) handleMediaUpload("avatar", f); }} />
                </div>
            </div>

            {/* Name bar below cover */}
            <div style={{ background: "#fff", borderBottom: "1px solid #F0F0F0", paddingLeft: 168, paddingRight: 40, paddingTop: 16, paddingBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{form.stage_name || "Your Name"}</p>
                    <p style={{ margin: 0, fontSize: 13, color: "#888", marginTop: 2 }}>{form.category} {form.location ? `· ${form.location}` : ""}</p>
                </div>
                <button onClick={() => navigate("/account")} className="btn-ghost" style={{ fontSize: 13, padding: "8px 16px" }}>
                    ← Back to Profile
                </button>
            </div>

            {/* Mobile tabs */}
            <div style={{ padding: "14px 16px 0", background: "#F5F5F7" }}>
                <div className="mobile-tabs">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                                className={`mobile-tab ${activeTab === t.id ? "mobile-tab-active" : ""}`}>
                            {t.icon} {t.id}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 60px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 24 }}>

                {/* SIDEBAR */}
                <div className="sidebar" style={{ alignSelf: "start", position: "sticky", top: 24 }}>
                    <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F4F4F4" }}>
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#999", textTransform: "uppercase" }}>Edit Sections</p>
                        </div>
                        {tabs.map((tab, i) => (
                            <div key={tab.id} onClick={() => setActiveTab(tab.id)}
                                 className={`tab-item ${activeTab === tab.id ? "tab-active" : ""}`}
                                 style={{
                                     display: "flex", alignItems: "center", gap: 12,
                                     padding: "13px 20px", cursor: "pointer", color: "#555",
                                     fontSize: 14, fontWeight: 500,
                                     borderBottom: i < tabs.length - 1 ? "1px solid #F8F8F8" : "none",
                                 }}
                            >
                                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                                {tab.id}
                                {activeTab === tab.id && (
                                    <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#DB0000" }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONTENT */}
                <div>
                    {/* Alerts */}
                    {success && (
                        <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
                            <span>✅</span> {success}
                        </div>
                    )}
                    {error && (
                        <div style={{ background: "#fff0f0", border: "1.5px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#991b1b", display: "flex", alignItems: "center", gap: 8 }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div style={{ background: "#fff", borderRadius: 18, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                        {/* Tab title */}
                        <div style={{ marginBottom: 28 }}>
                            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>
                                {tabs.find(t => t.id === activeTab)?.icon} {activeTab}
                            </h2>
                            <div style={{ width: 36, height: 3, background: "#DB0000", borderRadius: 2, marginTop: 8 }} />
                        </div>

                        {/* Basic Information */}
                        {activeTab === "Basic Information" && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                <Field label="Stage Name">
                                    <input className="field-input" name="stage_name" value={form.stage_name} onChange={handleChange} placeholder="Alex Jean" />
                                </Field>
                                <Field label="Category">
                                    <select className="select-field" name="category" value={form.category} onChange={handleChange}>
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
                                <Field label="Location">
                                    <input className="field-input" name="location" value={form.location} onChange={handleChange} placeholder="Colombo, Sri Lanka" />
                                </Field>
                                <Field label="Phone Number">
                                    <input className="field-input" name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="+94 777 123 456" />
                                </Field>
                                <Field label="Email Address" style={{ gridColumn: "1 / -1" }}>
                                    <input className="field-input" name="email" value={form.email} onChange={handleChange} placeholder="alex@email.com" />
                                </Field>
                                <Field label="Short Bio" style={{ gridColumn: "1 / -1" }}>
                                    <input className="field-input" name="short_bio" value={form.short_bio} onChange={handleChange} placeholder="A short tagline about yourself..." />
                                </Field>
                            </div>
                        )}

                        {/* Overview */}
                        {activeTab === "Overview" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                <Field label="Biography — Part 1">
                                    <textarea className="field-input" name="bio_1" value={form.bio_1} onChange={handleChange} rows={4} style={{ resize: "vertical" }} placeholder="Write about your background and experience..." />
                                </Field>
                                <Field label="Biography — Part 2">
                                    <textarea className="field-input" name="bio_2" value={form.bio_2} onChange={handleChange} rows={4} style={{ resize: "vertical" }} placeholder="Continue your story..." />
                                </Field>
                                <Field label="Additional Paragraph">
                                    <textarea className="field-input" name="paragraph" value={form.paragraph} onChange={handleChange} rows={4} style={{ resize: "vertical" }} placeholder="Any other info you'd like to share..." />
                                </Field>
                            </div>
                        )}

                        {/* Pricing */}
                        {activeTab === "Pricing" && (
                            <div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                    <Field label="Starting Price (Rs.)">
                                        <input className="field-input" name="starting_price" value={form.starting_price} onChange={handleChange} placeholder="35,000" />
                                    </Field>
                                    <Field label="Maximum Price (Rs.)">
                                        <input className="field-input" name="max_price" value={form.max_price} onChange={handleChange} placeholder="75,000" />
                                    </Field>
                                </div>
                                <div style={{ marginTop: 20, background: "#fff8f8", border: "1.5px solid #fdd", borderRadius: 12, padding: "16px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                                    <span style={{ fontSize: 18 }}>💡</span>
                                    <div>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#DB0000" }}>Pricing Visibility</p>
                                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888", lineHeight: 1.5 }}>
                                            Clients will see your price range (e.g. Rs. 35,000+) when browsing your profile and making booking decisions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Gallery */}
                        {activeTab === "Gallery" && (
                            <div>
                                <div className="upload-zone" onClick={() => galleryRef.current?.click()}>
                                    <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>Click to upload photos</p>
                                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#999" }}>PNG, JPG, WEBP up to 10MB each</p>
                                    <input ref={galleryRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handleGalleryUpload} />
                                </div>

                                {gallery.length > 0 && (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 20 }}>
                                        {gallery.map((img, index) => (
                                            <div key={index} className="gallery-card">
                                                <img src={img.url} alt="gallery" />
                                                <div className="gallery-overlay">
                                                    <button onClick={() => deleteGalleryItem(img)}
                                                            style={{ background: "#DB0000", border: "none", color: "#fff", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
                                                        Remove
                                                    </button>
                                                </div>
                                                {img.isNew && (
                                                    <div style={{ position: "absolute", top: 8, left: 8, background: "#22c55e", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>
                                                        NEW
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {gallery.length === 0 && (
                                    <p style={{ textAlign: "center", color: "#bbb", fontSize: 13, marginTop: 16 }}>No photos uploaded yet</p>
                                )}
                            </div>
                        )}

                        {/* Audio & Video */}
                        {activeTab === "Audio & Video" && (
                            <div>
                                <p style={{ margin: "0 0 20px", fontSize: 13, color: "#888", lineHeight: 1.6 }}>
                                    Add links to your YouTube videos, SoundCloud tracks, or Spotify songs. Include a title so clients know what they're listening to.
                                </p>

                                {mediaEntries.map((entry, i) => (
                                    <div key={i} className="media-card">
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ width: 28, height: 28, background: "#fff0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                                                    🎵
                                                </div>
                                                <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>Track {i + 1}</span>
                                            </div>
                                            <button className="btn-danger" onClick={() => removeMediaEntry(i)}>
                                                ✕ Remove
                                            </button>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                            <Field label="Song / Video Title">
                                                <input
                                                    className="field-input"
                                                    value={entry.title}
                                                    onChange={e => updateMediaEntry(i, "title", e.target.value)}
                                                    placeholder="e.g. Oba Nisa – Live at Nelum Pokuna"
                                                />
                                            </Field>
                                            <Field label="Media Link">
                                                <input
                                                    className="field-input"
                                                    value={entry.link}
                                                    onChange={e => updateMediaEntry(i, "link", e.target.value)}
                                                    placeholder="https://youtube.com/watch?v=..."
                                                />
                                            </Field>
                                        </div>
                                    </div>
                                ))}

                                <button className="btn-add" onClick={addMediaEntry}>
                                    + Add Another Track / Video
                                </button>
                            </div>
                        )}

                        {/* Social & Web */}
                        {activeTab === "Social & Web" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {[
                                    { label: "YouTube Channel", name: "youtube_link", placeholder: "https://youtube.com/@yourhandle", icon: "▶️" },
                                    { label: "Facebook Page", name: "facebook_link", placeholder: "https://facebook.com/yourpage", icon: "📘" },
                                    { label: "Instagram", name: "instagram_link", placeholder: "https://instagram.com/yourhandle", icon: "📷" },
                                    { label: "Spotify Artist", name: "spotify_link", placeholder: "https://open.spotify.com/artist/...", icon: "🎧" },
                                ].map(({ label, name, placeholder, icon }) => (
                                    <div key={name} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                                        <div style={{ width: 42, height: 42, background: "#F5F5F7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                                            {icon}
                                        </div>
                                        <Field label={label} style={{ flex: 1 }}>
                                            <input
                                                className="field-input"
                                                name={name}
                                                value={(form as any)[name]}
                                                onChange={handleChange}
                                                placeholder={placeholder}
                                            />
                                        </Field>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 28, marginTop: 28, borderTop: "1px solid #F4F4F4" }}>
                            <button onClick={() => navigate("/account")} className="btn-ghost">
                                Discard
                            </button>
                            <button onClick={handleSave} disabled={loading} className="btn-primary">
                                {loading ? (
                                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                                        Saving...
                                    </span>
                                ) : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={style}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 6, letterSpacing: "0.02em", textTransform: "uppercase" }}>
                {label}
            </label>
            {children}
        </div>
    );
}
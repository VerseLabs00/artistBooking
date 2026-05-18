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

const defaultForm: ProfileForm = {
    stage_name: "", category: "Musician", location: "", phone_number: "",
    email: "", short_bio: "", bio_1: "", bio_2: "", paragraph: "",
    starting_price: "", max_price: "", youtube_link: "", facebook_link: "",
    instagram_link: "", spotify_link: "",
};

export default function EditProfile() {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Basic Information");
    const [form, setForm] = useState<ProfileForm>(defaultForm);
    const [gallery, setGallery] = useState<{ id?: number; url: string; isNew?: boolean; file?: File }[]>([]);
    const [mediaLinks, setMediaLinks] = useState<string[]>(["", "", ""]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const avatarRef = useRef<HTMLInputElement>(null);
    const coverRef = useRef<HTMLInputElement>(null);
    const galleryRef = useRef<HTMLInputElement>(null);

    const tabs = ["Basic Information", "Overview", "Pricing", "Gallery", "Audio & Video", "Social & Web"];

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

                // Load avatar: check profile fields first, then media array
                const avatarUrl =
                    p.avatar_url || p.avatar || p.profile_image ||
                    (data.media || []).find((m: any) =>
                        ["avatar", "profile", "profile_picture", "profile_image"].includes(m.purpose)
                    )?.url || null;
                if (avatarUrl) setAvatarPreview(avatarUrl);

                // Load cover: check profile fields first, then media array
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
                setMediaLinks(vids.map((m: any) => m.url).concat(["", "", ""]).slice(0, 3));
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
                const validLinks = mediaLinks.filter(l => l.trim());
                if (validLinks.length > 0) {
                    await api.post("/profile/sync-links", { links: validLinks });
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
        // Show preview immediately before upload completes
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

    if (fetchLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#F8F9FB] pb-16">
            {/* HERO */}
            <div className="relative h-[260px] w-full">
                <img
                    src={coverPreview ?? "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e"}
                    className="w-full h-full object-cover"
                    alt="cover"
                />
                <button onClick={() => coverRef.current?.click()} className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 px-4 py-2 rounded-lg text-sm shadow">
                    Change Cover Photo
                </button>
                <input
                    ref={coverRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleMediaUpload("cover", f); }}
                />
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 lg:left-1/4 cursor-pointer" onClick={() => avatarRef.current?.click()}>
                    <img
                        src={avatarPreview ?? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"}
                        className="w-32 h-32 rounded-full border-[6px] border-white object-cover shadow-lg"
                        alt="avatar"
                    />
                    <input
                        ref={avatarRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleMediaUpload("avatar", f); }}
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-24 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* SIDEBAR */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-2xl p-6 shadow">
                        {tabs.map(tab => (
                            <div key={tab} onClick={() => setActiveTab(tab)}
                                 className={`px-4 py-2 rounded-lg cursor-pointer mb-2 ${activeTab === tab ? "bg-red-100 text-red-500" : "hover:bg-gray-100"}`}>
                                {tab}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONTENT */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl p-6 shadow space-y-6">
                        {success && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">{success}</div>}
                        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>}

                        {activeTab === "Basic Information" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Stage Name" name="stage_name" value={form.stage_name} onChange={handleChange} placeholder="Alex Jean" />
                                <div>
                                    <label className="text-sm text-gray-500">Category</label>
                                    <select name="category" value={form.category} onChange={handleChange} className="w-full mt-1 border rounded-lg px-3 py-2">
                                        <option>Musician</option><option>Producer</option><option>DJ</option>
                                    </select>
                                </div>
                                <Input label="Location" name="location" value={form.location} onChange={handleChange} placeholder="City, State" />
                                <Input label="Phone" name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="+94 777 123 456" />
                                <Input label="Email" name="email" value={form.email} onChange={handleChange} placeholder="alex@email.com" />
                                <Input label="Short Bio" name="short_bio" value={form.short_bio} onChange={handleChange} placeholder="Tell something about yourself..." />
                            </div>
                        )}

                        {activeTab === "Overview" && (
                            <div className="space-y-4">
                                <Textarea label="Biography 1" name="bio_1" value={form.bio_1} onChange={handleChange} />
                                <Textarea label="Biography 2" name="bio_2" value={form.bio_2} onChange={handleChange} />
                                <Textarea label="Paragraph" name="paragraph" value={form.paragraph} onChange={handleChange} />
                            </div>
                        )}

                        {activeTab === "Pricing" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Starting Price" name="starting_price" value={form.starting_price} onChange={handleChange} placeholder="100" />
                                <Input label="Maximum Price" name="max_price" value={form.max_price} onChange={handleChange} placeholder="1000" />
                                <div className="md:col-span-2 text-xs text-red-400">Clients will see your price range when booking</div>
                            </div>
                        )}

                        {activeTab === "Gallery" && (
                            <div>
                                <label className="text-sm text-gray-500">Upload Images</label>
                                <input ref={galleryRef} type="file" multiple accept="image/*" className="mt-2" onChange={handleGalleryUpload} />
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                                    {gallery.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img src={img.url} className="w-full h-28 object-cover rounded-lg shadow" alt="gallery" />
                                            <button onClick={() => deleteGalleryItem(img)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                ×
                                            </button>
                                            {img.isNew && <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">New</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "Audio & Video" && (
                            <div className="space-y-3">
                                {mediaLinks.map((link, i) => (
                                    <div key={i}>
                                        <label className="text-sm text-gray-500">Media Link {i + 1}</label>
                                        <input value={link} onChange={e => { const c = [...mediaLinks]; c[i] = e.target.value; setMediaLinks(c); }}
                                               placeholder="https://..." className="w-full mt-1 border rounded-lg px-3 py-2" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "Social & Web" && (
                            <div className="space-y-3">
                                <Input label="YouTube" name="youtube_link" value={form.youtube_link} onChange={handleChange} placeholder="https://youtube.com/..." />
                                <Input label="Facebook" name="facebook_link" value={form.facebook_link} onChange={handleChange} placeholder="https://facebook.com/..." />
                                <Input label="Instagram" name="instagram_link" value={form.instagram_link} onChange={handleChange} placeholder="https://instagram.com/..." />
                                <Input label="Spotify" name="spotify_link" value={form.spotify_link} onChange={handleChange} placeholder="https://spotify.com/..." />
                            </div>
                        )}

                        <div className="flex justify-end gap-4 pt-6">
                            <button onClick={() => navigate("/account")} className="text-gray-500">Discard</button>
                            <button onClick={handleSave} disabled={loading}
                                    className="bg-[#DB0000] text-white px-6 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed">
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Input({ label, name, value, onChange, placeholder }: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string;
}) {
    return (
        <div>
            <label className="text-sm text-gray-500">{label}</label>
            <input name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full mt-1 border rounded-lg px-3 py-2" />
        </div>
    );
}

function Textarea({ label, name, value, onChange }: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
    return (
        <div>
            <label className="text-sm text-gray-500">{label}</label>
            <textarea name={name} value={value} onChange={onChange} rows={4} className="w-full mt-1 border rounded-lg px-3 py-2" />
        </div>
    );
}

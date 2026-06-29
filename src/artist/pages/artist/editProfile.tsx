import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { compressImage } from "../../utils/compressImage";
import {
  User,
  FileText,
  DollarSign,
  Image,
  Music,
  Music2,
  Link,
  Youtube,
  Facebook,
  Instagram,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  X,
  Plus,
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
  full_price: string;
  advance: string;
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
  stage_name: "",
  category: "Musician",
  location: "",
  phone_number: "",
  email: "",
  short_bio: "",
  bio_1: "",
  bio_2: "",
  paragraph: "",
  full_price: "",
  advance: "",
  youtube_link: "",
  facebook_link: "",
  instagram_link: "",
  spotify_link: "",
};

const steps = [
  { id: "cover", label: "Photos", icon: <Image size={18} /> },
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
  const [gallery, setGallery] = useState<
    { id?: number; url: string; isNew?: boolean; file?: File }[]
  >([]);
  const [mediaEntries, setMediaEntries] = useState<MediaEntry[]>([
    { link: "", title: "" },
    { link: "", title: "" },
    { link: "", title: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const activeSection = steps[stepIndex].id;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

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
          full_price: p.full_price || "",
          advance: p.advance || "",
          youtube_link: p.youtube_link || "",
          facebook_link: p.facebook_link || "",
          instagram_link: p.instagram_link || "",
          spotify_link: p.spotify_link || "",
        });

        const avatarUrl = p.avatar_url || p.avatar || p.profile_image || null;
        if (avatarUrl) setAvatarPreview(avatarUrl);

        const coverUrl = p.cover_url || p.cover || p.cover_image || null;
        if (coverUrl) setCoverPreview(coverUrl);

        const imgs = (data.media || []).filter(
          (m: any) =>
            m.media_type === "image" &&
            ![
              "avatar",
              "profile",
              "cover",
              "banner",
              "verification_front",
              "verification_back",
              "selfie",
            ].includes(m.purpose),
        );
        setGallery(imgs.map((m: any) => ({ id: m.id, url: m.url })));

        const vids = (data.media || []).filter(
          (m: any) =>
            m.media_type === "video" &&
            m.purpose === "talent_media" &&
            m.is_external_link,
        );
        const loaded: MediaEntry[] = vids.map((m: any) => ({
          link: m.url,
          title: m.title || "",
        }));
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

  const formatPriceInput = (value: string) => {
    return value.replace(/[^0-9]/g, "");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "full_price" || name === "advance") {
      setForm((prev) => ({ ...prev, [name]: formatPriceInput(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setIsDirty(true);
  };

  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const handleSave = async () => {
    setLoading(true);
    const saveToast = toast.loading("Saving your changes...");
    try {
      const payload: Record<string, any> = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== "") payload[k] = v;
      });
      await api.put("/profile", payload);

      // Audio & Video
      const validLinks = mediaEntries
        .filter((e) => e.link.trim())
        .map((e) => ({ url: e.link, title: e.title }));
      await api.post("/profile/sync-links", { links: validLinks });

      // Gallery
      const newImages = gallery.filter((g) => g.isNew && g.file);
      for (const img of newImages) {
        const fd = new FormData();
        fd.append("purpose", "performance");
        fd.append("file", img.file!);
        await api.post("/profile/gallery", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success("Profile updated successfully!", { id: saveToast });
      setIsDirty(false);

      // Refresh gallery to get real IDs
      const { data } = await api.get("/profile");
      const imgs = (data.media || []).filter(
        (m: any) =>
          m.media_type === "image" &&
          ![
            "avatar",
            "profile",
            "cover",
            "banner",
            "verification_front",
            "verification_back",
            "selfie",
          ].includes(m.purpose),
      );
      setGallery(imgs.map((m: any) => ({ id: m.id, url: m.url })));

      // Navigate to account page after successful save
      navigate("/account");
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const message = err.response?.data?.message;

      if (errors && typeof errors === "object") {
        // Format field-specific errors for better readability
        const errorMessages = Object.entries(errors).map(([field, msgs]) => {
          const fieldName = field
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          const errorList = Array.isArray(msgs) ? msgs : [msgs];
          return `• ${fieldName}: ${errorList.join(", ")}`;
        });
        toast.error(
          `Please fix the following errors:\n${errorMessages.join("\n")}`,
          {
            id: saveToast,
            duration: 6000,
            style: { whiteSpace: "pre-line" },
          },
        );
      } else if (message) {
        toast.error(message, { id: saveToast, duration: 5000 });
      } else {
        toast.error(
          "Failed to save profile. Please check your connection and try again.",
          { id: saveToast },
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = async (type: "avatar" | "cover", file: File) => {
    // Client-side validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Failed to upload ${type}: File size exceeds 5MB limit.`);
      return;
    }

    const allowedExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "heic",
      "heif",
    ];
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      toast.error(
        `Failed to upload ${type}: Unsupported format. Allowed: JPG, PNG, GIF, WebP, HEIC`,
      );
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === "avatar") setAvatarPreview(previewUrl);
    if (type === "cover") setCoverPreview(previewUrl);

    const uploadToast = toast.loading(`Uploading ${type}...`);
    try {
      // Compress image to handle mobile formats (HEIC/HEIF) and reduce file size
      const processedFile = await compressImage(file);
      const fd = new FormData();
      fd.append("type", type);
      fd.append("file", processedFile);
      await api.post("/profile/media", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} updated!`,
        { id: uploadToast },
      );
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const message = err.response?.data?.message;

      if (errors && typeof errors === "object") {
        const errorMessages = Object.entries(errors).map(([field, msgs]) => {
          const fieldName = field
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          const errorList = Array.isArray(msgs) ? msgs : [msgs];
          return `• ${fieldName}: ${errorList.join(", ")}`;
        });
        toast.error(`Upload failed:\n${errorMessages.join("\n")}`, {
          id: uploadToast,
          duration: 6000,
          style: { whiteSpace: "pre-line" },
        });
      } else if (message) {
        toast.error(message, { id: uploadToast, duration: 5000 });
      } else {
        toast.error(
          `Failed to upload ${type}. Please check your connection and try again.`,
          { id: uploadToast },
        );
      }
    }
  };

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    const existingCount = gallery.length;
    const remainingSlots = 3 - existingCount;
    const filesToProcess = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast.error(
        `You can only upload up to 3 images. ${files.length - remainingSlots} file(s) were skipped.`,
      );
    }

    const validFiles: { url: string; isNew: boolean; file: File }[] = [];
    for (const file of filesToProcess) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(
          `File "${file.name}" exceeds the 50MB limit and was skipped.`,
        );
        continue;
      }
      const allowedExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "heic",
        "heif",
      ];
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension || !allowedExtensions.includes(extension)) {
        toast.error(
          `File "${file.name}" has an unsupported format and was skipped. Allowed formats: JPG, PNG, GIF, WebP, HEIC`,
        );
        continue;
      }
      // Compress images to handle mobile formats (HEIC/HEIF) and reduce file size
      const processedFile = await compressImage(file);
      validFiles.push({
        url: URL.createObjectURL(processedFile),
        isNew: true,
        file: processedFile,
      });
    }
    if (validFiles.length > 0) {
      setGallery((prev) => [...prev, ...validFiles]);
      setIsDirty(true);
    }
  };

  const deleteGalleryItem = async (item: {
    id?: number;
    url: string;
    isNew?: boolean;
  }) => {
    if (item.id) {
      const delToast = toast.loading("Removing photo...");
      try {
        await api.delete(`/profile/gallery/${item.id}`);
        toast.success("Photo removed", { id: delToast });
      } catch (err: any) {
        const errors = err.response?.data?.errors;
        const message = err.response?.data?.message;

        if (errors && typeof errors === "object") {
          const errorMessages = Object.entries(errors).map(([field, msgs]) => {
            const fieldName = field
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
            const errorList = Array.isArray(msgs) ? msgs : [msgs];
            return `• ${fieldName}: ${errorList.join(", ")}`;
          });
          toast.error(`Failed to remove photo:\n${errorMessages.join("\n")}`, {
            id: delToast,
            duration: 6000,
            style: { whiteSpace: "pre-line" },
          });
        } else if (message) {
          toast.error(message, { id: delToast, duration: 5000 });
        } else {
          toast.error(
            "Failed to remove photo. Please check your connection and try again.",
            { id: delToast },
          );
        }
        return;
      }
    }
    setGallery((prev) => prev.filter((g) => g.url !== item.url));
    setIsDirty(true);
  };

  const updateMediaEntry = (
    index: number,
    field: keyof MediaEntry,
    value: string,
  ) => {
    setMediaEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry,
      ),
    );
    setIsDirty(true);
  };

  const addMediaEntry = () => {
    setMediaEntries((prev) => [...prev, { link: "", title: "" }]);
    setIsDirty(true);
  };

  const removeMediaEntry = (index: number) => {
    setMediaEntries((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  if (fetchLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-[#E0263A] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 text-sm font-medium tracking-wide">
            Loading your profile…
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] font-sans">
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
                * { font-family: 'Inter', sans-serif; }
                .ed-display { font-family: 'Fraunces', serif; }
                .ed-input {
                    width: 100%; padding: 14px 16px; border-radius: 14px; border: 1.5px solid #E5E5E5;
                    transition: all 0.18s ease; outline: none; background: #FFFFFF; color: #1A1A1A;
                }
                .ed-input::placeholder { color: #9CA3AF; }
                .ed-input:focus { border-color: #E0263A; box-shadow: 0 0 0 4px rgba(224,38,58,0.16); }
                .ed-card {
                    background: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 28px;
                    padding: 28px 22px;
                }
                @media (min-width: 640px) { .ed-card { padding: 40px 36px; } }
                @media (min-width: 1024px) { .ed-card { padding: 52px 56px; } }
                .ed-progress-dot { transition: all 0.25s ease; }
                .ed-step-btn { transition: all 0.18s ease; }
                .ed-step-btn:hover { color: #1A1A1A; }
                .fade-in { animation: edFadeIn 0.35s ease; }
                @keyframes edFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E5E5] px-4 sm:px-8 py-3 sm:py-4 grid grid-cols-3 items-center gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={() => navigate("/account")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0 text-[#1A1A1A]"
          >
            <X size={18} />
          </button>
          <div className="min-w-0">
            <p className="ed-display text-base sm:text-lg font-semibold tracking-tight truncate">
              Edit your profile
            </p>
            <p className="text-[11px] text-gray-500 font-medium hidden sm:block">
              Step {stepIndex + 1} of {steps.length} · {steps[stepIndex].label}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={`ed-progress-dot h-1.5 rounded-full ${
                i === stepIndex
                  ? "w-7 bg-[#E0263A]"
                  : i < stepIndex
                    ? "w-3 bg-[#E0263A]/40"
                    : "w-3 bg-gray-300"
              }`}
            />
          ))}
        </div>

        <div className="flex justify-end">
          <span className="text-[11px] font-bold text-gray-500 shrink-0 sm:hidden">
            {stepIndex + 1}/{steps.length}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-32">
        {/* ===== STEP: COVER + AVATAR ===== */}
        {activeSection === "cover" && (
          <div className="fade-in pb-8">
            <SlideHeader
              icon={<Image size={20} />}
              title="Your photos"
              subtitle="First impressions matter — set a cover banner and profile photo."
            />
            <div className="relative">
              <div className="h-44 sm:h-60 rounded-[28px] overflow-hidden relative bg-gray-200 flex items-center justify-center">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    className="w-full h-full object-cover"
                    alt="cover"
                  />
                ) : (
                  <span className="text-gray-400 font-medium">
                    No cover photo
                  </span>
                )}
                <div className="absolute inset-0 bg-black/30" />
                <button
                  onClick={() => coverRef.current?.click()}
                  className="absolute bottom-5 right-5 bg-white/80 backdrop-blur border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-2 hover:bg-white transition-all text-[#1A1A1A]"
                >
                  <Image size={14} /> Change cover
                </button>
                <input
                  ref={coverRef}
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleMediaUpload("cover", e.target.files[0])
                  }
                />
              </div>

              <div className="flex items-end gap-5 px-2 -mt-10 sm:-mt-12">
                <div className="relative group/avatar shrink-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[28px] border-[5px] border-[#FAFAFA] bg-gray-200 flex items-center justify-center shadow-2xl overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        className="w-full h-full object-cover"
                        alt="avatar"
                      />
                    ) : (
                      <User size={48} className="text-gray-400" />
                    )}
                  </div>
                  <button
                    onClick={() => avatarRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-[#E0263A] text-white p-2.5 rounded-2xl border-4 border-[#FAFAFA] shadow-lg hover:scale-105 transition-all"
                  >
                    <Image size={14} />
                  </button>
                  <input
                    ref={avatarRef}
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleMediaUpload("avatar", e.target.files[0])
                    }
                  />
                </div>
                <div className="pb-2 min-w-0">
                  <p className="ed-display text-xl sm:text-2xl font-semibold truncate">
                    {form.stage_name || "Your stage name"}
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    {form.category}
                    {form.location ? ` · ${form.location}` : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP: BASIC INFO ===== */}
        {activeSection === "basic" && (
          <div className="fade-in ed-card">
            <SlideHeader
              icon={<User size={20} />}
              title="Basic information"
              subtitle="The essentials customers see first."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Stage name">
                <input
                  className="ed-input"
                  name="stage_name"
                  value={form.stage_name}
                  onChange={handleChange}
                  placeholder="Alex Jean"
                />
              </Field>
              <Field label="Category">
                <select
                  className="ed-input cursor-pointer"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option>Musician</option>
                  <option>Singer</option>
                  <option>Rapper</option>
                  <option>DJ</option>
                  <option>Live Band</option>
                  <option>Producer</option>
                  <option>Dance Group</option>
                  <option>Dancer</option>
                  <option>MC</option>
                  <option>Sound System</option>
                  <option>Lighting System</option>
                  <option>Photographer</option>
                  <option>Videographer</option>
                </select>
              </Field>
              <Field label="Performance location">
                <input
                  className="ed-input"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Colombo, Sri Lanka"
                />
              </Field>
              <Field label="Contact phone">
                <input
                  className="ed-input"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  placeholder="+94 777 123 456"
                />
              </Field>
              <Field label="Business email" className="sm:col-span-2">
                <input
                  className="ed-input"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="alex@email.com"
                />
              </Field>
              <Field label="Tagline" className="sm:col-span-2">
                <input
                  className="ed-input"
                  name="short_bio"
                  value={form.short_bio}
                  onChange={handleChange}
                  placeholder="Bringing life to your events with premium sound..."
                />
              </Field>
            </div>
          </div>
        )}

        {/* ===== STEP: OVERVIEW & BIO ===== */}
        {activeSection === "overview" && (
          <div className="fade-in ed-card">
            <SlideHeader
              icon={<FileText size={20} />}
              title="Biography & experience"
              subtitle="Tell your story — this builds trust with new clients."
            />
            <div className="space-y-5">
              <Field label="The introduction">
                <textarea
                  className="ed-input min-h-[130px]"
                  name="bio_1"
                  value={form.bio_1}
                  onChange={handleChange}
                  placeholder="Describe your journey and what makes you unique..."
                />
              </Field>
              <Field label="The details">
                <textarea
                  className="ed-input min-h-[130px]"
                  name="bio_2"
                  value={form.bio_2}
                  onChange={handleChange}
                  placeholder="Talk about your achievements, famous gigs, and musical style..."
                />
              </Field>
              <Field label="Extra information">
                <textarea
                  className="ed-input min-h-[100px]"
                  name="paragraph"
                  value={form.paragraph}
                  onChange={handleChange}
                  placeholder="Equipment list, special requirements, or anything else..."
                />
              </Field>
            </div>
          </div>
        )}

        {/* ===== STEP: PRICING ===== */}
        {activeSection === "pricing" && (
          <div className="fade-in ed-card">
            <SlideHeader
              icon={<DollarSign size={20} />}
              title="Pricing structure"
              subtitle="Give clients a clear sense of your rates."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Full Price (LKR)">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm"></span>
                  <input
                    className="ed-input pl-12"
                    name="full_price"
                    value={form.full_price}
                    onChange={handleChange}
                    placeholder="75,000"
                  />
                </div>
              </Field>
              <Field label="Advance (LKR)">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm"></span>
                  <input
                    className="ed-input pl-12"
                    name="advance"
                    value={form.advance}
                    onChange={handleChange}
                    placeholder="35,000"
                  />
                </div>
              </Field>
            </div>
            <div className="mt-6 p-5 bg-gray-100 rounded-2xl flex gap-3 items-start border border-[#E5E5E5]">
              <AlertCircle
                size={16}
                className="text-[#E0263A] mt-0.5 shrink-0"
              />
              <p className="text-sm text-gray-600 leading-relaxed">
                Set your full price and advance payment. Customers will see{" "}
                <span className="text-gray-900 font-semibold">
                  Rs. {form.full_price || "75,000"}
                </span>{" "}
                with an advance of{" "}
                <span className="text-gray-900 font-semibold">
                  Rs. {form.advance || "35,000"}
                </span>
                .
              </p>
            </div>
          </div>
        )}

        {/* ===== STEP: GALLERY ===== */}
        {activeSection === "gallery" && (
          <div className="fade-in ed-card">
            <div className="flex items-center justify-between mb-2">
              <SlideHeader
                icon={<Image size={20} />}
                title="Performance gallery"
                subtitle="Showcase your best moments on stage."
                noMargin
              />
              <button
                onClick={() => galleryRef.current?.click()}
                disabled={gallery.length >= 3}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  gallery.length >= 3
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#1A1A1A] text-white hover:bg-gray-800"
                }`}
              >
                Upload
              </button>
              <p className="text-xs text-gray-500 mt-2">
                {gallery.length}/3 images uploaded
              </p>
              <input
                ref={galleryRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleGalleryUpload}
              />
            </div>

            {gallery.length > 0 ? (
              <div className="grid grid-cols-3 gap-4 mt-6">
                {gallery.map((img, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square rounded-[20px] overflow-hidden border border-[#E5E5E5]"
                  >
                    <img
                      src={img.url}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      alt="gallery"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => deleteGalleryItem(img)}
                        className="bg-white text-[#E0263A] p-2.5 rounded-xl hover:bg-gray-100 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {img.isNew && (
                      <div className="absolute top-3 left-3 bg-[#2ECC71] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        New
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 py-14 border-2 border-dashed border-[#E5E5E5] rounded-[24px] text-center">
                <p className="text-sm text-gray-500 font-medium">
                  No photos yet. Showcase your past events here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===== STEP: AUDIO & VIDEO ===== */}
        {activeSection === "media" && (
          <div className="fade-in ed-card">
            <SlideHeader
              icon={<Music size={20} />}
              title="Audio & video samples"
              subtitle="Share links so clients can hear or see you perform."
            />
            <div className="space-y-3">
              {mediaEntries.map((entry, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    className="ed-input"
                    value={entry.link}
                    onChange={(e) =>
                      updateMediaEntry(i, "link", e.target.value)
                    }
                    placeholder="https://youtube.com/... or spotify link"
                  />
                  {mediaEntries.length > 1 && (
                    <button
                      onClick={() => removeMediaEntry(i)}
                      className="text-gray-400 hover:text-[#E0263A] transition-colors shrink-0 p-2"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}

              {mediaEntries[mediaEntries.length - 1]?.link.trim() && (
                <button
                  onClick={addMediaEntry}
                  className="w-full py-3.5 border-2 border-dashed border-[#E5E5E5] rounded-[18px] text-gray-500 text-sm font-bold hover:border-[#E0263A]/40 hover:text-[#E0263A] transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={15} /> Add another link
                </button>
              )}
            </div>
          </div>
        )}

        {/* ===== STEP: SOCIAL ===== */}
        {activeSection === "social" && (
          <div className="fade-in ed-card">
            <SlideHeader
              icon={<Link size={20} />}
              title="Social & web presence"
              subtitle="Help fans and clients find you elsewhere."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-gray-100 border border-[#E5E5E5] rounded-xl flex items-center justify-center text-[#E0263A] shrink-0">
                  <Youtube size={20} />
                </div>
                <Field label="YouTube" className="flex-1">
                  <input
                    className="ed-input"
                    name="youtube_link"
                    value={form.youtube_link}
                    onChange={handleChange}
                    placeholder="@handle"
                  />
                </Field>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-gray-100 border border-[#E5E5E5] rounded-xl flex items-center justify-center text-[#3B82F6] shrink-0">
                  <Facebook size={20} />
                </div>
                <Field label="Facebook" className="flex-1">
                  <input
                    className="ed-input"
                    name="facebook_link"
                    value={form.facebook_link}
                    onChange={handleChange}
                    placeholder="fb.com/..."
                  />
                </Field>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-gray-100 border border-[#E5E5E5] rounded-xl flex items-center justify-center text-[#EC4899] shrink-0">
                  <Instagram size={20} />
                </div>
                <Field label="Instagram" className="flex-1">
                  <input
                    className="ed-input"
                    name="instagram_link"
                    value={form.instagram_link}
                    onChange={handleChange}
                    placeholder="url"
                  />
                </Field>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-gray-100 border border-[#E5E5E5] rounded-xl flex items-center justify-center text-[#2ECC71] shrink-0">
                  <Music2 size={20} />
                </div>
                <Field label="Spotify" className="flex-1">
                  <input
                    className="ed-input"
                    name="spotify_link"
                    value={form.spotify_link}
                    onChange={handleChange}
                    placeholder="url"
                  />
                </Field>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== BOTTOM NAV BAR ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E5E5E5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3">
          <button
            onClick={goBack}
            disabled={isFirstStep}
            className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              isFirstStep
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ArrowLeft size={16} />{" "}
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {isLastStep ? (
              <button
                onClick={handleSave}
                disabled={loading || !isDirty}
                className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                  isDirty
                    ? "bg-[#E0263A] text-white shadow-lg shadow-[#E0263A]/20 hover:brightness-110 active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Save size={16} />
                {loading ? "Saving..." : "Save all changes"}
              </button>
            ) : (
              <button
                onClick={goNext}
                className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl text-sm font-bold bg-[#1A1A1A] text-white hover:bg-gray-800 transition-all flex items-center gap-2 active:scale-95"
              >
                Next <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideHeader({
  icon,
  title,
  subtitle,
  noMargin = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  noMargin?: boolean;
}) {
  return (
    <div className={noMargin ? "mb-0" : "mb-8"}>
      <div className="flex items-center gap-3 mb-2">
        <span className="p-2 bg-gray-100 border border-[#E5E5E5] text-[#E0263A] rounded-lg">
          {icon}
        </span>
        <h3 className="ed-display text-lg sm:text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2.5 ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}

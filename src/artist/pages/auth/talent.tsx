import React, { useState, useRef, useCallback } from "react";
import { Upload, X, CheckCircle2, AlertCircle, ImagePlus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import stage from "../../../../public/bg-login.png";
import api from "../../api/axios";

const MAX_FILE_MB    = 10;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const MAX_PHOTOS     = 6;
const MIN_PHOTOS     = 1;
const ALLOWED_TYPES  = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

interface PhotoEntry {
    file: File;
    preview: string;
}

const Talent: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const resuming = (location.state as any)?.resuming === true;

    const [photos,   setPhotos]   = useState<PhotoEntry[]>([]);
    const [loading,  setLoading]  = useState(false);
    const [uploadPct, setUploadPct] = useState(0);
    const [error,    setError]    = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFilesSelected = useCallback((files: FileList | null) => {
        if (!files) return;
        setError("");

        const incoming = Array.from(files);
        const remaining = MAX_PHOTOS - photos.length;

        if (incoming.length > remaining) {
            setError(`You can upload a maximum of ${MAX_PHOTOS} photos. ${photos.length} already added.`);
            return;
        }

        const valid: PhotoEntry[] = [];
        for (const file of incoming) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setError(`"${file.name}" is not supported. Use JPG, PNG, or WebP.`);
                return;
            }
            if (file.size > MAX_FILE_BYTES) {
                setError(`"${file.name}" exceeds ${MAX_FILE_MB} MB. Please use a smaller image.`);
                return;
            }
            valid.push({ file, preview: URL.createObjectURL(file) });
        }

        setPhotos(prev => [...prev, ...valid]);
    }, [photos.length]);

    const removePhoto = (index: number) => {
        setPhotos(prev => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
        setError("");
    };

    const handleContinue = async () => {
        setError("");
        if (photos.length < MIN_PHOTOS) {
            setError(`Please upload at least ${MIN_PHOTOS} photo of your work to continue.`);
            return;
        }

        setLoading(true);
        setUploadPct(0);

        try {
            const formData = new FormData();
            photos.forEach(p => formData.append("photos[]", p.file));

            await api.post("/onboarding/talent", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (e) => {
                    if (e.total) setUploadPct(Math.round((e.loaded / e.total) * 100));
                },
            });

            navigate("/account");
        } catch (err: any) {
            const errors = err.response?.data?.errors;
            setError(errors
                ? Object.values(errors).flat().join(" ")
                : err.response?.data?.message || "Upload failed. Please try again."
            );
        } finally {
            setLoading(false);
            setUploadPct(0);
        }
    };

    return (
        <div
            className="h-screen overflow-hidden flex items-center justify-center p-2 sm:p-6 bg-cover bg-center"
            style={{ backgroundImage: `url(${stage})`, fontFamily: "'Fraunces', serif" }}
        >
            <div className="relative w-full max-w-6xl h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div
                    onClick={() => navigate("/verification")}
                    className="absolute top-4 right-4 sm:top-6 sm:right-8 text-xs sm:text-sm font-medium cursor-pointer flex items-center gap-2 z-20"
                >
                    ← Back
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                    {/* LEFT */}
                    <div className="hidden md:flex relative p-10 lg:p-16 flex-col justify-center h-full">
                        <div className="absolute inset-0 bg-white" />
                        <div className="relative z-10">
                            <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">
                                Show us<br />your work
                            </h1>
                            <p className="mt-6 max-w-md leading-relaxed text-gray-600">
                                Upload photos from your concerts, gigs, events or studio sessions.
                                Our team reviews these to verify your talent before approving your profile.
                            </p>
                            <div className="mt-8 space-y-2">
                                {[
                                    ["Photos",   `${MIN_PHOTOS}–${MAX_PHOTOS} images required`],
                                    ["Formats",  "JPG, PNG, WebP"],
                                    ["Max size", `${MAX_FILE_MB} MB per photo`],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="font-semibold text-gray-800 w-20 shrink-0">{label}</span>
                                        <span>{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 mt-10">
                                <div className="flex -space-x-3">
                                    {["men/32", "women/44", "men/76"].map(p => (
                                        <img key={p} src={`https://randomuser.me/api/portraits/${p}.jpg`}
                                            className="w-10 h-10 rounded-full border-2 border-white" alt="" />
                                    ))}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">600+ artists already joined</p>
                                    <div className="text-yellow-400 text-sm">★★★★★</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="p-4 sm:p-8 lg:p-16 h-full overflow-y-auto scroll-smooth pb-10 sm:pb-12">
                        {/* Step indicator */}
                        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm mb-6 sm:mb-8 mt-6 md:mt-0 flex-wrap">
                            {["Basic Info", "Verification", "Talent Show Case"].map(label => (
                                <div key={label} className="flex items-center gap-2 text-green-600 font-medium">
                                    <div className="w-5 h-5 rounded-full border border-green-600 flex items-center justify-center text-xs">✓</div>
                                    {label}
                                </div>
                            ))}
                        </div>

                        <h2 className="text-lg sm:text-xl font-semibold mb-1">
                            Performance Photos <span className="text-red-500">*</span>
                        </h2>
                        <p className="text-gray-500 text-xs mb-6">
                            Upload {MIN_PHOTOS}–{MAX_PHOTOS} photos from your concerts, gigs or events.
                            These are reviewed by our team and are <span className="font-medium text-gray-700">not shown publicly</span>.
                        </p>

                        {/* Resume banner */}
                        {resuming && (
                            <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                                <span className="text-amber-500 text-lg leading-none mt-0.5">⚠</span>
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">One last step!</p>
                                    <p className="text-xs text-amber-700 mt-0.5">
                                        Upload your performance photos to complete registration and submit for approval.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="mb-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Photo grid */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {photos.map((p, i) => (
                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                                    <img src={p.preview} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                                    <button
                                        onClick={() => removePhoto(i)}
                                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X size={12} className="text-white" />
                                    </button>
                                    <div className="absolute bottom-1.5 right-1.5">
                                        <CheckCircle2 size={16} className="text-green-400 drop-shadow" />
                                    </div>
                                </div>
                            ))}

                            {/* Add more slot */}
                            {photos.length < MAX_PHOTOS && (
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-red-500 flex flex-col items-center justify-center cursor-pointer transition group"
                                >
                                    <ImagePlus size={22} className="text-gray-400 group-hover:text-red-500 transition mb-1" />
                                    <p className="text-[10px] text-gray-400 group-hover:text-red-500 transition text-center leading-tight px-1">
                                        {photos.length === 0 ? "Add photos" : "Add more"}
                                    </p>
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-gray-400 mb-6">
                            {photos.length}/{MAX_PHOTOS} photos added
                        </p>

                        <input
                            ref={fileRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/*"
                            multiple
                            className="hidden"
                            onChange={e => handleFilesSelected(e.target.files)}
                        />

                        {/* Upload progress */}
                        {loading && (
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Uploading photos…</span>
                                    <span>{uploadPct}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadPct || 5}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <p className="text-sm font-medium">Step 3 of 3</p>
                                <p className="text-xs text-gray-500">Upload your performance photos to complete registration</p>
                            </div>
                            <button
                                onClick={handleContinue}
                                disabled={loading || photos.length < MIN_PHOTOS}
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {loading ? "Uploading…" : "Continue →"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Talent;

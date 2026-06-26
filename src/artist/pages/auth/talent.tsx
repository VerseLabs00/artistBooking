import React, { useState, useRef, useCallback, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Video } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import stage from "../../../../public/bg-login.png";
import api from "../../api/axios";
import { compressVideo } from "../../utils/compressVideo";
import { getStats } from "../../../customer/services/discoveryService";

const MAX_VIDEO_MB    = 50;
const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska", "video/webm", "video/x-flv", "video/x-ms-wmv", "video/mp4v-es", "video/3gpp"];

interface VideoEntry {
    file: File;
    preview: string;
}

const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const Talent: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const resuming = (location.state as any)?.resuming === true;

    const [stats, setStats] = useState<{ total_artists: number; sample_avatars: string[] }>({
        total_artists: 0,
        sample_avatars: []
    });

    useEffect(() => {
        getStats()
            .then(data => {
                if (data && typeof data === 'object' && Array.isArray(data.sample_avatars)) {
                    setStats(data);
                }
            })
            .catch(() => {});

        // Load saved talent video if it exists
        api.get("/onboarding/talent")
            .then(response => {
                const savedData = response.data;
                if (savedData.video_url) {
                    setVideo({ file: null as any, preview: savedData.video_url });
                    setDataAlreadySaved(true);
                }
            })
            .catch(() => {
                // No saved data exists, keep default empty state
            });
    }, []);

    const [video,    setVideo]    = useState<VideoEntry | null>(null);
    const [loading,  setLoading]  = useState(false);
    const [uploadPct, setUploadPct] = useState(0);
    const [error,    setError]    = useState("");
    const [dataAlreadySaved, setDataAlreadySaved] = useState(false);
    const videoRef = useRef<HTMLInputElement>(null);

    const handleVideoSelected = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return;
        if (files.length > 1) {
            setError("Please upload only one video.");
            return;
        }
        setError("");

        const file = files[0];
        if (!ALLOWED_VIDEO_TYPES.some(type => type === file.type || file.type.startsWith("video/"))) {
            setError(`"${file.name}" is not a supported video format.`);
            return;
        }
        if (file.size > MAX_VIDEO_BYTES) {
            setError(`"${file.name}" exceeds ${MAX_VIDEO_MB} MB limit for videos (${formatBytes(file.size)}). Please use a smaller video.`);
            return;
        }

        setVideo({ file, preview: URL.createObjectURL(file) });
    }, []);

    const removeVideo = () => {
        if (video) {
            URL.revokeObjectURL(video.preview);
        }
        setVideo(null);
        setError("");
    };

    const handleContinue = async () => {
        setError("");

        // If data is already saved and user hasn't selected a new video, just navigate
        if (dataAlreadySaved && video && !video.file) {
            navigate("/account");
            return;
        }

        setLoading(true);
        setUploadPct(0);

        try {
            const formData = new FormData();
            if (video && video.file) {
                // iPhone videos (MOV) get MIME type correction
                const processedVideo = await compressVideo(video.file);
                console.log(`Uploading video: ${processedVideo.name}, size: ${(processedVideo.size / 1024 / 1024).toFixed(2)}MB, type: ${processedVideo.type}`);
                formData.append("video", processedVideo);
                
                // Log FormData contents for debugging
                console.log("FormData entries:");
                for (const [key, value] of formData.entries()) {
                    console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}, ${(value.size / 1024 / 1024).toFixed(2)}MB, ${value.type}` : value);
                }
            }

            await api.post("/onboarding/talent", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (e) => {
                    if (e.total) setUploadPct(Math.round((e.loaded / e.total) * 100));
                },
            });

            navigate("/account");
        } catch (err: any) {
            console.error("Video upload error:", err);
            console.error("Error status:", err.response?.status);
            console.error("Error data:", err.response?.data);
            
            const errors = err.response?.data?.errors;
            const message = err.response?.data?.message;
            
            if (err.response?.status === 413) {
                setError("Upload failed: File too large. Your video exceeds the server's upload limit. Please try a smaller video (under 50MB).");
            } else if (errors && typeof errors === 'object') {
                const errorMessages = Object.entries(errors).map(([field, msgs]) => {
                    const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    const errorList = Array.isArray(msgs) ? msgs : [msgs];
                    return `• ${fieldName}: ${errorList.join(', ')}`;
                });
                setError(`Upload failed:\n${errorMessages.join('\n')}`);
            } else if (message) {
                setError(message);
            } else {
                setError(`Upload failed: ${err.message || "Please try again."}`);
            }
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
                                Show us<br />your talent
                            </h1>
                            <p className="mt-6 max-w-md leading-relaxed text-gray-600">
                                Upload a short video showcasing your performance. Our team reviews this to verify your talent before approving your profile.
                            </p>
                            <div className="mt-8 space-y-2">
                                {[
                                    ["Video",    "Required talent video"],
                                    ["Formats",  "MP4, MOV, AVI, MKV, WebM"],
                                    ["Max size", `${MAX_VIDEO_MB} MB`],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="font-semibold text-gray-800 w-20 shrink-0">{label}</span>
                                        <span>{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 mt-10">
                                <div className="flex -space-x-3">
                                    {(stats?.sample_avatars && Array.isArray(stats.sample_avatars) && stats.sample_avatars.length > 0 ? stats.sample_avatars : []).slice(0, 5).map((src, i) => (
                                        <img key={i} src={src} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="" />
                                    ))}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{(stats?.total_artists ?? 0) > 100 ? "100+ artists already joined" : `${stats?.total_artists ?? 0} artists already joined`}</p>
                                    <div className="text-yellow-400 text-sm">★★★★★</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="p-4 sm:p-8 lg:p-16 h-full overflow-y-auto scroll-smooth pb-10 sm:pb-12">
                        {/* Step indicator */}
                        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm mb-6 sm:mb-8 mt-6 md:mt-0 flex-wrap">
                            {["Basic Info", "Verification", "Talent Video"].map(label => (
                                <div key={label} className="flex items-center gap-2 text-green-600 font-medium">
                                    <div className="w-5 h-5 rounded-full border border-green-600 flex items-center justify-center text-xs">✓</div>
                                    {label}
                                </div>
                            ))}
                        </div>

                        <h2 className="text-lg sm:text-xl font-semibold mb-1">
                            Talent Video <span className="text-red-500">*</span>
                        </h2>
                        <p className="text-gray-500 text-xs mb-6">
                            Upload a short video showcasing your talent. This is reviewed by our team and is <span className="font-medium text-gray-700">not shown publicly</span>.
                        </p>

                        {/* Resume banner */}
                        {resuming && (
                            <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                                <span className="text-amber-500 text-lg leading-none mt-0.5">⚠</span>
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">One last step!</p>
                                    <p className="text-xs text-amber-700 mt-0.5">
                                        Upload your talent video to complete registration and submit for approval.
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

                        {!video ? (
                            <div
                                onClick={() => !dataAlreadySaved && videoRef.current?.click()}
                                className={`aspect-video rounded-xl border-2 border-dashed border-gray-300 hover:border-red-500 flex flex-col items-center justify-center cursor-pointer transition group mb-6 ${dataAlreadySaved ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                                <Video size={32} className="text-gray-400 group-hover:text-red-500 transition mb-2" />
                                <p className="text-xs text-gray-400 group-hover:text-red-500 transition text-center leading-tight px-2">
                                    Upload a talent video (max {MAX_VIDEO_MB} MB)
                                </p>
                                <p className="text-[10px] text-gray-300 mt-1">MP4, MOV, AVI, MKV, WebM supported</p>
                            </div>
                        ) : (
                            <div className="mb-6">
                                <div className="relative rounded-xl overflow-hidden bg-black group">
                                    <video
                                        src={video.preview}
                                        controls
                                        className="w-full max-h-[300px] object-contain"
                                    />
                                    {!dataAlreadySaved && (
                                        <button
                                            onClick={removeVideo}
                                            className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X size={14} className="text-white" />
                                        </button>
                                    )}
                                    <div className="absolute bottom-2 right-2">
                                        <CheckCircle2 size={16} className="text-green-400 drop-shadow" />
                                    </div>
                                </div>
                                {video.file && (
                                    <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                                        {video.file.name} · {formatBytes(video.file.size)}
                                    </p>
                                )}
                            </div>
                        )}

                        <input
                            ref={videoRef}
                            type="file"
                            accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm,video/x-flv,video/x-ms-wmv,video/*"
                            className="hidden"
                            disabled={dataAlreadySaved}
                            onChange={e => handleVideoSelected(e.target.files)}
                        />

                        {/* Upload progress */}
                        {loading && (
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Uploading…</span>
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
                                <p className="text-xs text-gray-500">Upload your talent video to complete registration</p>
                            </div>
                            <button
                                onClick={handleContinue}
                                disabled={loading || !video}
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

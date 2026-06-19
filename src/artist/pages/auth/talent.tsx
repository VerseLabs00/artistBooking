import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import stage from "../../../../public/bg-login.png";
import api from "../../api/axios";

const Talent: React.FC = () => {
    const navigate = useNavigate();
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [links, setLinks] = useState<string[]>([""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                setError(`File "${file.name}" exceeds the maximum size of 50MB.`);
                setMediaFile(null);
                if (fileRef.current) fileRef.current.value = "";
                return;
            }
            const allowedExtensions = ['mp4', 'mov', 'avi', 'jpg', 'jpeg', 'png'];
            const extension = file.name.split('.').pop()?.toLowerCase();
            if (!extension || !allowedExtensions.includes(extension)) {
                setError(`File "${file.name}" has an unsupported format. Allowed formats: MP4, MOV, AVI, JPG, PNG`);
                setMediaFile(null);
                if (fileRef.current) fileRef.current.value = "";
                return;
            }
        }
        setMediaFile(file);
        setError("");
    };

    const updateLink = (i: number, val: string) => {
        const copy = [...links];
        copy[i] = val;
        setLinks(copy);
    };

    const handleContinue = async () => {
        setError("");
        const validLinks = links.filter(l => l.trim() !== "");
        if (!mediaFile && validLinks.length === 0) {
            setError("Please upload a video file or paste at least one link."); return;
        }

        setLoading(true);
        try {
            // If file uploaded, send it
            if (mediaFile) {
                const formData = new FormData();
                formData.append("media_file", mediaFile);
                if (validLinks[0]) formData.append("external_link", validLinks[0]);
                await api.post("/onboarding/talent", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                // Send external link
                await api.post("/onboarding/talent", { external_link: validLinks[0] });
            }

            // If additional links beyond the first, sync them
            if (validLinks.length > 1) {
                await api.post("/profile/sync-links", { links: validLinks.slice(1) });
            }

            navigate("/account");
        } catch (err: any) {
            const errors = err.response?.data?.errors;
            if (errors) {
                setError(Object.values(errors).flat().join(" "));
            } else {
                setError(err.response?.data?.message || "Failed to save talent showcase.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="h-screen overflow-hidden flex items-center justify-center p-2 sm:p-6 bg-cover bg-center"
            style={{
                backgroundImage: `url(${stage})`,
                fontFamily: "'Fraunces', serif"
            }}
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
                        <div className="absolute inset-0 bg-white"></div>
                        <div className="relative z-10">
                            <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">Show us<br />your talent</h1>
                            <p className="mt-6 max-w-md leading-relaxed text-gray-600">Add your best performances — videos, audio tracks, and social profiles so we can verify your work as an artist.</p>
                            <div className="flex items-center gap-4 mt-8">
                                <div className="flex -space-x-3">
                                    <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-10 h-10 rounded-full border-2 border-white" />
                                    <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-10 h-10 rounded-full border-2 border-white" />
                                    <img src="https://randomuser.me/api/portraits/men/76.jpg" className="w-10 h-10 rounded-full border-2 border-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">600+ artist already joined</p>
                                    <div className="text-yellow-400 text-sm">★★★★★</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="p-4 sm:p-8 lg:p-16 h-full overflow-y-auto scroll-smooth pb-10 sm:pb-12">
                        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm mb-6 sm:mb-8 mt-6 md:mt-0 flex-wrap">
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                                <div className="w-5 h-5 rounded-full border border-green-600 flex items-center justify-center text-xs">✓</div>
                                Basic Info
                            </div>
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                                <div className="w-5 h-5 rounded-full border border-green-600 flex items-center justify-center text-xs">✓</div>
                                Verification
                            </div>
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                                <div className="w-5 h-5 rounded-full border border-green-600 flex items-center justify-center text-xs">✓</div>
                                Talent Show Case
                            </div>
                        </div>

                        <h2 className="text-lg sm:text-xl font-semibold mb-2">Video Performances <span className="text-red-500">*</span></h2>
                        <p className="text-gray-600 text-sm mb-6">Upload clips or paste YouTube / Vimeo links — at least 1 required</p>

                        {error && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>
                        )}

                        <div onClick={() => fileRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl h-40 sm:h-44 flex flex-col items-center justify-center text-gray-500 hover:border-red-500 transition cursor-pointer mb-6 ${mediaFile ? "border-green-400" : ""}`}>
                            <Upload className="w-8 h-8 text-red-500 mb-3" />
                            <p className="text-sm font-medium">{mediaFile ? mediaFile.name : "Click to upload or drag & drop"}</p>
                            <p className="text-xs text-gray-400">MP4, MOV, AVI Max 50MB</p>
                        </div>
                        <input ref={fileRef} type="file" accept=".mp4,.mov,.avi,.jpg,.jpeg,.png" className="hidden"
                            onChange={handleFileChange} />

                        <div className="text-center text-xs text-gray-400 mb-4">OR PASTE A LINK</div>

                        {links.map((link, i) => (
                            <input key={i} type="text" value={link} onChange={e => updateLink(i, e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="w-full h-12 rounded-xl border border-gray-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black mb-4" />
                        ))}

                        <p onClick={() => setLinks(prev => [...prev, ""])} className="text-sm text-red-600 cursor-pointer mb-10">
                            + Add another video
                        </p>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <p className="text-sm font-medium">Step 3 of 3</p>
                                <p className="text-xs text-gray-500">Add at least 1 video and 1 social link</p>
                            </div>
                            <button onClick={handleContinue} disabled={loading}
                                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium transition disabled:opacity-60 disabled:cursor-not-allowed">
                                {loading ? 'Saving...' : 'continue →'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Talent;

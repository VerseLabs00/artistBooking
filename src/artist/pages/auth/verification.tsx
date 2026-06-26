import React, { useState, useRef, useEffect } from "react";
import { Upload, Camera, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import stage from "../../../../public/bg-login.png";
import api from "../../api/axios";
import { compressImage } from "../../utils/compressImage";
import { getStats } from "../../../customer/services/discoveryService";

const docTypes = ["National ID", "Passport", "Bank Statement", "Driving License"] as const;
type DocType = typeof docTypes[number];

type Field = "front" | "back" | "selfie";
type FieldErrors = Partial<Record<Field, string>>;

const fieldLabels: Record<Field, string> = {
    front: "Front side",
    back: "Back side",
    selfie: "Selfie",
};

// Map a backend error key to one of our boxes.
const keyToField = (key: string): Field | null => {
    if (key.includes("front")) return "front";
    if (key.includes("back")) return "back";
    if (key.includes("selfie")) return "selfie";
    return null;
};

const Verification: React.FC = () => {
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

        // Load saved verification documents if they exist
        api.get("/onboarding/verification")
            .then(response => {
                const savedData = response.data;
                if (savedData.front_url) setFrontPreview(savedData.front_url);
                if (savedData.back_url) setBackPreview(savedData.back_url);
                if (savedData.selfie_url) setSelfiePreview(savedData.selfie_url);
                setDataAlreadySaved(true);
            })
            .catch(() => {
                // No saved data exists, keep default empty state
            });
    }, []);

    const [docType, setDocType] = useState<DocType>("National ID");
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [frontPreview, setFrontPreview] = useState<string | null>(null);
    const [backPreview, setBackPreview] = useState<string | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [dataAlreadySaved, setDataAlreadySaved] = useState(false);

    const frontRef = useRef<HTMLInputElement>(null);
    const backRef = useRef<HTMLInputElement>(null);
    const selfieRef = useRef<HTMLInputElement>(null);

    // Clean up any object URLs when the component unmounts.
    useEffect(() => {
        return () => {
            [frontPreview, backPreview, selfiePreview].forEach(
                (url) => url && URL.revokeObjectURL(url)
            );
        };
    }, [frontPreview, backPreview, selfiePreview]);

    const selectFile = (
        field: Field,
        file: File | null,
        setFile: (f: File | null) => void,
        prevPreview: string | null,
        setPreview: (p: string | null) => void
    ) => {
        if (prevPreview) URL.revokeObjectURL(prevPreview);
        setFile(file);
        setPreview(file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
        // Re-selecting clears any previous failure for this box.
        setFieldErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleContinue = async () => {
        setError("");
        setFieldErrors({});
        
        // If data is already saved and user hasn't selected new files, just navigate
        if (dataAlreadySaved && !frontFile && !backFile && !selfieFile) {
            window.scrollTo(0, 0);
            navigate("/talent", { state: { resuming } });
            return;
        }

        if (!frontFile && !frontPreview) { setError("Please upload the front side of your document."); return; }
        if (!selfieFile && !selfiePreview) { setError("Please upload a selfie with your document."); return; }
        if (!agreed) { setError("Please agree to the terms to continue."); return; }

        setLoading(true);
        setProgress(0);
        try {
            // Phone photos are large (and iPhones use HEIC). Compress/convert to
            // JPEG in the browser so uploads don't fail on mobile devices.
            const [front, selfie, back] = await Promise.all([
                frontFile ? compressImage(frontFile) : Promise.resolve(null),
                selfieFile ? compressImage(selfieFile) : Promise.resolve(null),
                backFile ? compressImage(backFile) : Promise.resolve(null),
            ]);

            const formData = new FormData();
            formData.append("document_type", docType);
            if (front) formData.append("front", front);
            if (back) formData.append("back", back);
            if (selfie) formData.append("selfie", selfie);

            await api.post("/onboarding/verification", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 120000,
                onUploadProgress: (e) => {
                    if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
                },
            });
            window.scrollTo(0, 0);
            navigate("/talent", { state: { resuming } });
        } catch (err: any) {
            const errors = err.response?.data?.errors;
            if (errors) {
                // Map each failed field to its box, clear only that image and
                // show the reason so the user knows which one to re-upload.
                const newFieldErrors: FieldErrors = {};
                Object.entries(errors).forEach(([key, msgs]) => {
                    const field = keyToField(key);
                    const reason = (Array.isArray(msgs) ? msgs.join(" ") : String(msgs));
                    if (field) {
                        newFieldErrors[field] = reason;
                        if (field === "front") selectFile("front", null, setFrontFile, frontPreview, setFrontPreview);
                        if (field === "back") selectFile("back", null, setBackFile, backPreview, setBackPreview);
                        if (field === "selfie") selectFile("selfie", null, setSelfieFile, selfiePreview, setSelfiePreview);
                    }
                });
                if (Object.keys(newFieldErrors).length) {
                    setFieldErrors(newFieldErrors);
                    setError("Some documents failed to upload. Please re-upload the highlighted items below.");
                } else {
                    setError(Object.values(errors).flat().join(" "));
                }
            } else if (err.code === "ECONNABORTED") {
                setError("Upload timed out. Please check your connection and try again.");
            } else if (err.response?.status === 413) {
                setError("Your photos are too large. Please use smaller images and try again.");
            } else {
                setError(err.response?.data?.message || "Upload failed. Please try again.");
            }
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-0 md:p-6 overflow-y-auto md:overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${stage})` }}>
            <div className="relative w-full max-w-6xl min-h-screen md:min-h-0 md:h-[90vh] bg-white rounded-none md:rounded-2xl shadow-2xl md:overflow-hidden">
                <div onClick={() => navigate("/information")} className="absolute top-6 right-8 text-sm font-medium cursor-pointer flex items-center gap-2 z-20">
                    ← Back
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                    {/* LEFT */}
                    <div className="relative p-16 hidden md:flex flex-col justify-center h-full">
                        <div className="absolute inset-0 bg-white"></div>
                        <div className="relative z-10">
                            <h1 className="text-5xl font-semibold leading-tight">Verify your<br />Identity</h1>
                            <p className="mt-6 max-w-md leading-relaxed">We verify all artists to keep the platform safe and trusted. Your documents are fully encrypted and never shared with third parties.</p>
                            <div className="flex items-center gap-4 mt-8">
                                <div className="flex -space-x-3">
                                    {(stats?.sample_avatars && Array.isArray(stats.sample_avatars) && stats.sample_avatars.length > 0 ? stats.sample_avatars : []).slice(0, 5).map((src, i) => (
                                        <img key={i} src={src} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="" />
                                    ))}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{(stats?.total_artists ?? 0) > 100 ? "100+ artist already joined" : `${stats?.total_artists ?? 0} artist already joined`}</p>
                                    <div className="text-yellow-400 text-sm">★★★★★</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="p-6 md:p-16 h-full md:overflow-y-auto scroll-smooth">
                        <div className="flex items-center gap-6 text-sm mb-8">
                            <div className="flex items-center gap-2 text-gray-400 font-medium">
                                <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-xs">✓</div>
                                Basic Info
                            </div>
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                                <div className="w-5 h-5 rounded-full border border-green-600 flex items-center justify-center text-xs">✓</div>
                                Verification
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 font-medium">
                                <div className="w-5 h-5 rounded-full border flex items-center justify-center text-xs">3</div>
                                Talent Show Case
                            </div>
                        </div>

                        <h2 className="text-xl font-semibold mb-2">Upload your document</h2>
                        <p className="text-gray-600 text-sm mb-6">Select a document type and upload a clear, unedited photo.</p>

                        {resuming && (
                            <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                                <span className="text-amber-500 text-lg leading-none mt-0.5">⚠</span>
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">Complete your registration</p>
                                    <p className="text-xs text-amber-700 mt-0.5">You left before finishing. Upload your documents to continue activating your artist account.</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>
                        )}

                        {/* Document Types */}
                        <div className="flex gap-4 mb-8 flex-wrap">
                            {docTypes.map((item) => (
                                <div key={item} onClick={() => !dataAlreadySaved && setDocType(item)}
                                    className={`w-28 h-24 border rounded-2xl flex flex-col items-center justify-center text-xs cursor-pointer transition ${docType === item ? "border-red-500 text-red-600 bg-red-50" : "text-gray-600 hover:border-red-500"} ${dataAlreadySaved ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <div className="mb-2 text-red-500">🪪</div>
                                    {item}
                                </div>
                            ))}
                        </div>

                        {/* Front & Back */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <p className="text-xs text-gray-400 mb-2">FRONT SIDE *</p>
                                <div onClick={() => !dataAlreadySaved && frontRef.current?.click()}
                                    className={`relative overflow-hidden border-2 border-dashed rounded-2xl h-40 flex flex-col items-center justify-center text-gray-500 hover:border-red-500 cursor-pointer transition ${fieldErrors.front ? "border-red-500" : frontPreview ? "border-green-400" : ""} ${dataAlreadySaved ? 'cursor-not-allowed opacity-70' : ''}`}>
                                    {frontPreview ? (
                                        <>
                                            <img src={frontPreview} alt="Front preview" className="absolute inset-0 w-full h-full object-cover" />
                                            {!dataAlreadySaved && (
                                                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition flex items-center justify-center opacity-0 hover:opacity-100">
                                                    <p className="text-white text-sm font-medium">Change</p>
                                                </div>
                                            )}
                                        </>
                                    ) : frontFile ? (
                                        <>
                                            <div className="text-red-500 text-3xl mb-2">📄</div>
                                            <p className="text-sm">PDF selected</p>
                                            <p className="text-xs text-gray-400">Tap to change</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 text-red-500 mb-2" />
                                            <p className="text-sm">Upload front</p>
                                            <p className="text-xs text-gray-400">JPG, PNG or PDF</p>
                                        </>
                                    )}
                                </div>
                                <input ref={frontRef} type="file" accept=".jpg,.jpeg,.png,.pdf,.heic,.heif,image/*,application/pdf" className="hidden" disabled={dataAlreadySaved} onChange={e => selectFile("front", e.target.files?.[0] || null, setFrontFile, frontPreview, setFrontPreview)} />
                                {fieldErrors.front && <p className="text-xs text-red-600 mt-1 flex items-start gap-1"><AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />{fieldErrors.front}</p>}
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-2">BACK SIDE</p>
                                <div onClick={() => !dataAlreadySaved && backRef.current?.click()}
                                    className={`relative overflow-hidden border-2 border-dashed rounded-2xl h-40 flex flex-col items-center justify-center text-gray-500 hover:border-red-500 cursor-pointer transition ${fieldErrors.back ? "border-red-500" : backPreview ? "border-green-400" : ""} ${dataAlreadySaved ? 'cursor-not-allowed opacity-70' : ''}`}>
                                    {backPreview ? (
                                        <>
                                            <img src={backPreview} alt="Back preview" className="absolute inset-0 w-full h-full object-cover" />
                                            {!dataAlreadySaved && (
                                                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition flex items-center justify-center opacity-0 hover:opacity-100">
                                                    <p className="text-white text-sm font-medium">Change</p>
                                                </div>
                                            )}
                                        </>
                                    ) : backFile ? (
                                        <>
                                            <div className="text-red-500 text-3xl mb-2">📄</div>
                                            <p className="text-sm">PDF selected</p>
                                            <p className="text-xs text-gray-400">Tap to change</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 text-red-500 mb-2" />
                                            <p className="text-sm">Upload back</p>
                                            <p className="text-xs text-gray-400">JPG, PNG or PDF</p>
                                        </>
                                    )}
                                </div>
                                <input ref={backRef} type="file" accept=".jpg,.jpeg,.png,.pdf,.heic,.heif,image/*,application/pdf" className="hidden" disabled={dataAlreadySaved} onChange={e => selectFile("back", e.target.files?.[0] || null, setBackFile, backPreview, setBackPreview)} />
                                {fieldErrors.back && <p className="text-xs text-red-600 mt-1 flex items-start gap-1"><AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />{fieldErrors.back}</p>}
                            </div>
                        </div>

                        {/* Selfie */}
                        <div className="mb-6">
                            <p className="text-xs text-gray-400 mb-2">SELFIE *</p>
                            <div onClick={() => !dataAlreadySaved && selfieRef.current?.click()}
                                className={`relative overflow-hidden border-2 border-dashed rounded-2xl h-36 flex items-center justify-between px-6 hover:border-red-500 cursor-pointer transition ${fieldErrors.selfie ? "border-red-500" : selfiePreview ? "border-green-400" : ""} ${dataAlreadySaved ? 'cursor-not-allowed opacity-70' : ''}`}>
                                {selfiePreview ? (
                                    <>
                                        <img src={selfiePreview} alt="Selfie preview" className="absolute inset-0 w-full h-full object-cover" />
                                        {!dataAlreadySaved && (
                                            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition flex items-center justify-center opacity-0 hover:opacity-100">
                                                <p className="text-white text-sm font-medium">Change</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-4">
                                            <Camera className="w-6 h-6 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium">Selfie with document</p>
                                                <p className="text-xs text-gray-400">Hold your document next to your face. JPG or PNG</p>
                                            </div>
                                        </div>
                                        <Upload className="w-5 h-5 text-red-500" />
                                    </>
                                )}
                            </div>
                            <input ref={selfieRef} type="file" accept=".jpg,.jpeg,.png,.heic,.heif,image/*" capture="user" className="hidden" disabled={dataAlreadySaved} onChange={e => selectFile("selfie", e.target.files?.[0] || null, setSelfieFile, selfiePreview, setSelfiePreview)} />
                            {fieldErrors.selfie && <p className="text-xs text-red-600 mt-1 flex items-start gap-1"><AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />{fieldErrors.selfie}</p>}
                        </div>

                        {/* Agreement */}
                        <div className="flex items-start gap-3 mb-8 text-sm text-gray-600">
                            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} disabled={dataAlreadySaved} className="mt-1 accent-red-600" />
                            <p>I confirm these documents are genuine and belong to me. I agree to the <span className="text-red-600 font-medium">Privacy Policy</span> and <span className="text-red-600 font-medium">Verification Terms</span>.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-6 md:pb-0">
                            <div>
                                <p className="text-sm font-medium">Step 2 of 3</p>
                                <p className="text-xs text-gray-500">All documents are encrypted & private</p>
                            </div>
                            <button onClick={handleContinue} disabled={loading}
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium transition disabled:opacity-60 disabled:cursor-not-allowed">
                                {loading ? 'Uploading...' : 'continue →'}
                            </button>
                        </div>

                        {/* Upload progress bar */}
                        {loading && (
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Uploading your documents…</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-600 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${progress || 5}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Verification;

import React, { useState, useRef, useEffect } from "react";
import { Upload, Camera, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import stage from "../../../../public/bg-login.png";
import api from "../../api/axios";

const docTypes = ["National ID", "Passport", "Bank Statement", "Driving License"] as const;
type DocType = typeof docTypes[number];

// Max dimension / quality used to compress images before upload.
// Phone cameras can produce 8-20MB photos; this brings them down to a
// size that uploads reliably on mobile networks and stays under backend limits.
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.8;
const MAX_UPLOAD_MB = 10;

/**
 * Compresses an image file via canvas resizing + re-encoding as JPEG.
 * Leaves PDFs and already-small files untouched.
 */
const compressImageIfNeeded = (file: File): Promise<File> => {
    return new Promise((resolve) => {
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const isHeic = /\.(heic|heif)$/i.test(file.name);

        // PDFs can't be compressed this way; leave them as-is (size is checked separately).
        // HEIC can't be reliably decoded in <img>/<canvas> in most browsers, so skip too —
        // these are rare in practice once the camera capture attribute is removed.
        if (isPdf || isHeic) {
            resolve(file);
            return;
        }

        // If the file is already comfortably small, don't bother re-encoding it.
        if (file.size <= 1.5 * 1024 * 1024) {
            resolve(file);
            return;
        }

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            let { width, height } = img;

            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                if (width > height) {
                    height = Math.round((height * MAX_DIMENSION) / width);
                    width = MAX_DIMENSION;
                } else {
                    width = Math.round((width * MAX_DIMENSION) / height);
                    height = MAX_DIMENSION;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                URL.revokeObjectURL(objectUrl);
                resolve(file);
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    URL.revokeObjectURL(objectUrl);
                    if (!blob) {
                        resolve(file);
                        return;
                    }
                    const compressedFile = new File(
                        [blob],
                        file.name.replace(/\.(png|webp|gif|bmp|tiff?)$/i, ".jpg"),
                        { type: "image/jpeg", lastModified: Date.now() }
                    );
                    // Use the compressed version only if it's actually smaller.
                    resolve(compressedFile.size < file.size ? compressedFile : file);
                },
                "image/jpeg",
                JPEG_QUALITY
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file);
        };

        img.src = objectUrl;
    });
};

type FileKey = "front" | "back" | "selfie";

const Verification: React.FC = () => {
    const navigate = useNavigate();
    const [docType, setDocType] = useState<DocType>("National ID");

    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);

    const [frontPreview, setFrontPreview] = useState<string | null>(null);
    const [backPreview, setBackPreview] = useState<string | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

    const [processingFront, setProcessingFront] = useState(false);
    const [processingBack, setProcessingBack] = useState(false);
    const [processingSelfie, setProcessingSelfie] = useState(false);

    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const frontRef = useRef<HTMLInputElement>(null);
    const backRef = useRef<HTMLInputElement>(null);
    const selfieRef = useRef<HTMLInputElement>(null);

    // Revoke object URLs when they change/unmount to avoid memory leaks.
    useEffect(() => {
        return () => {
            if (frontPreview) URL.revokeObjectURL(frontPreview);
        };
    }, [frontPreview]);
    useEffect(() => {
        return () => {
            if (backPreview) URL.revokeObjectURL(backPreview);
        };
    }, [backPreview]);
    useEffect(() => {
        return () => {
            if (selfiePreview) URL.revokeObjectURL(selfiePreview);
        };
    }, [selfiePreview]);

    const validateFile = (file: File | null, maxSizeMB: number, allowPdf = false): string | null => {
        if (!file) return null;

        const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
        const mimeType = file.type.toLowerCase();

        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp', 'tif', 'tiff', 'avif'];
        const isImage =
            mimeType.startsWith('image/') ||
            imageExtensions.includes(extension) ||
            /\.(heic|heif)$/i.test(file.name);

        const isPdf = extension === 'pdf' || mimeType === 'application/pdf';

        if (!isImage && !(allowPdf && isPdf)) {
            const formats = allowPdf ? 'photos (JPG, PNG, HEIC, etc.) or PDF' : 'photos (JPG, PNG, HEIC, etc.)';
            return `File "${file.name}" is not supported. Please upload ${formats}.`;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            return `File "${file.name}" exceeds the maximum size of ${maxSizeMB}MB.`;
        }
        return null;
    };

    const clearBox = (key: FileKey) => {
        if (key === "front") {
            if (frontPreview) URL.revokeObjectURL(frontPreview);
            setFrontFile(null);
            setFrontPreview(null);
            if (frontRef.current) frontRef.current.value = "";
        } else if (key === "back") {
            if (backPreview) URL.revokeObjectURL(backPreview);
            setBackFile(null);
            setBackPreview(null);
            if (backRef.current) backRef.current.value = "";
        } else {
            if (selfiePreview) URL.revokeObjectURL(selfiePreview);
            setSelfieFile(null);
            setSelfiePreview(null);
            if (selfieRef.current) selfieRef.current.value = "";
        }
    };

    const handleFrontChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (!file) return;

        const err = validateFile(file, 20, true); // generous pre-compression cap
        if (err) {
            setError(err);
            clearBox("front");
            return;
        }

        setError("");
        setProcessingFront(true);
        try {
            const finalFile = await compressImageIfNeeded(file);
            const sizeErr = validateFile(finalFile, MAX_UPLOAD_MB, true);
            if (sizeErr) {
                setError(sizeErr);
                clearBox("front");
                return;
            }
            if (frontPreview) URL.revokeObjectURL(frontPreview);
            setFrontFile(finalFile);
            setFrontPreview(finalFile.type.startsWith("image/") ? URL.createObjectURL(finalFile) : null);
        } finally {
            setProcessingFront(false);
        }
    };

    const handleBackChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (!file) return;

        const err = validateFile(file, 20, true);
        if (err) {
            setError(err);
            clearBox("back");
            return;
        }

        setError("");
        setProcessingBack(true);
        try {
            const finalFile = await compressImageIfNeeded(file);
            const sizeErr = validateFile(finalFile, MAX_UPLOAD_MB, true);
            if (sizeErr) {
                setError(sizeErr);
                clearBox("back");
                return;
            }
            if (backPreview) URL.revokeObjectURL(backPreview);
            setBackFile(finalFile);
            setBackPreview(finalFile.type.startsWith("image/") ? URL.createObjectURL(finalFile) : null);
        } finally {
            setProcessingBack(false);
        }
    };

    const handleSelfieChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (!file) return;

        const err = validateFile(file, 20, false);
        if (err) {
            setError(err);
            clearBox("selfie");
            return;
        }

        setError("");
        setProcessingSelfie(true);
        try {
            const finalFile = await compressImageIfNeeded(file);
            const sizeErr = validateFile(finalFile, MAX_UPLOAD_MB, false);
            if (sizeErr) {
                setError(sizeErr);
                clearBox("selfie");
                return;
            }
            if (selfiePreview) URL.revokeObjectURL(selfiePreview);
            setSelfieFile(finalFile);
            setSelfiePreview(URL.createObjectURL(finalFile));
        } finally {
            setProcessingSelfie(false);
        }
    };

    const handleContinue = async () => {
        setError("");
        if (!frontFile) { setError("Please upload the front side of your document."); return; }
        if (!selfieFile) { setError("Please upload a selfie with your document."); return; }
        if (!agreed) { setError("Please agree to the terms to continue."); return; }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("document_type", docType);
            formData.append("front", frontFile);
            if (backFile) formData.append("back", backFile);
            formData.append("selfie", selfieFile);

            await api.post("/onboarding/verification", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            window.scrollTo(0, 0);
            navigate("/talent");
        } catch (err: any) {
            const errors = err.response?.data?.errors as Record<string, string[]> | undefined;

            if (errors) {
                // Remove only the specific box(es) the backend rejected, keep the rest intact.
                (Object.keys(errors) as string[]).forEach((key) => {
                    if (key === "front" || key === "back" || key === "selfie") {
                        clearBox(key as FileKey);
                    }
                });
                setError(Object.values(errors).flat().join(" "));
            } else {
                // Unknown failure (network error, Cloudinary error, timeout, etc.) —
                // we don't know which file caused it, so clear all uploaded boxes to be safe
                // and let the user re-upload everything.
                clearBox("front");
                clearBox("back");
                clearBox("selfie");
                setError(err.response?.data?.message || "Upload failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const isPdfPreview = (file: File | null) =>
        !!file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));

    return (
        <div
            className="h-screen overflow-hidden flex items-center justify-center p-2 sm:p-6 bg-cover bg-center"
            style={{ backgroundImage: `url(${stage})`, fontFamily: "'Fraunces', serif" }}
        >
            <div className="relative w-full max-w-6xl h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div onClick={() => navigate("/information")} className="absolute top-4 right-4 sm:top-6 sm:right-8 text-xs sm:text-sm font-medium cursor-pointer flex items-center gap-2 z-20">
                    ← Back
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                    {/* LEFT - hidden on mobile, visible from md breakpoint up */}
                    <div className="hidden md:flex relative p-10 lg:p-16 flex-col justify-center h-full">
                        <div className="absolute inset-0 bg-white"></div>
                        <div className="relative z-10">
                            <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">Verify your<br />Identity</h1>
                            <p className="mt-6 max-w-md leading-relaxed text-gray-600">We verify all artists to keep the platform safe and trusted. Your documents are fully encrypted and never shared with third parties.</p>
                            <div className="flex items-center gap-4 mt-8">
                                <div className="flex -space-x-3">
                                    <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-10 h-10 rounded-full border-2 border-white" />
                                    <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-10 h-10 rounded-full border-2 border-white" />
                                    <img src="https://randomuser.me/api/portraits/men/76.jpg" className="w-10 h-10 rounded-full border-2 border-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">600+ artists already joined</p>
                                    <div className="text-yellow-400 text-sm">★★★★★</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT - form, full width on mobile, only this panel scrolls */}
                    <div className="p-4 sm:p-8 lg:p-16 h-full overflow-y-auto scroll-smooth pb-10 sm:pb-12">
                        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm mb-6 sm:mb-8 mt-6 md:mt-0 flex-wrap">
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

                        <h2 className="text-lg sm:text-xl font-semibold mb-2">Upload your document</h2>
                        <p className="text-gray-600 text-sm mb-6">Select a document type and upload a clear, unedited photo.</p>

                        {/* Document Types */}
                        <div className="flex gap-3 sm:gap-4 mb-8 flex-wrap">
                            {docTypes.map((item) => (
                                <div key={item} onClick={() => setDocType(item)}
                                     className={`w-24 sm:w-28 h-20 sm:h-24 border rounded-2xl flex flex-col items-center justify-center text-xs text-center px-1 cursor-pointer transition ${docType === item ? "border-red-500 text-red-600 bg-red-50" : "text-gray-600 hover:border-red-500"}`}>
                                    <div className="mb-2 text-red-500">🪪</div>
                                    {item}
                                </div>
                            ))}
                        </div>

                        {/* Front & Back */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            <div>
                                <p className="text-xs text-gray-400 mb-2">FRONT SIDE *</p>
                                <div onClick={() => !processingFront && frontRef.current?.click()}
                                     className={`relative border-2 border-dashed rounded-2xl h-40 flex flex-col items-center justify-center text-gray-500 hover:border-red-500 cursor-pointer transition overflow-hidden ${frontFile ? "border-green-400" : ""}`}>
                                    {frontFile && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); clearBox("front"); }}
                                            className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white rounded-full p-1 shadow"
                                            aria-label="Remove front side"
                                        >
                                            <X className="w-4 h-4 text-gray-700" />
                                        </button>
                                    )}
                                    {processingFront ? (
                                        <p className="text-sm text-gray-400">Processing...</p>
                                    ) : frontPreview ? (
                                        <img src={frontPreview} alt="Front side preview" className="absolute inset-0 w-full h-full object-cover" />
                                    ) : frontFile && isPdfPreview(frontFile) ? (
                                        <>
                                            <Upload className="w-6 h-6 text-red-500 mb-2" />
                                            <p className="text-sm truncate px-4">{frontFile.name}</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 text-red-500 mb-2" />
                                            <p className="text-sm">Upload front</p>
                                            <p className="text-xs text-gray-400">Photos or PDF (incl. iPhone HEIC)</p>
                                        </>
                                    )}
                                </div>
                                <input ref={frontRef} type="file" accept="image/*,.pdf,application/pdf" className="hidden" onChange={handleFrontChange} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-2">BACK SIDE</p>
                                <div onClick={() => !processingBack && backRef.current?.click()}
                                     className={`relative border-2 border-dashed rounded-2xl h-40 flex flex-col items-center justify-center text-gray-500 hover:border-red-500 cursor-pointer transition overflow-hidden ${backFile ? "border-green-400" : ""}`}>
                                    {backFile && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); clearBox("back"); }}
                                            className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white rounded-full p-1 shadow"
                                            aria-label="Remove back side"
                                        >
                                            <X className="w-4 h-4 text-gray-700" />
                                        </button>
                                    )}
                                    {processingBack ? (
                                        <p className="text-sm text-gray-400">Processing...</p>
                                    ) : backPreview ? (
                                        <img src={backPreview} alt="Back side preview" className="absolute inset-0 w-full h-full object-cover" />
                                    ) : backFile && isPdfPreview(backFile) ? (
                                        <>
                                            <Upload className="w-6 h-6 text-red-500 mb-2" />
                                            <p className="text-sm truncate px-4">{backFile.name}</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 text-red-500 mb-2" />
                                            <p className="text-sm">Upload back</p>
                                            <p className="text-xs text-gray-400">Photos or PDF (incl. iPhone HEIC)</p>
                                        </>
                                    )}
                                </div>
                                <input ref={backRef} type="file" accept="image/*,.pdf,application/pdf" className="hidden" onChange={handleBackChange} />
                            </div>
                        </div>

                        {/* Selfie */}
                        <div className="mb-6">
                            <p className="text-xs text-gray-400 mb-2">SELFIE *</p>
                            <div onClick={() => !processingSelfie && selfieRef.current?.click()}
                                 className={`relative border-2 border-dashed rounded-2xl h-36 flex flex-col sm:flex-row items-center sm:justify-between justify-center gap-3 px-6 hover:border-red-500 cursor-pointer transition overflow-hidden ${selfieFile ? "border-green-400" : ""}`}>
                                {selfieFile && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); clearBox("selfie"); }}
                                        className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white rounded-full p-1 shadow"
                                        aria-label="Remove selfie"
                                    >
                                        <X className="w-4 h-4 text-gray-700" />
                                    </button>
                                )}
                                {selfiePreview && (
                                    <img src={selfiePreview} alt="Selfie preview" className="absolute inset-0 w-full h-full object-cover" />
                                )}
                                <div className={`relative z-[1] flex items-center gap-4 text-center sm:text-left ${selfiePreview ? "bg-white/80 rounded-xl px-3 py-2" : ""}`}>
                                    {!selfiePreview && <Camera className="w-6 h-6 text-gray-500" />}
                                    <div>
                                        <p className="text-sm font-medium">
                                            {processingSelfie ? "Processing..." : selfieFile ? selfieFile.name : "Selfie with document"}
                                        </p>
                                        {!selfiePreview && (
                                            <p className="text-xs text-gray-400">Hold your document next to your face. All photo formats accepted.</p>
                                        )}
                                    </div>
                                </div>
                                {!selfiePreview && <Upload className="w-5 h-5 text-red-500 relative z-[1]" />}
                            </div>
                            <input ref={selfieRef} type="file" accept="image/*" className="hidden" onChange={handleSelfieChange} />
                        </div>

                        {/* Agreement */}
                        <div className="flex items-start gap-3 mb-6 text-sm text-gray-600">
                            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 accent-red-600" />
                            <p>I confirm these documents are genuine and belong to me. I agree to the <span className="text-red-600 font-medium">Privacy Policy</span> and <span className="text-red-600 font-medium">Verification Terms</span>.</p>
                        </div>

                        {error && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <p className="text-sm font-medium">Step 2 of 3</p>
                                <p className="text-xs text-gray-500">All documents are encrypted & private</p>
                            </div>
                            <button onClick={handleContinue} disabled={loading || processingFront || processingBack || processingSelfie}
                                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium transition disabled:opacity-60 disabled:cursor-not-allowed">
                                {loading ? 'Uploading...' : 'continue →'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Verification;
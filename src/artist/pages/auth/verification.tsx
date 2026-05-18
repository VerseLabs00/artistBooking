import React, { useState, useRef } from "react";
import { Upload, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import stage from "../../../../public/bg-login.png";
import api from "../../api/axios";

const docTypes = ["National ID", "Passport", "Bank Statement", "Driving License"] as const;
type DocType = typeof docTypes[number];

const Verification: React.FC = () => {
    const navigate = useNavigate();
    const [docType, setDocType] = useState<DocType>("National ID");
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const frontRef = useRef<HTMLInputElement>(null);
    const backRef = useRef<HTMLInputElement>(null);
    const selfieRef = useRef<HTMLInputElement>(null);

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
            const errors = err.response?.data?.errors;
            if (errors) {
                setError(Object.values(errors).flat().join(" "));
            } else {
                setError(err.response?.data?.message || "Upload failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const FileLabel = ({ file }: { file: File | null }) =>
        file ? <p className="text-xs text-green-600 mt-1 truncate">{file.name}</p> : null;

    return (
        <div className="h-screen flex items-center justify-center p-6 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${stage})` }}>
            <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div onClick={() => navigate("/information")} className="absolute top-6 right-8 text-sm font-medium cursor-pointer flex items-center gap-2 z-20">
                    ← Back
                </div>
                <div className="grid grid-cols-2 h-full">
                    {/* LEFT */}
                    <div className="relative p-16 flex flex-col justify-center h-full">
                        <div className="absolute inset-0 bg-white"></div>
                        <div className="relative z-10">
                            <h1 className="text-5xl font-semibold leading-tight">Verify your<br />Identity</h1>
                            <p className="mt-6 max-w-md leading-relaxed">We verify all artists to keep the platform safe and trusted. Your documents are fully encrypted and never shared with third parties.</p>
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
                    <div className="p-16 h-full overflow-y-auto scroll-smooth">
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

                        {error && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>
                        )}

                        {/* Document Types */}
                        <div className="flex gap-4 mb-8 flex-wrap">
                            {docTypes.map((item) => (
                                <div key={item} onClick={() => setDocType(item)}
                                    className={`w-28 h-24 border rounded-2xl flex flex-col items-center justify-center text-xs cursor-pointer transition ${docType === item ? "border-red-500 text-red-600 bg-red-50" : "text-gray-600 hover:border-red-500"}`}>
                                    <div className="mb-2 text-red-500">🪪</div>
                                    {item}
                                </div>
                            ))}
                        </div>

                        {/* Front & Back */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <p className="text-xs text-gray-400 mb-2">FRONT SIDE *</p>
                                <div onClick={() => frontRef.current?.click()}
                                    className={`border-2 border-dashed rounded-2xl h-40 flex flex-col items-center justify-center text-gray-500 hover:border-red-500 cursor-pointer transition ${frontFile ? "border-green-400" : ""}`}>
                                    <Upload className="w-6 h-6 text-red-500 mb-2" />
                                    <p className="text-sm">{frontFile ? "Change front" : "Upload front"}</p>
                                    <p className="text-xs text-gray-400">JPG, PNG or PDF</p>
                                </div>
                                <input ref={frontRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => setFrontFile(e.target.files?.[0] || null)} />
                                <FileLabel file={frontFile} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-2">BACK SIDE</p>
                                <div onClick={() => backRef.current?.click()}
                                    className={`border-2 border-dashed rounded-2xl h-40 flex flex-col items-center justify-center text-gray-500 hover:border-red-500 cursor-pointer transition ${backFile ? "border-green-400" : ""}`}>
                                    <Upload className="w-6 h-6 text-red-500 mb-2" />
                                    <p className="text-sm">{backFile ? "Change back" : "Upload back"}</p>
                                    <p className="text-xs text-gray-400">JPG, PNG or PDF</p>
                                </div>
                                <input ref={backRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => setBackFile(e.target.files?.[0] || null)} />
                                <FileLabel file={backFile} />
                            </div>
                        </div>

                        {/* Selfie */}
                        <div className="mb-6">
                            <p className="text-xs text-gray-400 mb-2">SELFIE *</p>
                            <div onClick={() => selfieRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl h-36 flex items-center justify-between px-6 hover:border-red-500 cursor-pointer transition ${selfieFile ? "border-green-400" : ""}`}>
                                <div className="flex items-center gap-4">
                                    <Camera className="w-6 h-6 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">{selfieFile ? selfieFile.name : "Selfie with document"}</p>
                                        <p className="text-xs text-gray-400">Hold your document next to your face. JPG or PNG</p>
                                    </div>
                                </div>
                                <Upload className="w-5 h-5 text-red-500" />
                            </div>
                            <input ref={selfieRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={e => setSelfieFile(e.target.files?.[0] || null)} />
                        </div>

                        {/* Agreement */}
                        <div className="flex items-start gap-3 mb-8 text-sm text-gray-600">
                            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 accent-red-600" />
                            <p>I confirm these documents are genuine and belong to me. I agree to the <span className="text-red-600 font-medium">Privacy Policy</span> and <span className="text-red-600 font-medium">Verification Terms</span>.</p>
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium">Step 2 of 3</p>
                                <p className="text-xs text-gray-500">All documents are encrypted & private</p>
                            </div>
                            <button onClick={handleContinue} disabled={loading}
                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium transition disabled:opacity-60 disabled:cursor-not-allowed">
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

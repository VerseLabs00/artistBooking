import { useState, useEffect } from "react";

const DEV_USERNAME = "sangeeth";
const DEV_PASSWORD = "12348765";
const SESSION_KEY = "performa_dev_auth";

// Helper to check if storage is available (iOS ITP can block it)
const isStorageAvailable = (storage: Storage): boolean => {
    try {
        const test = "__storage_test__";
        storage.setItem(test, test);
        storage.removeItem(test);
        return true;
    } catch {
        return false;
    }
};

interface DevGateProps {
    children: React.ReactNode;
}

export default function DevGate({ children }: DevGateProps) {
    const [authed, setAuthed] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [storageAvailable, setStorageAvailable] = useState(true);

    useEffect(() => {
        const sessionAvailable = isStorageAvailable(sessionStorage);
        const localAvailable = isStorageAvailable(localStorage);
        setStorageAvailable(sessionAvailable || localAvailable);

        const sessionAuth = sessionAvailable && sessionStorage.getItem(SESSION_KEY) === "true";
        const localAuth = localAvailable && localStorage.getItem(SESSION_KEY) === "true";
        if (sessionAuth || localAuth) {
            setAuthed(true);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        
        setSubmitting(true);
        
        if (username === DEV_USERNAME && password === DEV_PASSWORD) {
            // Try to save to storage if available
            try {
                if (isStorageAvailable(sessionStorage)) {
                    sessionStorage.setItem(SESSION_KEY, "true");
                }
                if (isStorageAvailable(localStorage)) {
                    localStorage.setItem(SESSION_KEY, "true");
                }
            } catch (err) {
                // Storage blocked by iOS ITP - continue anyway with in-memory auth
                console.warn("Storage blocked by ITP, using in-memory auth");
            }
            setAuthed(true);
        } else {
            setError("Incorrect username or password.");
            setShake(true);
            setTimeout(() => {
                setShake(false);
                setSubmitting(false);
            }, 500);
        }
    };

    if (authed) return <>{children}</>;

    return (
        <div style={{
            minHeight: "100vh",
            background: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Fraunces', Georgia, serif",
        }}>
            <style>{`
                @keyframes shake {
                    0%,100%{transform:translateX(0)}
                    20%,60%{transform:translateX(-8px)}
                    40%,80%{transform:translateX(8px)}
                }
                .gate-shake { animation: shake 0.4s ease; }
                .gate-input {
                    width: 100%;
                    background: #111;
                    border: 1px solid #2a2a2a;
                    border-radius: 10px;
                    color: #fff;
                    font-size: 14px;
                    padding: 11px 14px;
                    box-sizing: border-box;
                    outline: none;
                    font-family: inherit;
                    transition: border-color 0.15s;
                    margin-top: 6px;
                }
                .gate-input:focus { border-color: #E8194B; }
            `}</style>

            <div
                className={shake ? "gate-shake" : ""}
                style={{
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: 20,
                    padding: "40px 36px",
                    width: 360,
                    textAlign: "center",
                }}
            >
                {/* Logo */}
                <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -1, marginBottom: 4 }}>
                    Perfor<span style={{ color: "#E8194B" }}>ma</span>
                </div>

                {/* Dev badge */}
                <div style={{
                    display: "inline-block",
                    background: "rgba(232,25,75,0.12)",
                    color: "#E8194B",
                    border: "1px solid rgba(232,25,75,0.3)",
                    borderRadius: 100,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    padding: "3px 10px",
                    marginBottom: 28,
                }}>
                    Dev Preview
                </div>

                <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                    Access Required
                </div>
                <p style={{ color: "#666", fontSize: 13, marginBottom: 28, lineHeight: 1.5 }}>
                    This site is currently in development.<br />
                    Enter your credentials to continue.
                </p>

                <form onSubmit={handleSubmit}>
                    <label style={{ display: "block", textAlign: "left", color: "#888", fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" }}>
                        Username
                    </label>
                    <input
                        className="gate-input"
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={e => { setUsername(e.target.value); setError(""); }}
                        autoComplete="username"
                    />

                    <label style={{ display: "block", textAlign: "left", color: "#888", fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", marginTop: 14 }}>
                        Password
                    </label>
                    <input
                        className="gate-input"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(""); }}
                        autoComplete="current-password"
                    />

                    {error && (
                        <p style={{ color: "#E8194B", fontSize: 12, marginTop: 10, textAlign: "left" }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            width: "100%",
                            marginTop: 24,
                            background: submitting ? "#999" : "#E8194B",
                            color: "#fff",
                            border: "none",
                            borderRadius: 12,
                            fontSize: 14,
                            fontWeight: 800,
                            padding: "13px",
                            cursor: submitting ? "not-allowed" : "pointer",
                            fontFamily: "inherit",
                            WebkitTapHighlightColor: "transparent",
                            opacity: submitting ? 0.7 : 1,
                        }}
                    >
                        {submitting ? "Verifying..." : "Continue to Performa"}
                    </button>
                </form>

                <div style={{ color: "#444", fontSize: 11, marginTop: 28 }}>
                    Authorized personnel only · Performa © 2025
                </div>
            </div>
        </div>
    );
}
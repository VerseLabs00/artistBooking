import { useState, useEffect } from "react";

const DEV_USERNAME = "sangeeth";
const DEV_PASSWORD = "12348765";
const SESSION_KEY = "performa_dev_auth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";



interface DevGateProps {
    children: React.ReactNode;
}

export default function DevGate({ children }: DevGateProps) {
    // null = still loading, false = off (show site), true = on (show gate)
    const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);
    const [authed, setAuthed] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Fetch maintenance mode status from the public backend endpoint
        fetch(`${API_BASE}/settings/maintenance`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch maintenance status");
                return res.json();
            })
            .then((data) => {
                setMaintenanceMode(!!data.maintenance_mode);
            })
            .catch(() => {
                // If the request fails (e.g. backend down), default to OFF
                // so a network error doesn't lock everyone out
                setMaintenanceMode(false);
            });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        setSubmitting(true);

        if (username === DEV_USERNAME && password === DEV_PASSWORD) {
            // Auth is in-memory only — resets on every page load / new tab
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

    // ── Loading: fetching maintenance status ──────────────────────────────────
    if (maintenanceMode === null) {
        return (
            <div style={{
                minHeight: "100vh",
                background: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <div style={{
                    width: 32,
                    height: 32,
                    border: "3px solid #2a2a2a",
                    borderTop: "3px solid #E8194B",
                    borderRadius: "50%",
                    animation: "devgate-spin 0.7s linear infinite",
                }} />
                <style>{`@keyframes devgate-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // ── Maintenance OFF or dev already authed: render site normally ───────────
    if (!maintenanceMode || authed) return <>{children}</>;

    // ── Maintenance ON + not authed: show dev login gate ─────────────────────
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
                    Maintenance Mode
                </div>

                <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                    Access Required
                </div>
                <p style={{ color: "#666", fontSize: 13, marginBottom: 28, lineHeight: 1.5 }}>
                    This site is temporarily under maintenance.<br />
                    Enter your developer credentials to continue.
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
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      if (msg.includes("email-already-in-use")) setError("Este correo ya está registrado.");
      else if (msg.includes("invalid-credential") || msg.includes("wrong-password")) setError("Correo o contraseña incorrectos.");
      else if (msg.includes("weak-password")) setError("La contraseña debe tener al menos 6 caracteres.");
      else setError("Ha ocurrido un error. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--bg)",
      }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          border: "2px solid var(--border)",
          borderTopColor: "var(--accent)",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (user) return null;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg)",
      padding: "24px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "20%", left: "50%",
        transform: "translateX(-50%)", width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(124,106,255,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div className="animate-fade-up" style={{ width: "100%", maxWidth: "420px", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "52px", height: "52px", background: "var(--accent)",
            borderRadius: "14px", marginBottom: "16px",
            boxShadow: "0 8px 32px var(--accent-glow)",
          }}>
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
              <path d="M2 8.5h20M6 12h2m4 0h2M6 15.5h2m4 0h6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text)" }}>BBVA</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "6px" }}>
            {mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta gratis"}
          </p>
        </div>
        <div className="glass" style={{ padding: "32px" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            background: "var(--surface-2)", borderRadius: "var(--radius-sm)",
            padding: "4px", marginBottom: "28px",
          }}>
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                padding: "9px", borderRadius: "8px", border: "none", cursor: "pointer",
                fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: "13px",
                transition: "all 0.2s",
                background: mode === m ? "var(--surface)" : "transparent",
                color: mode === m ? "var(--text)" : "var(--text-muted)",
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
              }}>
                {m === "login" ? "Iniciar sesión" : "Registrarse"}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {mode === "register" && (
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", display: "block", fontWeight: 500 }}>NOMBRE COMPLETO</label>
                <input className="input-field" type="text" placeholder="María García" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", display: "block", fontWeight: 500 }}>CORREO ELECTRÓNICO</label>
              <input className="input-field" type="email" placeholder="maria@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", display: "block", fontWeight: 500 }}>CONTRASEÑA</label>
              <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && (
              <div style={{ background: "var(--red-soft)", border: "1px solid rgba(255,94,122,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "var(--red)" }}>
                {error}
              </div>
            )}
            <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: "4px" }}>
              {loading ? "Cargando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "var(--text-dim)" }}>
          Simulador bancario — Solo para demostración
        </p>
      </div>
    </div>
  );
}
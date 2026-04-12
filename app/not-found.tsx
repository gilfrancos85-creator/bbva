"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg)", color: "var(--text)", textAlign: "center",
      padding: "24px",
    }}>
      <div style={{
        fontSize: "80px", fontFamily: "'Syne', sans-serif",
        fontWeight: 800, color: "var(--surface-3)", lineHeight: 1,
        marginBottom: "16px",
      }}>404</div>
      <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
        Página no encontrada
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "15px" }}>
        La página que buscas no existe o fue movida.
      </p>
      <button className="btn-primary" onClick={() => router.push("/dashboard")}>
        Volver al inicio
      </button>
    </div>
  );
}

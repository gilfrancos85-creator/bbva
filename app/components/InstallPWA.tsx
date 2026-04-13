"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Détecter iOS
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // Détecter si déjà installé
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Capturer l'événement d'installation (Android/Desktop)
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setInstallPrompt(null);
  };

  // Ne rien afficher si déjà installé ou si pas de prompt disponible et pas iOS
  if (isInstalled || (!installPrompt && !isIOS)) return null;

  return (
    <>
      {/* Bouton d'installation */}
      <button
        onClick={handleInstall}
        style={{
          position: "fixed",
          bottom: "90px",
          right: "16px",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "var(--accent)",
          color: "white",
          border: "none",
          borderRadius: "50px",
          padding: "12px 18px",
          fontSize: "13px",
          fontFamily: "'Syne', sans-serif",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 8px 24px var(--accent-glow)",
          transition: "transform 0.2s, opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M12 3v13m-5-5l5 5 5-5M5 19h14"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Instalar app
      </button>

      {/* Guide iOS */}
      {showIOSGuide && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "flex-end",
          backdropFilter: "blur(4px)",
        }}
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "20px 20px 0 0",
              padding: "32px 24px 40px",
              width: "100%",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{
                width: "48px", height: "48px",
                background: "var(--accent-soft)",
                borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
              }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M12 3v13m-5-5l5 5 5-5M5 19h14"
                    stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>
                Instalar NovoBanco
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                Sigue estos pasos para instalar la app en tu iPhone
              </p>
            </div>

            {[
              {
                step: "1",
                text: "Toca el botón Compartir",
                icon: (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M8.59 13.51l6.83 3.98m-.01-10.98l-6.82 3.98M21 5a3 3 0 11-6 0 3 3 0 016 0zM9 12a3 3 0 11-6 0 3 3 0 016 0zm12 7a3 3 0 11-6 0 3 3 0 016 0z"
                      stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                ),
              },
              {
                step: "2",
                text: 'Desplázate y toca "Añadir a pantalla de inicio"',
                icon: (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M12 5v14m-7-7l7 7 7-7"
                      stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                step: "3",
                text: 'Toca "Añadir" para confirmar',
                icon: (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7"
                      stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "14px 0",
                borderBottom: item.step !== "3" ? "1px solid var(--border)" : "none",
              }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: "var(--accent-soft)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <p style={{ fontSize: "14px", color: "var(--text)" }}>{item.text}</p>
              </div>
            ))}

            <button
              onClick={() => setShowIOSGuide(false)}
              className="btn-ghost"
              style={{ width: "100%", marginTop: "24px" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
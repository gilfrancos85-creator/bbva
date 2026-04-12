"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { maskCardNumber } from "@/lib/card";

export default function TarjetaPage() {
  const { profile } = useAuth();
  const [revealed, setRevealed] = useState(false);

  if (!profile) return null;

  const { card } = profile;
  const displayNumber = revealed
    ? card.cardNumber
    : maskCardNumber(card.cardNumber);

  return (
    <div
      className="animate-fade-up"
      style={{ maxWidth: "600px", margin: "0 auto" }}
    >
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800 }}>Mi Tarjeta</h1>
        <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
          Tu tarjeta virtual NovoBanco
        </p>
      </div>

      {/* Card Visual */}
      <div
        style={{
          position: "relative",
          borderRadius: "20px",
          padding: "32px",
          marginBottom: "24px",
          overflow: "hidden",
          background:
            card.type === "VISA"
              ? "linear-gradient(135deg, #1a1a3e 0%, #2d1b69 50%, #7c6aff 100%)"
              : "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #eb5757 100%)",
          boxShadow:
            card.type === "VISA"
              ? "0 20px 60px rgba(124,106,255,0.4)"
              : "0 20px 60px rgba(235,87,87,0.4)",
          minHeight: "200px",
        }}
      >
        {/* Background patterns */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "240px",
            height: "240px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "40px",
            width: "200px",
            height: "200px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "50%",
          }}
        />

        {/* Chip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "34px",
              background:
                "linear-gradient(135deg, #d4a843 0%, #f5c842 50%, #d4a843 100%)",
              borderRadius: "6px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "2px",
                background: "rgba(0,0,0,0.2)",
                borderRadius: "1px",
              }}
            />
            <div
              style={{
                width: "28px",
                height: "8px",
                background: "rgba(0,0,0,0.1)",
                borderRadius: "2px",
              }}
            />
            <div
              style={{
                width: "28px",
                height: "2px",
                background: "rgba(0,0,0,0.2)",
                borderRadius: "1px",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {/* Contactless icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4C8.13 4 5 7.13 5 11s3.13 7 7 7 7-3.13 7-7"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M12 7c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="12" cy="11" r="1.5" fill="rgba(255,255,255,0.5)" />
            </svg>
          </div>
        </div>

        {/* Card number */}
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "20px",
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.9)",
              fontWeight: 600,
            }}
          >
            {displayNumber}
          </p>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.08em",
                marginBottom: "4px",
              }}
            >
              TITULAR
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.85)",
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              {profile.name.toUpperCase()}
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.08em",
                marginBottom: "4px",
              }}
            >
              VENCE
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.85)",
                fontWeight: 500,
              }}
            >
              {card.expiry}
            </p>
          </div>
          {/* Card brand */}
          <div>
            {card.type === "VISA" ? (
              <div
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontSize: "22px",
                  fontWeight: 800,
                  fontStyle: "italic",
                  color: "white",
                  letterSpacing: "-0.02em",
                }}
              >
                VISA
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#eb5757",
                    opacity: 0.9,
                  }}
                />
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#f5c842",
                    marginLeft: "-12px",
                    opacity: 0.9,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card details */}
      <div
        className="glass stagger-1 animate-fade-up"
        style={{ padding: "24px", marginBottom: "16px" }}
      >
        <h3
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-muted)",
            marginBottom: "20px",
            letterSpacing: "0.08em",
          }}
        >
          DETALLES DE LA TARJETA
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { label: "Número de tarjeta", value: displayNumber, mono: true },
            { label: "CVV", value: revealed ? card.cvv : "•••" },
            { label: "Fecha de vencimiento", value: card.expiry },
            { label: "Tipo", value: card.type },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "16px",
                borderBottom: i < 3 ? "1px solid var(--border)" : "none",
              }}
            >
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {item.label}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  fontFamily: item.mono
                    ? "'Courier New', monospace"
                    : "inherit",
                  letterSpacing: item.mono ? "0.05em" : "normal",
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reveal button */}
      <button
        onClick={() => setRevealed(!revealed)}
        className="btn-ghost"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          {revealed ? (
            <path
              d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          ) : (
            <>
              <path
                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </>
          )}
        </svg>
        {revealed ? "Ocultar datos" : "Mostrar datos completos"}
      </button>

      {/* Security notice */}
    </div>
  );
}

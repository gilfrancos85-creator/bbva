"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function PerfilPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successName, setSuccessName] = useState("");
  const [successPwd, setSuccessPwd] = useState("");
  const [errorName, setErrorName] = useState("");
  const [errorPwd, setErrorPwd] = useState("");
  const [loadingName, setLoadingName] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setErrorName(""); setSuccessName(""); setLoadingName(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { name: name.trim() });
      await refreshProfile();
      setSuccessName("Nombre actualizado correctamente.");
    } catch {
      setErrorName("Error al actualizar el nombre.");
    } finally {
      setLoadingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    setErrorPwd(""); setSuccessPwd(""); setLoadingPwd(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      setSuccessPwd("Contraseña actualizada correctamente.");
      setCurrentPassword(""); setNewPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("wrong-password") || msg.includes("invalid-credential"))
        setErrorPwd("La contraseña actual es incorrecta.");
      else if (msg.includes("weak-password"))
        setErrorPwd("La nueva contraseña debe tener al menos 6 caracteres.");
      else
        setErrorPwd("Error al actualizar la contraseña.");
    } finally {
      setLoadingPwd(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="animate-fade-up" style={{ maxWidth: "560px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800 }}>Mi Perfil</h1>
        <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
          Gestiona tu información personal
        </p>
      </div>

      {/* Account summary */}
      <div className="glass stagger-1 animate-fade-up" style={{
        padding: "24px", marginBottom: "20px",
        display: "flex", alignItems: "center", gap: "20px",
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: "var(--accent-soft)",
          border: "2px solid var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "22px", fontWeight: 700, color: "var(--accent)",
          fontFamily: "'Syne', sans-serif",
          flexShrink: 0,
        }}>
          {(profile?.name || "U")[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: "16px" }}>{profile?.name}</p>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>{profile?.email}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>SALDO</p>
          <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent)", marginTop: "2px" }}>
            {fmt(profile?.balance ?? 0)}
          </p>
        </div>
      </div>

      {/* Update name */}
      <div className="glass stagger-2 animate-fade-up" style={{ padding: "28px", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "20px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
          INFORMACIÓN PERSONAL
        </h3>
        <form onSubmit={handleUpdateName} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", display: "block", fontWeight: 500 }}>
              NOMBRE COMPLETO
            </label>
            <input
              className="input-field"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", display: "block", fontWeight: 500 }}>
              CORREO ELECTRÓNICO
            </label>
            <input
              className="input-field"
              type="email"
              value={profile?.email || ""}
              disabled
              style={{ opacity: 0.5, cursor: "not-allowed" }}
            />
          </div>
          {errorName && (
            <div style={{ background: "var(--red-soft)", border: "1px solid rgba(255,94,122,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "var(--red)" }}>
              {errorName}
            </div>
          )}
          {successName && (
            <div style={{ background: "var(--green-soft)", border: "1px solid rgba(34,211,160,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "var(--green)" }}>
              ✓ {successName}
            </div>
          )}
          <button className="btn-primary" type="submit" disabled={loadingName} style={{ alignSelf: "flex-start" }}>
            {loadingName ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>

      {/* Update password */}
      <div className="glass stagger-3 animate-fade-up" style={{ padding: "28px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "20px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
          CAMBIAR CONTRASEÑA
        </h3>
        <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", display: "block", fontWeight: 500 }}>
              CONTRASEÑA ACTUAL
            </label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", display: "block", fontWeight: 500 }}>
              NUEVA CONTRASEÑA
            </label>
            <input
              className="input-field"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          {errorPwd && (
            <div style={{ background: "var(--red-soft)", border: "1px solid rgba(255,94,122,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "var(--red)" }}>
              {errorPwd}
            </div>
          )}
          {successPwd && (
            <div style={{ background: "var(--green-soft)", border: "1px solid rgba(34,211,160,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "var(--green)" }}>
              ✓ {successPwd}
            </div>
          )}
          <button className="btn-primary" type="submit" disabled={loadingPwd}
            style={{ alignSelf: "flex-start", background: "var(--surface-3)", color: "var(--text)" }}>
            {loadingPwd ? "Actualizando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}

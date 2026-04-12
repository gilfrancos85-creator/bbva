"use client";

import { useState } from "react";
import { doc, updateDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { sendNotificationEmail } from "@/lib/email";
import { Transaction } from "@/lib/types";

interface TransactionFormProps {
  type: "deposit" | "withdrawal" | "transfer";
}

export default function TransactionForm({ type }: TransactionFormProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Ingresa un importe válido.");
      setLoading(false);
      return;
    }
    if (!user || !profile) { setLoading(false); return; }

    try {
      if (type === "deposit") {
        const newBalance = profile.balance + amt;
        await updateDoc(doc(db, "users", user.uid), { balance: newBalance });
        const tx: Omit<Transaction, "id"> = {
          type: "deposit",
          amount: amt,
          description: description || "Depósito",
          timestamp: Date.now(),
          balanceAfter: newBalance,
        };
        await addDoc(collection(db, "users", user.uid, "transactions"), tx);
        await sendNotificationEmail({
          to_email: profile.email,
          to_name: profile.name,
          subject: "Depósito recibido — NovoBanco",
          message: `Has realizado un depósito de ${fmt(amt)}. Tu nuevo saldo es ${fmt(newBalance)}.`,
        });
        setSuccess(`Depósito de ${fmt(amt)} realizado con éxito.`);

      } else if (type === "withdrawal") {
        if (amt > profile.balance) {
          setError("Saldo insuficiente.");
          setLoading(false);
          return;
        }
        const newBalance = profile.balance - amt;
        await updateDoc(doc(db, "users", user.uid), { balance: newBalance });
        const tx: Omit<Transaction, "id"> = {
          type: "withdrawal",
          amount: amt,
          description: description || "Retiro",
          timestamp: Date.now(),
          balanceAfter: newBalance,
        };
        await addDoc(collection(db, "users", user.uid, "transactions"), tx);
        await sendNotificationEmail({
          to_email: profile.email,
          to_name: profile.name,
          subject: "Retiro realizado — NovoBanco",
          message: `Has retirado ${fmt(amt)}. Tu nuevo saldo es ${fmt(newBalance)}.`,
        });
        setSuccess(`Retiro de ${fmt(amt)} realizado con éxito.`);

      } else if (type === "transfer") {
        if (!recipientEmail) { setError("Ingresa el correo del destinatario."); setLoading(false); return; }
        if (recipientEmail === profile.email) { setError("No puedes transferirte a ti mismo."); setLoading(false); return; }
        if (amt > profile.balance) { setError("Saldo insuficiente."); setLoading(false); return; }

        const q = query(collection(db, "users"), where("email", "==", recipientEmail));
        const snap = await getDocs(q);
        if (snap.empty) { setError("No se encontró ningún usuario con ese correo."); setLoading(false); return; }

        const recipientDoc = snap.docs[0];
        const recipient = recipientDoc.data();
        const recipientNewBalance = recipient.balance + amt;
        const senderNewBalance = profile.balance - amt;

        await updateDoc(doc(db, "users", user.uid), { balance: senderNewBalance });
        await updateDoc(doc(db, "users", recipientDoc.id), { balance: recipientNewBalance });

        await addDoc(collection(db, "users", user.uid, "transactions"), {
          type: "transfer_out", amount: amt,
          description: description || `Transferencia a ${recipientEmail}`,
          timestamp: Date.now(), balanceAfter: senderNewBalance,
          counterpartEmail: recipientEmail,
        });
        await addDoc(collection(db, "users", recipientDoc.id, "transactions"), {
          type: "transfer_in", amount: amt,
          description: description || `Transferencia de ${profile.email}`,
          timestamp: Date.now(), balanceAfter: recipientNewBalance,
          counterpartEmail: profile.email,
        });

        await sendNotificationEmail({
          to_email: profile.email, to_name: profile.name,
          subject: "Transferencia enviada — NovoBanco",
          message: `Has enviado ${fmt(amt)} a ${recipientEmail}. Tu nuevo saldo es ${fmt(senderNewBalance)}.`,
        });
        await sendNotificationEmail({
          to_email: recipient.email, to_name: recipient.name,
          subject: "Transferencia recibida — NovoBanco",
          message: `Has recibido ${fmt(amt)} de ${profile.email}. Tu nuevo saldo es ${fmt(recipientNewBalance)}.`,
        });

        setSuccess(`Transferencia de ${fmt(amt)} a ${recipientEmail} realizada con éxito.`);
      }

      await refreshProfile();
      setAmount("");
      setDescription("");
      setRecipientEmail("");
    } catch (err) {
      console.error(err);
      setError("Ha ocurrido un error. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const configs = {
    deposit: { title: "Depositar fondos", subtitle: "Añade dinero a tu cuenta", color: "var(--green)", bg: "var(--green-soft)" },
    withdrawal: { title: "Retirar fondos", subtitle: "Retira dinero de tu cuenta", color: "var(--red)", bg: "var(--red-soft)" },
    transfer: { title: "Transferir dinero", subtitle: "Envía dinero a otro usuario", color: "var(--accent)", bg: "var(--accent-soft)" },
  };
  const cfg = configs[type];

  // Bloquer le retrait si compte inactif
  if (type === "withdrawal" && profile?.isActive === false) {
    return (
      <div className="animate-fade-up" style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800 }}>Retirar fondos</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Retira dinero de tu cuenta</p>
        </div>
        <div className="glass" style={{ padding: "40px", textAlign: "center" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: "var(--red-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "28px",
          }}>
            🔒
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
            Cuenta no activa
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.7, marginBottom: "24px" }}>
            Tu cuenta aún no está activada. Para realizar retiros,
            ponte en contacto con el banco para activar tu cuenta.
          </p>
          <div style={{
            background: "var(--surface-2)",
            borderRadius: "10px",
            padding: "16px 20px",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            color: "var(--text-muted)",
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            soporte@novobanco.com
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up" style={{ maxWidth: "500px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800 }}>{cfg.title}</h1>
        <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>{cfg.subtitle}</p>
      </div>

      <div className="glass" style={{ padding: "16px 20px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Saldo disponible</span>
        <span style={{ fontSize: "18px", fontWeight: 700, color: cfg.color }}>
          {fmt(profile?.balance ?? 0)}
        </span>
      </div>

      <div className="glass" style={{ padding: "32px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {type === "transfer" && (
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", display: "block", fontWeight: 500 }}>
                CORREO DEL DESTINATARIO
              </label>
              <input
                className="input-field"
                type="email"
                placeholder="destinatario@ejemplo.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", display: "block", fontWeight: 500 }}>
              IMPORTE (€)
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: "16px", top: "50%",
                transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "16px",
              }}>€</span>
              <input
                className="input-field"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ paddingLeft: "32px" }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", display: "block", fontWeight: 500 }}>
              DESCRIPCIÓN (opcional)
            </label>
            <input
              className="input-field"
              type="text"
              placeholder={type === "deposit" ? "Nómina, ahorro..." : type === "withdrawal" ? "Alquiler, supermercado..." : "Pago compartido..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={80}
            />
          </div>

          {error && (
            <div style={{
              background: "var(--red-soft)", border: "1px solid rgba(255,94,122,0.2)",
              borderRadius: "8px", padding: "12px 14px", fontSize: "13px", color: "var(--red)",
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: "var(--green-soft)", border: "1px solid rgba(34,211,160,0.2)",
              borderRadius: "8px", padding: "12px 14px", fontSize: "13px", color: "var(--green)",
            }}>
              ✓ {success}
            </div>
          )}

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: cfg.color,
              boxShadow: loading ? "none" : `0 8px 24px ${cfg.bg}`,
            }}
          >
            {loading ? "Procesando..." : cfg.title}
          </button>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Transaction } from "@/lib/types";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const LABELS: Record<Transaction["type"], string> = {
  deposit: "Depósito",
  withdrawal: "Retiro",
  transfer_in: "Transferencia recibida",
  transfer_out: "Transferencia enviada",
};
const COLORS: Record<Transaction["type"], string> = {
  deposit: "var(--green)",
  withdrawal: "var(--red)",
  transfer_in: "var(--accent)",
  transfer_out: "var(--gold)",
};

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchTx = async () => {
      const q = query(
        collection(db, "users", user.uid, "transactions"),
        orderBy("timestamp", "desc"),
        limit(20)
      );
      const snap = await getDocs(q);
      const txs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
      setTransactions(txs);
      setLoading(false);
    };
    fetchTx();
  }, [user]);

  const totalIn = transactions
    .filter((t) => t.type === "deposit" || t.type === "transfer_in")
    .reduce((a, t) => a + t.amount, 0);
  const totalOut = transactions
    .filter((t) => t.type === "withdrawal" || t.type === "transfer_out")
    .reduce((a, t) => a + t.amount, 0);

  // Chart data: last 7 transactions reversed for chronological order
  const chartData = [...transactions]
    .reverse()
    .slice(-7)
    .map((t, i) => ({
      name: `T${i + 1}`,
      saldo: t.balanceAfter,
    }));

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="animate-fade-up" style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800 }}>
          Hola, {profile?.name?.split(" ")[0] || "Usuario"} 👋
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
          Aquí tienes un resumen de tu cuenta
        </p>
      </div>

      {/* Balance card */}
      <div style={{
        background: "linear-gradient(135deg, #7c6aff 0%, #5b4fe0 100%)",
        borderRadius: "20px",
        padding: "32px",
        marginBottom: "24px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 16px 48px rgba(124,106,255,0.3)",
      }} className="stagger-1 animate-fade-up">
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "180px", height: "180px",
          background: "rgba(255,255,255,0.06)", borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", right: "80px",
          width: "120px", height: "120px",
          background: "rgba(255,255,255,0.04)", borderRadius: "50%",
        }} />
        <p style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em" }}>
          SALDO DISPONIBLE
        </p>
        <h2 style={{ fontSize: "42px", fontWeight: 800, color: "white", marginTop: "8px", letterSpacing: "-0.03em" }}>
          {fmt(profile?.balance ?? 0)}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginTop: "8px" }}>
          {profile?.email}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total ingresado", value: fmt(totalIn), color: "var(--green)", bg: "var(--green-soft)", icon: "↓" },
          { label: "Total gastado", value: fmt(totalOut), color: "var(--red)", bg: "var(--red-soft)", icon: "↑" },
        ].map((stat, i) => (
          <div key={i} className={`glass stagger-${i + 2} animate-fade-up`} style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: stat.bg, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "16px", color: stat.color, fontWeight: 700,
              }}>
                {stat.icon}
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                {stat.label}
              </span>
            </div>
            <p style={{ fontSize: "22px", fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="glass stagger-3 animate-fade-up" style={{ padding: "24px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>
            Evolución del saldo
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c6aff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7c6aff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: "var(--text-dim)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-dim)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
              <Tooltip
                contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "13px" }}
                labelStyle={{ color: "var(--text-muted)" }}
                formatter={(v: unknown) => [fmt(v as number), "Saldo"]}
              />
              <Area type="monotone" dataKey="saldo" stroke="#7c6aff" strokeWidth={2} fill="url(#grad)" dot={{ fill: "#7c6aff", strokeWidth: 0, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent transactions */}
      <div className="glass stagger-4 animate-fade-up" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>
          Últimas transacciones
        </h3>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Cargando...</p>
        ) : transactions.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", padding: "24px" }}>
            Aún no tienes transacciones
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: tx.type === "deposit" || tx.type === "transfer_in" ? "var(--green-soft)" : "var(--red-soft)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "15px",
                  }}>
                    {tx.type === "deposit" ? "↓" : tx.type === "withdrawal" ? "↑" : tx.type === "transfer_in" ? "←" : "→"}
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 500 }}>{LABELS[tx.type]}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {tx.description} · {new Date(tx.timestamp).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>
                <span style={{
                  fontSize: "15px", fontWeight: 600,
                  color: COLORS[tx.type],
                }}>
                  {tx.type === "deposit" || tx.type === "transfer_in" ? "+" : "-"}{fmt(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

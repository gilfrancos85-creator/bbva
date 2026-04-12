"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Transaction } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const LABELS: Record<Transaction["type"], string> = {
  deposit: "Depósito",
  withdrawal: "Retiro",
  transfer_in: "Transferencia recibida",
  transfer_out: "Transferencia enviada",
};

const TYPE_COLORS: Record<Transaction["type"], string> = {
  deposit: "#22d3a0",
  withdrawal: "#ff5e7a",
  transfer_in: "#7c6aff",
  transfer_out: "#f5c842",
};

const TYPE_BG: Record<Transaction["type"], string> = {
  deposit: "rgba(34,211,160,0.12)",
  withdrawal: "rgba(255,94,122,0.12)",
  transfer_in: "rgba(124,106,255,0.12)",
  transfer_out: "rgba(245,200,66,0.12)",
};

const TYPE_ICON: Record<Transaction["type"], string> = {
  deposit: "↓",
  withdrawal: "↑",
  transfer_in: "←",
  transfer_out: "→",
};

type FilterType = "all" | Transaction["type"];

export default function HistorialPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

  useEffect(() => {
    if (!user) return;
    const fetchTx = async () => {
      const q = query(
        collection(db, "users", user.uid, "transactions"),
        orderBy("timestamp", "desc")
      );
      const snap = await getDocs(q);
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction)));
      setLoading(false);
    };
    fetchTx();
  }, [user]);

  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.type === filter);

  // Monthly summary for chart
  const monthlyMap: Record<string, { inflow: number; outflow: number }> = {};
  transactions.forEach((t) => {
    const d = new Date(t.timestamp);
    const key = `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
    if (!monthlyMap[key]) monthlyMap[key] = { inflow: 0, outflow: 0 };
    if (t.type === "deposit" || t.type === "transfer_in") monthlyMap[key].inflow += t.amount;
    else monthlyMap[key].outflow += t.amount;
  });
  const chartData = Object.entries(monthlyMap)
    .slice(-6)
    .map(([month, val]) => ({ month, ...val }));

  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "Todo" },
    { value: "deposit", label: "Depósitos" },
    { value: "withdrawal", label: "Retiros" },
    { value: "transfer_in", label: "Recibidas" },
    { value: "transfer_out", label: "Enviadas" },
  ];

  return (
    <div className="animate-fade-up" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800 }}>Historial</h1>
        <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
          Todas tus transacciones
        </p>
      </div>

      {/* Bar chart */}
      {chartData.length > 1 && (
        <div className="glass stagger-1 animate-fade-up" style={{ padding: "24px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "20px", color: "var(--text-muted)" }}>
            RESUMEN MENSUAL
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barGap={4}>
              <XAxis dataKey="month" tick={{ fill: "var(--text-dim)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-dim)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
              <Tooltip
                contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "13px" }}
                formatter={(v: unknown, name?: unknown) => [fmt(v as number), name === "inflow" ? "Ingresos" : "Gastos"]}
              />
              <Bar dataKey="inflow" radius={[4, 4, 0, 0]} fill="#22d3a0" />
              <Bar dataKey="outflow" radius={[4, 4, 0, 0]} fill="#ff5e7a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: "7px 16px",
              borderRadius: "20px",
              border: "1px solid",
              borderColor: filter === f.value ? "var(--accent)" : "var(--border)",
              background: filter === f.value ? "var(--accent-soft)" : "transparent",
              color: filter === f.value ? "var(--accent)" : "var(--text-muted)",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="glass" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Cargando...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ fontSize: "32px", marginBottom: "8px" }}>📭</p>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Sin transacciones</p>
          </div>
        ) : (
          filtered.map((tx, i) => (
            <div key={tx.id} style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: TYPE_BG[tx.type],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", color: TYPE_COLORS[tx.type], fontWeight: 700,
                }}>
                  {TYPE_ICON[tx.type]}
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 500 }}>{LABELS[tx.type]}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {tx.description}
                    {tx.counterpartEmail && (
                      <span style={{ color: "var(--text-dim)" }}> · {tx.counterpartEmail}</span>
                    )}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{
                  fontSize: "15px", fontWeight: 600,
                  color: TYPE_COLORS[tx.type],
                }}>
                  {tx.type === "deposit" || tx.type === "transfer_in" ? "+" : "-"}{fmt(tx.amount)}
                </p>
                <p style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>
                  {new Date(tx.timestamp).toLocaleDateString("es-ES", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

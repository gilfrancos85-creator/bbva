export default function DashboardLoading() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ width: "220px", height: "32px", background: "var(--surface-3)", borderRadius: "8px", marginBottom: "10px" }} />
        <div style={{ width: "160px", height: "16px", background: "var(--surface-2)", borderRadius: "6px" }} />
      </div>
      {/* Balance card skeleton */}
      <div style={{ height: "140px", borderRadius: "20px", background: "var(--surface-2)", marginBottom: "24px", animation: "pulse 1.5s ease-in-out infinite" }} />
      {/* Stats grid skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        {[0, 1].map(i => (
          <div key={i} style={{ height: "90px", borderRadius: "16px", background: "var(--surface-2)", animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>
      {/* Chart skeleton */}
      <div style={{ height: "220px", borderRadius: "16px", background: "var(--surface-2)", marginBottom: "24px", animation: "pulse 1.5s ease-in-out infinite" }} />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

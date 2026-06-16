/* DiscordLog — enriched firing feed (compact, for the Trades page). */
function DiscordLog({ maxHeight = 320, fill = false }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const feed = window.NT_DATA.discord;
  const sum = window.NT_DATA.summary14d;

  const Summary = (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "var(--w-medium) var(--t-2xs)/1 var(--font-mono)", color: "var(--fired)" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--fired)" }}></span>{sum.fired} fired
      </span>
      <span style={{ color: "var(--text-tertiary)" }}>·</span>
      <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-mono)", color: "var(--text-tertiary)" }}>{sum.filtered} filtered</span>
      <span style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)", letterSpacing: "var(--ls-wide)" }}>· 14d</span>
    </div>
  );

  // legend mirrors the Live trades column header so the two cards' row lines align
  const legendBase = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", whiteSpace: "nowrap" };
  const legendCell = (w) => ({ ...legendBase, width: w, flex: "none" });

  return (
    <NT.Card title="Alerts" padding={20} action={Summary}
      style={fill ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" } : undefined}
      bodyStyle={{ padding: 0, ...(fill ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } : {}) }}>
      <div style={{ flex: fill ? 1 : undefined, maxHeight: fill ? undefined : maxHeight, overflowY: "auto", overflowX: "hidden" }}>
        {/* column legend — same 32px band as the Live trades header */}
        <div style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--surface-card)", display: "flex", alignItems: "center", gap: 11, padding: "0 18px", height: 32 }}>
          <span style={legendCell(42)}>time</span>
          <span style={legendCell(78)}>type</span>
          <span style={legendCell(74)}>symbol</span>
          <span style={{ ...legendBase, flex: 1, minWidth: 0 }}>message</span>
          <span style={{ ...legendBase, flex: "none" }}>status</span>
        </div>
        {feed.map((m, i) => {
          const muted = !m.fired;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 11, padding: "0 18px", height: 41, boxSizing: "border-box",
              borderTop: i ? "1px solid var(--border)" : "none", opacity: muted ? 0.6 : 1,
            }}>
              <span className="num" style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-mono)", color: "var(--text-tertiary)", width: 42, flex: "none" }}>{m.t.slice(0, 5)}</span>
              <span style={{ width: 78, flex: "none", display: "inline-flex" }}><NT.TypeChip type={m.type} /></span>
              <span className="num" style={{ width: 74, flex: "none", font: "var(--w-medium) var(--t-2xs)/1 var(--font-mono)", color: m.symbol === "—" ? "var(--text-tertiary)" : "var(--text-secondary)" }}>{m.symbol}</span>
              <span style={{ flex: 1, minWidth: 0, font: "var(--w-regular) var(--t-sm)/1.3 var(--font-sans)", color: muted ? "var(--text-tertiary)" : "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {m.msg}
              </span>
              <div style={{ flex: "none" }} title={m.reason || undefined}><NT.FiredBadge fired={m.fired} /></div>
            </div>
          );
        })}
      </div>
    </NT.Card>
  );
}
Object.assign(window, { DiscordLog });

/* LogPage — full Discord firing log: all columns + filter tabs. */
function LogPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const all = window.NT_DATA.discord;
  const sum = window.NT_DATA.summary14d;
  const [range, setRange] = React.useState("today");
  const [filter, setFilter] = React.useState("all");
  const rows = all.filter((m) => filter === "all" ? true : filter === "fired" ? m.fired : !m.fired);

  const Tab = ({ id, label, count }) => {
    const on = filter === id;
    return (
      <button onClick={() => setFilter(id)} style={{
        display: "inline-flex", alignItems: "center", gap: 7, height: 22, padding: "0 10px", borderRadius: "var(--radius-sm)", cursor: "pointer",
        border: "1px solid " + (on ? "var(--border-strong)" : "transparent"),
        background: on ? "var(--surface-hover)" : "transparent", color: on ? "var(--text-primary)" : "var(--text-tertiary)",
        font: `${on ? "var(--w-semibold)" : "var(--w-medium)"} var(--t-xs)/1 var(--font-sans)`,
      }}>{label}<span className="num" style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-mono)", color: on ? "var(--text-secondary)" : "var(--text-tertiary)" }}>{count}</span></button>
    );
  };

  const th = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "12px 14px 12px 0", textAlign: "left", whiteSpace: "nowrap", position: "sticky", top: 0, background: "var(--surface-card)", zIndex: 1 };
  const td = { font: "var(--w-regular) var(--t-sm)/1.3 var(--font-sans)", padding: "12px 14px 12px 0", borderTop: "1px solid var(--border)", verticalAlign: "middle" };
  const mono = { fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Alerts" subtitle="Every Discord message the bot evaluated this session" right={<DateFilter value={range} onChange={setRange} />} />
      <NT.Card padding={20}
        title={<div style={{ display: "flex", alignItems: "center", gap: 4 }}><Tab id="all" label="All" count={all.length} /><Tab id="fired" label="Fired" count={all.filter(m=>m.fired).length} /><Tab id="filtered" label="Filtered" count={all.filter(m=>!m.fired).length} /></div>}
        action={<span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-mono)", color: "var(--text-tertiary)" }}><span style={{ color: "var(--fired)" }}>{sum.fired} fired</span> · {sum.filtered} filtered · 14d</span>}
        bodyStyle={{ padding: 0 }}>
        <div style={{ overflowX: "auto", padding: "0 20px 16px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
            <thead><tr>
              <th style={th}>time</th><th style={th}>type</th><th style={th}>channel</th><th style={th}>symbol</th>
              <th style={{ ...th, width: "40%" }}>message</th><th style={th}>latency</th><th style={th}>action</th><th style={{ ...th, paddingRight: 0 }}>result</th>
            </tr></thead>
            <tbody>
              {rows.map((m, i) => (
                <tr key={i} style={{ opacity: m.fired ? 1 : 0.62 }}>
                  <td style={{ ...td, ...mono, color: "var(--text-tertiary)" }}>{m.t.slice(0, 5)}</td>
                  <td style={td}><NT.TypeChip type={m.type} /></td>
                  <td style={td}><span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: "var(--radius-xs)", background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-tertiary)", font: "var(--w-medium) var(--t-2xs)/1 var(--font-mono)" }}>#{m.ch}</span></td>
                  <td style={{ ...td, ...mono, color: m.symbol === "—" ? "var(--text-tertiary)" : "var(--text-secondary)", fontWeight: "var(--w-medium)" }}>{m.symbol}</td>
                  <td style={{ ...td, color: m.fired ? "var(--text-primary)" : "var(--text-tertiary)" }}>{m.msg}</td>
                  <td style={{ ...td, ...mono, color: "var(--text-tertiary)" }}>{m.fired ? m.latency : "—"}</td>
                  <td style={{ ...td, ...mono, color: m.fired ? "var(--text-secondary)" : "var(--text-tertiary)" }}>{m.fired ? m.action : "—"}</td>
                  <td style={{ ...td, paddingRight: 0 }}><NT.FiredBadge fired={m.fired} reason={m.reason} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NT.Card>
    </div>
  );
}
Object.assign(window, { LogPage });

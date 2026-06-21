/* ChangelogPage — plain-language "what changed", newest version on top. */
function ChangelogPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const log = window.NT_CHANGELOG || [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Updates" subtitle={"What's changed · currently v" + (window.NT_VERSION || "1.0")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {log.map((e, i) => (
          <NT.Card key={i} padding={18}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
              <span style={{ font: "var(--w-semibold) var(--t-h3)/1 var(--font-mono)", color: "var(--accent)", letterSpacing: "var(--ls-tight)" }}>v{e.v}</span>
              <span className="num" style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-mono)", color: "var(--text-tertiary)" }}>{e.date}</span>
              {i === 0 && <span style={{ display: "inline-flex", alignItems: "center", height: 18, padding: "0 7px", borderRadius: "var(--radius-xs)", background: "var(--profit-bg)", color: "var(--profit)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase" }}>latest</span>}
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 7 }}>
              {e.notes.map((n, j) => (
                <li key={j} style={{ font: "var(--w-regular) var(--t-sm)/1.5 var(--font-sans)", color: "var(--text-secondary)" }}>{n}</li>
              ))}
            </ul>
          </NT.Card>
        ))}
      </div>
    </div>
  );
}
Object.assign(window, { ChangelogPage });

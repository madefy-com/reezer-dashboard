/* ChangelogPage — "what changed", grouped by day, newest day on top. */
function ChangelogPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const log = window.NT_CHANGELOG || [];

  // group the (already newest-first) flat list into day buckets
  const days = [];
  log.forEach((e) => {
    let d = days[days.length - 1];
    if (!d || d.date !== e.date) { d = { date: e.date, items: [] }; days.push(d); }
    d.items.push(e);
  });

  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pretty = (iso) => { const p = String(iso).split("-"); return p[2].replace(/^0/, "") + " " + (MON[+p[1] - 1] || p[1]) + " " + p[0]; };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Updates" subtitle={"What's changed · currently v" + (window.NT_VERSION || "1.0")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {days.map((day, di) => (
          <NT.Card key={di} padding={18}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
              <span style={{ font: "var(--w-semibold) var(--t-h3)/1 var(--font-sans)", letterSpacing: "var(--ls-tight)", color: "var(--text-primary)" }}>{pretty(day.date)}</span>
              <span className="num" style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-mono)", color: "var(--text-tertiary)" }}>{day.items.length} update{day.items.length === 1 ? "" : "s"}</span>
              {di === 0 && <span style={{ display: "inline-flex", alignItems: "center", height: 18, padding: "0 7px", borderRadius: "var(--radius-xs)", background: "var(--profit-bg)", color: "var(--profit)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase" }}>latest</span>}
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
              {day.items.map((it, j) => (
                <li key={j} style={{ font: "var(--w-regular) var(--t-sm)/1.5 var(--font-sans)", color: "var(--text-secondary)" }}>
                  {it.note}
                  <span className="num" style={{ marginLeft: 7, font: "var(--w-regular) var(--t-2xs)/1 var(--font-mono)", color: "var(--text-tertiary)" }}>v{it.v}</span>
                </li>
              ))}
            </ul>
          </NT.Card>
        ))}
      </div>
    </div>
  );
}
Object.assign(window, { ChangelogPage });

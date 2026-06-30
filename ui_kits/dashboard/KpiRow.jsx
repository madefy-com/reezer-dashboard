/* KpiRow — six headline metrics with small visuals. Shared by the dashboard AND the
   Trades page. Cards mirror the design-system KpiCard look + add a per-card visual:
   a win-rate donut and a profit-factor split bar. */
function KpiRow() {
  const k = window.NT_DATA.kpis || {};
  const toneCol = (t) => (t === "profit" ? "var(--profit)" : t === "loss" ? "var(--loss)" : "var(--text-primary)");

  // win-rate donut — green arc = win fraction, grey track = the rest
  const ring = (frac) => {
    const f = Math.max(0, Math.min(1, frac || 0)), r = 11, c = 2 * Math.PI * r;
    return (
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" style={{ flex: "none" }}>
        <circle cx="15" cy="15" r={r} fill="none" stroke="var(--surface-inset)" strokeWidth="4" />
        <circle cx="15" cy="15" r={r} fill="none" stroke="var(--profit)" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - f * c} transform="rotate(-90 15 15)" />
      </svg>
    );
  };
  // profit-factor split bar — green = share of profit, red = share of loss
  const splitbar = (share) => {
    const pct = Math.round(Math.max(0, Math.min(1, share || 0)) * 100);
    return (
      <span aria-hidden="true" style={{ display: "inline-flex", width: 56, height: 8, borderRadius: 999, overflow: "hidden", background: "var(--loss)", flex: "none" }}>
        <span style={{ width: pct + "%", background: "var(--profit)" }} />
      </span>
    );
  };

  const Kard = ({ label, value, sub, tone, visual }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "18px 18px 16px", background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 30 }}>
        <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "lowercase", color: "var(--text-tertiary)" }}>{label}</span>
        {visual || null}
      </div>
      <span style={{ font: "var(--w-light) var(--t-kpi)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", letterSpacing: "var(--ls-tight)", color: toneCol(tone) }}>{value != null ? value : "—"}</span>
      {sub ? <span style={{ font: "var(--w-regular) var(--t-xs)/1.3 var(--font-sans)", color: "var(--text-tertiary)" }}>{sub}</span> : null}
    </div>
  );

  const ar = k.accountReturn || {}, np = k.netPnl || {}, wr = k.winRate || {}, ap = k.avgPerTrade || {}, pf = k.profitFactor || {}, ex = k.expectancy || {};
  return (
    <div className="nt-kpi-row">
      <Kard label="account return" value={ar.value} sub={ar.sub} tone={ar.tone} />
      <Kard label="net p&l" value={np.value} sub="realized" tone={np.tone} />
      <Kard label="trade win %" value={wr.value} sub={wr.sub} visual={ring(wr.frac)} />
      <Kard label="avg profit / trade" value={ap.value} sub={ap.sub} tone={ap.tone} />
      <Kard label="profit factor" value={pf.value} sub={pf.sub} tone={pf.tone} visual={splitbar(pf.share)} />
      <Kard label="trade expectancy" value={ex.value} sub={ex.sub} tone={ex.tone} />
      <style>{`
        .nt-kpi-row{ display:grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: var(--gap-grid); }
        @media (max-width: 1240px){ .nt-kpi-row{ grid-template-columns: repeat(3, minmax(0,1fr)); } }
        @media (max-width: 720px){ .nt-kpi-row{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
      `}</style>
    </div>
  );
}
Object.assign(window, { KpiRow });

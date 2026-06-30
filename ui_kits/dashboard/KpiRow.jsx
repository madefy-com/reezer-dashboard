/* KpiRow — six headline metrics, each new one with its own visual. Shared by the
   dashboard AND the Trades page. Account return + Net P&L are plain colored numbers;
   the four trade metrics each carry a dynamic visual:
     trade win %   -> donut ring (green arc = win rate, visible grey track)
     avg win/loss  -> ratio headline + green/red magnitude bar + the two $ figures
     profit factor -> green/red split bar (profit vs loss share)
     expectancy    -> centered meter (green right / red left of 0, by sign & size) */
function KpiRow() {
  const k = window.NT_DATA.kpis || {};
  const toneCol = (t) => (t === "profit" ? "var(--profit)" : t === "loss" ? "var(--loss)" : "var(--text-primary)");
  const dol = (n) => "$" + Math.round(Math.abs(n || 0)).toLocaleString();

  // shared card styling (mirrors the design-system KpiCard)
  const cardStyle = { display: "flex", flexDirection: "column", gap: 10, padding: "18px 18px 16px", background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", minWidth: 0 };
  const labelStyle = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "lowercase", color: "var(--text-tertiary)" };
  const valStyle = (tone) => ({ font: "var(--w-light) var(--t-kpi)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", letterSpacing: "var(--ls-tight)", color: toneCol(tone) });
  const subStyle = { font: "var(--w-regular) var(--t-xs)/1.3 var(--font-sans)", color: "var(--text-tertiary)" };

  // --- visuals (all 30px tall, top-right aligned) ---
  const ring = (frac) => {
    const f = Math.max(0, Math.min(1, frac || 0)), r = 11, c = 2 * Math.PI * r;
    return (
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" style={{ flex: "none" }}>
        <circle cx="15" cy="15" r={r} fill="none" stroke="var(--line-3)" strokeWidth="4" />
        <circle cx="15" cy="15" r={r} fill="none" stroke="var(--profit)" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - f * c} transform="rotate(-90 15 15)" />
      </svg>
    );
  };
  // two explicit full-height segments so green and red are exactly the same thickness
  const bar = (share, width) => {
    const pct = Math.round(Math.max(0, Math.min(1, share || 0)) * 100);
    return (
      <span aria-hidden="true" style={{ display: "flex", width: width || 56, height: 8, borderRadius: 999, overflow: "hidden", flex: "none" }}>
        <span style={{ width: pct + "%", background: "var(--profit)" }} />
        <span style={{ flex: 1, background: "var(--loss)" }} />
      </span>
    );
  };
  // expectancy meter — fills out from a centered 0 line: green right if positive, red left if negative
  const meter = (frac) => {
    const f = Math.max(-1, Math.min(1, frac || 0)), pos = f >= 0;
    const w = Math.max(0.6, Math.abs(f)) * 50;   // min fill so the +/- direction is always clearly visible
    const fill = { position: "absolute", top: 0, bottom: 0, width: w + "%", background: pos ? "var(--profit)" : "var(--loss)" };
    if (pos) fill.left = "50%"; else fill.right = "50%";
    return (
      <span aria-hidden="true" style={{ position: "relative", display: "inline-block", width: 56, height: 10, borderRadius: 999, background: "var(--line-1)", flex: "none", overflow: "hidden" }}>
        <span style={fill} />
        <span style={{ position: "absolute", left: "calc(50% - 0.5px)", top: 0, bottom: 0, width: 1, background: "var(--line-3)" }} />
      </span>
    );
  };

  const Kard = ({ label, value, sub, tone, visual }) => (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 30 }}>
        <span style={labelStyle}>{label}</span>
        {visual || null}
      </div>
      <span style={valStyle(tone)}>{value != null ? value : "—"}</span>
      {sub ? <span style={subStyle}>{sub}</span> : null}
    </div>
  );

  // avg win / loss — ratio headline + green/red magnitude bar + the two $ figures
  const AvgWL = () => {
    const a = k.avgWinLoss || {};
    const r = a.ratio;
    const ratioStr = r == null ? "—" : (r === Infinity || r > 999 ? "∞" : r.toFixed(2));
    const tone = r == null ? null : (r >= 1 ? "profit" : "loss");
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 30 }}><span style={labelStyle}>avg win / loss</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={valStyle(tone)}>{ratioStr}</span>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {bar(a.winShare != null ? a.winShare : 0.5, "100%")}
            <div style={{ display: "flex", justifyContent: "space-between", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
              <span style={{ color: "var(--profit)" }}>{dol(a.avgWin)}</span>
              <span style={{ color: "var(--loss)" }}>−{dol(a.avgLoss)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ar = k.accountReturn || {}, np = k.netPnl || {}, wr = k.winRate || {}, pf = k.profitFactor || {}, ex = k.expectancy || {};
  const winTone = wr.frac == null ? null : (wr.frac >= 0.5 ? "profit" : "loss");
  return (
    <div className="nt-kpi-row">
      <Kard label="account return" value={ar.value} sub={ar.sub} tone={ar.tone} />
      <Kard label="net p&l" value={np.value} sub="realized" tone={np.tone} />
      <Kard label="trade win %" value={wr.value} sub={wr.sub} tone={winTone} visual={ring(wr.frac)} />
      <AvgWL />
      <Kard label="profit factor" value={pf.value} sub={pf.sub} tone={pf.tone} visual={bar(pf.share)} />
      <Kard label="trade expectancy" value={ex.value} sub={ex.sub} tone={ex.tone} visual={meter(ex.frac)} />
      <style>{`
        .nt-kpi-row{ display:grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: var(--gap-grid); }
        @media (max-width: 1240px){ .nt-kpi-row{ grid-template-columns: repeat(3, minmax(0,1fr)); } }
        @media (max-width: 720px){ .nt-kpi-row{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
      `}</style>
    </div>
  );
}
Object.assign(window, { KpiRow });

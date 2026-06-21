/* BacktestingPage — strategy equity curve + result stats. */
function BacktestingPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const bt = window.NT_DATA.backtest;
  const strategies = window.NT_DATA.strategies;
  const [strat, setStrat] = React.useState(bt.strategy);
  const range = String(window.NT_DATA.dateRange || "week");   // shared, persisted date filter

  // equity curve geometry
  const eq = bt.equity;
  const hasData = eq.length > 1;
  const W = 920, H = 300, mL = 46, mR = 16, mT = 18, mB = 28;
  const max = 40, min = 0;
  const ix = (i) => mL + (i * (W - mL - mR)) / (eq.length - 1);
  const iy = (v) => mT + (1 - (v - min) / (max - min)) * (H - mT - mB);
  const line = eq.map((v, i) => (i ? "L" : "M") + ix(i).toFixed(1) + " " + iy(v).toFixed(1)).join(" ");
  const area = line + ` L ${ix(eq.length - 1).toFixed(1)} ${iy(0).toFixed(1)} L ${mL} ${iy(0).toFixed(1)} Z`;
  const yTicks = [0, 10, 20, 30, 40];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Backtesting" subtitle="Replay a strategy over historical sessions"
        right={<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", display: "inline-flex" }}>
            <select value={strat} onChange={(e) => setStrat(e.target.value)} style={{
              appearance: "none", height: 32, padding: "0 30px 0 12px", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-primary)",
              font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)", cursor: "pointer",
            }}>
              {strategies.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
            <span style={{ position: "absolute", right: 10, top: 9, pointerEvents: "none", color: "var(--text-tertiary)" }}><Ico name="chevron-down" size={14} /></span>
          </div>
          <DateFilter value={range} onChange={(v, b) => window.NT_SET_RANGE(v, b)} />
          <NT.Button variant="primary" size="md" icon={<Ico name="play" size={15} />}>Run</NT.Button>
        </div>} />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) minmax(0,1fr)", gap: "var(--gap-grid)", alignItems: "stretch" }} className="nt-body">
        <NT.Card title={"Equity curve · " + strat} action={<span style={{ font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>{bt.range}</span>}>
          {!hasData ? (
            <div style={{ height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--text-tertiary)" }}>
              <Ico name="line-chart" size={26} />
              <span style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)" }}>No backtest yet</span>
              <span style={{ font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)" }}>Run a strategy over historical sessions to see its equity curve.</span>
            </div>
          ) : (<>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
            <span className="num" style={{ font: "var(--w-light) 34px/1 var(--font-mono)", letterSpacing: "var(--ls-tight)", color: "var(--profit)" }}>{bt.cumReturn || ""}</span>
            <span style={{ font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>cumulative return · {eq.length} sessions</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
            {yTicks.map((v) => (
              <g key={v}>
                <line x1={mL} y1={iy(v)} x2={W - mR} y2={iy(v)} stroke="var(--border)" strokeDasharray={v === 0 ? "none" : "3 4"} />
                <text x={mL - 10} y={iy(v) + 4} textAnchor="end" fill="var(--text-tertiary)" style={{ font: "var(--w-regular) 11px/1 var(--font-mono)" }}>{v}%</text>
              </g>
            ))}
            <path d={area} fill="var(--violet-soft)" />
            <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={ix(eq.length - 1)} cy={iy(eq[eq.length - 1])} r="4.5" fill="var(--accent)" stroke="var(--ink-2)" strokeWidth="2.5" />
          </svg>
          </>)}
        </NT.Card>

        <NT.Card title="Results" bodyStyle={{ display: "flex", flexDirection: "column" }}>
          {bt.stats.length === 0 ? (
            <div style={{ flex: 1, minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", textAlign: "center", padding: 20 }}>
              No results yet
            </div>
          ) : (
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gridAutoRows: "1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            {bt.stats.map((s, i) => (
              <div key={i} style={{ background: "var(--surface-card)", padding: "14px 15px", display: "flex", flexDirection: "column", gap: 7 }}>
                <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", color: "var(--text-tertiary)" }}>{s.label}</span>
                <span className="num" style={{ font: "var(--w-light) 21px/1 var(--font-mono)", letterSpacing: "var(--ls-tight)", color: s.tone === "profit" ? "var(--profit)" : s.tone === "loss" ? "var(--loss)" : "var(--text-primary)" }}>{s.value}</span>
              </div>
            ))}
          </div>
          )}
        </NT.Card>
      </div>
      <style>{`@media (max-width: 1080px){ .nt-body{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
Object.assign(window, { BacktestingPage });

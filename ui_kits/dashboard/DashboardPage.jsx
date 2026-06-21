/* DashboardPage — the operator's live overview. KPIs + live trades + P&L + Discord firing log.
   Left: trades (fill) + P&L chart below. Right: Discord firing log (full height).
   Opening a trade slides a detail panel over the right column; click outside it to dismiss. */
/* Dashboard view filter — scope KPIs/trades/P&L to one strategy (persisted).
   Hidden when there's only one strategy. */
function StrategyViewSelect() {
  const strategies = window.NT_DATA.strategies || [];
  if (strategies.length < 2) return null;
  const view = window.NT_DATA.viewStrategy || "all";
  const anyLive = strategies.some((s) => s.account === "live");
  return (
    <select value={view} onChange={(e) => window.NT_SET_VIEW(e.target.value)} title="Which strategy the dashboard shows"
      style={{ height: 30, padding: "0 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-strong)", background: "var(--surface-inset)", color: "var(--text-secondary)", colorScheme: "dark", font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)" }}>
      <option value="all">All strategies</option>
      {anyLive && <option value="live">Live only</option>}
      {strategies.map((s) => <option key={s.id || s.name} value={s.id}>{s.name}</option>)}
    </select>
  );
}

function DashboardPage({ mode, kill }) {
  const [range, setRange] = React.useState("today");
  const [sel, setSel] = React.useState(null);
  // keep the top date filter and the chart's range in sync (Today↔1D, week↔1W, month↔1M)
  const chartRange = ({ today: "1D", week: "1W", month: "1M", custom: "1M" })[range] || "1M";
  const onChartRange = (cr) => setRange(({ "1D": "today", "1W": "week", "1M": "month" })[cr] || "today");
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title={greeting(window.NT_USER_NAME || window.NT_DATA.session.user)} right={<div style={{ display: "flex", alignItems: "center", gap: 10 }}><StrategyViewSelect /><DateFilter value={range} onChange={setRange} /></div>} />
      <KpiRow />
      <div className="nt-body" style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gridTemplateRows: "minmax(0,1fr)", gap: "var(--gap-grid)", alignItems: "stretch" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)", minHeight: 0 }}>
          <TradesLog fill onSelect={setSel} />
          <PnlChart onSelect={setSel} range={chartRange} onRange={onChartRange} />
        </div>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <DiscordLog fill />
          {sel && <TradeDetail trade={sel} onClose={() => setSel(null)} />}
        </div>
      </div>
      <style>{`@media (max-width: 1080px){ .nt-body{ grid-template-columns: 1fr !important; grid-template-rows: auto !important; } }`}</style>
    </div>
  );
}
Object.assign(window, { DashboardPage });

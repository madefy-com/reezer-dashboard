/* DashboardPage — the operator's live overview. KPIs + live trades + P&L + Discord firing log.
   Left: trades (fill) + P&L chart below. Right: Discord firing log (full height).
   Opening a trade slides a detail panel over the right column; click outside it to dismiss. */
/* Dashboard view filter — scope KPIs/trades/P&L to one strategy (persisted).
   Hidden when there's only one strategy. */
/* StrategyViewSelect now lives in Shared.jsx (used by Dashboard + Trades). */

function DashboardPage({ mode, kill, category = "options" }) {
  const range = String(window.NT_DATA.dateRange || "week");   // shared, persisted date filter
  const [sel, setSel] = React.useState(null);
  // Keep the top date filter and the chart's range in sync. Ranges wider than a month
  // (year-to-date, all-time, custom) map to ALL = "the whole filtered period" — before,
  // they silently fell back to 1M and the chart's total contradicted the KPI cards
  // ($709 under a chart while net p&l said $1,106).
  const chartRange = ({ today: "1D", week: "1W", month: "1M" })[range] || "ALL";
  const onChartRange = (cr) => {
    if (cr === "ALL") return;                    // ALL just mirrors the page filter above
    window.NT_SET_RANGE(({ "1D": "today", "1W": "week", "1M": "month" })[cr] || "week");
  };
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title={greeting(window.NT_USER_NAME || window.NT_DATA.session.user)} right={<div style={{ display: "flex", alignItems: "center", gap: 10 }}><StrategyViewSelect category={category} /><DateFilter value={range} onChange={(v, b) => window.NT_SET_RANGE(v, b)} /></div>} />
      <KpiRow category={category} />
      <div className="nt-body" style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gridTemplateRows: "minmax(0,1fr)", gap: "var(--gap-grid)", alignItems: "stretch" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)", minHeight: 0 }}>
          <TradesLog fill onSelect={setSel} category={category} />
          <PnlChart onSelect={setSel} range={chartRange} onRange={onChartRange} category={category} />
        </div>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <DiscordLog fill category={category} />
          {sel && <TradeDetail trade={sel} onClose={() => setSel(null)} />}
        </div>
      </div>
      <style>{`@media (max-width: 1080px){ .nt-body{ grid-template-columns: 1fr !important; grid-template-rows: auto !important; } }`}</style>
    </div>
  );
}
Object.assign(window, { DashboardPage });

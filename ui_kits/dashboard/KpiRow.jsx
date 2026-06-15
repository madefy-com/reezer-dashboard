/* KpiRow — six headline metrics. Order: net, best, worst, avg return, win rate, open. */
function KpiRow() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const k = window.NT_DATA.kpis;
  const cards = [
    { label: "net p&l", ...k.netPnl },
    { label: "best trade", ...k.bestTrade },
    { label: "worst trade", ...k.worstTrade },
    { label: "avg return / trade", ...k.avgReturn },
    { label: "win rate", ...k.winRate },
    { label: "open positions", ...k.openPos },
  ];
  return (
    <div className="nt-kpi-row">
      {cards.map((c, i) => (
        <NT.KpiCard key={i} label={c.label} value={c.value} delta={c.delta} sub={c.sub} tone={c.tone} />
      ))}
      <style>{`
        .nt-kpi-row{ display:grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: var(--gap-grid); }
        @media (max-width: 1240px){ .nt-kpi-row{ grid-template-columns: repeat(3, minmax(0,1fr)); } }
        @media (max-width: 720px){ .nt-kpi-row{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
      `}</style>
    </div>
  );
}
Object.assign(window, { KpiRow });

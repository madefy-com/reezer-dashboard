/* TradesPage — every trade the bot placed, in full detail.
   Detailed table (more columns than the dashboard log). Click a row to open the
   full breakdown in a right-side drawer; click the dimmed backdrop to dismiss. */
function TradesPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const rows = window.NT_DATA.trades;
  const [range, setRange] = React.useState("today");
  const [sel, setSel] = React.useState(null);

  const money = (n) => (n > 0 ? "+$" + n.toFixed(2) : n < 0 ? "\u2212$" + Math.abs(n).toFixed(2) : "$0.00");
  const pct = (n) => (n > 0 ? "+" : n < 0 ? "\u2212" : "") + Math.abs(n).toFixed(1) + "%";
  const tone = (n) => (n > 0 ? "var(--profit)" : n < 0 ? "var(--loss)" : "var(--breakeven)");

  // ---- summary roll-up ----
  const open = rows.filter((r) => r.status === "live").length;
  const closed = rows.length - open;
  const k = window.NT_DATA.kpis;
  // top frames mirror the dashboard headline metrics (same KpiCard look)
  const kpis = [
    { label: "total trades", value: String(rows.length), sub: closed + " closed \u00b7 " + open + " open" },
    { label: "net p&l", value: k.netPnl.value, delta: k.netPnl.delta, tone: "profit", sub: "realized" },
    { label: "win rate", value: k.winRate.value, sub: k.winRate.sub },
    { label: "best ticker", value: k.bestTrade.value, sub: k.bestTrade.sub, tone: "profit" },
    { label: "worst ticker", value: k.worstTrade.value, sub: k.worstTrade.sub, tone: "loss" },
    { label: "avg return", value: k.avgReturn.value, sub: k.avgReturn.sub },
  ];

  const th = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap", position: "sticky", top: 0, background: "var(--surface-card)", zIndex: 1 };
  const thL = { ...th, textAlign: "left" };
  const td = { font: "var(--w-regular) var(--t-sm)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", padding: "13px 14px", borderTop: "1px solid var(--border)", textAlign: "right", color: "var(--text-primary)", whiteSpace: "nowrap" };
  const tdL = { ...td, textAlign: "left" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Trades" subtitle="Every order the bot has placed — click a row for the full breakdown"
        right={<span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><StrategyViewSelect /><DateFilter value={range} onChange={setRange} /></span>} />

      {/* top frames — same KpiCard look as the dashboard */}
      <div className="nt-tkpi">
        {kpis.map((c, i) => (
          <NT.KpiCard key={i} label={c.label} value={c.value} delta={c.delta} sub={c.sub} tone={c.tone} />
        ))}
      </div>

      {/* detailed table */}
      <NT.Card title="All trades" padding={20}
        action={<span style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>{rows.length} orders · {window.NT_DATA.session.date}</span>}
        bodyStyle={{ padding: 0 }}>
        <div style={{ overflowX: "auto", padding: "0 6px 12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1080 }}>
            <thead><tr>
              <th style={{ ...thL, width: 26, paddingRight: 0 }}></th>
              <th style={thL}>opened</th>
              <th style={thL}>closed</th>
              <th style={thL}>contract</th>
              <th style={thL}>side</th>
              <th style={th}>qty</th>
              <th style={th}>entry</th>
              <th style={th}>exit</th>
              <th style={th}>stop</th>
              <th style={th}>capital</th>
              <th style={th}>p&l $</th>
              <th style={th}>p&l %</th>
              <th style={th}>hold</th>
              <th style={thL}>strategy</th>
              <th style={{ ...th }}>result</th>
            </tr></thead>
            <tbody>
              {rows.map((r, i) => {
                const capital = (r.entry * r.qty * 100).toFixed(0);
                return (
                  <tr key={i} onClick={() => setSel(r)} className="nt-trow" style={{ cursor: "pointer" }}>
                    <td style={{ ...tdL, width: 26, paddingRight: 0 }}><NT.StatusDot status={r.status} /></td>
                    <td style={{ ...tdL, color: "var(--text-secondary)" }}>{r.t}</td>
                    <td style={{ ...tdL, color: r.close === "\u2014" ? "var(--text-tertiary)" : "var(--text-secondary)" }}>{r.close}</td>
                    <td style={tdL}>
                      <span style={{ color: "var(--text-primary)", fontWeight: "var(--w-medium)" }}>{r.tk}</span>
                      <span style={{ color: "var(--text-secondary)" }}> {r.strike}</span>
                    </td>
                    <td style={{ ...tdL }}>
                      <span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: "var(--radius-xs)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)",
                        background: r.side === "C" ? "var(--profit-bg)" : "var(--loss-bg)", color: r.side === "C" ? "var(--profit)" : "var(--loss)" }}>
                        {r.side === "C" ? "CALL" : "PUT"}
                      </span>
                    </td>
                    <td style={{ ...td, color: "var(--text-secondary)" }}>×{r.qty}</td>
                    <td style={td}>{r.entry.toFixed(2)}</td>
                    <td style={{ ...td, color: r.exit == null ? "var(--text-tertiary)" : "var(--text-primary)" }}>{r.exit == null ? "\u2014" : Number(r.exit).toFixed(2)}</td>
                    <td title={r.stop != null && r.atBreakeven ? "at breakeven" : undefined} style={{ ...td, color: r.stop == null ? "var(--text-tertiary)" : (r.atBreakeven ? "var(--breakeven)" : "var(--loss)") }}>{r.stop == null ? "\u2014" : Number(r.stop).toFixed(2)}</td>
                    <td style={{ ...td, color: "var(--text-secondary)" }}>${capital}</td>
                    <td style={{ ...td, color: tone(r.pnl), fontWeight: "var(--w-medium)" }}>{money(r.pnl)}</td>
                    <td style={{ ...td, color: tone(r.pnl) }}>{pct(r.pct)}</td>
                    <td style={{ ...td, color: "var(--text-secondary)" }}>{r.hold === "open" ? "\u2014" : r.hold}</td>
                    <td style={{ ...tdL, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{r.strat}</td>
                    <td style={{ ...td }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {r.stopped && <i data-lucide="octagon-x" style={{ width: 13, height: 13, color: "var(--loss)" }}></i>}
                        <NT.ResultBadge result={r.result} size="sm" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </NT.Card>

      {/* detail drawer — click the backdrop (outside the panel) to dismiss */}
      {sel && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(8,8,10,0.55)", display: "flex", justifyContent: "flex-end" }}>
        <div style={{ position: "relative", width: "min(686px, 92vw)", height: "100%" }}>
            <TradeDetail trade={sel} onClose={() => setSel(null)} />
          </div>
        </div>
      )}

      <style>{`
        .nt-trow:hover td{ background: var(--surface-inset); }
        .nt-trow td{ transition: background var(--dur); }
        .nt-trow td:first-child{ border-top-left-radius: var(--radius-xs); border-bottom-left-radius: var(--radius-xs); }
        .nt-trow td:last-child{ border-top-right-radius: var(--radius-xs); border-bottom-right-radius: var(--radius-xs); }
        .nt-tkpi{ display:grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: var(--gap-grid); }
        @media (max-width: 1240px){ .nt-tkpi{ grid-template-columns: repeat(3, minmax(0,1fr)); } }
        @media (max-width: 720px){ .nt-tkpi{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
      `}</style>
    </div>
  );
}
Object.assign(window, { TradesPage });

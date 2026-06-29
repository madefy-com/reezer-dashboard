/* TradesPage — every trade the bot placed, in full detail.
   Detailed table (more columns than the dashboard log). Click a row to open the
   full breakdown in a right-side drawer; click the dimmed backdrop to dismiss. */
function TradesPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const rows = window.NT_DATA.trades;
  const range = String(window.NT_DATA.dateRange || "week");   // shared, persisted date filter
  const [sel, setSel] = React.useState(null);

  const money = (n) => (n > 0 ? "+$" + n.toFixed(2) : n < 0 ? "\u2212$" + Math.abs(n).toFixed(2) : "$0.00");
  const pct = (n) => (n > 0 ? "+" : n < 0 ? "\u2212" : "") + Math.abs(n).toFixed(1) + "%";
  const tone = (n) => (n > 0 ? "var(--profit)" : n < 0 ? "var(--loss)" : "var(--breakeven)");
  const dkey = (iso) => { if (!iso) return ""; try { const tz = (window.NT_DATA.marketHours || {}).display_tz || "Europe/Amsterdam"; return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso)); } catch (e) { return ""; } };
  const dlabel = (key) => (key ? key.slice(8, 10) + "/" + key.slice(5, 7) : "");


  const th = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap", position: "sticky", top: 0, background: "var(--surface-card)", zIndex: 1 };
  const thL = { ...th, textAlign: "left" };
  const td = { font: "var(--w-regular) var(--t-sm)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", padding: "13px 14px", borderTop: "1px solid var(--border)", textAlign: "right", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
  const tdL = { ...td, textAlign: "left" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Trades" subtitle="Every order the bot has placed — click a row for the full breakdown"
        right={<span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><StrategyViewSelect /><DateFilter value={range} onChange={(v, b) => window.NT_SET_RANGE(v, b)} /></span>} />

      {/* headline metrics — the exact same six cards as the dashboard */}
      <KpiRow />

      {/* detailed table */}
      <NT.Card title="All trades" padding={20}
        action={<span style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>{rows.length} order{rows.length === 1 ? "" : "s"}{window.NT_DATA.session.date ? " · " + window.NT_DATA.session.date : ""}</span>}
        bodyStyle={{ padding: 0 }}>
        <div style={{ overflowX: "auto", padding: "0 6px 12px", containerType: "inline-size" }}>
          <style>{`@container (max-width: 760px){ .nt-datecol-col{ width:0 !important; } .nt-datecol{ padding-left:0 !important; padding-right:0 !important; overflow:hidden !important; } }`}</style>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1080, tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "2%" }} /><col className="nt-datecol-col" style={{ width: "5%" }} /><col style={{ width: "7%" }} /><col style={{ width: "7%" }} />
              <col style={{ width: "10%" }} /><col style={{ width: "7%" }} /><col style={{ width: "5%" }} /><col style={{ width: "6%" }} />
              <col style={{ width: "6%" }} /><col style={{ width: "6%" }} /><col style={{ width: "6%" }} /><col style={{ width: "8%" }} />
              <col style={{ width: "7%" }} /><col style={{ width: "4%" }} /><col style={{ width: "6%" }} /><col style={{ width: "8%" }} />
            </colgroup>
            <thead><tr>
              <th style={{ ...thL, paddingRight: 0 }}></th>
              <th className="nt-datecol" style={thL}>date</th>
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
                    <td className="nt-datecol" style={{ ...tdL, color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-xs)/1 var(--font-mono)" }}>{dlabel(dkey(r.entryTs))}</td>
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
                    <td title={r.strat} style={{ ...tdL, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{r.strat}</td>
                    <td style={{ ...td, overflow: "visible", textOverflow: "clip" }}>
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
      `}</style>
    </div>
  );
}
Object.assign(window, { TradesPage });

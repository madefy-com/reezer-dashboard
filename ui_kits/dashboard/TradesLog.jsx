/* TradesLog — live trades table / log. Fillable with internal scroll + sticky header. */
function TradesLog({ onSelect, fill = false }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const rows = window.NT_DATA.trades;
  // streaming dot: green+blinking inside the streaming window, red outside (live)
  const [, setTick] = React.useState(0);
  React.useEffect(() => { const id = setInterval(() => setTick((x) => x + 1), 1000); return () => clearInterval(id); }, []);
  const streaming = ntSession(new Date()).streaming;
  const money = (n) => (n > 0 ? "+$" + n.toFixed(2) : n < 0 ? "\u2212$" + Math.abs(n).toFixed(2) : "$0.00");
  const pct = (n) => (n > 0 ? "+" : n < 0 ? "\u2212" : "") + Math.abs(n).toFixed(1) + "%";
  const tone = (n) => (n > 0 ? "var(--profit)" : n < 0 ? "var(--loss)" : "var(--breakeven)");

  const th = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "10px 0", textAlign: "right", whiteSpace: "nowrap", position: "sticky", top: 0, background: "var(--surface-card)", zIndex: 1 };
  const thL = { ...th, textAlign: "left" };
  const td = { font: "var(--w-regular) var(--t-sm)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", padding: "11px 0", borderTop: "1px solid var(--border)", textAlign: "right", color: "var(--text-primary)", whiteSpace: "nowrap" };
  const tdL = { ...td, textAlign: "left" };

  return (
    <NT.Card title="Trades" padding={20}
      action={<NT.StatusDot status={streaming ? "live" : "loss"} label={streaming ? "Streaming" : "Not streaming"} />}
      style={fill ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" } : undefined}
      bodyStyle={{ padding: 0, ...(fill ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } : {}) }}>
      <div style={{ flex: fill ? 1 : undefined, minHeight: 0, overflowY: "auto", overflowX: "hidden", padding: "0 20px 10px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            <th style={{ ...thL, width: 28 }}></th>
            <th style={thL}>time</th>
            <th style={thL}>contract</th>
            <th style={th}>qty</th>
            <th style={th}>entry</th>
            <th style={th}>exit</th>
            <th style={th}>p&l $</th>
            <th style={th}>p&l %</th>
            <th style={{ ...th, paddingRight: 2 }}>result</th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} onClick={() => onSelect && onSelect(r)} className="nt-trow" style={{ cursor: onSelect ? "pointer" : "default" }}>
                <td style={{ ...tdL, width: 28 }}><NT.StatusDot status={r.status} /></td>
                <td style={{ ...tdL, color: "var(--text-secondary)" }}>{r.t.slice(0, 5)}</td>
                <td style={tdL}>
                  <span style={{ color: "var(--text-primary)", fontWeight: "var(--w-medium)" }}>{r.tk}</span>
                  <span style={{ color: "var(--text-secondary)" }}> {r.strike}</span>
                </td>
                <td style={{ ...td, color: "var(--text-secondary)" }}>
                  ×{r.qty}
                  {r.partial && <span title="Half sold — position still open" style={{ marginLeft: 5, padding: "1px 5px", borderRadius: "var(--radius-xs)", background: "var(--profit-bg)", color: "var(--profit)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)" }}>½</span>}
                </td>
                <td style={td}>{r.entry.toFixed(2)}</td>
                <td style={{ ...td, color: r.exit === null ? "var(--text-tertiary)" : "var(--text-primary)" }}>{r.exit === null ? "—" : r.exit}</td>
                <td style={{ ...td, color: tone(r.pnl), fontWeight: "var(--w-medium)" }}>{money(r.pnl)}</td>
                <td style={{ ...td, color: tone(r.pnl) }}>{pct(r.pct)}</td>
                <td style={{ ...td, paddingRight: 2 }}><NT.ResultBadge result={r.result} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`.nt-trow:hover td{ background: var(--surface-inset); } .nt-trow td{ transition: background var(--dur); } .nt-trow td:first-child{ border-top-left-radius: var(--radius-xs); border-bottom-left-radius: var(--radius-xs); } .nt-trow td:last-child{ border-top-right-radius: var(--radius-xs); border-bottom-right-radius: var(--radius-xs); }`}</style>
    </NT.Card>
  );
}
Object.assign(window, { TradesLog });

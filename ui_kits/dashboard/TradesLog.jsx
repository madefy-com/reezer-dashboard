/* TradesLog — live trades table / log. Fillable with internal scroll + sticky header. */
function TradesLog({ onSelect, fill = false }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const rows = window.NT_DATA.trades;
  const money = (n) => (n > 0 ? "+$" + n.toFixed(2) : n < 0 ? "\u2212$" + Math.abs(n).toFixed(2) : "$0.00");
  const pct = (n) => (n > 0 ? "+" : n < 0 ? "\u2212" : "") + Math.abs(n).toFixed(1) + "%";
  const tone = (n) => (n > 0 ? "var(--profit)" : n < 0 ? "var(--loss)" : "var(--breakeven)");
  const dkey = (iso) => { if (!iso) return ""; try { const tz = (window.NT_DATA.marketHours || {}).display_tz || "Europe/Amsterdam"; return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso)); } catch (e) { return ""; } };
  const dlabel = (key) => (key ? key.slice(8, 10) + "/" + key.slice(5, 7) : "");

  const th = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "10px 0", textAlign: "right", whiteSpace: "nowrap", position: "sticky", top: 0, background: "var(--surface-card)", zIndex: 1 };
  const thL = { ...th, textAlign: "left" };
  const td = { font: "var(--w-regular) var(--t-sm)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", padding: "11px 0", borderTop: "1px solid var(--border)", textAlign: "right", color: "var(--text-primary)", whiteSpace: "nowrap" };
  const tdL = { ...td, textAlign: "left" };

  return (
    <NT.Card title="Trades" padding={20}
      style={fill ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" } : undefined}
      bodyStyle={{ padding: 0, ...(fill ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } : {}) }}>
      <div style={{ flex: fill ? 1 : undefined, minHeight: 0, overflowY: "auto", overflowX: "auto", padding: "0 20px 10px" }}>
        {/* table-layout:fixed + percentage columns (sum 100%) -> the table fills the
            full card width with even, tight column spacing (no trailing whitespace,
            no mid gap) AND a changing P&L value never reflows the columns. */}
        <table style={{ width: "100%", minWidth: 548, borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "4%" }} /><col style={{ width: "9%" }} /><col style={{ width: "14%" }} />
            <col style={{ width: "7%" }} /><col style={{ width: "10%" }} /><col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} /><col style={{ width: "13%" }} /><col style={{ width: "11%" }} />
            <col style={{ width: "12%" }} />
          </colgroup>
          <thead><tr>
            <th style={{ ...thL }}></th>
            <th style={thL}>time</th>
            <th style={thL}>contract</th>
            <th style={thL}>qty</th>
            <th style={th}>entry</th>
            <th style={th}>exit</th>
            <th style={th}>stop</th>
            <th style={th}>p&l $</th>
            <th style={th}>p&l %</th>
            <th style={{ ...th, paddingRight: 2 }}>result</th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} onClick={() => onSelect && onSelect(r)} className="nt-trow" style={{ cursor: onSelect ? "pointer" : "default" }}>
                <td style={{ ...tdL }}><NT.StatusDot status={r.status} /></td>
                <td style={{ ...tdL, color: "var(--text-secondary)", lineHeight: 1.3 }}>
                  <div style={{ color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-2xs)/1 var(--font-mono)" }}>{dlabel(dkey(r.entryTs))}</div>
                  {r.t.slice(0, 5)}
                </td>
                <td style={{ ...tdL, overflow: "hidden", textOverflow: "ellipsis" }}>
                  <span style={{ color: "var(--text-primary)", fontWeight: "var(--w-medium)" }}>{r.tk}</span>
                  <span style={{ color: "var(--text-secondary)" }}> {r.strike}</span>
                </td>
                <td style={{ ...tdL, color: "var(--text-secondary)" }}>
                  ×{r.qty}
                  {r.partial && <span title="Half sold — position still open" style={{ marginLeft: 5, padding: "1px 5px", borderRadius: "var(--radius-xs)", background: "var(--profit-bg)", color: "var(--profit)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)" }}>½</span>}
                </td>
                <td style={td}>{r.entry.toFixed(2)}</td>
                <td style={{ ...td, color: r.exit == null ? "var(--text-tertiary)" : "var(--text-primary)" }}>{r.exit == null ? "—" : Number(r.exit).toFixed(2)}</td>
                <td title={r.stop != null && r.atBreakeven ? "at breakeven" : undefined} style={{ ...td, color: r.stop == null ? "var(--text-tertiary)" : (r.atBreakeven ? "var(--breakeven)" : "var(--loss)") }}>
                  {r.stop == null ? "—" : Number(r.stop).toFixed(2)}
                </td>
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

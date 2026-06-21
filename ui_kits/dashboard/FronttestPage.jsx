/* FronttestPage — "Exit Lab". Every closed trade across ALL strategies on the same
   alerts, so you can compare what each strategy's exits did. Filter by strategy
   (shared with the dashboard), then a per-strategy stats rollup below. Real taped
   trades also show peak vs actual exit ("left on the table"); replay/what-if rows
   show their realized result. */
function FronttestPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const TZ = (window.NT_DATA.marketHours && window.NT_DATA.marketHours.display_tz) || "Europe/Amsterdam";
  const [, force] = React.useState(0);
  React.useEffect(() => { const h = () => force((x) => x + 1); window.addEventListener("nt-data", h); return () => window.removeEventListener("nt-data", h); }, []);
  const [rows, setRows] = React.useState(null);   // null = loading
  const [err, setErr] = React.useState("");
  const range = String(window.NT_DATA.dateRange || "week");   // shared, persisted date filter
  const bounds = window.NT_DATA.dateBounds || (window.ntRangeBounds ? window.ntRangeBounds(range, null) : null);

  const load = React.useCallback(async () => {
    const c = window.NT_CLIENT;
    if (!c) { setErr("not connected"); setRows([]); return; }
    setRows(null); setErr("");
    try {
      const [posR, peakR] = await Promise.all([
        c.from("positions").select("id,strategy_id,ticker,strike,side,entry_price,exit_price,exit_ts,realized_pnl,orig_qty,qty,status").eq("status", "closed").order("exit_ts", { ascending: false }).limit(300),
        c.from("fronttest_peak").select("position_id,peak_price,samples,last_ts").limit(500),
      ]);
      if (posR.error) throw posR.error;
      const peaks = {};
      (peakR.data || []).forEach((p) => { peaks[p.position_id] = p; });
      const out = (posR.data || []).map((p) => {
        const entry = Number(p.entry_price);
        const total = Number(p.orig_qty || p.qty);
        const pnl = Number(p.realized_pnl || 0);
        const pk = peaks[p.id];
        const exit = p.exit_price == null ? null : Number(p.exit_price);
        // realized % = the trade's OVERALL return (includes partial sells), not just final-exit vs entry
        const retPct = (entry && total) ? (pnl / (entry * 100 * total)) * 100 : null;
        const peakPx = pk ? Number(pk.peak_price) : null;
        const peakPct = (entry && peakPx != null) ? (peakPx / entry - 1) * 100 : null;
        const left = (peakPct != null && retPct != null) ? Math.max(0, peakPct - retPct) : null;
        return {
          id: p.id, sid: p.strategy_id, tk: p.ticker, label: String(Number(p.strike)) + (p.side || ""), qty: total,
          when: p.exit_ts, entry: entry, exit: exit, retPct: retPct, pnl: pnl,
          peakPx: peakPx, peakPct: peakPct, left: left, samples: pk ? pk.samples : 0,
        };
      });
      setRows(out);
    } catch (e) { setErr(e.message || String(e)); setRows([]); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  // strategy lookup + the shared (default) view filter, same as the dashboard
  const strategies = window.NT_DATA.strategies || [];
  const stratMap = {}; strategies.forEach((s) => { stratMap[s.id] = s; });
  const ACCT = { live: { label: "LIVE", c: "var(--live)" }, fronttest: { label: "PAPER", c: "var(--dryrun)" }, draft: { label: "DRAFT", c: "var(--text-tertiary)" } };
  const view = String(window.NT_DATA.viewStrategy || "all");
  const liveIds = {}; strategies.forEach((s) => { if (s.account === "live") liveIds[s.id] = true; });
  const inView = (sid) => view === "all" ? true : view === "live" ? !!liveIds[sid] : String(sid) === view;
  const inDate = (iso) => { if (!bounds || !iso) return true; const d = new Date(iso); return d >= bounds.from && d <= bounds.to; };
  const dateRows = (rows || []).filter((r) => inDate(r.when));   // date-filtered (all strategies) -> drives the stats
  const shown = dateRows.filter((r) => inView(r.sid));           // + strategy filter -> drives the trades table

  const pct = (n) => (n == null ? "—" : (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(1) + "%");
  const money = (n) => (n > 0 ? "+$" : n < 0 ? "−$" : "$") + Math.abs(Math.round(n));
  const tone = (n) => (n == null ? "var(--text-tertiary)" : n > 0 ? "var(--profit)" : n < 0 ? "var(--loss)" : "var(--text-secondary)");
  const tOf = (iso) => { try { return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso)); } catch (e) { return "—"; } };
  const sName = (sid) => (stratMap[sid] || {}).name || "—";
  const sAcct = (sid) => ACCT[(stratMap[sid] || {}).account] || ACCT.draft;

  const th = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "10px 0", textAlign: "right", whiteSpace: "nowrap" };
  const thL = { ...th, textAlign: "left" };
  const td = { font: "var(--w-regular) var(--t-sm)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", padding: "11px 0", borderTop: "1px solid var(--border)", textAlign: "right", color: "var(--text-primary)", whiteSpace: "nowrap" };
  const tdL = { ...td, textAlign: "left" };

  // per-strategy stats rollup over the visible trades
  const stats = {};
  dateRows.forEach((r) => {
    const s = stats[r.sid] || (stats[r.sid] = { sid: r.sid, n: 0, wins: 0, pnl: 0, retSum: 0, retN: 0, leftSum: 0, leftN: 0 });
    s.n++; if (r.pnl > 0) s.wins++; s.pnl += r.pnl;
    if (r.retPct != null) { s.retSum += r.retPct; s.retN++; }
    if (r.left != null) { s.leftSum += r.left; s.leftN++; }
  });
  const statList = Object.values(stats).sort((a, b) => b.pnl - a.pnl);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Exit Lab" subtitle="Every trade across all strategies on the same alerts — compare what each strategy's exits did"
        right={<span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><DateFilter value={range} onChange={(v, b) => window.NT_SET_RANGE(v, b)} /><NT.Button variant="ghost" size="md" onClick={load}>Refresh</NT.Button></span>} />

      <NT.Card title="Trades" padding={20} action={<StrategyViewSelect />}>
        {rows == null ? (
          <div style={{ padding: "30px 0", textAlign: "center", color: "var(--text-tertiary)", font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)" }}>Loading…</div>
        ) : shown.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", display: "flex", flexDirection: "column", gap: 8, alignItems: "center", color: "var(--text-tertiary)" }}>
            <Ico name="git-compare-arrows" size={26} />
            <span style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)", color: "var(--text-secondary)" }}>No trades in this range</span>
            <span style={{ font: "var(--w-regular) var(--t-xs)/1.5 var(--font-sans)" }}>Try a wider date range or a different strategy. {err ? "(" + err + ")" : ""}</span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
              <thead><tr>
                <th style={thL}>strategy</th><th style={thL}>closed</th><th style={thL}>contract</th><th style={th}>qty</th>
                <th style={th}>entry</th><th style={th}>exit</th><th style={th}>realized %</th><th style={th}>p&l</th>
                <th style={th}>peak %</th><th style={th}>left on table</th><th style={th}>tape</th>
              </tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id}>
                    <td style={tdL}><span style={{ fontWeight: "var(--w-medium)", color: "var(--text-primary)" }}>{sName(r.sid)}</span> <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", color: sAcct(r.sid).c }}>{sAcct(r.sid).label}</span></td>
                    <td style={{ ...tdL, color: "var(--text-secondary)" }}>{tOf(r.when)}</td>
                    <td style={tdL}><span style={{ fontWeight: "var(--w-medium)" }}>{r.tk}</span> <span style={{ color: "var(--text-secondary)" }}>{r.label}</span></td>
                    <td style={{ ...td, color: "var(--text-secondary)" }}>×{r.qty}</td>
                    <td style={td}>{r.entry.toFixed(2)}</td>
                    <td style={td}>{r.exit == null ? "—" : r.exit.toFixed(2)}</td>
                    <td style={{ ...td, color: tone(r.retPct) }}>{pct(r.retPct)}</td>
                    <td style={{ ...td, color: tone(r.pnl), fontWeight: "var(--w-medium)" }}>{money(r.pnl)}</td>
                    <td style={{ ...td, color: tone(r.peakPct) }}>{pct(r.peakPct)}</td>
                    <td style={{ ...td, color: r.left ? "var(--profit)" : "var(--text-tertiary)" }}>{r.left == null ? "—" : pct(r.left)}</td>
                    <td style={{ ...td, color: "var(--text-tertiary)" }}>{r.samples ? r.samples + " pts" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </NT.Card>

      {statList.length > 0 && (
        <NT.Card title="Per-strategy stats" padding={20}
          action={<span style={{ font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>all strategies in range</span>}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
              <thead><tr>
                <th style={thL}>strategy</th><th style={th}>trades</th><th style={th}>win rate</th>
                <th style={th}>avg return</th><th style={th}>total p&l</th><th style={th}>avg left on table</th>
              </tr></thead>
              <tbody>
                {statList.map((s) => (
                  <tr key={s.sid}>
                    <td style={tdL}><span style={{ fontWeight: "var(--w-medium)", color: "var(--text-primary)" }}>{sName(s.sid)}</span> <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", color: sAcct(s.sid).c }}>{sAcct(s.sid).label}</span></td>
                    <td style={{ ...td, color: "var(--text-secondary)" }}>{s.n}</td>
                    <td style={{ ...td, color: "var(--text-secondary)" }}>{s.n ? Math.round(s.wins / s.n * 100) : 0}%</td>
                    <td style={{ ...td, color: tone(s.retN ? s.retSum / s.retN : null) }}>{s.retN ? pct(s.retSum / s.retN) : "—"}</td>
                    <td style={{ ...td, color: tone(s.pnl), fontWeight: "var(--w-medium)" }}>{money(s.pnl)}</td>
                    <td style={{ ...td, color: s.leftN ? "var(--profit)" : "var(--text-tertiary)" }}>{s.leftN ? pct(s.leftSum / s.leftN) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NT.Card>
      )}
    </div>
  );
}
Object.assign(window, { FronttestPage });

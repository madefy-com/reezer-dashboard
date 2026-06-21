/* FronttestPage — forward-testing review, kept SEPARATE from the dashboard/trades.
   The bot tapes each traded contract's full price path (entry -> 30 min past the
   live close) into the `fronttest_tape` table. Phase 1: per-trade "peak vs live
   exit" — how much the runner gave back after we got out. (Candidate exit-strategy
   replay / leaderboard is the next phase, scored over these same tapes.) */
function FronttestPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const TZ = (window.NT_DATA.marketHours && window.NT_DATA.marketHours.display_tz) || "Europe/Amsterdam";
  const [rows, setRows] = React.useState(null);   // null = loading
  const [err, setErr] = React.useState("");

  const load = React.useCallback(async () => {
    const c = window.NT_CLIENT;
    if (!c) { setErr("not connected"); setRows([]); return; }
    setRows(null); setErr("");
    try {
      const [posR, peakR] = await Promise.all([
        c.from("positions").select("id,ticker,strike,side,entry_price,exit_price,exit_ts,realized_pnl,orig_qty,qty,status").eq("status", "closed").order("id", { ascending: false }).limit(200),
        c.from("fronttest_peak").select("position_id,peak_price,samples,last_ts").limit(500),
      ]);
      if (posR.error) throw posR.error;
      const peaks = {};
      (peakR.data || []).forEach((p) => { peaks[p.position_id] = p; });
      const out = (posR.data || []).map((p) => {
        const entry = Number(p.entry_price);
        const total = Number(p.orig_qty || p.qty);
        const pk = peaks[p.id];
        const exit = p.exit_price == null ? null : Number(p.exit_price);
        const exitPct = (entry && exit != null) ? (exit / entry - 1) * 100 : null;
        const peakPx = pk ? Number(pk.peak_price) : null;
        const peakPct = (entry && peakPx != null) ? (peakPx / entry - 1) * 100 : null;
        const left = (peakPct != null && exitPct != null) ? Math.max(0, peakPct - exitPct) : null;
        return {
          id: p.id, tk: p.ticker, label: String(Number(p.strike)) + (p.side || ""), qty: total,
          when: p.exit_ts, entry: entry, exit: exit, exitPct: exitPct,
          peakPx: peakPx, peakPct: peakPct, left: left, samples: pk ? pk.samples : 0,
        };
      });
      setRows(out);
    } catch (e) { setErr(e.message || String(e)); setRows([]); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const pct = (n) => (n == null ? "—" : (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(1) + "%");
  const tone = (n) => (n == null ? "var(--text-tertiary)" : n > 0 ? "var(--profit)" : n < 0 ? "var(--loss)" : "var(--text-secondary)");
  const tOf = (iso) => { try { return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso)); } catch (e) { return "—"; } };

  const th = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "10px 0", textAlign: "right", whiteSpace: "nowrap" };
  const thL = { ...th, textAlign: "left" };
  const td = { font: "var(--w-regular) var(--t-sm)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", padding: "11px 0", borderTop: "1px solid var(--border)", textAlign: "right", color: "var(--text-primary)", whiteSpace: "nowrap" };
  const tdL = { ...td, textAlign: "left" };

  const avgLeft = rows && rows.length ? rows.filter((r) => r.left != null).reduce((a, r) => a + r.left, 0) / Math.max(1, rows.filter((r) => r.left != null).length) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Fronttesting" subtitle="Forward-test exit management on the live alert stream · separate from your live dashboard"
        right={<NT.Button variant="ghost" size="md" onClick={load}>Refresh</NT.Button>} />

      <NT.Card padding={18}>
        <div style={{ font: "var(--w-regular) var(--t-sm)/1.55 var(--font-sans)", color: "var(--text-secondary)" }}>
          Every contract the bot trades is taped — its full price path from entry until <b style={{ color: "var(--text-primary)" }}>30 minutes after the live close</b> — into a separate store. That lets us see what alternative <b style={{ color: "var(--text-primary)" }}>exit</b> settings would have done on the exact same trades.
          <br /><span style={{ color: "var(--text-tertiary)" }}>Phase 1 below: where each trade <b>peaked</b> within the taped window vs where the live strategy actually exited (“left on the table”). Candidate strategy replay + leaderboard is next.</span>
        </div>
      </NT.Card>

      <NT.Card title="Taped trades · peak vs actual exit" padding={20}
        action={rows && rows.length ? <span style={{ font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>avg left on table <b style={{ color: "var(--profit)" }}>{pct(avgLeft)}</b></span> : null}>
        {rows == null ? (
          <div style={{ padding: "30px 0", textAlign: "center", color: "var(--text-tertiary)", font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)" }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", display: "flex", flexDirection: "column", gap: 8, alignItems: "center", color: "var(--text-tertiary)" }}>
            <Ico name="git-compare-arrows" size={26} />
            <span style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)", color: "var(--text-secondary)" }}>No fronttest data yet</span>
            <span style={{ font: "var(--w-regular) var(--t-xs)/1.5 var(--font-sans)" }}>It collects automatically during live sessions — each trade’s price path is taped to 30 min past its close. {err ? "(" + err + ")" : ""}</span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={thL}>closed</th><th style={thL}>contract</th><th style={th}>qty</th>
                <th style={th}>entry</th><th style={th}>exit</th><th style={th}>realized %</th>
                <th style={th}>peak %</th><th style={th}>left on table</th><th style={th}>tape</th>
              </tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ ...tdL, color: "var(--text-secondary)" }}>{tOf(r.when)}</td>
                    <td style={tdL}><span style={{ fontWeight: "var(--w-medium)" }}>{r.tk}</span> <span style={{ color: "var(--text-secondary)" }}>{r.label}</span></td>
                    <td style={{ ...td, color: "var(--text-secondary)" }}>×{r.qty}</td>
                    <td style={td}>{r.entry.toFixed(2)}</td>
                    <td style={td}>{r.exit == null ? "—" : r.exit.toFixed(2)}</td>
                    <td style={{ ...td, color: tone(r.exitPct) }}>{pct(r.exitPct)}</td>
                    <td style={{ ...td, color: tone(r.peakPct) }}>{pct(r.peakPct)}</td>
                    <td style={{ ...td, color: r.left ? "var(--profit)" : "var(--text-tertiary)", fontWeight: "var(--w-medium)" }}>{r.left == null ? "—" : pct(r.left)}</td>
                    <td style={{ ...td, color: "var(--text-tertiary)" }}>{r.samples ? r.samples + " pts" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </NT.Card>
    </div>
  );
}
Object.assign(window, { FronttestPage });

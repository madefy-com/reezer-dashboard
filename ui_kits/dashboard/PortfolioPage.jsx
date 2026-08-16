/* PortfolioPage — the positional / swing-trade world, deliberately separate from the
   0DTE options pages. Reads the parallel tables (sheet_snapshots, sheet_signals,
   equity_strategies, equity_broker_accounts, equity_positions) and never touches the
   Discord/options data. */

const PF_INPUT = { height: 38, padding: "0 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-strong)", background: "var(--surface-inset)", color: "var(--text-primary)", colorScheme: "dark", font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)", width: "100%", boxSizing: "border-box" };

function PF_Field({ label, hint, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{label}</span>
      {children}
      {hint ? <span style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)" }}>{hint}</span> : null}
    </label>
  );
}

const PF_money = (v) => (v == null ? "—" : (v < 0 ? "−$" : "$") + Math.abs(Math.round(v)).toLocaleString());
const PF_ago = (iso) => {
  if (!iso) return "never";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return Math.round(s) + "s ago";
  if (s < 5400) return Math.round(s / 60) + "m ago";
  if (s < 172800) return Math.round(s / 3600) + "h ago";
  return Math.round(s / 86400) + "d ago";
};

function PF_Pill({ tone, children }) {
  const c = { ok: ["var(--profit)", "rgba(52,199,123,.12)"], warn: ["var(--dryrun)", "var(--dryrun-bg)"],
              bad: ["var(--loss)", "rgba(255,90,90,.12)"], mute: ["var(--text-tertiary)", "var(--surface-inset)"] }[tone || "mute"];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 9px", borderRadius: 999, background: c[1], color: c[0], font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase" }}>{children}</span>;
}

function PortfolioPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const db = window.NT_CLIENT;
  const [d, setD] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [edit, setEdit] = React.useState(null);

  const load = React.useCallback(async () => {
    if (!db) return;
    const [snaps, sigs, strats, brokers, pos] = await Promise.all([
      db.from("sheet_snapshots").select("*").order("fetched_at", { ascending: false }).limit(10),
      db.from("sheet_signals").select("*").order("detected_at", { ascending: false }).limit(40),
      db.from("equity_strategies").select("*").order("id"),
      db.from("equity_broker_accounts").select("*").order("id"),
      db.from("equity_positions").select("*").order("id", { ascending: false }),
    ]);
    setD({ snaps: snaps.data || [], sigs: sigs.data || [], strats: strats.data || [],
           brokers: brokers.data || [], pos: pos.data || [] });
  }, [db]);
  React.useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  if (!d) return <div style={{ color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)" }}>Loading…</div>;

  const snapOf = (tab) => d.snaps.find((s) => s.tab === tab);
  const portfolio = snapOf("portfolio"), closed = snapOf("closed");
  const feedAge = portfolio ? (Date.now() - new Date(portfolio.fetched_at).getTime()) / 60000 : null;
  const feedTone = feedAge == null ? "mute" : feedAge < 20 ? "ok" : feedAge < 180 ? "warn" : "bad";

  const save = async (row) => {
    setBusy(true);
    try {
      const payload = {
        name: row.name, sizing_mode: row.sizing_mode || null,
        sizing_base: row.sizing_base === "" || row.sizing_base == null ? null : Number(row.sizing_base),
        max_position_usd: row.max_position_usd === "" || row.max_position_usd == null ? null : Number(row.max_position_usd),
        allowlist: (row.allowlist || "").trim() || null,
        broker_account_id: row.broker_account_id || null,
        updated_at: new Date().toISOString(),
      };
      const r = row.id ? await db.from("equity_strategies").update(payload).eq("id", row.id)
                       : await db.from("equity_strategies").insert({ ...payload, account: "paper", paused: true });
      if (r.error) throw r.error;
      setEdit(null); await load();
    } catch (e) { await window.NT_ALERT("Couldn’t save: " + (e.message || e), { title: "Portfolio strategy" }); }
    setBusy(false);
  };
  const togglePause = async (s) => {
    setBusy(true);
    try { await db.from("equity_strategies").update({ paused: !s.paused, updated_at: new Date().toISOString() }).eq("id", s.id); await load(); }
    finally { setBusy(false); }
  };

  const statsFor = (sid) => {
    const mine = d.pos.filter((p) => p.strategy_id === sid);
    const open = mine.filter((p) => p.status === "open");
    const invested = open.reduce((a, p) => a + Number(p.qty || 0) * Number(p.avg_price || 0), 0);
    const realized = mine.reduce((a, p) => a + Number(p.realized_pnl || 0), 0);
    return { open: open.length, invested, realized, total: mine.length };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Portfolio" subtitle="Swing / positional strategies driven by the Macrotrends portfolio sheet — separate from the 0DTE options bot"
        right={<NT.Button variant="primary" size="md" icon={<Ico name="plus" size={15} />}
          onClick={() => setEdit({ name: "Macrotrends follow", sizing_mode: "fixed_usd", sizing_base: 20000, max_position_usd: "", allowlist: "" })}>New strategy</NT.Button>} />

      {/* ---------- source health ---------- */}
      <NT.Card title="Signal source · Macrotrends sheet" padding={20}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
          {[["Feed", <PF_Pill tone={feedTone}>{feedAge == null ? "no data" : feedTone === "ok" ? "live" : feedTone === "warn" ? "lagging" : "stale"}</PF_Pill>],
            ["Last check", PF_ago(portfolio && portfolio.fetched_at)],
            ["Holdings tracked", portfolio ? portfolio.row_count : "—"],
            ["Closed log", closed ? closed.row_count : "—"],
            ["Signals (30d)", d.sigs.length]].map((m, i) => (
            <div key={i}>
              <div style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{m[0]}</div>
              <div className="num" style={{ font: "var(--w-medium) var(--t-lg)/1.2 var(--font-mono)", marginTop: 6 }}>{m[1]}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)", font: "var(--w-regular) var(--t-xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)" }}>
          Polled every 5 minutes from the published sheet. Buys come from the portfolio tab, sells from the closed-positions tab.
          Physical metal (gold, silver, platinum) is tracked but never ordered.
        </div>
      </NT.Card>

      {/* ---------- broker ---------- */}
      <NT.Card title="Broker · Interactive Brokers" padding={20}>
        {d.brokers.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ font: "var(--w-regular) var(--t-sm)/1.6 var(--font-sans)", color: "var(--text-secondary)", maxWidth: 620 }}>
              No IBKR connection yet. Positional trades need Interactive Brokers because this portfolio holds
              European and Canadian listings that Schwab can’t trade. Each user runs IB Gateway on their own machine
              and signs in <b style={{ color: "var(--text-primary)" }}>once a week</b> — the daily restart is automatic.
            </div>
            <PF_Pill tone="warn">not connected</PF_Pill>
          </div>
        ) : d.brokers.map((b) => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "10px 0", borderTop: "1px solid var(--border)" }}>
            <div>
              <div style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)" }}>{b.label}</div>
              <div style={{ font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 4 }}>
                {b.account_ref || "no account id"} · box {b.machine_id || "unassigned"} · checked {PF_ago(b.last_check_at)}
              </div>
            </div>
            <PF_Pill tone={b.status === "connected" ? "ok" : b.status === "needs_login" ? "warn" : "bad"}>{b.status}</PF_Pill>
          </div>
        ))}
      </NT.Card>

      {/* ---------- strategies ---------- */}
      {d.strats.length === 0 ? (
        <NT.Card title="Strategies" padding={20}>
          <div style={{ color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-sm)/1.6 var(--font-sans)" }}>
            No portfolio strategy yet. Create one to decide how much of your money each sheet weight represents —
            a fixed amount, or a share of your account.
          </div>
        </NT.Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(430px,1fr))", gap: "var(--gap-grid)" }}>
          {d.strats.map((s) => {
            const st = statsFor(s.id);
            const notional = s.sizing_mode === "fixed_usd" ? Number(s.sizing_base || 0) : null;
            return (
              <NT.Card key={s.id} padding={20}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ font: "var(--w-semibold) var(--t-lg)/1.2 var(--font-sans)" }}>{s.name}</div>
                    <div style={{ font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 4 }}>
                      Follows the Macrotrends sheet · starts flat, buys only on change
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <PF_Pill tone={s.account === "live" ? "bad" : "warn"}>{s.account}</PF_Pill>
                    <PF_Pill tone={s.paused ? "mute" : "ok"}>{s.paused ? "paused" : "active"}</PF_Pill>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, margin: "16px 0 4px", paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                  {[["open", st.open], ["invested", PF_money(st.invested)], ["realized", PF_money(st.realized)], ["trades", st.total]].map((m, i) => (
                    <div key={i}>
                      <div style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{m[0]}</div>
                      <div className="num" style={{ font: "var(--w-medium) var(--t-base)/1.2 var(--font-mono)", marginTop: 5 }}>{m[1]}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
                  {[["Sizing", s.sizing_mode === "fixed_usd" ? `each sheet % of ${PF_money(s.sizing_base)}`
                      : s.sizing_mode === "pct_of_account" ? `each sheet % of ${s.sizing_base}% of the account` : "not set"],
                    ["Example", s.sizing_mode ? `a 3% holding ≈ ${notional ? PF_money(notional * 0.03) : "3% of your invested base"}` : "—"],
                    ["Max per position", s.max_position_usd ? PF_money(s.max_position_usd) : "no cap"],
                    ["Only these tickers", s.allowlist || "all from the sheet"],
                    ["Broker", (d.brokers.find((b) => b.id === s.broker_account_id) || {}).label || "not linked"]].map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, font: "var(--w-regular) var(--t-sm)/1.4 var(--font-sans)" }}>
                      <span style={{ color: "var(--text-tertiary)" }}>{r[0]}</span>
                      <span style={{ color: "var(--text-primary)", textAlign: "right" }}>{r[1]}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                  <NT.Button variant="ghost" size="sm" disabled={busy} onClick={() => togglePause(s)}>{s.paused ? "Activate" : "Pause"}</NT.Button>
                  <NT.Button variant="primary" size="md" icon={<Ico name="settings-2" size={15} />} onClick={() => setEdit({ ...s })}>Edit</NT.Button>
                </div>
              </NT.Card>
            );
          })}
        </div>
      )}

      {/* ---------- our positions ---------- */}
      {d.pos.length > 0 && (
        <NT.Card title={"Positions · " + d.pos.length} padding={20} bodyStyle={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)" }}>
              <thead><tr style={{ color: "var(--text-tertiary)", font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "var(--ls-wide)" }}>
                {["symbol", "qty", "entry", "exit", "p&l", "status"].map((t) => <th key={t} style={{ textAlign: t === "symbol" ? "left" : "right", padding: "12px 16px" }}>{t}</th>)}
              </tr></thead>
              <tbody>
                {d.pos.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "11px 16px", fontWeight: 500 }}>{p.symbol} <span style={{ color: "var(--text-tertiary)" }}>{p.name}</span></td>
                    <td className="num" style={{ textAlign: "right", padding: "11px 16px" }}>{Number(p.qty)}</td>
                    <td className="num" style={{ textAlign: "right", padding: "11px 16px" }}>{p.avg_price}</td>
                    <td className="num" style={{ textAlign: "right", padding: "11px 16px" }}>{p.exit_price || "—"}</td>
                    <td className="num" style={{ textAlign: "right", padding: "11px 16px", color: Number(p.realized_pnl || 0) > 0 ? "var(--profit)" : Number(p.realized_pnl || 0) < 0 ? "var(--loss)" : "var(--text-secondary)" }}>{p.realized_pnl == null ? "—" : PF_money(p.realized_pnl)}</td>
                    <td style={{ textAlign: "right", padding: "11px 16px" }}><PF_Pill tone={p.status === "open" ? "ok" : "mute"}>{p.status}</PF_Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NT.Card>
      )}

      {/* ---------- signal feed ---------- */}
      <NT.Card title="Sheet activity" padding={20} bodyStyle={{ padding: 0 }}>
        {d.sigs.length === 0 ? (
          <div style={{ padding: "16px 20px", color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-sm)/1.6 var(--font-sans)" }}>
            Nothing yet. The current sheet is stored as the baseline — you’ll see an entry here the first time the publisher
            changes an advice, a weight, or closes a position.
          </div>
        ) : d.sigs.map((s, i) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "11px 20px", borderTop: i ? "1px solid var(--border)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <PF_Pill tone={s.action === "buy" ? "ok" : s.action === "sell" ? "bad" : "mute"}>{s.action}</PF_Pill>
              <span style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)" }}>{s.symbol}</span>
              <span style={{ font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.kind === "advice" ? `${s.from_advies || "—"} → ${s.advies}` :
                 s.kind === "weight" ? `${s.from_pct}% → ${s.target_pct}%` :
                 s.kind === "closed" ? `publisher exited${s.result_pct != null ? ` at ${s.result_pct}%` : ""}` :
                 s.kind === "added" ? `new holding · ${s.target_pct || "?"}%` : s.kind}
              </span>
              {!s.tradeable && <PF_Pill tone="mute">not traded</PF_Pill>}
            </div>
            <span style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)", flex: "none" }}>{PF_ago(s.detected_at)}</span>
          </div>
        ))}
      </NT.Card>

      {/* ---------- editor ---------- */}
      {edit && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget) setEdit(null); }} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(8,8,10,.55)", display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ width: 520, maxWidth: "94vw", background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-pop)", padding: 24, display: "flex", flexDirection: "column", gap: 18, maxHeight: "90vh", overflowY: "auto" }}>
            <span style={{ font: "var(--w-semibold) var(--t-h3)/1 var(--font-sans)" }}>{edit.id ? "Edit strategy" : "New portfolio strategy"}</span>

            <PF_Field label="Name"><input value={edit.name || ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} style={PF_INPUT} /></PF_Field>

            <div>
              <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>How much is a sheet % worth?</span>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {[["fixed_usd", "A fixed amount"], ["pct_of_account", "A share of my account"]].map((o) => {
                  const on = edit.sizing_mode === o[0];
                  return <button key={o[0]} type="button" onClick={() => setEdit({ ...edit, sizing_mode: o[0] })}
                    style={{ flex: 1, height: 40, borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid " + (on ? "var(--accent)" : "var(--border-strong)"), background: on ? "var(--surface-hover)" : "transparent", color: on ? "var(--text-primary)" : "var(--text-tertiary)", font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)" }}>{o[1]}</button>;
                })}
              </div>
            </div>

            <PF_Field label={edit.sizing_mode === "pct_of_account" ? "Share of account (%)" : "Amount (USD)"}
              hint={edit.sizing_mode === "pct_of_account"
                ? "The sheet's weights apply to this share of your account. 60 → a 3% holding is 3% of 60% of your account."
                : "The sheet's weights apply to this amount. $20,000 → a 3% holding is $600."}>
              <input type="number" value={edit.sizing_base == null ? "" : edit.sizing_base} onChange={(e) => setEdit({ ...edit, sizing_base: e.target.value })} style={PF_INPUT} />
            </PF_Field>

            <PF_Field label="Max per position (USD)" hint="Safety cap — no single holding may exceed this. Empty = no cap.">
              <input type="number" value={edit.max_position_usd == null ? "" : edit.max_position_usd} onChange={(e) => setEdit({ ...edit, max_position_usd: e.target.value })} style={PF_INPUT} />
            </PF_Field>

            <PF_Field label="Only these tickers" hint="Comma separated. Empty = follow every tradeable holding on the sheet.">
              <input value={edit.allowlist || ""} onChange={(e) => setEdit({ ...edit, allowlist: e.target.value })} placeholder="e.g. OXY,BTU,SDF" style={PF_INPUT} />
            </PF_Field>

            <PF_Field label="Broker">
              <select value={edit.broker_account_id || ""} onChange={(e) => setEdit({ ...edit, broker_account_id: e.target.value ? Number(e.target.value) : null })} style={PF_INPUT}>
                <option value="">Not linked — paper only</option>
                {d.brokers.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
            </PF_Field>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, paddingTop: 4 }}>
              <span style={{ font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)", maxWidth: 280 }}>
                New strategies start paused and on paper. Nothing is ordered until you activate it and link a broker.
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <NT.Button variant="ghost" size="md" onClick={() => setEdit(null)}>Cancel</NT.Button>
                <NT.Button variant="primary" size="md" disabled={busy} onClick={() => save(edit)}>{busy ? "Saving…" : "Save"}</NT.Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

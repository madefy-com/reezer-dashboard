/* StrategiesPage — one card per strategy from the `strategies` table.
   Each strategy is linked to an account: live (real orders), fronttest (paper),
   or draft (not running). Create / duplicate / delete + per-card edit, account
   selector and source subscriptions, all persisted to Supabase. */

const NT_SINPUT = { height: 38, padding: "0 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-strong)", background: "var(--surface-inset)", color: "var(--text-primary)", colorScheme: "dark", font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)", width: "100%", boxSizing: "border-box" };
function NT_SField({ label, hint, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{label}</span>
      {children}
      {hint ? <span style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)" }}>{hint}</span> : null}
    </label>
  );
}
function NT_SSection({ children }) {
  return <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", color: "var(--text-primary)", marginTop: 12, paddingTop: 16, borderTop: "1px solid var(--border)" }}>{children}</span>;
}
const NT_pct = (v) => Math.round((Number(v) || 0) * 100);
const NT_tier = (p, i) => (Array.isArray(p.trailing_tiers) ? p.trailing_tiers[i] : null) || null;
const NT_tierAt = (p, i) => { const t = NT_tier(p, i); return t == null ? "" : NT_pct(t.at != null ? t.at : t[0]); };
const NT_tierTr = (p, i) => { const t = NT_tier(p, i); return t == null ? "" : NT_pct(t.trail != null ? t.trail : t[1]); };
const NT_EXIT_MODES = [
  { id: "rules", label: "Rules only", desc: "Ignore the trader's partial AND close alerts — exits come only from the rules below." },
  { id: "rules_close", label: "Rules + closes", desc: "Use the rules below, and also close fully when the trader posts a close — but ignore their partials/scales." },
  { id: "alerts", label: "Follow trader", desc: "Take the trader's exits (partials + closes); the rules below act as a backstop." },
];
const NT_exitMode = (p) => p.exit_mode || (p.ignore_exit_alerts ? "rules" : "alerts");
const NT_exitModeLabel = (p) => (NT_EXIT_MODES.find((m) => m.id === NT_exitMode(p)) || NT_EXIT_MODES[0]).label;

// account -> badge {label, color var, bg var}
const NT_ACCT = {
  live: { label: "LIVE", c: "var(--live)", bg: "var(--live-bg)" },
  fronttest: { label: "PAPER", c: "var(--dryrun)", bg: "var(--dryrun-bg)" },
  draft: { label: "DRAFT", c: "var(--text-tertiary)", bg: "var(--surface-inset)" },
};

function StrategyCard({ strat, sources }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const [form, setForm] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const p = strat.params || {};
  const acct = strat.account || "draft";
  const badge = NT_ACCT[acct] || NT_ACCT.draft;

  const openEdit = () => {
    const tiers = Array.isArray(p.trailing_tiers) ? p.trailing_tiers : [];
    setForm({
      name: strat.name || "Strategy", desc: strat.desc || "", account: acct,
      budget: p.trade_budget_usd, maxC: p.max_contracts_per_trade, allowlist: p.allowlist || "",
      stop: p.stop_loss_pct == null ? "" : NT_pct(p.stop_loss_pct),
      be: p.breakeven_at_pct == null ? "" : NT_pct(p.breakeven_at_pct),
      beAfter: p.breakeven_after_partial !== false,
      tp: p.take_profit_pct == null ? "" : NT_pct(p.take_profit_pct),
      half: p.take_half_at_pct == null ? "" : NT_pct(p.take_half_at_pct),
      maxHold: p.max_hold_minutes == null ? "" : p.max_hold_minutes,
      trailOn: tiers.length > 0, tierCount: Math.max(1, tiers.length),
      t1at: NT_tierAt(p, 0), t1pct: NT_tierTr(p, 0), t2at: NT_tierAt(p, 1), t2pct: NT_tierTr(p, 1), t3at: NT_tierAt(p, 2), t3pct: NT_tierTr(p, 2),
      maxSlip: p.max_price_slippage_usd == null ? "" : p.max_price_slippage_usd,
      maxTrades: p.max_trades_per_day == null ? "" : p.max_trades_per_day,
      exitMode: (p.exit_mode || (p.ignore_exit_alerts ? "rules" : "alerts")),
      dayPct: Object.assign({ mon: 100, tue: 100, wed: 100, thu: 100, fri: 100 }, p.budget_day_pct || {}),
      sourceIds: (strat.sourceIds || []).slice(),
    });
  };
  const closeEdit = () => setForm(null);
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    const tickers = (form.allowlist || "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
    const bad = tickers.filter((s) => !/^[A-Z]{1,5}$/.test(s));
    if (bad.length) { await window.NT_ALERT("Invalid ticker(s): " + bad.join(", "), { title: "Check the allowlist" }); return; }
    if (!tickers.length) { await window.NT_ALERT("The allowlist can’t be empty.", { title: "Check the allowlist" }); return; }
    setSaving(true);
    const opt = (v) => (v === "" || v == null ? null : v);
    const pctOpt = (v) => (opt(v) == null ? null : (Number(v) || 0) / 100);
    const tiers = !form.trailOn ? [] :
      [[form.t1at, form.t1pct], [form.t2at, form.t2pct], [form.t3at, form.t3pct]].slice(0, form.tierCount)
        .filter((r) => opt(r[0]) != null && opt(r[1]) != null)
        .map((r) => ({ at: (Number(r[0]) || 0) / 100, trail: (Number(r[1]) || 0) / 100 }))
        .filter((x) => x.at > 0 && x.trail > 0).sort((x, y) => x.at - y.at);
    const payload = {
      name: form.name, description: form.desc, account: form.account,
      trade_budget_usd: Number(form.budget) || 0, max_contracts_per_trade: Number(form.maxC) || 0,
      allowlist: tickers.join(","),
      stop_loss_pct: pctOpt(form.stop), breakeven_at_pct: pctOpt(form.be), take_profit_pct: pctOpt(form.tp),
      breakeven_after_partial: !!form.beAfter,
      take_half_at_pct: pctOpt(form.half), trailing_tiers: tiers,
      max_hold_minutes: opt(form.maxHold) == null ? null : (Number(form.maxHold) || 0),
      max_price_slippage_usd: opt(form.maxSlip) == null ? null : (Number(form.maxSlip) || 0),
      max_trades_per_day: opt(form.maxTrades) == null ? null : (Number(form.maxTrades) || 0),
      exit_mode: form.exitMode || "rules_close",
      // legacy mirror for any code still reading the boolean: only "alerts" follows partials
      ignore_exit_alerts: (form.exitMode || "rules_close") !== "alerts",
      // keep only days that differ from 100% (so the stored object stays minimal)
      budget_day_pct: Object.fromEntries(Object.entries(form.dayPct || {}).map(function (e) { return [e[0], Number(e[1])]; }).filter(function (e) { return e[1] !== 100; })),
      updated_at: new Date().toISOString(),
    };
    try {
      const r = await window.NT_CLIENT.from("strategies").update(payload).eq("id", strat.id);
      if (r.error) throw r.error;
      // sync source subscriptions: replace this strategy's strategy_sources rows
      await window.NT_CLIENT.from("strategy_sources").delete().eq("strategy_id", strat.id);
      if ((form.sourceIds || []).length) {
        await window.NT_CLIENT.from("strategy_sources").insert(form.sourceIds.map((sid) => ({ strategy_id: strat.id, source_id: sid })));
      }
      await window.NT_REFRESH();
      closeEdit();
    } catch (e) { await window.NT_ALERT("Save failed: " + (e.message || e), { title: "Couldn’t save" }); }
    setSaving(false);
  };

  const duplicate = async () => {
    setBusy(true);
    try {
      const r = await window.NT_CLIENT.from("strategies").insert({
        name: (strat.name || "Strategy") + " copy", description: strat.desc || "", account: "draft",
        trade_budget_usd: p.trade_budget_usd, max_contracts_per_trade: p.max_contracts_per_trade,
        allowlist: p.allowlist, stop_loss_pct: p.stop_loss_pct, breakeven_at_pct: p.breakeven_at_pct,
        take_profit_pct: p.take_profit_pct, take_half_at_pct: p.take_half_at_pct, trailing_tiers: p.trailing_tiers || [],
        max_hold_minutes: p.max_hold_minutes, max_price_slippage_usd: p.max_price_slippage_usd, max_trades_per_day: p.max_trades_per_day,
        ignore_exit_alerts: !!p.ignore_exit_alerts, exit_mode: p.exit_mode || (p.ignore_exit_alerts ? "rules" : "alerts"), budget_day_pct: p.budget_day_pct || {},
      });
      if (r.error) throw r.error;
      await window.NT_REFRESH();
    } catch (e) { await window.NT_ALERT("Duplicate failed: " + (e.message || e), { title: "Duplicate" }); }
    setBusy(false);
  };

  const del = async () => {
    if (!(await window.NT_CONFIRM("Delete strategy “" + strat.name + "”? Its past trades stay in the history.", { title: "Delete strategy", ok: "Delete", danger: true }))) return;
    setBusy(true);
    try {
      const r = await window.NT_CLIENT.from("strategies").delete().eq("id", strat.id);
      if (r.error) throw r.error;
      await window.NT_REFRESH();
    } catch (e) { await window.NT_ALERT("Delete failed: " + (e.message || e), { title: "Delete" }); }
    setBusy(false);
  };

  const [replay, setReplay] = React.useState(null);   // {status} | {result} | {error}
  const canReplay = acct === "fronttest" || acct === "draft";
  const doReplay = async () => {
    if (!window.Replay) { await window.NT_ALERT("Replay engine not loaded yet — refresh and try again.", { title: "Replay" }); return; }
    setBusy(true);
    setReplay({ status: "Starting…" });
    try {
      const res = await window.Replay.replayStrategy(strat, window.NT_CLIENT, (m) => setReplay({ status: m }));
      setReplay({ result: res });
      await window.NT_REFRESH();   // refresh so replay-aware views pick up the new snapshot
    } catch (e) { setReplay({ error: (e && e.message) || String(e) }); }
    setBusy(false);
  };

  const [viewTrade, setViewTrade] = React.useState(null);   // {loading} | {tr, detail}
  const tFmt = (iso) => { try { const tz = (window.NT_DATA && window.NT_DATA.marketHours && window.NT_DATA.marketHours.display_tz) || "Europe/Amsterdam"; return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date(iso)); } catch (e) { return String(iso || "").slice(11, 19); } };
  // open ONE replayed trade in the existing TradeDetail view: chart line = the real
  // recorded tape, markers + log = the replay's events. The originals are never read.
  const openReplayTrade = async (st) => {
    setViewTrade({ loading: true });
    let samples = [];
    try {
      const sessEnd = new Date(new Date(st.entry_ts).getTime() + 8 * 3600 * 1000).toISOString();
      const t = await window.NT_CLIENT.from("fronttest_tape").select("ts,price")
        .eq("position_id", st.position_id).gte("ts", st.entry_ts).lt("ts", sessEnd).order("ts").limit(6000);
      samples = (t.data || []).map((r) => ({ ts: r.ts, price: Number(r.price) }));
    } catch (e) {}
    const events = (st.events || []).filter((e) => e.type !== "_closed");
    const lastTs = events.length ? events[events.length - 1].ts : st.entry_ts;
    const qty = Number(st.orig_qty || 1), entry = Number(st.entry_price), pnl = Math.round(st.realized);
    const cost = entry * 100 * qty, holdS = Math.max(0, Math.round((new Date(lastTs) - new Date(st.entry_ts)) / 1000));
    const label = String(Number(st.strike)) + (st.side || "");
    const tr = {
      id: st.position_id, tk: st.ticker, strike: label, side: st.side, qty: qty,
      entry: entry, exit: st.exit_price, pnl: pnl, pct: cost ? Math.round((pnl / cost * 100) * 10) / 10 : 0,
      result: pnl > 0 ? "WIN" : pnl < 0 ? "LOSS" : "BE", status: "done",
      strat: strat.name, hold: Math.floor(holdS / 60) + "m " + (holdS % 60) + "s",
      stopped: events.some((e) => e.type === "stop"),
      t: tFmt(st.entry_ts), close: tFmt(lastTs),
      trigger: { type: "ENTRY", user: "alerts", msg: st.ticker + " " + label },
    };
    setViewTrade({ tr: tr, detail: { samples: samples, events: events } });
  };

  const money = (n) => (n > 0 ? "+$" + n : n < 0 ? "−$" + Math.abs(n) : "$0");
  const tone = (n) => (n > 0 ? "var(--profit)" : n < 0 ? "var(--loss)" : "var(--text-primary)");
  const pctOff = (v) => (v == null ? "off" : NT_pct(v) + "%");
  const srcNames = (strat.sourceIds || []).map((id) => { const s = (sources || []).find((x) => x.id === id); return s ? s.name : id; });

  const groups = [
    { g: "Sizing", icon: "coins", items: [["Trade budget", "$" + Number(p.trade_budget_usd)], ["Max contracts", String(p.max_contracts_per_trade)],
      ["Budget by weekday", (p.budget_day_pct && Object.keys(p.budget_day_pct).length) ? Object.entries(p.budget_day_pct).map(function (e) { return e[0].charAt(0).toUpperCase() + e[0].slice(1) + " " + e[1] + "%"; }).join(" · ") : "full every day"]] },
    { g: "Exits & risk", icon: "shield", items: [["Exits", NT_exitModeLabel(p)], ["Stop loss", pctOff(p.stop_loss_pct)], ["Breakeven at", pctOff(p.breakeven_at_pct)], ["BE after exit", p.breakeven_after_partial === false ? "off" : "on"], ["Take profit", pctOff(p.take_profit_pct)], ["Take half at", pctOff(p.take_half_at_pct)],
      ["Trailing stop", (Array.isArray(p.trailing_tiers) && p.trailing_tiers.length) ? "Yes" : "No"],
      ["Max hold", p.max_hold_minutes == null ? "off" : p.max_hold_minutes + " min"]] },
    { g: "Sources", icon: "rss", items: [["Listens to", srcNames.length ? srcNames.join(", ") : "all sources"]] },
  ];

  return (
    <div style={{ height: "100%", boxSizing: "border-box", background: "var(--surface-card)", border: "1px solid " + (acct === "live" ? "var(--violet-line)" : "var(--border)"), borderRadius: "var(--radius-lg)", padding: 22, boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ font: "var(--w-semibold) var(--t-h3)/1.2 var(--font-sans)", letterSpacing: "var(--ls-snug)" }}>{strat.name}</div>
          <div style={{ font: "var(--w-regular) var(--t-xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 6 }}>{strat.desc}</div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 24, padding: "0 10px", borderRadius: "var(--radius-sm)", background: badge.bg, color: badge.c, font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", flex: "none" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: badge.c, animation: acct === "live" ? "nt-pulse var(--blink) var(--ease-in-out) infinite" : "none" }}></span>{badge.label}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, padding: "16px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        {[["trades", strat.trades, null], ["win rate", (strat.winRate || 0) + "%", null], ["p&l", money(strat.pnl || 0), tone(strat.pnl || 0)], ["avg ret", ((strat.avgReturn || 0) > 0 ? "+" : (strat.avgReturn || 0) < 0 ? "−" : "") + Math.abs(strat.avgReturn || 0).toFixed(1) + "%", tone(strat.avgReturn || 0)]].map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", color: "var(--text-tertiary)" }}>{m[0]}</span>
            <span className="num" style={{ font: "var(--w-medium) var(--t-body)/1 var(--font-mono)", color: m[2] || "var(--text-primary)" }}>{m[1]}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(178px, 1fr))", gap: "18px 26px" }}>
        {groups.map((grp, gi) => (
          <div key={gi} style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, paddingBottom: 8, marginBottom: 5, borderBottom: "1px solid var(--border-strong)" }}>
              <Ico name={grp.icon} size={14} style={{ color: "var(--text-secondary)" }} />
              <span style={{ font: "var(--w-semibold) var(--t-sm)/1 var(--font-sans)", color: "var(--text-primary)" }}>{grp.g}</span>
            </div>
            {grp.items.map((it, ii) => {
              const muted = ["off", "full every day", "follow alerts", "all sources"].indexOf(it[1]) >= 0;
              return (
                <div key={ii} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, padding: "4px 0" }}>
                  <span style={{ font: "var(--w-regular) var(--t-xs)/1.3 var(--font-sans)", color: "var(--text-tertiary)", flex: "none" }}>{it[0]}</span>
                  <span className="num" style={{ font: "var(--w-medium) var(--t-sm)/1.35 var(--font-mono)", color: muted ? "var(--text-tertiary)" : "var(--text-primary)", textAlign: "right", minWidth: 0, overflowWrap: "anywhere" }}>{it[1]}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
        {canReplay && <NT.Button variant="ghost" size="sm" disabled={busy} onClick={doReplay} icon={<Ico name="rotate-ccw" size={14} />}>{busy && replay && replay.status ? "Replaying…" : "Replay"}</NT.Button>}
        <NT.Button variant="ghost" size="sm" disabled={busy} onClick={del}>Delete</NT.Button>
        <NT.Button variant="ghost" size="sm" disabled={busy} onClick={duplicate}>Duplicate</NT.Button>
        <NT.Button variant="primary" size="md" icon={<Ico name="settings-2" size={15} />} onClick={openEdit}>Edit</NT.Button>
      </div>

      {replay && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget && !(replay.status)) setReplay(null); }} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(8,8,10,0.55)", display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ width: 460, maxWidth: "94vw", background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-pop)", padding: 22, display: "flex", flexDirection: "column", gap: 14, maxHeight: "88vh", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ font: "var(--w-semibold) var(--t-h3)/1 var(--font-sans)" }}>Replay · {strat.name}</span>
              {!replay.status && <button onClick={() => setReplay(null)} aria-label="Close" style={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: "var(--radius-sm)", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>}
            </div>

            {replay.status && <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", color: "var(--text-secondary)", font: "var(--w-regular) var(--t-sm)/1.4 var(--font-sans)" }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--border-strong)", borderTopColor: "var(--accent)", animation: "nt-spin 0.7s linear infinite" }}></span>
              {replay.status}<span style={{ color: "var(--text-tertiary)" }}> (first run loads the engine, ~5s)</span>
            </div>}

            {replay.error && <div style={{ color: "var(--loss)", font: "var(--w-regular) var(--t-sm)/1.5 var(--font-sans)" }}>Replay failed: {replay.error}</div>}

            {replay.result && (() => { const s = replay.result.summary; const list = replay.result.trades || []; const d = Math.round((s.realized - s.orig_realized) * 100) / 100; return (
              <React.Fragment>
                <div style={{ font: "var(--w-regular) var(--t-sm)/1.5 var(--font-sans)", color: "var(--text-secondary)" }}>
                  Replayed <b style={{ color: "var(--text-primary)" }}>{s.trades}</b> of {s.matched} available alert-trade{s.matched === 1 ? "" : "s"} this strategy matches (allowlist + sources), at its <b style={{ color: "var(--text-primary)" }}>current</b> settings.{s.unaffordable ? " " + s.unaffordable + " didn’t fit the budget." : ""}{s.skipped ? " " + s.skipped + " had no tape." : ""}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[["Replay P&L", s.realized], ["Recorded P&L", s.orig_realized]].map((x, i) => (
                    <div key={i} style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>
                      <div style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", color: "var(--text-tertiary)", textTransform: "uppercase" }}>{x[0]}</div>
                      <div className="num" style={{ font: "var(--w-medium) var(--t-h3)/1 var(--font-mono)", marginTop: 6, color: x[1] > 0 ? "var(--profit)" : x[1] < 0 ? "var(--loss)" : "var(--text-primary)" }}>{money(x[1])}</div>
                    </div>
                  ))}
                </div>
                <div style={{ font: "var(--w-regular) var(--t-xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)" }}>
                  {d === 0 ? "Same as the recorded outcomes." : (d > 0 ? "+$" + d : "−$" + Math.abs(d)) + " vs the recorded outcomes."} Click a trade for its replayed chart &amp; log — the recorded trades stay untouched.
                </div>
                {list.length > 0 && (
                  <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflowX: "hidden", overflowY: "auto", maxHeight: "42vh", WebkitOverflowScrolling: "touch" }}>
                    {list.map((t, i) => { const rp = Math.round(t.realized), op = Math.round(t.orig_realized); const rc = rp > 0 ? "var(--profit)" : rp < 0 ? "var(--loss)" : "var(--text-secondary)"; return (
                      <button key={i} onClick={() => openReplayTrade(t)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 12px", border: "none", borderTop: i ? "1px solid var(--border)" : "none", background: "var(--surface-inset)", cursor: "pointer", textAlign: "left" }}>
                        <span style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)", color: "var(--text-primary)" }}>{t.ticker} <span style={{ color: "var(--text-tertiary)" }}>{String(Number(t.strike)) + (t.side || "")}</span></span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span className="num" style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-mono)", color: "var(--text-tertiary)" }}>{money(op)} →</span>
                          <span className="num" style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-mono)", color: rc }}>{money(rp)}</span>
                          <Ico name="chevron-right" size={15} style={{ color: "var(--text-tertiary)" }} />
                        </span>
                      </button>
                    ); })}
                  </div>
                )}
              </React.Fragment>
            ); })()}

            {!replay.status && <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 6 }}>
              <NT.Button variant="primary" size="md" onClick={() => setReplay(null)}>Done</NT.Button>
            </div>}
          </div>
        </div>
      )}

      {viewTrade && (
        <div style={{ position: "fixed", inset: 0, zIndex: 65, background: "rgba(8,8,10,0.6)", display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ position: "relative", width: 460, maxWidth: "94vw", height: "82vh", maxHeight: 760 }}>
            {viewTrade.loading
              ? <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-lg)" }}><span style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid var(--border-strong)", borderTopColor: "var(--accent)", animation: "nt-spin 0.7s linear infinite" }}></span></div>
              : <TradeDetail trade={viewTrade.tr} detailOverride={viewTrade.detail} onClose={() => setViewTrade(null)} />}
          </div>
        </div>
      )}

      {form && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget) closeEdit(); }} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(8,8,10,0.55)", display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ width: 540, maxWidth: "94vw", background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-pop)", padding: "24px 24px 22px", display: "flex", flexDirection: "column", gap: 20, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ font: "var(--w-semibold) var(--t-h3)/1 var(--font-sans)" }}>Edit strategy</span>
              <button onClick={closeEdit} aria-label="Close" style={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: "var(--radius-sm)", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <NT_SField label="Name"><input value={form.name} onChange={(e) => setF("name", e.target.value)} style={NT_SINPUT} /></NT_SField>
            <NT_SField label="Description"><textarea value={form.desc} onChange={(e) => setF("desc", e.target.value)} rows={2} style={{ ...NT_SINPUT, height: "auto", padding: "10px 12px", lineHeight: 1.45, resize: "vertical" }} /></NT_SField>

            <NT_SSection>Account</NT_SSection>
            <div style={{ display: "inline-flex", width: "fit-content", padding: 3, gap: 3, background: "var(--surface-inset)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)" }}>
              {[["Live", "live"], ["Paper", "fronttest"], ["Draft", "draft"]].map((o) => {
                const on = form.account === o[1]; const col = NT_ACCT[o[1]].c;
                return <button key={o[1]} type="button" onClick={async () => {
                  if (o[1] === "live" && form.account !== "live") {
                    const ok = await window.NT_CONFIRM("Live sends REAL orders to your Schwab account when this strategy fires.", { title: "Go LIVE?", ok: "Go LIVE", cancel: "Stay paper", danger: true });
                    if (!ok) return;
                  }
                  setF("account", o[1]);
                }} style={{ height: 30, padding: "0 14px", borderRadius: "var(--radius-xs)", cursor: "pointer", border: "1px solid " + (on ? "color-mix(in srgb, " + col + " 34%, transparent)" : "transparent"), background: on ? NT_ACCT[o[1]].bg : "transparent", color: on ? col : "var(--text-tertiary)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)" }}>{o[0]}</button>;
              })}
            </div>
            <span style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)" }}>Live = real orders · Paper = records on live prices, sends nothing · Draft = not running.</span>

            <NT_SSection>Sizing</NT_SSection>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <NT_SField label="Trade budget ($)"><input type="number" value={form.budget} onChange={(e) => setF("budget", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Max contracts"><input type="number" value={form.maxC} onChange={(e) => setF("maxC", e.target.value)} style={NT_SINPUT} /></NT_SField>
            </div>
            <NT_SField label="Allowlist" hint="Comma-separated tickers the bot may trade."><input value={form.allowlist} onChange={(e) => setF("allowlist", e.target.value)} style={NT_SINPUT} /></NT_SField>
            <NT_SField label="Budget by weekday (%)" hint="Trade this % of the budget on each day. 100 = full size; e.g. Mon 50% halves it.">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {[["Mon", "mon"], ["Tue", "tue"], ["Wed", "wed"], ["Thu", "thu"], ["Fri", "fri"]].map(function (d) {
                  return (
                    <label key={d[1]} style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                      <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>{d[0]}</span>
                      <input type="number" min={0} max={100} value={(form.dayPct || {})[d[1]]} onChange={(e) => setF("dayPct", Object.assign({}, form.dayPct, { [d[1]]: e.target.value }))} style={{ ...NT_SINPUT, textAlign: "center", padding: "0 6px" }} />
                    </label>
                  );
                })}
              </div>
            </NT_SField>

            <NT_SSection>Exits / risk</NT_SSection>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Exit handling</div>
              <div style={{ display: "flex", gap: 6 }}>
                {NT_EXIT_MODES.map((m) => {
                  const on = (form.exitMode || "rules_close") === m.id;
                  return <button key={m.id} type="button" onClick={() => setF("exitMode", m.id)} style={{ flex: 1, height: 34, padding: "0 8px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                    border: "1px solid " + (on ? "var(--accent)" : "var(--border-strong)"),
                    background: on ? "var(--accent)" : "var(--surface-inset)",
                    color: on ? "#fff" : "var(--text-tertiary)",
                    font: (on ? "var(--w-semibold)" : "var(--w-medium)") + " var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", whiteSpace: "nowrap" }}>{m.label}</button>;
                })}
              </div>
              <div style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)" }}>
                {(NT_EXIT_MODES.find((m) => m.id === (form.exitMode || "rules_close")) || NT_EXIT_MODES[1]).desc}
              </div>
            </div>
            <div style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)", marginTop: -4 }}>Leave any field empty to skip that rule and follow the alerts.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <NT_SField label="Stop loss (%)" hint="Empty = no auto stop"><input type="number" value={form.stop} onChange={(e) => setF("stop", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Breakeven (%)" hint="Empty = off"><input type="number" value={form.be} onChange={(e) => setF("be", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Take profit (%)" hint="Empty = off"><input type="number" value={form.tp} onChange={(e) => setF("tp", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Take half (%)" hint="Empty = off"><input type="number" value={form.half} onChange={(e) => setF("half", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Max hold (min)" hint="Empty = off"><input type="number" value={form.maxHold} onChange={(e) => setF("maxHold", e.target.value)} style={NT_SINPUT} /></NT_SField>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 2 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)", color: "var(--text-primary)" }}>Stop to breakeven after first exit</div>
                <div style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 3 }}>After the first partial, protect the runner at entry. Off = let it ride (trailing / stop only).</div>
              </div>
              <div style={{ display: "inline-flex", flex: "none", padding: 3, gap: 3, background: "var(--surface-inset)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)" }}>
                {[["Off", false], ["On", true]].map((o) => {
                  const on = !!form.beAfter === o[1];
                  return <button key={o[0]} type="button" onClick={() => setF("beAfter", o[1])} style={{ height: 28, padding: "0 16px", borderRadius: "var(--radius-xs)", cursor: "pointer", border: "1px solid " + (on ? "var(--border-strong)" : "transparent"), background: on ? "var(--surface-hover)" : "transparent", color: on ? "var(--text-primary)" : "var(--text-tertiary)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)" }}>{o[0]}</button>;
                })}
              </div>
            </div>

            <NT_SSection>Trailing stop</NT_SSection>
            <div style={{ display: "inline-flex", width: "fit-content", padding: 3, gap: 3, background: "var(--surface-inset)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)" }}>
              {[["Off", false], ["On", true]].map((o) => {
                const on = !!form.trailOn === o[1];
                return <button key={o[0]} type="button" onClick={() => setF("trailOn", o[1])} style={{ height: 28, padding: "0 16px", borderRadius: "var(--radius-xs)", cursor: "pointer", border: "1px solid " + (on ? "var(--border-strong)" : "transparent"), background: on ? "var(--surface-hover)" : "transparent", color: on ? "var(--text-primary)" : "var(--text-tertiary)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)" }}>{o[0]}</button>;
              })}
            </div>
            {form.trailOn && (
              <React.Fragment>
                {Array.from({ length: form.tierCount }).map((_, i) => { const n = i + 1; return (
                  <div key={n} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <NT_SField label={"Tier " + n + " — when profit ≥ (%)"}><input type="number" value={form["t" + n + "at"]} onChange={(e) => setF("t" + n + "at", e.target.value)} style={NT_SINPUT} /></NT_SField>
                    <NT_SField label="give back (%)"><input type="number" value={form["t" + n + "pct"]} onChange={(e) => setF("t" + n + "pct", e.target.value)} style={NT_SINPUT} /></NT_SField>
                  </div>
                ); })}
                <div style={{ display: "flex", gap: 8 }}>
                  {form.tierCount < 3 && <NT.Button variant="ghost" size="sm" onClick={() => setF("tierCount", form.tierCount + 1)}>+ Add tier</NT.Button>}
                  {form.tierCount > 1 && <NT.Button variant="ghost" size="sm" onClick={() => setF("tierCount", form.tierCount - 1)}>Remove tier</NT.Button>}
                </div>
              </React.Fragment>
            )}

            <NT_SSection>Safety</NT_SSection>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <NT_SField label="Max price slippage ($)" hint="Reject if ask > alert price + this $. Empty = off."><input type="number" step="0.05" value={form.maxSlip} onChange={(e) => setF("maxSlip", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Max trades / day" hint="Empty = no cap"><input type="number" value={form.maxTrades} onChange={(e) => setF("maxTrades", e.target.value)} style={NT_SINPUT} /></NT_SField>
            </div>

            <NT_SSection>Sources</NT_SSection>
            <div style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)", marginTop: -4 }}>Which alert channels this strategy trades. Select none = listen to all.</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(sources || []).map((s) => {
                const on = (form.sourceIds || []).indexOf(s.id) >= 0;
                return <button key={s.id} type="button" onClick={() => setF("sourceIds", on ? form.sourceIds.filter((x) => x !== s.id) : form.sourceIds.concat([s.id]))}
                  style={{ height: 30, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid " + (on ? "var(--violet-line)" : "var(--border-strong)"), background: on ? "var(--violet-soft)" : "var(--surface-inset)", color: on ? "var(--accent)" : "var(--text-secondary)", font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)" }}>{on ? "✓ " : ""}{s.name}</button>;
              })}
              {!(sources || []).length && <span style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>No sources yet — add one on the Sources page.</span>}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginTop: 10, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <NT.Button variant="ghost" size="md" onClick={closeEdit}>Cancel</NT.Button>
              <NT.Button variant="primary" size="md" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</NT.Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StrategiesPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const [, force] = React.useState(0);
  React.useEffect(() => { const h = () => force((x) => x + 1); window.addEventListener("nt-data", h); return () => window.removeEventListener("nt-data", h); }, []);
  const strategies = (window.NT_DATA.strategies) || [];
  const sources = (window.NT_DATA.sources) || [];

  const createStrategy = async () => {
    try {
      const r = await window.NT_CLIENT.from("strategies").insert({
        name: "New strategy", description: "", account: "draft",
        trade_budget_usd: 400, max_contracts_per_trade: 10, allowlist: "QQQ,NVDA,TSLA",
        stop_loss_pct: 0.2, breakeven_at_pct: 0.2, breakeven_after_partial: true, take_half_at_pct: 0.3, trailing_tiers: [],
      });
      if (r.error) throw r.error;
      await window.NT_REFRESH();
    } catch (e) { await window.NT_ALERT("Couldn’t create: " + (e.message || e), { title: "New strategy" }); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Strategies" subtitle="One card per strategy · linked to a live, paper or draft account"
        right={<NT.Button variant="primary" size="md" icon={<Ico name="plus" size={15} />} onClick={createStrategy}>New strategy</NT.Button>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: "var(--gap-grid)", alignItems: "stretch" }}>
        {strategies.map((s) => <StrategyCard key={s.id || s.name} strat={s} sources={sources} />)}
        {!strategies.length && <div style={{ color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)" }}>No strategies yet — click “New strategy”.</div>}
      </div>
    </div>
  );
}
Object.assign(window, { StrategiesPage, StrategyCard });

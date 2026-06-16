/* StrategiesPage — strategy cards (one for now), all params editable.
   Reads/writes Supabase `strategy_params` (one row, id=1) under the signed-in owner.
   Layout is a responsive grid so more strategy cards tile in cleanly later. */

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
// a section heading inside the edit modal — top border + space to separate sections
function NT_SSection({ children }) {
  return <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", color: "var(--text-primary)", marginTop: 12, paddingTop: 16, borderTop: "1px solid var(--border)" }}>{children}</span>;
}
const NT_pct = (v) => Math.round((Number(v) || 0) * 100);
const NT_tier = (p, i) => (Array.isArray(p.trailing_tiers) ? p.trailing_tiers[i] : null) || null;
const NT_tierAt = (p, i) => { const t = NT_tier(p, i); return t == null ? "" : NT_pct(t.at != null ? t.at : t[0]); };
const NT_tierTr = (p, i) => { const t = NT_tier(p, i); return t == null ? "" : NT_pct(t.trail != null ? t.trail : t[1]); };

function StrategiesPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const base = (window.NT_DATA.strategy) || (window.NT_DATA.strategies && window.NT_DATA.strategies[0]) || { name: "Nitro 0DTE", params: {} };

  const [strat, setStrat] = React.useState(base);
  const [form, setForm] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [pausing, setPausing] = React.useState(false);
  const p = strat.params || {};
  const paused = strat.status === "paused";

  // Pause / resume — one click. Soft stop: blocks NEW entries, keeps managing open
  // positions. Writes strategy_params.paused (pushed live to the bot).
  const togglePause = async () => {
    const next = !paused;          // true = pause
    setPausing(true);
    const prev = strat;
    const ns = { ...strat, status: next ? "paused" : "live", params: { ...p, paused: next } };
    setStrat(ns); window.NT_DATA.strategy = ns; window.NT_DATA.strategies = [ns];
    if (window.NT_ON_STRAT) window.NT_ON_STRAT(ns);
    try {
      const r = await window.NT_CLIENT.from("strategy_params").update({ paused: next, updated_at: new Date().toISOString() }).eq("id", 1);
      if (r.error) throw r.error;
    } catch (e) {
      setStrat(prev); window.NT_DATA.strategy = prev; window.NT_DATA.strategies = [prev];
      if (window.NT_ON_STRAT) window.NT_ON_STRAT(prev);
      await window.NT_ALERT("Couldn’t " + (next ? "pause" : "resume") + ": " + (e.message || e), { title: "Pause" });
    }
    setPausing(false);
  };

  const openEdit = () => {
    const tiers = Array.isArray(p.trailing_tiers) ? p.trailing_tiers : [];
    setForm({
      name: strat.name || "Nitro 0DTE", desc: strat.desc || "",
      budget: p.trade_budget_usd, maxC: p.max_contracts_per_trade, allowlist: p.allowlist || "",
      stop: p.stop_loss_pct == null ? "" : NT_pct(p.stop_loss_pct),
      be: p.breakeven_at_pct == null ? "" : NT_pct(p.breakeven_at_pct),
      tp: p.take_profit_pct == null ? "" : NT_pct(p.take_profit_pct),
      half: p.take_half_at_pct == null ? "" : NT_pct(p.take_half_at_pct),
      maxHold: p.max_hold_minutes == null ? "" : p.max_hold_minutes,
      trailOn: tiers.length > 0,
      tierCount: Math.max(1, tiers.length),
      t1at: NT_tierAt(p, 0), t1pct: NT_tierTr(p, 0),
      t2at: NT_tierAt(p, 1), t2pct: NT_tierTr(p, 1),
      t3at: NT_tierAt(p, 2), t3pct: NT_tierTr(p, 2),
      maxSlip: p.max_price_slippage_usd == null ? "" : p.max_price_slippage_usd,
      maxTrades: p.max_trades_per_day == null ? "" : p.max_trades_per_day,
      dry: p.dry_run !== false,
    });
    setSaved(false);
  };
  const closeEdit = () => setForm(null);
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    const tickers = (form.allowlist || "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
    const bad = tickers.filter((s) => !/^[A-Z]{1,5}$/.test(s));
    if (bad.length) { await window.NT_ALERT("Invalid ticker(s): " + bad.join(", ") + "\nUse 1–5 letters, comma-separated (e.g. QQQ, NVDA).", { title: "Check the allowlist" }); return; }
    if (!tickers.length) { await window.NT_ALERT("The allowlist can’t be empty — add at least one ticker.", { title: "Check the allowlist" }); return; }
    setSaving(true);
    const opt = (v) => (v === "" || v == null ? null : v);
    const pctOpt = (v) => (opt(v) == null ? null : (Number(v) || 0) / 100);   // % field -> fraction or null
    const tiers = !form.trailOn ? [] :
      [[form.t1at, form.t1pct], [form.t2at, form.t2pct], [form.t3at, form.t3pct]]
        .slice(0, form.tierCount)
        .filter((r) => opt(r[0]) != null && opt(r[1]) != null)
        .map((r) => ({ at: (Number(r[0]) || 0) / 100, trail: (Number(r[1]) || 0) / 100 }))
        .filter((x) => x.at > 0 && x.trail > 0)
        .sort((x, y) => x.at - y.at);
    const payload = {
      name: form.name, description: form.desc,
      trade_budget_usd: Number(form.budget) || 0,
      max_contracts_per_trade: Number(form.maxC) || 0,
      allowlist: tickers.join(","),
      stop_loss_pct: pctOpt(form.stop),
      breakeven_at_pct: pctOpt(form.be),
      take_profit_pct: pctOpt(form.tp),
      take_half_at_pct: pctOpt(form.half),
      trailing_tiers: tiers,
      max_hold_minutes: opt(form.maxHold) == null ? null : (Number(form.maxHold) || 0),
      max_price_slippage_usd: opt(form.maxSlip) == null ? null : (Number(form.maxSlip) || 0),
      max_trades_per_day: opt(form.maxTrades) == null ? null : (Number(form.maxTrades) || 0),
      dry_run: !!form.dry,   // kill_switch + paused are owned elsewhere, not saved here
      updated_at: new Date().toISOString(),
    };
    try {
      const r = await window.NT_CLIENT.from("strategy_params").update(payload).eq("id", 1);
      if (r.error) throw r.error;
      const ns = { ...strat, name: payload.name, desc: payload.description, alloc: "$" + payload.trade_budget_usd + "/trade", status: p.paused ? "paused" : "live", params: {
        trade_budget_usd: payload.trade_budget_usd, max_contracts_per_trade: payload.max_contracts_per_trade,
        allowlist: payload.allowlist, stop_loss_pct: payload.stop_loss_pct, breakeven_at_pct: payload.breakeven_at_pct,
        take_profit_pct: payload.take_profit_pct, take_half_at_pct: payload.take_half_at_pct, trailing_tiers: payload.trailing_tiers,
        max_hold_minutes: payload.max_hold_minutes, max_price_slippage_usd: payload.max_price_slippage_usd,
        max_trades_per_day: payload.max_trades_per_day, kill_switch: p.kill_switch, paused: p.paused, dry_run: payload.dry_run } };
      setStrat(ns); window.NT_DATA.strategy = ns; window.NT_DATA.strategies = [ns];
      if (window.NT_ON_STRAT) window.NT_ON_STRAT(ns);  // refresh header pill + mode
      setSaved(true); closeEdit();
    } catch (e) { await window.NT_ALERT("Save failed: " + (e.message || e), { title: "Couldn’t save" }); }
    setSaving(false);
  };

  const money = (n) => (n > 0 ? "+$" + n : n < 0 ? "−$" + Math.abs(n) : "$0");
  const tone = (n) => (n > 0 ? "var(--profit)" : n < 0 ? "var(--loss)" : "var(--text-primary)");
  const live = !paused;
  const pctOff = (v) => (v == null ? "off" : NT_pct(v) + "%");

  const groups = [
    { g: "Sizing", items: [
      ["Trade budget", "$" + Number(p.trade_budget_usd)],
      ["Max contracts / trade", String(p.max_contracts_per_trade)],
      ["Order type", "market"],
      ["Expiry", "0DTE / nearest-listed"],
      ["Allowlist", p.allowlist, true],
    ] },
    { g: "Exits / risk", items: [
      ["Stop loss", pctOff(p.stop_loss_pct)],
      ["Breakeven at", pctOff(p.breakeven_at_pct)],
      ["Take profit", pctOff(p.take_profit_pct)],
      ["Take half at", pctOff(p.take_half_at_pct)],
      ["Trailing stop", (Array.isArray(p.trailing_tiers) && p.trailing_tiers.length)
        ? p.trailing_tiers.map((t) => "≥+" + NT_pct(t.at != null ? t.at : t[0]) + "% give back " + NT_pct(t.trail != null ? t.trail : t[1]) + "%").join("  ·  ")
        : "off", true],
      ["Max hold", p.max_hold_minutes == null ? "off" : p.max_hold_minutes + " min"],
    ] },
    { g: "Safety", items: [
      ["Max price slippage", p.max_price_slippage_usd == null ? "off" : "$" + Number(p.max_price_slippage_usd).toFixed(2)],
      ["Max trades / day", p.max_trades_per_day == null ? "off" : String(p.max_trades_per_day)],
      ["Mode", p.dry_run === false ? "LIVE" : "SIMULATION"],
    ] },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Strategies" subtitle="The strategies the bot runs · money management + how it acts on calls" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 560px))", gap: "var(--gap-grid)", alignItems: "start" }}>
        <div style={{ background: "var(--surface-card)", border: "1px solid " + (live ? "var(--violet-line)" : "var(--border)"), borderRadius: "var(--radius-lg)", padding: 22, boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ font: "var(--w-semibold) var(--t-h3)/1.2 var(--font-sans)", letterSpacing: "var(--ls-snug)" }}>{strat.name}</div>
              <div style={{ font: "var(--w-regular) var(--t-xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 6 }}>{strat.desc || "Reads 0DTE options alerts from Discord and trades them on Schwab."}</div>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 24, padding: "0 10px", borderRadius: "var(--radius-sm)", background: live ? "var(--live-bg)" : "var(--dryrun-bg)", color: live ? "var(--live)" : "var(--dryrun)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", flex: "none" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: live ? "var(--live)" : "var(--dryrun)", animation: live ? "nt-pulse var(--blink) var(--ease-in-out) infinite" : "none" }}></span>{live ? "ACTIVE" : "PAUSED"}
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

          {groups.map((grp, gi) => (
            <div key={gi} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", color: "var(--text-secondary)" }}>{grp.g}</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "8px 24px" }}>
                {grp.items.map((it, ii) => (
                  <div key={ii} style={{ gridColumn: it[2] ? "1 / -1" : "auto", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ font: "var(--w-regular) var(--t-xs)/1.3 var(--font-sans)", color: "var(--text-tertiary)" }}>{it[0]}</span>
                    <span className="num" style={{ font: "var(--w-medium) var(--t-sm)/1.3 var(--font-mono)", color: "var(--text-primary)", textAlign: "right" }}>{it[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingTop: 4 }}>
            <span style={{ font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)", color: "var(--profit)" }}>{saved ? "✓ saved" : ""}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <NT.Button variant="ghost" size="md" disabled={pausing} onClick={togglePause}>{paused ? "Resume" : "Pause"}</NT.Button>
              <NT.Button variant="primary" size="md" icon={<Ico name="settings-2" size={15} />} onClick={openEdit}>Edit</NT.Button>
            </div>
          </div>
        </div>
      </div>

      {form && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
          style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(8,8,10,0.55)", display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ width: 540, maxWidth: "94vw", background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-pop)", padding: 22, display: "flex", flexDirection: "column", gap: 14, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ font: "var(--w-semibold) var(--t-h3)/1 var(--font-sans)", letterSpacing: "var(--ls-snug)" }}>Edit strategy</span>
              <button onClick={closeEdit} aria-label="Close" style={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: "var(--radius-sm)", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <NT_SField label="Name"><input value={form.name} onChange={(e) => setF("name", e.target.value)} style={NT_SINPUT} /></NT_SField>
            <NT_SField label="Description"><textarea value={form.desc} onChange={(e) => setF("desc", e.target.value)} rows={2} style={{ ...NT_SINPUT, height: "auto", padding: "10px 12px", lineHeight: 1.45, resize: "vertical" }} /></NT_SField>

            <NT_SSection>Sizing</NT_SSection>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <NT_SField label="Trade budget ($)"><input type="number" value={form.budget} onChange={(e) => setF("budget", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Max contracts"><input type="number" value={form.maxC} onChange={(e) => setF("maxC", e.target.value)} style={NT_SINPUT} /></NT_SField>
            </div>
            <NT_SField label="Allowlist" hint="Comma-separated tickers the bot may trade."><input value={form.allowlist} onChange={(e) => setF("allowlist", e.target.value)} style={NT_SINPUT} /></NT_SField>

            <NT_SSection>Exits / risk</NT_SSection>
            <div style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)", marginTop: -4 }}>Leave any field empty to skip that rule and just follow the alerts.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <NT_SField label="Stop loss (%)" hint="Empty = no auto stop"><input type="number" value={form.stop} onChange={(e) => setF("stop", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Breakeven (%)" hint="Empty = off"><input type="number" value={form.be} onChange={(e) => setF("be", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Take profit (%)" hint="Close fully at +X% · empty = off"><input type="number" value={form.tp} onChange={(e) => setF("tp", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Take half (%)" hint="Empty = off"><input type="number" value={form.half} onChange={(e) => setF("half", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Max hold (min)" hint="Empty = off"><input type="number" value={form.maxHold} onChange={(e) => setF("maxHold", e.target.value)} style={NT_SINPUT} /></NT_SField>
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
                <div style={{ font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)" }}>
                  Once profit reaches <b style={{ color: "var(--text-secondary)" }}>when ≥</b>, lock in profit and never give back more than the <b style={{ color: "var(--text-secondary)" }}>give-back %</b> (simple subtraction): give back 25 → up +50% won’t sell below <b style={{ color: "var(--text-secondary)" }}>+25%</b>. Add tiers that give back less to squeeze more near the top.
                </div>
                {Array.from({ length: form.tierCount }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <div key={n} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <NT_SField label={"Tier " + n + " — when profit ≥ (%)"}><input type="number" value={form["t" + n + "at"]} onChange={(e) => setF("t" + n + "at", e.target.value)} style={NT_SINPUT} /></NT_SField>
                      <NT_SField label="give back (%)"><input type="number" value={form["t" + n + "pct"]} onChange={(e) => setF("t" + n + "pct", e.target.value)} style={NT_SINPUT} /></NT_SField>
                    </div>
                  );
                })}
                <div style={{ display: "flex", gap: 8 }}>
                  {form.tierCount < 3 && <NT.Button variant="ghost" size="sm" onClick={() => setF("tierCount", form.tierCount + 1)}>+ Add tier</NT.Button>}
                  {form.tierCount > 1 && <NT.Button variant="ghost" size="sm" onClick={() => setF("tierCount", form.tierCount - 1)}>Remove tier</NT.Button>}
                </div>
              </React.Fragment>
            )}
            <div style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)" }}>End-of-day flatten (~15:58 ET) is always on as a final backstop.</div>

            <NT_SSection>Safety</NT_SSection>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <NT_SField label="Max price slippage ($)" hint="Reject if ask > alert price + this $. Empty = off."><input type="number" step="0.05" value={form.maxSlip} onChange={(e) => setF("maxSlip", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Max trades / day" hint="Empty = no cap"><input type="number" value={form.maxTrades} onChange={(e) => setF("maxTrades", e.target.value)} style={NT_SINPUT} /></NT_SField>
            </div>

            <NT_SSection>Mode</NT_SSection>
            <div style={{ display: "inline-flex", width: "fit-content", padding: 3, gap: 3, background: "var(--surface-inset)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)" }}>
              {[["Simulation", true], ["Live", false]].map((opt) => {
                const lbl = opt[0], dryVal = opt[1], on = !!form.dry === dryVal;
                const col = dryVal ? "var(--dryrun)" : "var(--live)";
                return (
                  <button key={lbl} type="button" onClick={async () => {
                    if (!dryVal && !on) {
                      const ok = await window.NT_CONFIRM("This switches the bot to LIVE real-money trading — real orders will be placed on your Schwab account.", { title: "Go LIVE?", ok: "Go LIVE", cancel: "Stay in simulation", danger: true });
                      if (!ok) return;
                    }
                    setF("dry", dryVal);
                  }} style={{ height: 30, padding: "0 16px", borderRadius: "var(--radius-xs)", cursor: "pointer",
                    border: "1px solid " + (on ? "color-mix(in srgb, " + col + " 34%, transparent)" : "transparent"),
                    background: on ? (dryVal ? "var(--dryrun-bg)" : "var(--live-bg)") : "transparent",
                    color: on ? col : "var(--text-tertiary)",
                    font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)" }}>{lbl}</button>
                );
              })}
            </div>
            <span style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)" }}>Simulation never sends real orders. The kill switch is the ACTIVE toggle in the top bar.</span>

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
Object.assign(window, { StrategiesPage });

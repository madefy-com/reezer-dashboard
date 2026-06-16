/* StrategiesPage — the single live strategy (the one the bot runs), with ALL
   parameters, editable. Reads from / writes to Supabase `strategy_params`
   (one row, id=1) under the signed-in owner. */

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
const NT_pct = (v) => Math.round((Number(v) || 0) * 100);

function StrategiesPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const base = (window.NT_DATA.strategy) || (window.NT_DATA.strategies && window.NT_DATA.strategies[0]) || { name: "Nitro 0DTE", params: {} };

  const [strat, setStrat] = React.useState(base);
  const [form, setForm] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const p = strat.params || {};

  const openEdit = () => {
    setForm({
      name: strat.name || "Nitro 0DTE",
      budget: p.trade_budget_usd, maxC: p.max_contracts_per_trade, allowlist: p.allowlist || "",
      stop: NT_pct(p.stop_loss_pct), be: NT_pct(p.breakeven_at_pct), half: NT_pct(p.take_half_at_pct),
      maxMult: p.max_price_multiple, maxTrades: p.max_trades_per_day, eod: p.eod_flatten_et || "15:58",
      kill: !!p.kill_switch, dry: p.dry_run !== false,
    });
    setSaved(false);
  };
  const closeEdit = () => setForm(null);
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      trade_budget_usd: Number(form.budget) || 0,
      max_contracts_per_trade: Number(form.maxC) || 0,
      allowlist: (form.allowlist || "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean).join(","),
      stop_loss_pct: (Number(form.stop) || 0) / 100,
      breakeven_at_pct: (Number(form.be) || 0) / 100,
      take_half_at_pct: (Number(form.half) || 0) / 100,
      max_price_multiple: Number(form.maxMult) || 0,
      max_trades_per_day: Number(form.maxTrades) || 0,
      eod_flatten_et: form.eod,
      kill_switch: !!form.kill,
      dry_run: !!form.dry,
      updated_at: new Date().toISOString(),
    };
    try {
      const r = await window.NT_CLIENT.from("strategy_params").update(payload).eq("id", 1);
      if (r.error) throw r.error;
      const ns = { ...strat, name: payload.name, alloc: "$" + payload.trade_budget_usd + "/trade", status: payload.kill_switch ? "paused" : "live", params: {
        trade_budget_usd: payload.trade_budget_usd, max_contracts_per_trade: payload.max_contracts_per_trade,
        allowlist: payload.allowlist, stop_loss_pct: payload.stop_loss_pct, breakeven_at_pct: payload.breakeven_at_pct,
        take_half_at_pct: payload.take_half_at_pct, max_price_multiple: payload.max_price_multiple,
        max_trades_per_day: payload.max_trades_per_day, eod_flatten_et: payload.eod_flatten_et,
        kill_switch: payload.kill_switch, dry_run: payload.dry_run } };
      setStrat(ns); window.NT_DATA.strategy = ns; window.NT_DATA.strategies = [ns];
      setSaved(true); closeEdit();
    } catch (e) { alert("Save failed: " + (e.message || e)); }
    setSaving(false);
  };

  const money = (n) => (n > 0 ? "+$" + n : n < 0 ? "−$" + Math.abs(n) : "$0");
  const tone = (n) => (n > 0 ? "var(--profit)" : n < 0 ? "var(--loss)" : "var(--text-primary)");
  const live = strat.status !== "paused";

  const groups = [
    { g: "Sizing", items: [
      ["Trade budget", "$" + Number(p.trade_budget_usd)],
      ["Max contracts / trade", String(p.max_contracts_per_trade)],
      ["Order type", "market"],
      ["Expiry", "0DTE / nearest-listed"],
      ["Allowlist", p.allowlist, true],
    ] },
    { g: "Exits / risk", items: [
      ["Stop loss", NT_pct(p.stop_loss_pct) + "%"],
      ["Breakeven at", NT_pct(p.breakeven_at_pct) + "%"],
      ["Take half at", NT_pct(p.take_half_at_pct) + "%"],
      ["EOD flatten (ET)", p.eod_flatten_et],
    ] },
    { g: "Safety", items: [
      ["Max price × alert", p.max_price_multiple + "×"],
      ["Max trades / day", String(p.max_trades_per_day)],
      ["Kill switch", p.kill_switch ? "ON" : "off"],
      ["Mode", p.dry_run ? "DRY-RUN" : "LIVE"],
    ] },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Strategies" subtitle="The single strategy the bot runs · money management + how it acts on calls" />

      <div style={{ background: "var(--surface-card)", border: "1px solid " + (live ? "var(--violet-line)" : "var(--border)"), borderRadius: "var(--radius-lg)", padding: 22, boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: 18, maxWidth: 720 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ font: "var(--w-semibold) var(--t-h3)/1.2 var(--font-sans)", letterSpacing: "var(--ls-snug)" }}>{strat.name}</div>
            <div style={{ font: "var(--w-regular) var(--t-xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 6, maxWidth: 460 }}>{strat.desc || "Reads 0DTE options alerts from Discord and trades them on Schwab."}</div>
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

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 4 }}>
          <span style={{ font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>{saved ? "✓ saved" : "edits persist to the database"}</span>
          <NT.Button variant="primary" size="md" icon={<Ico name="settings-2" size={15} />} onClick={openEdit}>Edit parameters</NT.Button>
        </div>
      </div>

      {form && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
          style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(8,8,10,0.55)", display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ width: 520, maxWidth: "94vw", background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-pop)", padding: 20, display: "flex", flexDirection: "column", gap: 14, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ font: "var(--w-semibold) var(--t-h3)/1 var(--font-sans)", letterSpacing: "var(--ls-snug)" }}>Edit strategy</span>
              <button onClick={closeEdit} aria-label="Close" style={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: "var(--radius-sm)", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer" }}><Ico name="x" size={16} /></button>
            </div>

            <NT_SField label="Name"><input value={form.name} onChange={(e) => setF("name", e.target.value)} style={NT_SINPUT} /></NT_SField>

            <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", color: "var(--text-primary)", marginTop: 2 }}>Sizing</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <NT_SField label="Trade budget ($)"><input type="number" value={form.budget} onChange={(e) => setF("budget", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Max contracts"><input type="number" value={form.maxC} onChange={(e) => setF("maxC", e.target.value)} style={NT_SINPUT} /></NT_SField>
            </div>
            <NT_SField label="Allowlist" hint="Comma-separated tickers the bot may trade."><input value={form.allowlist} onChange={(e) => setF("allowlist", e.target.value)} style={NT_SINPUT} /></NT_SField>

            <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", color: "var(--text-primary)", marginTop: 2 }}>Exits / risk</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <NT_SField label="Stop loss (%)"><input type="number" value={form.stop} onChange={(e) => setF("stop", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Breakeven (%)"><input type="number" value={form.be} onChange={(e) => setF("be", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Take half (%)"><input type="number" value={form.half} onChange={(e) => setF("half", e.target.value)} style={NT_SINPUT} /></NT_SField>
            </div>
            <NT_SField label="EOD flatten (ET, HH:MM)"><input value={form.eod} onChange={(e) => setF("eod", e.target.value)} style={NT_SINPUT} /></NT_SField>

            <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", color: "var(--text-primary)", marginTop: 2 }}>Safety</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <NT_SField label="Max price × alert" hint="Reject if live ask exceeds this × the alert price."><input type="number" value={form.maxMult} onChange={(e) => setF("maxMult", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Max trades / day"><input type="number" value={form.maxTrades} onChange={(e) => setF("maxTrades", e.target.value)} style={NT_SINPUT} /></NT_SField>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 9, font: "var(--w-medium) var(--t-sm)/1.3 var(--font-sans)", color: "var(--text-secondary)", cursor: "pointer" }}>
                <input type="checkbox" checked={form.kill} onChange={(e) => setF("kill", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--loss)" }} /> Kill switch — block all new orders
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 9, font: "var(--w-medium) var(--t-sm)/1.3 var(--font-sans)", color: "var(--text-secondary)", cursor: "pointer" }}>
                <input type="checkbox" checked={form.dry} onChange={(e) => setF("dry", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} /> Dry-run — simulate, never send real orders
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
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

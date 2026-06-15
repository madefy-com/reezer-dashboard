/* StrategiesPage — strategy cards with status + performance.
   Strategies live in App (shared with the header pill). Only ONE can be active.
   Edit opens a modal with ALL fields (sizing + exits, matching the pill); Delete removes it. */

// NOTE: Field + input style live at MODULE scope. Defining them inside the
// component would give them a new identity every render, remounting the inputs
// and dropping focus after each keystroke.
const NT_SINPUT = { height: 38, padding: "0 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-strong)", background: "var(--surface-inset)", color: "var(--text-primary)", colorScheme: "dark", font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)", width: "100%", boxSizing: "border-box" };
function NT_SField({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{label}</span>
      {children}
    </label>
  );
}

function StrategiesPage({ strategies, onActivate, onPause, onUpdate, onDelete }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const strats = strategies || [];

  const [editName, setEditName] = React.useState(null); // original name of the strategy being edited
  const [form, setForm] = React.useState(null);
  const openEdit = (s) => { setEditName(s.name); setForm({ name: s.name, desc: s.desc, budget: s.params.trade_budget_usd, maxC: s.params.max_contracts_per_trade, stop: Math.round(s.params.stop_loss_pct * 100), be: Math.round(s.params.breakeven_at_pct * 100), half: Math.round(s.params.take_half_at_pct * 100) }); };
  const closeEdit = () => { setEditName(null); setForm(null); };
  const saveEdit = () => {
    onUpdate(editName, {
      name: form.name, desc: form.desc, alloc: "$" + (Number(form.budget) || 0) + "/trade",
      params: { trade_budget_usd: Number(form.budget) || 0, max_contracts_per_trade: Number(form.maxC) || 0, stop_loss_pct: (Number(form.stop) || 0) / 100, breakeven_at_pct: (Number(form.be) || 0) / 100, take_half_at_pct: (Number(form.half) || 0) / 100 },
    });
    closeEdit();
  };
  const removeEdit = () => { onDelete(editName); closeEdit(); };
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const statusMap = {
    live:   { c: "var(--live)",   bg: "var(--live-bg)",   label: "ACTIVE", pulse: true },
    paused: { c: "var(--dryrun)", bg: "var(--dryrun-bg)", label: "PAUSED", pulse: false },
    off:    { c: "var(--breakeven)", bg: "var(--breakeven-bg)", label: "OFF", pulse: false },
  };
  const money = (n) => (n > 0 ? "+$" + n : n < 0 ? "\u2212$" + Math.abs(n) : "$0");
  const tone = (n) => (n > 0 ? "var(--profit)" : n < 0 ? "var(--loss)" : "var(--text-primary)");

  const Metric = ({ label, value, color }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", color: "var(--text-tertiary)" }}>{label}</span>
      <span className="num" style={{ font: "var(--w-medium) var(--t-body)/1 var(--font-mono)", color: color || "var(--text-primary)" }}>{value}</span>
    </div>
  );

  const activeCount = strats.filter((s) => s.status === "live").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Strategies" subtitle={"Signal sources the bot trades from \u00b7 " + activeCount + " active"}
        right={<NT.Button variant="primary" size="md" icon={<Ico name="plus" size={15} />}>New strategy</NT.Button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "var(--gap-grid)" }} className="nt-strat">
        {strats.map((s, i) => {
          const st = statusMap[s.status];
          const live = s.status === "live";
          return (
            <div key={i} style={{ background: "var(--surface-card)", border: "1px solid " + (live ? "var(--violet-line)" : "var(--border)"), borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ font: "var(--w-semibold) var(--t-h3)/1.2 var(--font-sans)", letterSpacing: "var(--ls-snug)" }}>{s.name}</div>
                  <div style={{ font: "var(--w-regular) var(--t-xs)/1.45 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 6, maxWidth: 320 }}>{s.desc}</div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 24, padding: "0 10px", borderRadius: "var(--radius-sm)", background: st.bg, color: st.c, font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", flex: "none" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.c, animation: st.pulse ? "nt-pulse var(--blink) var(--ease-in-out) infinite" : "none" }}></span>{st.label}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <Metric label="trades" value={s.trades} />
                <Metric label="win rate" value={s.winRate + "%"} />
                <Metric label="p&l" value={money(s.pnl)} color={tone(s.pnl)} />
                <Metric label="avg ret" value={(s.avgReturn > 0 ? "+" : s.avgReturn < 0 ? "\u2212" : "") + Math.abs(s.avgReturn).toFixed(1) + "%"} color={tone(s.avgReturn)} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 4 }}>
                <span style={{ font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>budget <span className="num" style={{ color: "var(--text-secondary)" }}>{s.alloc}</span></span>
                <div style={{ display: "flex", gap: 8 }}>
                  <NT.Button variant="ghost" size="sm" icon={<Ico name="settings-2" size={14} />} onClick={() => openEdit(s)}>Edit</NT.Button>
                  <NT.Button variant={live ? "secondary" : "primary"} size="sm" onClick={() => (live ? onPause(s.name) : onActivate(s.name))}>{live ? "Pause" : "Activate"}</NT.Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {form && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
          style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(8,8,10,0.55)", display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ width: 460, maxWidth: "94vw", background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-pop)", padding: 20, display: "flex", flexDirection: "column", gap: 14, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ font: "var(--w-semibold) var(--t-h3)/1 var(--font-sans)", letterSpacing: "var(--ls-snug)" }}>Edit strategy</span>
              <button onClick={closeEdit} aria-label="Close" style={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: "var(--radius-sm)", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer" }}>
                <Ico name="x" size={16} />
              </button>
            </div>

            <NT_SField label="Name"><input value={form.name} onChange={(e) => setF("name", e.target.value)} style={NT_SINPUT} /></NT_SField>

            <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", color: "var(--text-primary)", marginTop: 2 }}>Sizing</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <NT_SField label="Trade budget ($)"><input type="number" value={form.budget} onChange={(e) => setF("budget", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Max contracts"><input type="number" value={form.maxC} onChange={(e) => setF("maxC", e.target.value)} style={NT_SINPUT} /></NT_SField>
            </div>

            <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", color: "var(--text-primary)", marginTop: 2 }}>Exits / risk</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <NT_SField label="Stop loss (%)"><input type="number" value={form.stop} onChange={(e) => setF("stop", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Breakeven (%)"><input type="number" value={form.be} onChange={(e) => setF("be", e.target.value)} style={NT_SINPUT} /></NT_SField>
              <NT_SField label="Take half (%)"><input type="number" value={form.half} onChange={(e) => setF("half", e.target.value)} style={NT_SINPUT} /></NT_SField>
            </div>

            <NT_SField label="Description"><textarea value={form.desc} onChange={(e) => setF("desc", e.target.value)} rows={3} style={{ ...NT_SINPUT, height: "auto", padding: "10px 12px", lineHeight: 1.45, resize: "vertical" }} /></NT_SField>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
              <NT.Button variant="danger" size="md" icon={<Ico name="trash-2" size={15} />} onClick={removeEdit}>Delete</NT.Button>
              <div style={{ display: "flex", gap: 8 }}>
                <NT.Button variant="ghost" size="md" onClick={closeEdit}>Cancel</NT.Button>
                <NT.Button variant="primary" size="md" onClick={saveEdit}>Save changes</NT.Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@media (max-width: 980px){ .nt-strat{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
Object.assign(window, { StrategiesPage });

/* SourcesPage (Settings) — dashboard defaults, alert sources, broker accounts.
   Three sections, each a header + a matching card grid so everything lines up. */
function SourcesPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const [, force] = React.useState(0);
  React.useEffect(() => { const h = () => force((x) => x + 1); window.addEventListener("nt-data", h); return () => window.removeEventListener("nt-data", h); }, []);
  const sources = window.NT_DATA.sources || [];
  const brokers = window.NT_DATA.brokerAccounts || [];
  const strategies = window.NT_DATA.strategies || [];
  const anyLive = strategies.some((s) => s.account === "live");
  const viewOptions = [{ value: "all", label: "All strategies" }]
    .concat(anyLive ? [{ value: "live", label: "Live only" }] : [])
    .concat(strategies.map((s) => ({ value: String(s.id), label: s.name })));
  const view = String(window.NT_DATA.viewStrategy || "all");
  const [form, setForm] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const INP = { height: 38, padding: "0 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-strong)", background: "var(--surface-inset)", color: "var(--text-primary)", colorScheme: "dark", font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)", width: "100%", boxSizing: "border-box" };

  // shared layout tokens so every section aligns
  const GRID = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "var(--gap-grid)", alignItems: "stretch" };
  const CARD = { height: "100%", boxSizing: "border-box", background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 18, boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: 14 };
  const ICON = { width: 34, height: 34, flex: "none", borderRadius: "var(--radius-md)", background: "var(--surface-inset)", border: "1px solid var(--border)", display: "grid", placeItems: "center", color: "var(--text-secondary)" };
  const Section = (title, sub, action) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 6 }}>
      <div><span style={{ font: "var(--w-semibold) var(--t-body)/1 var(--font-sans)" }}>{title}</span><span style={{ marginLeft: 10, font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>{sub}</span></div>
      {action || null}
    </div>
  );

  const openNew = () => setForm({ id: null, name: "", type: "discord", channel_url: "", enabled: true });
  const openEdit = (s) => setForm({ id: s.id, name: s.name || "", type: s.type || "discord", channel_url: s.channel_url || "", enabled: !!s.enabled });
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) { await window.NT_ALERT("Give the source a name.", { title: "Source" }); return; }
    setSaving(true);
    const payload = { name: form.name.trim(), type: form.type, channel_url: form.channel_url.trim() || null, enabled: !!form.enabled, updated_at: new Date().toISOString() };
    try {
      const r = form.id ? await window.NT_CLIENT.from("sources").update(payload).eq("id", form.id)
                        : await window.NT_CLIENT.from("sources").insert(payload);
      if (r.error) throw r.error;
      await window.NT_REFRESH(); setForm(null);
    } catch (e) { await window.NT_ALERT("Save failed: " + (e.message || e), { title: "Source" }); }
    setSaving(false);
  };
  const toggle = async (s) => {
    try { const r = await window.NT_CLIENT.from("sources").update({ enabled: !s.enabled, updated_at: new Date().toISOString() }).eq("id", s.id); if (r.error) throw r.error; await window.NT_REFRESH(); }
    catch (e) { await window.NT_ALERT("Couldn’t update: " + (e.message || e), { title: "Source" }); }
  };
  const del = async (s) => {
    if (!(await window.NT_CONFIRM("Delete source “" + s.name + "”? Past alerts keep their tag.", { title: "Delete source", ok: "Delete", danger: true }))) return;
    try { const r = await window.NT_CLIENT.from("sources").delete().eq("id", s.id); if (r.error) throw r.error; await window.NT_REFRESH(); }
    catch (e) { await window.NT_ALERT("Delete failed: " + (e.message || e), { title: "Source" }); }
  };

  const statusPill = (on) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 9px", borderRadius: "var(--radius-sm)", background: on ? "var(--profit-bg)" : "var(--surface-inset)", color: on ? "var(--profit)" : "var(--text-tertiary)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", flex: "none" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: on ? "var(--profit)" : "var(--text-tertiary)" }}></span>{on ? "ON" : "OFF"}
    </span>
  );
  const inset = (icon, text, color) => (
    <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--surface-inset)", minWidth: 0 }}>
      <Ico name={icon} size={13} style={color ? { color } : undefined} />
      <span style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-" + (icon === "link" ? "mono" : "sans") + ")", color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: icon === "link" ? "nowrap" : "normal" }}>{text}</span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Settings" subtitle="Dashboard defaults, alert sources and broker accounts" />

      {/* ---- Dashboard ---- */}
      {Section("Dashboard", "how the dashboard opens")}
      <div style={GRID}>
        <div style={CARD}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span style={ICON}><Ico name="eye" size={17} /></span>
            <div style={{ minWidth: 0 }}>
              <div style={{ font: "var(--w-semibold) var(--t-body)/1.2 var(--font-sans)" }}>Default view</div>
              <div style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 4 }}>Which strategy the dashboard shows by default.</div>
            </div>
          </div>
          <div style={{ marginTop: "auto" }}><NT_Select value={view} options={viewOptions} icon="filter" minWidth={220} onChange={(v) => window.NT_SET_VIEW(v)} /></div>
        </div>
      </div>

      {/* ---- Alert sources ---- */}
      {Section("Alert sources", "channels the bot reads alerts from",
        <NT.Button variant="primary" size="md" icon={<Ico name="plus" size={15} />} onClick={openNew}>New source</NT.Button>)}
      <div style={GRID}>
        {sources.map((s) => (
          <div key={s.id} style={{ ...CARD, opacity: s.enabled ? 1 : 0.72 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                <span style={ICON}><Ico name={s.type === "discord" ? "message-square-dot" : s.type === "webhook" ? "webhook" : "inbox"} size={17} /></span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ font: "var(--w-semibold) var(--t-body)/1.2 var(--font-sans)" }}>{s.name}</div>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 17, padding: "0 7px", marginTop: 4, borderRadius: "var(--radius-xs)", background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-tertiary)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-mono)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase" }}>{s.type}</span>
                </div>
              </div>
              {statusPill(s.enabled)}
            </div>
            {inset("link", s.channel_url || "uses the bot's default channel")}
            <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <NT.Button variant="ghost" size="sm" onClick={() => del(s)}>Delete</NT.Button>
              <NT.Button variant="ghost" size="sm" onClick={() => toggle(s)}>{s.enabled ? "Disable" : "Enable"}</NT.Button>
              <NT.Button variant="primary" size="sm" icon={<Ico name="settings-2" size={14} />} onClick={() => openEdit(s)}>Edit</NT.Button>
            </div>
          </div>
        ))}
        {!sources.length && <div style={{ ...CARD, color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-sm)/1.4 var(--font-sans)", justifyContent: "center", alignItems: "center", textAlign: "center" }}>No sources yet — click “New source”.</div>}
      </div>
      <div style={{ font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)" }}>
        Enabling, disabling or adding a source takes effect when the bot next starts a session. A Discord source needs its own browser login.
      </div>

      {/* ---- Broker accounts ---- */}
      {Section("Broker accounts", "where live strategies place real orders")}
      <div style={GRID}>
        {brokers.map((b) => (
          <div key={b.id} style={CARD}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span style={ICON}><Ico name="landmark" size={17} /></span>
              <div style={{ minWidth: 0 }}>
                <div style={{ font: "var(--w-semibold) var(--t-body)/1.2 var(--font-sans)" }}>{b.label || "Broker account"}</div>
                <div style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-mono)", color: "var(--text-tertiary)", marginTop: 4 }}>Schwab{b.account_ref ? " · ••••" + String(b.account_ref).slice(-4) : ""}</div>
              </div>
            </div>
            <div style={{ marginTop: "auto" }}>{inset("shield-check", "API key, secret & account number stay in the bot's server config — never in the dashboard.", "var(--profit)")}</div>
          </div>
        ))}
        {!brokers.length && <div style={{ ...CARD, color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-sm)/1.4 var(--font-sans)", justifyContent: "center", alignItems: "center", textAlign: "center" }}>No broker accounts yet.</div>}
      </div>

      {/* ---- Machines (failover boxes) ---- */}
      {(window.NT_DATA.machines || []).length > 0 && (() => {
        const ago = (ts) => { if (!ts) return "never"; const s = Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 1000)); return s < 60 ? s + "s ago" : s < 3600 ? Math.round(s / 60) + "m ago" : Math.round(s / 3600) + "h ago"; };
        const online = (m) => m.last_seen && (Date.now() - new Date(m.last_seen).getTime()) < 120000;
        const hchip = (label, ok) => (
          <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 22, padding: "0 9px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
            background: ok === true ? "color-mix(in srgb, var(--profit) 13%, transparent)" : ok === false ? "color-mix(in srgb, var(--loss) 14%, transparent)" : "var(--surface-inset)",
            color: ok === true ? "var(--profit)" : ok === false ? "var(--loss)" : "var(--text-tertiary)",
            font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)" }}>{ok === true ? "✓" : ok === false ? "✗" : "–"} {label}</span>
        );
        return (
          <React.Fragment>
            {Section("Machines", "your boxes — online, which is active, and connection health")}
            <div style={GRID}>
              {(window.NT_DATA.machines || []).map((m) => {
                const on = online(m); const act = on && m.active;
                return (
                  <div key={m.machine_id} style={{ ...CARD, opacity: on ? 1 : 0.7 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                        <span style={ICON}><Ico name="server" size={17} /></span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ font: "var(--w-semibold) var(--t-body)/1.2 var(--font-sans)" }}>{m.machine_id}</div>
                          <div style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 4 }}>seen {ago(m.last_seen)}</div>
                        </div>
                      </div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 9px", borderRadius: "var(--radius-sm)", flex: "none", letterSpacing: "var(--ls-caps)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)",
                        background: act ? "var(--violet-soft)" : on ? "var(--profit-bg)" : "var(--surface-inset)",
                        color: act ? "var(--accent)" : on ? "var(--profit)" : "var(--text-tertiary)",
                        border: act ? "1px solid var(--violet-line)" : "1px solid transparent" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: act ? "var(--accent)" : on ? "var(--profit)" : "var(--text-tertiary)", animation: act ? "nt-pulse var(--blink) var(--ease-in-out) infinite" : "none" }}></span>
                        {act ? "ACTIVE" : on ? "STANDBY" : "OFFLINE"}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {hchip("Schwab", m.schwab_ok)}{hchip("Discord", m.discord_ok)}{hchip("Supabase", m.supabase_ok)}
                    </div>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        );
      })()}

      {form && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget) setForm(null); }} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(8,8,10,0.55)", display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ width: 480, maxWidth: "94vw", background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-pop)", padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ font: "var(--w-semibold) var(--t-h3)/1 var(--font-sans)" }}>{form.id ? "Edit source" : "New source"}</span>
              <button onClick={() => setForm(null)} aria-label="Close" style={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: "var(--radius-sm)", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Name</span><input value={form.name} onChange={(e) => setF("name", e.target.value)} style={INP} /></label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Type</span>
              <select value={form.type} onChange={(e) => setF("type", e.target.value)} style={INP}><option value="discord">discord</option><option value="webhook">webhook</option><option value="manual">manual</option></select></label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Channel URL</span><input value={form.channel_url} onChange={(e) => setF("channel_url", e.target.value)} placeholder="Empty = use the bot's default DISCORD_CHANNEL_URL" style={INP} /></label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}><input type="checkbox" checked={form.enabled} onChange={(e) => setF("enabled", e.target.checked)} /><span style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)", color: "var(--text-secondary)" }}>Enabled (watched while the bot runs)</span></label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <NT.Button variant="ghost" size="md" onClick={() => setForm(null)}>Cancel</NT.Button>
              <NT.Button variant="primary" size="md" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</NT.Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
Object.assign(window, { SourcesPage });

/* SourcesPage (Settings) — rebuilt to match the other pages: each section is an
   NT.Card with its title INSIDE the card header, and the contents are real tables
   (not a cramped right-aligned card grid). */
function SourcesPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const [, force] = React.useState(0);
  React.useEffect(() => { const h = () => force((x) => x + 1); window.addEventListener("nt-data", h); return () => window.removeEventListener("nt-data", h); }, []);
  const sources = window.NT_DATA.sources || [];
  const brokers = window.NT_DATA.brokerAccounts || [];
  const strategies = window.NT_DATA.strategies || [];
  const machines = window.NT_DATA.machines || [];
  const cmds = window.NT_DATA.machineCommands || [];   // newest first (id desc)
  const anyLive = strategies.some((s) => s.account === "live");
  const viewOptions = [{ value: "all", label: "All strategies" }]
    .concat(anyLive ? [{ value: "live", label: "Live only" }] : [])
    .concat(strategies.map((s) => ({ value: String(s.id), label: s.name })));
  const view = String(window.NT_DATA.viewStrategy || "all");
  const [form, setForm] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const INP = { height: 38, padding: "0 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-strong)", background: "var(--surface-inset)", color: "var(--text-primary)", colorScheme: "dark", font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)", width: "100%", boxSizing: "border-box" };

  // ---- shared table styles (match TradesPage) ----
  const th = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "11px 16px", textAlign: "left", whiteSpace: "nowrap", borderBottom: "1px solid var(--border)" };
  const thR = { ...th, textAlign: "right" };
  const td = { font: "var(--w-regular) var(--t-sm)/1.3 var(--font-sans)", padding: "13px 16px", borderTop: "1px solid var(--border)", textAlign: "left", color: "var(--text-primary)", verticalAlign: "middle" };
  const tdR = { ...td, textAlign: "right" };
  const ICON = { width: 32, height: 32, flex: "none", borderRadius: "var(--radius-md)", background: "var(--surface-inset)", border: "1px solid var(--border)", display: "grid", placeItems: "center", color: "var(--text-secondary)" };
  const typeChip = (t) => (
    <span style={{ display: "inline-flex", alignItems: "center", height: 18, padding: "0 7px", borderRadius: "var(--radius-xs)", background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-secondary)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-mono)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase" }}>{t}</span>
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
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 9px", borderRadius: "var(--radius-sm)", background: on ? "var(--profit-bg)" : "var(--surface-inset)", color: on ? "var(--profit)" : "var(--text-tertiary)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: on ? "var(--profit)" : "var(--text-tertiary)" }}></span>{on ? "ON" : "OFF"}
    </span>
  );

  // ---- machines helpers ----
  const ago = (ts) => { if (!ts) return "never"; const s = Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 1000)); return s < 60 ? s + "s ago" : s < 3600 ? Math.round(s / 60) + "m ago" : Math.round(s / 3600) + "h ago"; };
  const online = (m) => m.last_seen && (Date.now() - new Date(m.last_seen).getTime()) < 120000;
  const hchip = (label, ok) => (
    <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 22, padding: "0 9px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
      background: ok === true ? "var(--profit-bg)" : ok === false ? "var(--loss-bg)" : "var(--surface-inset)",
      color: ok === true ? "var(--profit)" : ok === false ? "var(--loss)" : "var(--text-tertiary)",
      font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)" }}>{ok === true ? "✓" : ok === false ? "✗" : "–"} {label}</span>
  );
  const lastCmd = (mid) => cmds.find((c) => c.machine_id === mid);
  const issueCmd = async (mid, command) => {
    try { const r = await window.NT_CLIENT.from("machine_commands").insert({ machine_id: mid, command }); if (r.error) throw r.error; await window.NT_REFRESH(); }
    catch (e) { await window.NT_ALERT("Couldn’t send command: " + (e.message || e), { title: "Box command" }); }
  };
  const cmdBtn = (mid, command, label, danger) => (
    <button key={label} onClick={() => issueCmd(mid, command)} style={{ height: 28, padding: "0 11px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid var(--border-strong)", background: "var(--surface-inset)", color: danger ? "var(--loss)" : "var(--text-secondary)", font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)" }}>{label}</button>
  );
  const machineBadge = (m) => {
    const on = online(m), act = on && m.active;
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 9px", borderRadius: "var(--radius-sm)", letterSpacing: "var(--ls-caps)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)",
        background: act ? "var(--violet-soft)" : on ? "var(--profit-bg)" : "var(--surface-inset)",
        color: act ? "var(--accent)" : on ? "var(--profit)" : "var(--text-tertiary)",
        border: act ? "1px solid var(--violet-line)" : "1px solid transparent" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: act ? "var(--accent)" : on ? "var(--profit)" : "var(--text-tertiary)", animation: act ? "nt-pulse var(--blink) var(--ease-in-out) infinite" : "none" }}></span>
        {act ? "ACTIVE" : on ? "STANDBY" : "OFFLINE"}
      </span>
    );
  };

  const emptyRow = (cols, text) => (
    <tr><td colSpan={cols} style={{ ...td, textAlign: "center", color: "var(--text-tertiary)", padding: "26px 16px" }}>{text}</td></tr>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Settings" subtitle="Dashboard defaults, alert sources, broker accounts and your boxes" />

      {/* ---- Dashboard defaults ---- */}
      <NT.Card title="Dashboard" padding={20}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ font: "var(--w-semibold) var(--t-body)/1.2 var(--font-sans)", color: "var(--text-primary)" }}>Default view</div>
            <div style={{ font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-secondary)", marginTop: 4 }}>Which strategy the dashboard shows when it first opens.</div>
          </div>
          <NT_Select value={view} options={viewOptions} icon="filter" minWidth={240} onChange={(v) => window.NT_SET_VIEW(v)} />
        </div>
      </NT.Card>

      {/* ---- Alert sources ---- */}
      <NT.Card title="Alert sources" padding={20} bodyStyle={{ padding: 0 }}
        action={<NT.Button variant="primary" size="sm" icon={<Ico name="plus" size={14} />} onClick={openNew}>New source</NT.Button>}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead><tr><th style={th}>Source</th><th style={th}>Channel</th><th style={th}>Status</th><th style={thR}>Actions</th></tr></thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} style={{ opacity: s.enabled ? 1 : 0.72 }}>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                      <span style={ICON}><Ico name={s.type === "discord" ? "message-square-dot" : s.type === "webhook" ? "webhook" : "inbox"} size={16} /></span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ font: "var(--w-semibold) var(--t-sm)/1.2 var(--font-sans)", color: "var(--text-primary)" }}>{s.name}</div>
                        <div style={{ marginTop: 3 }}>{typeChip(s.type)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...td, font: "var(--w-regular) var(--t-xs)/1.4 var(--font-mono)", color: s.channel_url ? "var(--text-secondary)" : "var(--text-tertiary)", maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.channel_url || "uses the bot's default channel"}</td>
                  <td style={td}>{statusPill(s.enabled)}</td>
                  <td style={tdR}>
                    <span style={{ display: "inline-flex", gap: 8, justifyContent: "flex-end" }}>
                      <NT.Button variant="ghost" size="sm" onClick={() => toggle(s)}>{s.enabled ? "Disable" : "Enable"}</NT.Button>
                      <NT.Button variant="ghost" size="sm" onClick={() => del(s)}>Delete</NT.Button>
                      <NT.Button variant="secondary" size="sm" icon={<Ico name="settings-2" size={13} />} onClick={() => openEdit(s)}>Edit</NT.Button>
                    </span>
                  </td>
                </tr>
              ))}
              {!sources.length && emptyRow(4, "No sources yet — click “New source”.")}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)" }}>
          Enabling, disabling or adding a source takes effect when the bot next starts a session. A Discord source needs its own browser login.
        </div>
      </NT.Card>

      {/* ---- Broker accounts ---- */}
      <NT.Card title="Broker accounts" padding={20} bodyStyle={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead><tr><th style={th}>Account</th><th style={th}>Broker</th><th style={th}>Reference</th><th style={thR}>Credentials</th></tr></thead>
            <tbody>
              {brokers.map((b) => (
                <tr key={b.id}>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <span style={ICON}><Ico name="landmark" size={16} /></span>
                      <span style={{ font: "var(--w-semibold) var(--t-sm)/1.2 var(--font-sans)", color: "var(--text-primary)" }}>{b.label || "Broker account"}</span>
                    </div>
                  </td>
                  <td style={{ ...td, color: "var(--text-secondary)" }}>Charles Schwab</td>
                  <td style={{ ...td, font: "var(--w-regular) var(--t-sm)/1 var(--font-mono)", color: "var(--text-secondary)" }}>{b.account_ref ? "••••" + String(b.account_ref).slice(-4) : "—"}</td>
                  <td style={tdR}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--profit)", font: "var(--w-medium) var(--t-2xs)/1.4 var(--font-sans)" }}>
                      <Ico name="shield-check" size={13} /> on the bot's server only
                    </span>
                  </td>
                </tr>
              ))}
              {!brokers.length && emptyRow(4, "No broker accounts yet.")}
            </tbody>
          </table>
        </div>
      </NT.Card>

      {/* ---- Machines (failover boxes) ---- */}
      <NT.Card title="Machines" padding={20} bodyStyle={{ padding: machines.length ? 0 : 20 }}
        action={machines.length ? <span style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>{machines.length} box{machines.length === 1 ? "" : "es"}</span> : null}>
        {machines.length ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
              <thead><tr><th style={th}>Box</th><th style={th}>Status</th><th style={th}>Health</th><th style={th}>Last seen</th><th style={thR}>Controls</th></tr></thead>
              <tbody>
                {machines.map((m) => {
                  const lc = lastCmd(m.machine_id);
                  return (
                    <tr key={m.machine_id} style={{ opacity: online(m) ? 1 : 0.72 }}>
                      <td style={td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                          <span style={ICON}><Ico name="server" size={16} /></span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ font: "var(--w-semibold) var(--t-sm)/1.2 var(--font-sans)", color: "var(--text-primary)" }}>{m.machine_id}</div>
                            {lc ? <div style={{ marginTop: 3, font: "var(--w-regular) var(--t-2xs)/1.3 var(--font-mono)", color: lc.status === "error" ? "var(--loss)" : lc.status === "done" ? "var(--text-tertiary)" : "var(--accent)" }}>{lc.command}: {lc.status}</div> : null}
                          </div>
                        </div>
                      </td>
                      <td style={td}>{machineBadge(m)}</td>
                      <td style={td}><span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6 }}>{hchip("Schwab", m.schwab_ok)}{hchip("Discord", m.discord_ok)}{hchip("Supabase", m.supabase_ok)}</span></td>
                      <td style={{ ...td, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{ago(m.last_seen)}</td>
                      <td style={tdR}>
                        <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6, justifyContent: "flex-end" }}>
                          {cmdBtn(m.machine_id, "preflight", "Verify")}
                          {cmdBtn(m.machine_id, "restart", "Restart")}
                          {cmdBtn(m.machine_id, "relogin-discord", "Re-login")}
                          {cmdBtn(m.machine_id, m.paused ? "resume" : "pause", m.paused ? "Resume" : "Pause", !m.paused)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span style={ICON}><Ico name="server" size={16} /></span>
              <div>
                <div style={{ font: "var(--w-semibold) var(--t-body)/1.2 var(--font-sans)", color: "var(--text-primary)" }}>Connect a box</div>
                <div style={{ font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-secondary)", marginTop: 4 }}>Your nitro-trader folder is already on every Mac via iCloud — connecting each one is a single double-click.</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "var(--surface-inset)", border: "1px solid var(--border)" }}>
              <Ico name="mouse-pointer-click" size={15} style={{ color: "var(--text-secondary)" }} />
              <span style={{ font: "var(--w-medium) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-primary)" }}>On each Mac: Documents → nitro-trader → double-click <b>Connect-this-Mac.command</b></span>
            </div>
            <div style={{ font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)" }}>
              It installs the bot on that Mac, opens a browser for its one-time Discord login (Schwab is already shared — no second login), and schedules it. The box shows up here within seconds — verify / restart / re-login / pause / failover are all dashboard buttons from then on. (First time, right-click → Open if macOS warns.) Each box runs only during the trading window, not 24/7.
            </div>
          </div>
        )}
      </NT.Card>

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

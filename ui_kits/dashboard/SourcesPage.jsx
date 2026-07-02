/* SourcesPage (Settings) — rebuilt to match the other pages: each section is an
   NT.Card with its title INSIDE the card header, and the contents are real tables
   (not a cramped right-aligned card grid). */
function SourcesPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const [, force] = React.useState(0);
  React.useEffect(() => { const h = () => force((x) => x + 1); window.addEventListener("nt-data", h); return () => window.removeEventListener("nt-data", h); }, []);
  React.useEffect(() => { const id = setInterval(() => force((x) => x + 1), 15000); return () => clearInterval(id); }, []);  // re-tick so a finished-command badge ages out on its own
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
  const range = String(window.NT_DATA.dateRange || "week");
  const defaultRange = String(window.NT_DATA.dateRangeDefault || "week");
  const [form, setForm] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  // ---- streaming window (session_config) ----
  const SC0 = window.NT_DATA.sessionConfig || {};
  const MH = window.NT_DATA.marketHours || { market_tz: "America/New_York", display_tz: "Europe/Amsterdam" };
  const [win, setWin] = React.useState({ start: SC0.streaming_start_et || "09:30", end: SC0.streaming_end_et || "12:00", lead: SC0.scan_lead_min != null ? SC0.scan_lead_min : 30 });
  const [savingWin, setSavingWin] = React.useState(false);
  const dispOf = (hhmm) => { try { const a = String(hhmm).split(":"); const inst = window.ntTzInstant(new Date(), MH.market_tz, Number(a[0]), Number(a[1])); return window.ntFmtTz(inst, MH.display_tz); } catch (e) { return ""; } };
  const dispZone = (MH.display_tz || "Europe/Amsterdam").split("/")[1].replace("_", " ");
  const saveWin = async () => {
    setSavingWin(true);
    try {
      const r = await window.NT_CLIENT.from("session_config").update({ streaming_start_et: win.start, streaming_end_et: win.end, scan_lead_min: Number(win.lead) || 30, updated_at: new Date().toISOString() }).eq("id", 1);
      if (r.error) throw r.error;
      await window.NT_REFRESH();
    } catch (e) { await window.NT_ALERT("Save failed: " + (e.message || e), { title: "Streaming window" }); }
    setSavingWin(false);
  };
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
  // One health dot summarising Schwab/Discord/Supabase (details on hover) instead of 3 chips.
  const healthDot = (m) => {
    const items = [["Schwab", m.schwab_ok], ["Discord", m.discord_ok], ["Supabase", m.supabase_ok]];
    const anyBad = items.some(([, v]) => v === false);
    const allOk = items.every(([, v]) => v === true);
    const col = anyBad ? "var(--loss)" : allOk ? "var(--profit)" : "var(--text-tertiary)";
    const label = anyBad ? "Issue" : allOk ? "Healthy" : "Not checked";
    const title = items.map(([l, v]) => l + ": " + (v === true ? "ok" : v === false ? "FAIL" : "—")).join("  ·  ");
    return (
      <span title={title} style={{ display: "inline-flex", alignItems: "center", gap: 7, font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)", color: col }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />{label}
      </span>
    );
  };
  // Show the latest command while it's in-flight; a finished one (done/error) lingers
  // only ~60s, then disappears — it's just a transient "last action" note.
  const lastCmd = (mid) => {
    const c = cmds.find((x) => x.machine_id === mid);
    if (!c) return null;
    if (c.status === "pending" || c.status === "running") return c;
    const t = Date.parse(c.updated_at || c.created_at || "");
    return (t && Date.now() - t < 60000) ? c : null;
  };
  const issueCmd = async (mid, command) => {
    try { const r = await window.NT_CLIENT.from("machine_commands").insert({ machine_id: mid, command }); if (r.error) throw r.error; await window.NT_REFRESH(); }
    catch (e) { await window.NT_ALERT("Couldn’t send command: " + (e.message || e), { title: "Box command" }); }
  };
  const removeMachine = async (mid) => {
    if (!(await window.NT_CONFIRM("Remove “" + mid + "”? It'll come back on its own if that box checks in again — use this to clear a stale/duplicate entry.", { title: "Remove box", ok: "Remove", danger: true }))) return;
    try { const r = await window.NT_CLIENT.from("machines").delete().eq("machine_id", mid); if (r.error) throw r.error; await window.NT_REFRESH(); }
    catch (e) { await window.NT_ALERT("Couldn’t remove: " + (e.message || e), { title: "Remove box" }); }
  };
  const iconBtn = (label, icon, onClick, danger) => (
    <button key={label} title={label} aria-label={label} onClick={onClick}
      style={{ width: 30, height: 30, display: "inline-grid", placeItems: "center", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid var(--border-strong)", background: "var(--surface-inset)", color: danger ? "var(--loss)" : "var(--text-secondary)" }}>
      <Ico name={icon} size={14} />
    </button>
  );
  const cmdBtn = (mid, command, label, icon, danger) => iconBtn(label, icon, () => issueCmd(mid, command), danger);
  // Is the bot SUPPOSED to be running right now? (only then is "not seen" a real problem)
  const sess = (function () { try { return window.ntSession(new Date()); } catch (e) { return null; } })();
  const inWindow = !!(sess && sess.scanning);   // bot should be up from 30 min before streaming
  const nextLabel = (function () { try { return window.ntNextOpenLabel(new Date()); } catch (e) { return "the next session"; } })();
  const machineBadge = (m) => {
    const on = online(m), act = on && m.active;
    const offProblem = !on && inWindow;        // should be running now, but isn't → real alert
    const label = act ? "ACTIVE" : on ? "STANDBY" : offProblem ? "OFFLINE" : "OFF-HOURS";
    const col = act ? "var(--accent)" : on ? "var(--profit)" : offProblem ? "var(--loss)" : "var(--text-tertiary)";
    const bg = act ? "var(--violet-soft)" : on ? "var(--profit-bg)" : offProblem ? "var(--loss-bg)" : "var(--surface-inset)";
    return (
      <span title={offProblem ? "In the trading window but not reporting — check this box" : on ? "Bot running" : "Outside the trading window — starts itself at the next session"}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 9px", borderRadius: "var(--radius-sm)", letterSpacing: "var(--ls-caps)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)",
        background: bg, color: col, border: act ? "1px solid var(--violet-line)" : offProblem ? "1px solid var(--loss-line)" : "1px solid transparent" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: col, animation: act ? "nt-pulse var(--blink) var(--ease-in-out) infinite" : "none" }}></span>
        {label}
      </span>
    );
  };

  const emptyRow = (cols, text) => (
    <tr><td colSpan={cols} style={{ ...td, textAlign: "center", color: "var(--text-tertiary)", padding: "26px 16px" }}>{text}</td></tr>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Settings" subtitle="Dashboard defaults, alert sources, broker accounts and your boxes" />
      <style>{`
        .nt-set2{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: var(--gap-grid); align-items: stretch; }
        .nt-set2 > *{ height: 100%; }   /* paired cards share the row height -> bottoms aligned */
        @media (max-width: 900px){ .nt-set2{ grid-template-columns: 1fr; } .nt-set2 > *{ height: auto; } }
      `}</style>

      <div className="nt-set2">
      {/* ---- Dashboard defaults ---- */}
      <NT.Card title="Dashboard" padding={20}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "nowrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ font: "var(--w-semibold) var(--t-body)/1.2 var(--font-sans)", color: "var(--text-primary)" }}>Default view</div>
            <div style={{ font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-secondary)", marginTop: 4 }}>Which strategy the dashboard shows when it first opens.</div>
          </div>
          <NT_Select value={view} options={viewOptions} icon="filter" minWidth={240} onChange={(v) => window.NT_SET_VIEW(v)} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "nowrap", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ font: "var(--w-semibold) var(--t-body)/1.2 var(--font-sans)", color: "var(--text-primary)" }}>Default date range</div>
            <div style={{ font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-secondary)", marginTop: 4 }}>The range the dashboard opens on each time. The date pickers on the pages change your current view for the session — they don’t change this default.</div>
          </div>
          <DateFilter value={defaultRange} onChange={(v, b) => window.NT_SET_DEFAULT_RANGE(v, b)} />
        </div>
      </NT.Card>

      {/* ---- Streaming window ---- */}
      <NT.Card title="Streaming window" padding={20}
        action={<NT.Button variant="primary" size="sm" onClick={saveWin} disabled={savingWin}>{savingWin ? "Saving…" : "Save"}</NT.Button>}>
        <div style={{ font: "var(--w-regular) var(--t-xs)/1.5 var(--font-sans)", color: "var(--text-secondary)", marginBottom: 16 }}>
          The bot wakes <b style={{ color: "var(--text-primary)" }}>{win.lead} min before</b> the start and stops at the end — not the whole market day. Times in US&nbsp;Eastern ({dispZone} shown below each).
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-end" }}>
          {[["Start (ET)", "start"], ["End (ET)", "end"]].map(([lbl, key]) => (
            <label key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{lbl}</span>
              <input type="time" value={win[key]} onChange={(e) => setWin((w) => ({ ...w, [key]: e.target.value }))} style={{ ...INP, width: 150 }} />
              <span style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>= {dispOf(win[key])} {dispZone}</span>
            </label>
          ))}
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Scan lead</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input type="number" min={0} max={120} value={win.lead} onChange={(e) => setWin((w) => ({ ...w, lead: e.target.value }))} style={{ ...INP, width: 90 }} />
              <span style={{ font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)", color: "var(--text-secondary)" }}>min early</span>
            </span>
            <span style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>start scanning before the open</span>
          </label>
        </div>
      </NT.Card>

      </div>

      <div className="nt-set2">
      {/* ---- Alert sources ---- */}
      <NT.Card title="Alert sources" padding={20} bodyStyle={{ padding: 0 }}
        action={<NT.Button variant="primary" size="sm" icon={<Ico name="plus" size={14} />} onClick={openNew}>New source</NT.Button>}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 380 }}>
            <thead><tr><th style={th}>Source</th><th style={th}>Status</th><th style={thR}>Actions</th></tr></thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} style={{ opacity: s.enabled ? 1 : 0.72 }}>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                      <span style={ICON}><Ico name={s.type === "discord" ? "message-square-dot" : s.type === "webhook" ? "webhook" : "inbox"} size={16} /></span>
                      <div style={{ minWidth: 0 }}>
                        <div title={s.channel_url || "uses the bot's default channel"} style={{ font: "var(--w-semibold) var(--t-sm)/1.2 var(--font-sans)", color: "var(--text-primary)" }}>{s.name}</div>
                        <div style={{ marginTop: 3 }}>{typeChip(s.type)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={td}>{statusPill(s.enabled)}</td>
                  <td style={tdR}>
                    <span style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                      {iconBtn(s.enabled ? "Disable" : "Enable", s.enabled ? "eye-off" : "eye", () => toggle(s), false)}
                      {iconBtn("Delete", "trash-2", () => del(s), false)}
                      <NT.Button variant="secondary" size="sm" icon={<Ico name="settings-2" size={13} />} onClick={() => openEdit(s)}>Edit</NT.Button>
                    </span>
                  </td>
                </tr>
              ))}
              {!sources.length && emptyRow(3, "No sources yet — click “New source”.")}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)" }}>
          Changes take effect at the next session. A Discord source needs its own browser login.
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

      </div>

      {/* ---- Machines (failover boxes) ---- */}
      <NT.Card title="Machines" padding={20} bodyStyle={{ padding: machines.length ? 0 : 20 }}
        action={machines.length ? <span style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>{machines.length} box{machines.length === 1 ? "" : "es"}</span> : null}>
        {machines.length ? (
          <React.Fragment>
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
                      <td style={td}>{healthDot(m)}</td>
                      <td style={{ ...td, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{ago(m.last_seen)}</td>
                      <td style={tdR}>
                        <span style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
                          {cmdBtn(m.machine_id, "preflight", "Verify", "shield-check")}
                          {cmdBtn(m.machine_id, "restart", "Restart", "rotate-cw")}
                          {cmdBtn(m.machine_id, "relogin-discord", "Re-login Discord", "log-in")}
                          {cmdBtn(m.machine_id, m.paused ? "resume" : "pause", m.paused ? "Resume" : "Pause", m.paused ? "play" : "pause", !m.paused)}
                          {!online(m) && iconBtn("Remove", "trash-2", () => removeMachine(m.machine_id), false)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)" }}>
            <b style={{ color: "var(--text-secondary)" }}>OFF-HOURS</b> = outside the trading window; the box starts itself at the next session ({nextLabel}). <b style={{ color: "var(--loss)" }}>OFFLINE</b> only shows if a box goes missing <i>during</i> a session.
          </div>
          </React.Fragment>
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

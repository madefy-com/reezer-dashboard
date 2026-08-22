/* SourcesPage (Settings) — rebuilt to match the other pages: each section is an
   NT.Card with its title INSIDE the card header, and the contents are real tables
   (not a cramped right-aligned card grid). */
/* Schwab connection — always-visible expiry + a one-flow re-auth that never touches a
   terminal. Talks to the `schwab-reauth` edge function: status (days left), authorize
   (opens Schwab login), exchange (pastes the redirect URL -> saves the shared token). */
function SchwabReauth() {
  const SB = window.NT_SUPABASE || {};
  const FN = (SB.url || "") + "/functions/v1/schwab-reauth";
  const [st, setSt] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState(null);

  const call = React.useCallback((action, body) => {
    const opts = { method: body ? "POST" : "GET",
      headers: { Authorization: "Bearer " + SB.key, apikey: SB.key, "Content-Type": "application/json" } };
    if (body) opts.body = JSON.stringify(body);
    return fetch(FN + (body ? "" : "?action=" + action), opts).then((r) => r.json());
  }, [FN, SB.key]);

  const loadStatus = React.useCallback(() => { call("status").then(setSt).catch(() => {}); }, [call]);
  React.useEffect(() => { loadStatus(); const id = setInterval(loadStatus, 60000); return () => clearInterval(id); }, [loadStatus]);

  const days = st && st.days_left != null ? st.days_left : null;
  const tone = days == null ? "var(--text-tertiary)" : (!st.valid || days <= 2) ? "var(--loss)" : days <= 3 ? "var(--breakeven)" : "var(--profit)";
  const label = days == null ? "checking…" : (!st.valid ? "EXPIRED — re-auth now" : `expires in ${days} day${days === 1 ? "" : "s"}`);

  const startLogin = () => { setMsg(null); call("authorize").then((r) => {
    if (r.authorize_url) { window.open(r.authorize_url, "_blank", "noopener"); setOpen(true); }
    else setMsg({ ok: false, text: r.error || "Couldn't build the login URL — are the Schwab secrets set on the edge function?" });
  }); };
  const connect = () => {
    if (!url.trim()) return; setBusy(true); setMsg(null);
    call("exchange", { redirect_url: url.trim() }).then((r) => {
      if (r.ok) { setMsg({ ok: true, text: `Connected — expires in ${r.days_left} days.` }); setOpen(false); setUrl(""); loadStatus(); }
      else setMsg({ ok: false, text: r.error || "Exchange failed." });
    }).catch((e) => setMsg({ ok: false, text: String(e) })).finally(() => setBusy(false));
  };

  const btn = { height: 30, padding: "0 13px", borderRadius: "var(--radius-xs)", border: "1px solid var(--line-3)", background: "var(--surface-inset)", color: "var(--text-primary)", font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)", cursor: "pointer", whiteSpace: "nowrap" };
  return (
    <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Ico name="key-round" size={15} />
          <span style={{ font: "var(--w-semibold) var(--t-sm)/1 var(--font-sans)", color: "var(--text-primary)" }}>Schwab connection</span>
          <span style={{ font: "var(--w-semibold) var(--t-xs)/1 var(--font-sans)", color: tone }}>· {label}</span>
        </span>
        <button onClick={startLogin} style={btn}>Re-auth Schwab</button>
      </div>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ font: "var(--w-regular) var(--t-xs)/1.5 var(--font-sans)", color: "var(--text-secondary)" }}>
            A Schwab login opened in a new tab — log in and approve. Schwab then bounces you to a page that won't load (that's fine); copy its full URL (starts with <code>https://127.0.0.1/?code=…</code>) and paste it here:
          </span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://127.0.0.1/?code=…"
              style={{ flex: 1, minWidth: 220, height: 30, padding: "0 10px", borderRadius: "var(--radius-xs)", border: "1px solid var(--line-3)", background: "var(--surface-card)", color: "var(--text-primary)", font: "var(--w-regular) var(--t-xs)/1 var(--font-mono)" }} />
            <button onClick={connect} disabled={busy} style={{ ...btn, opacity: busy ? 0.6 : 1 }}>{busy ? "Connecting…" : "Connect"}</button>
          </div>
        </div>
      )}
      {msg && <span style={{ font: "var(--w-medium) var(--t-xs)/1.4 var(--font-sans)", color: msg.ok ? "var(--profit)" : "var(--loss)" }}>{msg.text}</span>}
    </div>
  );
}

function SourcesPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const [, force] = React.useState(0);
  React.useEffect(() => { const h = () => force((x) => x + 1); window.addEventListener("nt-data", h); return () => window.removeEventListener("nt-data", h); }, []);
  React.useEffect(() => { const id = setInterval(() => force((x) => x + 1), 15000); return () => clearInterval(id); }, []);  // re-tick so a finished-command badge ages out on its own
  // Brokers live in two tables — broker_accounts (options/Schwab) and
  // equity_broker_accounts (swings/IBKR) — but both now carry the same stored shape
  // (account_ref + settings{account_value, synced_at}), so both are fetched fresh here and
  // rendered by ONE shared row builder. The cached NT_DATA list predates the new columns.
  const [optBrokers, setOptBrokers] = React.useState(null);
  const [eqBrokers, setEqBrokers] = React.useState(null);
  React.useEffect(() => {
    const db = window.NT_CLIENT;
    if (!db) return;
    db.from("broker_accounts").select("*").order("id").then(function (r) {
      if (r && !r.error && r.data) setOptBrokers(r.data);
    }, function () { /* offline — fall back to the cached list */ });
    db.from("equity_broker_accounts").select("*").order("id").then(function (r) {
      if (r && !r.error && r.data) setEqBrokers(r.data);
    }, function () { /* offline — keep the placeholder row */ });
  }, []);
  const brokers = optBrokers || window.NT_DATA.brokerAccounts || [];
  const hasIbkr = (eqBrokers || []).some((b) => /ibkr|interactive/i.test(String(b.broker || b.label || "")))
    || brokers.some((b) => /ibkr|interactive/i.test(String(b.broker || b.provider || b.label || "")));
  const strategies = window.NT_DATA.strategies || [];
  const machines = window.NT_DATA.machines || [];
  const cmds = window.NT_DATA.machineCommands || [];   // newest first (id desc)
  // One default strategy PER WORLD. Each select lists only its own world's strategies and
  // stores its own key, so picking a futures default can never bleed into options.
  const [, bumpView] = React.useState(0);
  // Evaluated lazily from JSX: it uses `cap` and NT_DATA fields declared further down, and an
  // eager IIFE here would throw before first paint — one undefined name blanked this whole
  // page once already.
  const worldStratRows = function () {
    const byWorld = {
      options: strategies.filter((x) => (x.category || "options") === "options"),
      swings: (window.NT_DATA.equityStrategies || []),
      futures: strategies.filter((x) => x.category === "futures"),
    };
    return ["options", "swings", "futures"].filter((w) => (byWorld[w] || []).length).map((w) => {
      const list = byWorld[w];
      const cur = String((window.NT_VIEW_FOR && window.NT_VIEW_FOR(w)) || "all");
      const val = list.some((x) => String(x.id) === cur) ? cur : "all";
      return (
        <div key={w} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 12 }}>
          <span style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)", color: "var(--text-secondary)" }}>{cap(w)}</span>
          <NT_Select value={val} icon="filter" minWidth={240}
            options={[{ value: "all", label: "All strategies" }]
              .concat(list.map((x) => ({ value: String(x.id), label: x.name })))}
            onChange={(v) => { window.NT_SET_VIEW(v, w); bumpView((n) => n + 1); }} />
        </div>
      );
    });
  };
  const range = String(window.NT_DATA.dateRange || "week");
  const defaultRange = String(window.NT_DATA.dateRangeDefault || "week");
  const [form, setForm] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  // ---- sources (fetched here: NT_DATA's cached copy predates category/type/window) ----
  const [srcRows, setSrcRows] = React.useState(null);
  const loadSources = React.useCallback(() => {
    const db = window.NT_CLIENT;
    if (!db) return;
    db.from("sources").select("*").order("id").then(function (r) {
      if (r && !r.error && r.data) setSrcRows(r.data);
    }, function () { /* offline — keep the cached list */ });
  }, []);
  React.useEffect(() => { loadSources(); }, [loadSources]);
  const sources = srcRows || (window.NT_DATA.sources || []);
  // What the row says under the name. The URL is long and noisy — it belongs in the
  // editor, not in a list you scan.
  const typeLabel = (x) => {
    const t = (x.type || "discord").toLowerCase();
    if (t === "discord") return "Discord channel";
    if (t === "sheet") return "Published sheet (CSV)";
    return t;
  };
  const catOf = (s) => s.category || "options";           // missing => the original world
  const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);
  // The worlds come from the rows themselves, so a future 'futures' category groups itself
  // without a code change. Options and Swings are always listed because Settings is the way
  // INTO a world that has no source row yet.
  const cats = Array.from(new Set(["options", "swings"].concat(sources.map(catOf)))).sort();

  // ---- swing world bootstrap (the sidebar's Options/Swings switch only appears once a
  //      swing strategy exists, so the first one is created from here) ----
  const [nSwing, setNSwing] = React.useState(null);
  const loadSwing = React.useCallback(() => {
    const db = window.NT_CLIENT;
    if (!db) return;
    db.from("equity_strategies").select("id").then(function (r) {
      if (r && !r.error && r.data) setNSwing(r.data.length);
    }, function () { /* offline/demo — no swing world */ });
  }, []);
  React.useEffect(() => { loadSwing(); }, [loadSwing]);
  const [creatingSwing, setCreatingSwing] = React.useState(false);
  const createSwing = async () => {
    setCreatingSwing(true);
    try {
      const r = await window.NT_CLIENT.from("equity_strategies").insert({
        name: "Macrotrends follow", account: "paper", paused: true,
        sizing_mode: "tiers_usd", source: "macrotrends_sheet",
      });
      if (r.error) throw r.error;
      window.NT_HAS_SWINGS = true;                       // reveal the Options/Swings switch
      window.dispatchEvent(new Event("nt-data"));
      loadSwing();
      await window.NT_ALERT("Created. Use the Options / Swings switch at the top of the menu to open it — "
        + "it starts paused and on paper, so nothing is ordered yet.", { title: "Swing trading" });
    } catch (e) { await window.NT_ALERT("Couldn’t create: " + (e.message || e), { title: "Swing trading" }); }
    setCreatingSwing(false);
  };

  // ---- default page per category ----
  // Which world's dashboard opens on sign-in. Stored PER USER in `user_prefs` so it follows
  // the person across machines (unlike the default date range, which is device-local).
  const [homeCat, setHomeCatState] = React.useState("options");
  React.useEffect(() => {
    const db = window.NT_CLIENT;
    if (!db || !window.NT_USER_EMAIL) return;
    db.from("user_prefs").select("prefs").eq("user_email", window.NT_USER_EMAIL).maybeSingle()
      .then(function (r) {
        const v = ((r && r.data && r.data.prefs) || {}).home_category;
        if (v) { setHomeCatState(v); window.NT_HOME_CATEGORY = v; }
      }, function () { /* offline — default to options */ });
  }, []);
  const setHomeCat = async (v) => {
    setHomeCatState(v);                                 // optimistic; the select is instant
    window.NT_HOME_CATEGORY = v;
    const db = window.NT_CLIENT;
    if (!db || !window.NT_USER_EMAIL) return;
    try {
      const cur = await db.from("user_prefs").select("prefs").eq("user_email", window.NT_USER_EMAIL).maybeSingle();
      const prefs = Object.assign({}, (cur && cur.data && cur.data.prefs) || {}, { home_category: v });
      await db.from("user_prefs").upsert({ user_email: window.NT_USER_EMAIL, prefs: prefs,
                                           updated_at: new Date().toISOString() },
                                         { onConflict: "user_email" });
    } catch (e) { await window.NT_ALERT("Couldn't save that: " + (e.message || e), { title: "Default view" }); }
  };

  // ---- sheet freshness (for a sheet source's "checked …" line) ----
  // Newest portfolio snapshot = the last time the poller actually pulled the sheet.
  const [sheetSeen, setSheetSeen] = React.useState(null);
  React.useEffect(() => {
    const db = window.NT_CLIENT;
    if (!db) return;
    db.from("sheet_snapshots").select("fetched_at").eq("tab", "portfolio").order("fetched_at", { ascending: false }).limit(1)
      .then(function (r) {
        const rows = (r && r.data) || [];
        if (rows.length && rows[0].fetched_at) setSheetSeen(rows[0].fetched_at);
      }, function () { /* offline — just show no stamp */ });
  }, []);

  const INP = { height: 38, padding: "0 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-strong)", background: "var(--surface-inset)", color: "var(--text-primary)", colorScheme: "dark", font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)", width: "100%", boxSizing: "border-box" };

  // ---- shared table styles (match TradesPage) ----
  const th = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "11px 16px", textAlign: "left", whiteSpace: "nowrap", borderBottom: "1px solid var(--border)" };
  const thR = { ...th, textAlign: "right" };
  const td = { font: "var(--w-regular) var(--t-sm)/1.3 var(--font-sans)", padding: "13px 16px", borderTop: "1px solid var(--border)", textAlign: "left", color: "var(--text-primary)", verticalAlign: "middle" };
  const tdR = { ...td, textAlign: "right" };
  const ICON = { width: 32, height: 32, flex: "none", borderRadius: "var(--radius-md)", background: "var(--surface-inset)", border: "1px solid var(--border)", display: "grid", placeItems: "center", color: "var(--text-secondary)" };

  // ---- one item = one row (shared by the sources list and the broker list, so both
  //      cards read the same way instead of being two different tables) ----
  const catLabel = (text, gi, right) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 18px 6px", color: "var(--text-tertiary)", font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", borderTop: gi ? "1px solid var(--border)" : "none" }}>
      <span>{text}</span>
      {right ? <span style={{ textTransform: "none", letterSpacing: "var(--ls-snug)" }}>{right}</span> : null}
    </div>
  );
  const mutedRow = (text) => (
    <div style={{ padding: "12px 18px", font: "var(--w-regular) var(--t-sm)/1.3 var(--font-sans)", color: "var(--text-tertiary)" }}>{text}</div>
  );
  const itemRow = (key, o) => (
    <div key={key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderTop: o.first ? "none" : "1px solid var(--border)", opacity: o.dim ? 0.75 : 1 }}>
      <span style={{ flex: "none", display: "inline-flex" }}><Ico name={o.icon || "rss"} size={19} color="var(--text-tertiary)" /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: "var(--w-medium) var(--t-sm)/1.25 var(--font-sans)", color: "var(--text-primary)" }}>{o.name || "—"}</div>
        <div title={o.sub || ""} style={{ font: "var(--w-regular) var(--t-2xs)/1.35 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.sub || "—"}</div>
      </div>
      {(o.meta || o.meta2) ? (
        <div style={{ textAlign: "right", flex: "none" }}>
          <div style={{ font: "var(--w-regular) var(--t-xs)/1.25 var(--font-sans)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{o.meta || "—"}</div>
          <div style={{ font: "var(--w-regular) var(--t-2xs)/1.35 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 3, whiteSpace: "nowrap" }}>{o.meta2 || "—"}</div>
        </div>
      ) : null}
      {o.pill ? <span style={{ flex: "none", display: "inline-flex" }}>{o.pill}</span> : null}
      {o.actions ? <span style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>{o.actions}</span> : null}
    </div>
  );

  // `w0` remembers the window the editor opened with, so save() can tell whether the
  // user actually changed it (see the session_config mirror in save()).
  const winKey = (a, b) => (a || "") + "→" + (b || "");
  const openNew = (c) => setForm({ id: null, name: "", type: c === "swings" ? "sheet" : "discord", category: c || "options", channel_url: "", enabled: true, window_start_et: "", window_end_et: "", w0: winKey("", "") });
  const openEdit = (s) => setForm({ id: s.id, name: s.name || "", type: s.type || "discord", category: catOf(s), channel_url: s.channel_url || "", enabled: !!s.enabled, window_start_et: s.window_start_et || "", window_end_et: s.window_end_et || "", w0: winKey(s.window_start_et, s.window_end_et) });
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const typeOf = (s) => s.type || "discord";              // missing => the original kind
  const iconOf = (s) => { const t = typeOf(s); return t === "discord" ? "message-square-dot" : t === "sheet" ? "table-2" : "rss"; };
  // The URL is context, not the headline — drop the scheme so the readable part fits.
  const urlOf = (s) => { const u = s.channel_url || ""; return u ? u.replace(/^https:\/\//, "") : "—"; };
  // A sheet source is polled on its own schedule; a discord source is watched inside a window.
  const schedOf = (s) => {
    const a = s.window_start_et || "", b = s.window_end_et || "";
    if (a && b) return a + " – " + b + " ET";
    return typeOf(s) === "sheet" ? "every 5 min" : "always on";
  };
  const freshOf = (s) => {
    const t = typeOf(s);
    if (t === "sheet") return sheetSeen ? "checked " + ago(sheetSeen) : "—";
    return t === "discord" ? "weekdays" : "—";
  };
  const typeOptions = (t) => {
    const base = ["discord", "sheet"];
    return t && base.indexOf(t) < 0 ? base.concat([t]) : base;   // never silently retype a legacy row
  };
  const catOptions = (c) => (c && cats.indexOf(c) < 0 ? cats.concat([c]) : cats);
  // Helper line under the window inputs — an empty window means something different for a
  // sheet (it just keeps polling) than for a watched Discord channel.
  const winHint = (f) => {
    if (!f) return { text: "", tone: "var(--text-tertiary)" };
    if (f.type === "sheet" && !f.window_start_et && !f.window_end_et) {
      return { text: "Empty — polls all day, every 5 minutes.", tone: "var(--profit)" };
    }
    return { text: "Entries are only taken inside this window. Leave empty for a source that runs all day.", tone: "var(--text-tertiary)" };
  };

  const save = async () => {
    if (!form.name.trim()) { await window.NT_ALERT("Give the source a name.", { title: "Source" }); return; }
    setSaving(true);
    const payload = { name: form.name.trim(), type: form.type, category: form.category || "options",
      channel_url: form.channel_url.trim() || null, enabled: !!form.enabled,
      window_start_et: form.window_start_et || null, window_end_et: form.window_end_et || null,
      updated_at: new Date().toISOString() };
    try {
      const r = form.id ? await window.NT_CLIENT.from("sources").update(payload).eq("id", form.id)
                        : await window.NT_CLIENT.from("sources").insert(payload);
      if (r.error) throw r.error;
      // TEMPORARY: the engine still reads its Discord schedule from the single global
      // session_config row (streaming_start_et / streaming_end_et), not from a source's
      // own window — so mirror a changed discord window there or the bot ignores it.
      // Remove this block once the engine reads window_start_et / window_end_et per source.
      const wNow = winKey(form.window_start_et, form.window_end_et);
      if (form.type === "discord" && wNow !== form.w0 && form.window_start_et && form.window_end_et) {
        const sc = await window.NT_CLIENT.from("session_config").update({
          streaming_start_et: form.window_start_et, streaming_end_et: form.window_end_et,
          updated_at: new Date().toISOString(),
        }).eq("id", 1);
        if (sc.error) throw sc.error;
      }
      await window.NT_REFRESH(); loadSources(); setForm(null);
    } catch (e) { await window.NT_ALERT("Save failed: " + (e.message || e), { title: "Source" }); }
    setSaving(false);
  };
  const toggle = async (s) => {
    try { const r = await window.NT_CLIENT.from("sources").update({ enabled: !s.enabled, updated_at: new Date().toISOString() }).eq("id", s.id); if (r.error) throw r.error; await window.NT_REFRESH(); loadSources(); }
    catch (e) { await window.NT_ALERT("Couldn’t update: " + (e.message || e), { title: "Source" }); }
  };
  const del = async (s) => {
    if (!(await window.NT_CONFIRM("Delete source “" + s.name + "”? Past alerts keep their tag.", { title: "Delete source", ok: "Delete", danger: true }))) return;
    try { const r = await window.NT_CLIENT.from("sources").delete().eq("id", s.id); if (r.error) throw r.error; await window.NT_REFRESH(); loadSources(); }
    catch (e) { await window.NT_ALERT("Delete failed: " + (e.message || e), { title: "Source" }); }
  };

  // Green = live, muted = off. Pass onClick to make it the toggle itself.
  const pill = (text, on, onClick) => {
    const st = { display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 9px", borderRadius: "var(--radius-sm)", border: "1px solid transparent", background: on ? "var(--profit-bg)" : "var(--surface-inset)", color: on ? "var(--profit)" : "var(--text-tertiary)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)" };
    const dot = <span style={{ width: 6, height: 6, borderRadius: "50%", background: on ? "var(--profit)" : "var(--text-tertiary)" }}></span>;
    if (!onClick) return <span style={st}>{dot}{text}</span>;
    return <button type="button" onClick={onClick} title={on ? "Turn this source off" : "Turn this source on"} style={{ ...st, cursor: "pointer" }}>{dot}{text}</button>;
  };

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
    catch (e) { await window.NT_ALERT("Couldn’t send command: " + (e.message || e), { title: "Server command" }); }
  };
  const removeMachine = async (mid) => {
    if (!(await window.NT_CONFIRM("Remove “" + mid + "”? It'll come back on its own if that server checks in again — use this to clear a stale/duplicate entry.", { title: "Remove server", ok: "Remove", danger: true }))) return;
    try { const r = await window.NT_CLIENT.from("machines").delete().eq("machine_id", mid); if (r.error) throw r.error; await window.NT_REFRESH(); }
    catch (e) { await window.NT_ALERT("Couldn’t remove: " + (e.message || e), { title: "Remove server" }); }
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
      <span title={offProblem ? "In the trading window but not reporting — check this server" : on ? "Bot running" : "Outside the trading window — starts itself at the next session"}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 9px", borderRadius: "var(--radius-sm)", letterSpacing: "var(--ls-caps)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)",
        background: bg, color: col, border: act ? "1px solid var(--violet-line)" : offProblem ? "1px solid var(--loss-line)" : "1px solid transparent" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: col, animation: act ? "nt-pulse var(--blink) var(--ease-in-out) infinite" : "none" }}></span>
        {label}
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <style>{`
        /* Three config cards side by side once there is room for them (Dashboard,
           Brokers, Alert sources), two on a laptop, one on a narrow window. The cap
           keeps a card from stretching to an unreadable width on a very wide display. */
        /* stretch, not start: the three cards read as one row, so they share the height of
           the tallest instead of each stopping at its own content. */
        .nt-set3{ display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: var(--gap-grid); align-items:stretch; }
        .nt-set3 > *{ height:100%; box-sizing:border-box; }
        @media (max-width: 1500px){ .nt-set3{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
        @media (max-width: 900px){ .nt-set3{ grid-template-columns: 1fr; } }
      `}</style>
      <PageHead title="Settings" subtitle="Dashboard defaults, alert sources, broker accounts and your servers" />

      {/* ---- Dashboard defaults + brokers + alert sources, side by side ---- */}
      <div className="nt-set3">
        <NT.Card title="Dashboard" padding={20}>
          {/* The world comes first: it decides which dashboard you land on, and every choice
              below it is a choice WITHIN a world. */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "nowrap" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ font: "var(--w-semibold) var(--t-body)/1.2 var(--font-sans)", color: "var(--text-primary)" }}>Default world</div>
              <div style={{ font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-secondary)", marginTop: 4 }}>Which dashboard opens when you sign in.</div>
            </div>
            <NT_Select value={homeCat} icon="layout-dashboard" minWidth={240}
              options={cats.map((c) => ({ value: c, label: cap(c) + " dashboard" }))}
              onChange={(v) => setHomeCat(v)} />
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div style={{ font: "var(--w-semibold) var(--t-body)/1.2 var(--font-sans)", color: "var(--text-primary)" }}>Default strategy</div>
            <div style={{ font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-secondary)", marginTop: 4 }}>Per world: which strategy its dashboard shows when it first opens.</div>
            {worldStratRows()}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "nowrap", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ font: "var(--w-semibold) var(--t-body)/1.2 var(--font-sans)", color: "var(--text-primary)" }}>Default date range</div>
              <div style={{ font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-secondary)", marginTop: 4 }}>The range the dashboard opens on each time. The date pickers on the pages change your current view for the session — they don’t change this default.</div>
            </div>
            <DateFilter value={defaultRange} onChange={(v, b) => window.NT_SET_DEFAULT_RANGE(v, b)} />
          </div>
        </NT.Card>
  
        {/* ---- Alert sources — every world in one list, one row per source, grouped under a
               category label. A source's own schedule now lives in its editor. ---- */}
        <NT.Card padding={20} bodyStyle={{ padding: 0 }}
          title={(
            <span style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
              Brokers
              <span style={{ font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", letterSpacing: "var(--ls-normal)", color: "var(--text-tertiary)" }}>Connect once — any strategy can use it.</span>
            </span>
          )}>
          {/* ONE builder for every broker row, whichever world it belongs to. LINKED must
              mean CHECKED RECENTLY (a daily sync stamps synced_at) — a broker that stopped
              reporting says STALE rather than pretending. */}
          {(function () {
            const row = (key, b, world, brand, first) => {
              const s = b.settings || {};
              const sym = { EUR: "€", GBP: "£", USD: "$", CAD: "C$" }[s.currency] || "$";
              const val = s.account_value != null ? sym + String(Math.round(s.account_value)) : null;
              const ageH = s.synced_at ? (Date.now() - new Date(s.synced_at).getTime()) / 36e5 : null;
              const fresh = ageH != null && ageH < 26;
              return itemRow(key, {
                first,
                icon: "landmark",
                name: b.label || brand,
                sub: (b.account_ref ? "••••" + String(b.account_ref).slice(-4) : "no account id") + " · " + world,
                meta: val ? val + " account value" : brand,
                meta2: s.synced_at ? (fresh ? "checked " + ago(s.synced_at) : "not checked in over a day")
                                   : "not checked yet",
                pill: pill(fresh ? "LINKED" : "STALE", fresh),
              });
            };
            // IBKR leads: it is the broker that holds the swings book the user watches daily.
            return ((eqBrokers || []).map((b, i) => row("eq" + b.id, b, "swings", "Interactive Brokers", i === 0)))
              .concat(brokers.map((b) => row(b.id, b, "options", "Charles Schwab", !(eqBrokers || []).length)));
          })()}
          {/* Swings need IBKR for European & Canadian listings — show it as a greyed-out
              row so the gap is visible before it exists. */}
          {!hasIbkr ? itemRow("ibkr", {
            first: true,
            dim: true,
            icon: "landmark",
            name: "Interactive Brokers",
            sub: "needed for swings — European & Canadian listings",
            actions: (
              <NT.Button variant="ghost" size="sm" onClick={() => window.NT_ALERT("Coming next — IBKR setup runs on your own machine and needs a weekly sign-in.", { title: "Interactive Brokers" })}>Connect</NT.Button>
            ),
          }) : null}
          <SchwabReauth />
        </NT.Card>
  
      <NT.Card title="Alert sources" padding={20} bodyStyle={{ padding: 0 }}>
        {cats.map((c, gi) => {
          const rows = sources.filter((s) => catOf(s) === c);
          return (
            <div key={c}>
              {catLabel(c, gi, c === "swings" && nSwing === 0 ? (
                <NT.Button variant="ghost" size="sm" disabled={creatingSwing} onClick={createSwing}>{creatingSwing ? "Creating…" : "Get started"}</NT.Button>
              ) : null)}
              {rows.map((s, i) => itemRow(s.id, {
                first: i === 0,
                dim: !s.enabled,
                icon: iconOf(s),
                name: s.name,
                sub: typeLabel(s),
                meta: schedOf(s),
                meta2: freshOf(s),
                pill: pill(s.enabled ? "ON" : "OFF", !!s.enabled, () => toggle(s)),
                actions: (
                  <React.Fragment>
                    <NT.Button variant="ghost" size="sm" onClick={() => openEdit(s)}>Edit</NT.Button>
                    {iconBtn("Delete", "trash-2", () => del(s), false)}
                  </React.Fragment>
                ),
              }))}
              {!rows.length && mutedRow("No source yet.")}
            </div>
          );
        })}
        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)" }}>
          Changes take effect at the next session. A Discord source needs its own browser login.
        </div>
      </NT.Card>
      </div>

      {/* ---- Servers (failover machines, shared) — full width: it is a real table ---- */}

      {/* ---- Brokers (shared) — same one-row-per-item layout as the sources list. ---- */}
      <NT.Card title="Servers" padding={20} bodyStyle={{ padding: machines.length ? 0 : 20 }}
        action={machines.length ? <span style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>{machines.length} server{machines.length === 1 ? "" : "s"}</span> : null}>
        {machines.length ? (
          <React.Fragment>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
              <thead><tr><th style={th}>Server</th><th style={th}>Status</th><th style={th}>Health</th><th style={th}>Last seen</th><th style={thR}>Controls</th></tr></thead>
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
            <b style={{ color: "var(--text-secondary)" }}>OFF-HOURS</b> = outside the trading window; the server starts itself at the next session ({nextLabel}). <b style={{ color: "var(--loss)" }}>OFFLINE</b> only shows if a server goes missing <i>during</i> a session.
          </div>
          </React.Fragment>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span style={ICON}><Ico name="server" size={16} /></span>
              <div>
                <div style={{ font: "var(--w-semibold) var(--t-body)/1.2 var(--font-sans)", color: "var(--text-primary)" }}>Connect a server</div>
                <div style={{ font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-secondary)", marginTop: 4 }}>Your nitro-trader folder is already on every Mac via iCloud — connecting each one is a single double-click.</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "var(--surface-inset)", border: "1px solid var(--border)" }}>
              <Ico name="mouse-pointer-click" size={15} style={{ color: "var(--text-secondary)" }} />
              <span style={{ font: "var(--w-medium) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-primary)" }}>On each Mac: Documents → nitro-trader → double-click <b>Connect-this-Mac.command</b></span>
            </div>
            <div style={{ font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)" }}>
              It installs the bot on that Mac, opens a browser for its one-time Discord login (Schwab is already shared — no second login), and schedules it. The server shows up here within seconds — verify / restart / re-login / pause / failover are all dashboard buttons from then on. (First time, right-click → Open if macOS warns.) Each server runs only during the trading window, not 24/7.
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
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 160 }}><span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Category</span>
                <select value={form.category} onChange={(e) => setF("category", e.target.value)} style={INP}>
                  {catOptions(form.category).map((c) => <option key={c} value={c}>{c}</option>)}
                </select></label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 160 }}><span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Type</span>
                <select value={form.type} onChange={(e) => setF("type", e.target.value)} style={INP}>
                  {typeOptions(form.type).map((t) => <option key={t} value={t}>{t}</option>)}
                </select></label>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{form.type === "sheet" ? "CSV URL" : "Discord channel URL"}</span><input value={form.channel_url} onChange={(e) => setF("channel_url", e.target.value)} placeholder={form.type === "sheet" ? "Published CSV link" : "Empty = use the bot's default DISCORD_CHANNEL_URL"} style={INP} /></label>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 2, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>When it runs</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="time" value={form.window_start_et} onChange={(e) => setF("window_start_et", e.target.value)} style={{ ...INP, width: 92 }} />
                <span style={{ font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>to</span>
                <input type="time" value={form.window_end_et} onChange={(e) => setF("window_end_et", e.target.value)} style={{ ...INP, width: 92 }} />
                <span style={{ font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>ET</span>
              </div>
              <span style={{ font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: winHint(form).tone }}>{winHint(form).text}</span>
            </div>
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

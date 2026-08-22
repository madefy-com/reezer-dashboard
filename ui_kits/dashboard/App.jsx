const NT_HOME_PAGE = { options: "dashboard", swings: "swings-dashboard", futures: "futures-dashboard" };

/* Operator-attention banner: surfaces unseen operator_flags (e.g. an ambiguous
   alert the bot had to guess on). Red strip under the status bar; Dismiss sets
   seen=1 in Supabase so it stays cleared across reloads. */
function FlagBanner() {
  const [dismissed, setDismissed] = React.useState({});
  const flags = ((window.NT_DATA && window.NT_DATA.flags) || [])
    .filter((f) => !f.seen && !dismissed[f.id]);
  if (!flags.length) return null;
  const dismiss = (id) => {
    setDismissed((d) => Object.assign({}, d, { [id]: true }));
    try {
      const c = window.NT_CLIENT;
      if (c) c.from("operator_flags").update({ seen: 1 }).eq("id", id).then(function () {}, function () {});
    } catch (e) { /* offline/demo — local hide is enough */ }
  };
  // A completed live order (closed / filled / placed) is INFORMATIONAL, not a problem —
  // it must NOT look like the red "Review needed" alarm (a +$82 take-profit did). Only real
  // issues (reject, unfilled, not-flat, not-ready, ambiguous alert) stay red.
  const PROBLEM = /reject|not filled|unfilled|fail|unmanaged|still open|not flat|check schwab|not ready|oversold|crash|expired/i;
  const GOOD = /closed|filled|placed|\bsold\b|\bbought\b/i;
  const isInfo = (f) => GOOD.test(f.message || "") && !PROBLEM.test(f.message || "");
  return (
    <div style={{ flex: "0 0 auto" }}>
      {flags.map((f) => {
        const ok = isInfo(f);
        const s = ok
          ? { bg: "rgba(148,163,184,0.12)", bd: "rgba(148,163,184,0.40)", tx: "#cbd5e1", hd: "#e2e8f0", icon: "check-circle", label: "Live order" }
          : { bg: "rgba(220,38,38,0.12)", bd: "rgba(220,38,38,0.45)", tx: "#fca5a5", hd: "#fecaca", icon: "alert-triangle", label: "Review needed" };
        return (
          <div key={f.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 26px", background: s.bg,
            borderBottom: "1px solid " + s.bd,
            color: s.tx, font: "500 13px/1.4 var(--font-sans)",
          }}>
            <i data-lucide={s.icon} style={{ width: 16, height: 16, flex: "0 0 auto" }} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <b style={{ color: s.hd }}>{s.label}{f.ticker ? " · " + f.ticker : ""}</b>
              {"  "}{f.message}
            </span>
            <button onClick={() => dismiss(f.id)} style={{
              flex: "0 0 auto", cursor: "pointer", background: "transparent",
              border: "1px solid " + s.bd, color: s.hd,
              borderRadius: 8, padding: "4px 12px", font: "600 12px var(--font-sans)",
            }}>Dismiss</button>
          </div>
        );
      })}
    </div>
  );
}

/* Watchdog: the dashboard's own health check. During the streaming window, if NO box is
   actively trading, show a loud red banner — this is exactly the "schedule failed / bot
   crashed / box asleep" case that otherwise fails silently. Recomputes every second (the
   App clock tick re-renders this child). */
function WatchdogBanner() {
  let sess = null;
  try { sess = window.ntSession(new Date()); } catch (e) { return null; }
  if (!sess || !sess.scanning) return null;                 // only during the trading window
  const machines = (window.NT_DATA && window.NT_DATA.machines) || [];
  const online = (m) => m.last_seen && (Date.now() - new Date(m.last_seen).getTime()) < 120000;
  if (machines.some((m) => m.active && online(m))) return null;   // a box is trading -> all good
  const anyOnline = machines.some(online);
  const msg = anyOnline
    ? "A server is online but none is actively trading (standby or paused) — new alerts won't be acted on."
    : "No server is running. The streaming window is open but none is online — alerts aren't being caught.";
  return (
    <div style={{ flex: "0 0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 26px",
        background: "rgba(220,38,38,0.18)", borderBottom: "1px solid rgba(220,38,38,0.6)",
        color: "#fca5a5", font: "600 13px/1.4 var(--font-sans)" }}>
        <i data-lucide="alert-octagon" style={{ width: 17, height: 17, flex: "0 0 auto" }} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <b style={{ color: "#fecaca" }}>Session at risk</b>{"  "}{msg}
        </span>
        <span style={{ flex: "0 0 auto", font: "500 12px var(--font-sans)", color: "#fecaca", opacity: 0.9 }}>Settings → Machines</span>
      </div>
    </div>
  );
}

/* App — Reezer operator dashboard shell with page routing. */
function App() {
  // The hash carries the world, so refreshing keeps you where you were rather than jumping
  // to your default. Reading it here (not in an effect) means the first paint is already
  // the right world — no flash of the wrong one.
  const fromHash = () => {
    const h = String(window.location.hash || "").replace(/^#\/?/, "").trim();
    const w = h.split("/")[0];
    return ["options", "swings", "futures"].indexOf(w) >= 0 ? w : null;
  };
  const initialWorld = fromHash();
  const [page, setPage] = React.useState(initialWorld ? (NT_HOME_PAGE[initialWorld] || "dashboard") : "dashboard");
  const [world, setWorld] = React.useState(initialWorld || "options");
  const [mode, setMode] = React.useState(window.NT_DATA.session.mode);
  const _anyKill = () => (window.NT_DATA.strategies || []).some((s) => s.params && s.params.kill_switch);
  const [kill, setKill] = React.useState(() => (_anyKill() ? "TRIPPED" : "ARMED"));
  const [clock, setClock] = React.useState("");

  // Live push: realtime.js fires "nt-data" -> re-render + re-sync mode/kill from data.
  const [, forceLive] = React.useState(0);
  React.useEffect(() => {
    const h = () => {
      forceLive((v) => v + 1);
      setMode(window.NT_DATA.session.mode);
      setKill(_anyKill() ? "TRIPPED" : "ARMED");
    };
    window.addEventListener("nt-data", h);
    return () => window.removeEventListener("nt-data", h);
  }, []);

  const strategies = window.NT_DATA.strategies || [];  // read fresh; StrategiesPage owns edits

  React.useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  });
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.75 } }); });

  // Probe the swing world once so the sidebar's world switcher can appear before any
  // swing page has ever been opened (SwingsPage keeps the flag fresh from then on).
  React.useEffect(() => {
    const db = window.NT_CLIENT;
    if (!db) return;
    // Which world to open on. Per-user (user_prefs), so it follows you between machines.
    if (window.NT_USER_EMAIL) {
      db.from("user_prefs").select("prefs").eq("user_email", window.NT_USER_EMAIL).maybeSingle()
        .then(function (r) {
          const c = ((r && r.data && r.data.prefs) || {}).home_category;
          if (fromHash()) return;                      // the URL wins over the saved default
          if (c && c !== "options") {                  // options is already the initial state
            window.NT_HOME_CATEGORY = c;
            setWorld(c);
            setPage(NT_HOME_PAGE[c] || "dashboard");
          }
        }, function () { /* offline — stay on options */ });
    }
    db.from("equity_strategies").select("id").limit(1).then(function (r) {
      const has = !!(r && r.data && r.data.length);
      if (has !== (window.NT_HAS_SWINGS === true)) {
        window.NT_HAS_SWINGS = has;
        window.dispatchEvent(new Event("nt-data"));
      }
    }, function () { /* offline/demo — no swing world */ });
    // Same probe for futures: the world exists as soon as its alert source does, so the
    // picker can show it before any futures page has been opened.
    db.from("sources").select("id").eq("category", "futures").limit(1).then(function (r) {
      const has = !!(r && r.data && r.data.length);
      if (has !== (window.NT_HAS_FUTURES === true)) {
        window.NT_HAS_FUTURES = has;
        window.dispatchEvent(new Event("nt-data"));
      }
    }, function () { /* offline — no futures world */ });
  }, []);

  // Switching worlds always lands on that world's dashboard, and writes the world into the
  // URL so a refresh (or a bookmark, or a link) returns to the same place.
  const goWorld = (w) => {
    setWorld(w);
    setPage(NT_HOME_PAGE[w] || "dashboard");
    try { window.history.replaceState(null, "", "#/" + w); } catch (e) {}
  };

  // Keep the URL honest on first load too, and follow the back/forward buttons.
  React.useEffect(() => {
    try {
      if (!String(window.location.hash || "").replace(/^#\/?/, "").trim()) {
        window.history.replaceState(null, "", "#/" + world);
      }
    } catch (e) {}
    const onHash = () => {
      const w = fromHash();
      if (w && w !== world) { setWorld(w); setPage(NT_HOME_PAGE[w] || "dashboard"); }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [world]);

  const renderPage = () => {
    if (page.indexOf("swings-") === 0) return <SwingsPage page={page} />;
    if (page.indexOf("futures-") === 0) return <FuturesPage page={page} />;
    if (page === "trades") return <TradesPage />;
    if (page === "activity") return <ActivityPage />;
    if (page === "log") return <LogPage />;
    if (page === "backtesting") return <BacktestingPage />;
    if (page === "fronttest") return <FronttestPage />;
    if (page === "updates") return <ChangelogPage />;
    if (page === "strategies") return <StrategiesPage />;
    if (page === "advisor") return <AdvisorPage />;
    if (page === "sources" || page === "settings") return <SourcesPage />;
    return <DashboardPage mode={mode} kill={kill} />;
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-app)" }}>
      <Sidebar page={page} onNav={setPage} world={world} onWorld={goWorld} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <StatusBar mode={mode} setMode={setMode} kill={kill} setKill={setKill} clock={clock} onNav={setPage} strategies={strategies} />
        <FlagBanner />
        <WatchdogBanner />
        <main style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{
            maxWidth: "var(--content-max)", width: "100%", margin: "0 auto",
            padding: page === "advisor" ? 0 : "22px 26px 24px",
            flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
            overflowY: (page === "dashboard" || page === "advisor") ? "hidden" : "auto",
          }}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
Object.assign(window, { App });

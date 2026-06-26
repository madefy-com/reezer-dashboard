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
  return (
    <div style={{ flex: "0 0 auto" }}>
      {flags.map((f) => (
        <div key={f.id} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 26px", background: "rgba(220,38,38,0.12)",
          borderBottom: "1px solid rgba(220,38,38,0.45)",
          color: "#fca5a5", font: "500 13px/1.4 var(--font-sans)",
        }}>
          <i data-lucide="alert-triangle" style={{ width: 16, height: 16, flex: "0 0 auto" }} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <b style={{ color: "#fecaca" }}>Review needed{f.ticker ? " · " + f.ticker : ""}</b>
            {"  "}{f.message}
          </span>
          <button onClick={() => dismiss(f.id)} style={{
            flex: "0 0 auto", cursor: "pointer", background: "transparent",
            border: "1px solid rgba(252,165,165,0.5)", color: "#fecaca",
            borderRadius: 8, padding: "4px 12px", font: "600 12px var(--font-sans)",
          }}>Dismiss</button>
        </div>
      ))}
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
    ? "A box is online but none is actively trading (standby or paused) — new alerts won't be acted on."
    : "No box is running. The streaming window is open but no machine is online — alerts aren't being caught.";
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
  const [page, setPage] = React.useState("dashboard");
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

  const renderPage = () => {
    if (page === "trades") return <TradesPage />;
    if (page === "log") return <LogPage />;
    if (page === "backtesting") return <BacktestingPage />;
    if (page === "fronttest") return <FronttestPage />;
    if (page === "activity") return <ActivityPage />;
    if (page === "updates") return <ChangelogPage />;
    if (page === "strategies") return <StrategiesPage />;
    if (page === "sources" || page === "settings") return <SourcesPage />;
    return <DashboardPage mode={mode} kill={kill} />;
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-app)" }}>
      <Sidebar page={page} onNav={setPage} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <StatusBar mode={mode} setMode={setMode} kill={kill} setKill={setKill} clock={clock} onNav={setPage} strategies={strategies} />
        <FlagBanner />
        <WatchdogBanner />
        <main style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{
            maxWidth: "var(--content-max)", width: "100%", margin: "0 auto", padding: "22px 26px 24px",
            flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
            overflowY: page === "dashboard" ? "hidden" : "auto",
          }}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
Object.assign(window, { App });

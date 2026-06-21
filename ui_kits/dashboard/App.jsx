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

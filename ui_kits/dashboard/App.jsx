/* App — Reezer operator dashboard shell with page routing. */
function App() {
  const [page, setPage] = React.useState("dashboard");
  const [mode, setMode] = React.useState(window.NT_DATA.session.mode);
  // kill switch reflects strategy_params.kill_switch (TRIPPED = killed/positions flattened)
  const [kill, setKill] = React.useState(() => {
    const s = window.NT_DATA.strategies && window.NT_DATA.strategies[0];
    return (s && s.params && s.params.kill_switch) ? "TRIPPED" : "ARMED";
  });
  const [clock, setClock] = React.useState("");

  // Live push: realtime.js fires "nt-data" when Reezer changes -> re-render
  // (children read window.NT_DATA fresh; page/drawer state is preserved).
  const [, forceLive] = React.useState(0);
  React.useEffect(() => {
    const h = () => forceLive((v) => v + 1);
    window.addEventListener("nt-data", h);
    return () => window.removeEventListener("nt-data", h);
  }, []);

  // shared strategies (one active at a time). currentStrat = the one the pill shows.
  const [strategies, setStrategies] = React.useState(() => {
    let live = false;
    return window.NT_DATA.strategies.map((s) => {
      const c = { ...s, params: { ...s.params } };
      if (c.status === "live") { if (live) c.status = "paused"; else live = true; }
      return c;
    });
  });
  const [currentStrat, setCurrentStrat] = React.useState(() => {
    const live = window.NT_DATA.strategies.find((s) => s.status === "live");
    return live ? live.name : window.NT_DATA.strategies[0].name;
  });
  const activateByName = (name) => { setStrategies((prev) => prev.map((s) => s.name === name ? { ...s, status: "live" } : (s.status === "live" ? { ...s, status: "paused" } : s))); setCurrentStrat(name); };
  const pauseByName = (name) => setStrategies((prev) => prev.map((s) => (s.name === name ? { ...s, status: "paused" } : s)));
  const updateByName = (oldName, patch) => { setStrategies((prev) => prev.map((s) => (s.name === oldName ? { ...s, ...patch } : s))); setCurrentStrat((cur) => (cur === oldName && patch.name ? patch.name : cur)); };
  const deleteByName = (name) => { setStrategies((prev) => prev.filter((s) => s.name !== name)); setCurrentStrat((cur) => (cur === name ? null : cur)); };

  React.useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  });

  React.useEffect(() => { if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.75 } }); });

  // Strategy edits (from StrategiesPage) propagate to the header pill + state,
  // and keep the SIMULATION/LIVE mode pill in sync with the strategy's dry_run.
  React.useEffect(() => {
    window.NT_ON_STRAT = (s) => {
      setStrategies([s]); setCurrentStrat(s.name);
      if (s && s.params) setMode(s.params.dry_run === false ? "LIVE" : "SIMULATION");
    };
    return () => { delete window.NT_ON_STRAT; };
  }, []);

  const renderPage = () => {
    if (page === "trades") return <TradesPage />;
    if (page === "log") return <LogPage />;
    if (page === "backtesting") return <BacktestingPage />;
    if (page === "fronttest") return <FronttestPage />;
    if (page === "strategies") return <StrategiesPage strategies={strategies} onActivate={activateByName} onPause={pauseByName} onUpdate={updateByName} onDelete={deleteByName} />;
    return <DashboardPage mode={mode} kill={kill} />;
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-app)" }}>
      <Sidebar page={page} onNav={setPage} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <StatusBar mode={mode} setMode={setMode} kill={kill} setKill={setKill} clock={clock} onNav={setPage} strategies={strategies} currentStrat={currentStrat} onActivateStrat={activateByName} />
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

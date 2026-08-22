/* StatusBar — run-state cluster + live market session/clock. Brand lives in the sidebar. */
function StatusBar({ mode, setMode, kill, setKill, clock, onNav, strategies }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const D = window.NT_DATA;
  const TZ = D.marketHours.display_tz;
  const list = strategies || [];
  const counts = { live: 0, fronttest: 0, draft: 0 };
  list.forEach((s) => { counts[s.account] = (counts[s.account] || 0) + 1; });

  /* live clock driving the session state */
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const sess = ntSession(now);
  const [sessOpen, setSessOpen] = React.useState(false);

  const pill = {
    display: "inline-flex", alignItems: "center", gap: 7, height: 30, padding: "0 12px",
    borderRadius: "var(--radius-sm)", border: "1px solid var(--border-strong)",
    background: "var(--surface-inset)", color: "var(--text-secondary)",
    font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", whiteSpace: "nowrap",
  };
  const dot = (c, pulse) => ({ width: 7, height: 7, borderRadius: "50%", background: c, flex: "none", opacity: pulse ? "var(--nt-blink-o, 1)" : 1 });

  const sv = ({
    open:      { c: "var(--profit)", pulse: true,  label: "MARKET OPEN",   range: ntFmtTz(sess.open, TZ) + " – " + ntFmtTz(sess.close, TZ) },
    premarket: { c: "var(--dryrun)", pulse: true,  label: "PRE-MARKET",    range: ntFmtTz(sess.pre, TZ) + " – " + ntFmtTz(sess.open, TZ) },
    closed:    { c: "var(--loss)",   pulse: false, label: "MARKET CLOSED", range: "opens " + ntNextOpenLabel(now) },
  })[sess.state];

  const sessionRow = (c, pulse, label, range) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "9px 0", borderTop: "1px solid var(--border)" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
        <span style={dot(c, pulse)}></span>
        <span style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)", color: "var(--text-primary)" }}>{label}</span>
      </span>
      <span className="num" style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-mono)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{range}</span>
    </div>
  );

  return (
    <header style={{ height: "var(--topbar-h)", flex: "none", display: "flex", alignItems: "center", gap: 10, padding: "0 22px", borderBottom: "1px solid var(--border)", background: "var(--ink-1)" }}>
      {(() => {  /* mode badge — SIMULATION (no live strategy) vs LIVE (a live strategy is running) */
        const liveMode = mode === "LIVE";
        const mc = liveMode ? "var(--live)" : "var(--dryrun)";
        return (
          <span title={liveMode ? "LIVE — a strategy is sending real orders" : "Simulation — no real orders are sent"}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 30, padding: "0 12px 0 10px",
              borderRadius: "var(--radius-sm)", background: liveMode ? "var(--live-bg)" : "var(--dryrun-bg)",
              border: "1px solid color-mix(in srgb, " + mc + " 34%, transparent)", color: mc,
              font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: mc, opacity: liveMode ? "var(--nt-blink-o, 1)" : 1 }} />
            {liveMode ? "LIVE" : "SIMULATION"}
          </span>
        );
      })()}

      {/* STRATEGIES — read-only summary; click to manage on the Strategies page */}
      <button onClick={() => onNav && onNav("strategies")} className="nt-strat-pill" title="Manage strategies" style={{ ...pill, cursor: "pointer" }}>
        <span><span style={{ color: "var(--text-primary)", fontWeight: "var(--w-semibold)" }}>{list.length}</span> {list.length === 1 ? "strategy" : "strategies"}</span>
        <span style={{ color: "var(--text-tertiary)", letterSpacing: 0 }}>
          {(counts.live ? " · " + counts.live + " live" : "") + (counts.fronttest ? " · " + counts.fronttest + " paper" : "") + (counts.draft ? " · " + counts.draft + " draft" : "")}
        </span>
        <Ico name="chevron-right" size={13} />
      </button>

      <NT.KillSwitch state={kill} onToggle={async () => {
        const tripping = kill === "ARMED";  // ARMED -> trip (kill all); else re-arm
        if (tripping && !(await window.NT_CONFIRM("This immediately CLOSES ALL open positions across every strategy and blocks new trades.", { title: "Kill switch", ok: "Kill & close all", cancel: "Cancel", danger: true }))) return;
        const prev = kill;
        setKill(tripping ? "TRIPPED" : "ARMED");
        try {
          const ids = list.map((s) => s.id).filter((x) => x != null);
          if (window.NT_CLIENT && ids.length) {
            const r = await window.NT_CLIENT.from("strategies").update({ kill_switch: tripping, updated_at: new Date().toISOString() }).in("id", ids);
            if (r.error) throw r.error;
          } else if (window.NT_CLIENT) {
            const r = await window.NT_CLIENT.from("strategy_params").update({ kill_switch: tripping, updated_at: new Date().toISOString() }).eq("id", 1);
            if (r.error) throw r.error;
          }
        } catch (e) {
          setKill(prev);
          window.NT_ALERT("Kill switch didn’t save: " + (e.message || e), { title: "Kill switch", danger: true });
        }
      }} />

      <div style={{ flex: 1 }}></div>

      {/* LIVE MARKET SESSION */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setSessOpen((o) => !o)} className="nt-sess-pill" style={{ display: "flex", alignItems: "center", gap: 8, height: 30, padding: "0 6px 0 4px", background: "transparent", border: "1px solid transparent", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-tertiary)", font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", whiteSpace: "nowrap" }}>
          <span style={dot(sv.c, sv.pulse)}></span>
          <span style={{ color: sv.c }}>{sv.label}</span>
          <span className="num" style={{ color: "var(--text-secondary)", letterSpacing: 0, fontFamily: "var(--font-mono)" }}>{sv.range}</span>
          <Ico name="chevron-down" size={12} />
        </button>
        {sessOpen && (
          <React.Fragment>
            <div onClick={() => setSessOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }}></div>
            <div style={{ position: "absolute", top: 40, right: 0, zIndex: 41, width: 326, padding: 16, background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ font: "var(--w-semibold) var(--t-xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 4 }}>Trading sessions · your time</span>
              {sessionRow("var(--dryrun)", sess.state === "premarket", "Pre-market", ntFmtTz(sess.pre, TZ) + " – " + ntFmtTz(sess.open, TZ))}
              {sessionRow("var(--profit)", sess.state === "open", "Regular / open", ntFmtTz(sess.open, TZ) + " – " + ntFmtTz(sess.close, TZ))}
              {sessionRow("var(--loss)", false, "Closed", "after " + ntFmtTz(sess.close, TZ))}
              {sessionRow("var(--accent)", sess.streaming, "Streaming", ntFmtTz(sess.streamStart, TZ) + " – " + ntFmtTz(sess.streamEnd, TZ))}
              <div style={{ marginTop: 10, font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)" }}>
                Shown in {TZ.split("/")[1].replace("_", " ")} · market hours US Eastern. Both auto-correct for summer/winter.
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      <div style={{ width: 1, height: 22, background: "var(--border)" }}></div>
      <span className="num" style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-mono)", color: "var(--text-primary)" }}>{ntFmtTz(now.getTime(), TZ)}</span>
      <span style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>{new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric" }).format(now)}</span>
      <button style={{ width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: "var(--radius-sm)", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", position: "relative" }}>
        <Ico name="bell" size={16} />
        <span style={{ position: "absolute", top: 7, right: 7, width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }}></span>
      </button>
      <style>{`@property --nt-blink-o{ syntax:"<number>"; inherits:true; initial-value:1; } @keyframes nt-blinkkf{ 0%,100%{ --nt-blink-o:1 } 50%{ --nt-blink-o:0.4 } } html{ animation: nt-blinkkf var(--blink) var(--ease-in-out) infinite; } .nt-strat-pill:hover, .nt-sess-pill:hover{ filter: brightness(1.08); } .nt-sess-pill:hover{ background: var(--surface-inset) !important; }`}</style>
    </header>
  );
}
Object.assign(window, { StatusBar });

/* StatusBar — run-state cluster + live market session/clock. Brand lives in the sidebar. */
function StatusBar({ mode, setMode, kill, setKill, clock, onNav, strategies, currentStrat, onActivateStrat }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const D = window.NT_DATA;
  const SP = D.strategyParams;
  const TZ = D.marketHours.display_tz;
  const list = strategies || [];
  const current = list.find((s) => s.name === currentStrat) || list.find((s) => s.status === "live") || list[0] || { name: "—", params: {} };
  const cp = current.params || {};
  const stratActive = kill === "ARMED" && current.status === "live";
  const deactivated = kill !== "ARMED";

  /* live clock driving the session state */
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const sess = ntSession(now);

  const [stratOpen, setStratOpen] = React.useState(false);
  const [stratSel, setStratSel] = React.useState(false);
  const [sessOpen, setSessOpen] = React.useState(false);
  const stratStatus = { live: "var(--live)", paused: "var(--dryrun)", off: "var(--breakeven)" };
  const closeStrat = () => { setStratOpen(false); setStratSel(false); };

  const pill = {
    display: "inline-flex", alignItems: "center", gap: 7, height: 30, padding: "0 12px",
    borderRadius: "var(--radius-sm)", border: "1px solid var(--border-strong)",
    background: "var(--surface-inset)", color: "var(--text-secondary)",
    font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", whiteSpace: "nowrap",
  };
  const dot = (c, pulse) => ({
    width: 7, height: 7, borderRadius: "50%", background: c, flex: "none",
    opacity: pulse ? "var(--nt-blink-o, 1)" : 1,
  });

  /* ---- live session visual ---- */
  const sv = ({
    open:      { c: "var(--profit)", pulse: true,  label: "MARKET OPEN",   range: ntFmtTz(sess.open, TZ) + " \u2013 " + ntFmtTz(sess.close, TZ) },
    premarket: { c: "var(--dryrun)", pulse: true,  label: "PRE-MARKET",    range: ntFmtTz(sess.pre, TZ) + " \u2013 " + ntFmtTz(sess.open, TZ) },
    closed:    { c: "var(--loss)",   pulse: false, label: "MARKET CLOSED", range: "opens " + ntNextOpenLabel(now) },
  })[sess.state];

  /* ---- strategy parameter popover ---- */
  const ParamRow = ({ k, v, note }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "8px 0", borderTop: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <span style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)", color: "var(--text-secondary)" }}>{k}</span>
        <span className="num" style={{ font: "var(--w-semibold) var(--t-sm)/1 var(--font-mono)", color: "var(--text-primary)", letterSpacing: 0 }}>{v}</span>
      </div>
      {note && <span style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)" }}>{note}</span>}
    </div>
  );
  const SectionLabel = ({ children }) => (
    <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", color: "var(--text-primary)" }}>{children}</span>
  );

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
    <header style={{
      height: "var(--topbar-h)", flex: "none", display: "flex", alignItems: "center",
      gap: 10, padding: "0 22px", borderBottom: "1px solid var(--border)", background: "var(--ink-1)",
    }}>
      {(() => {  /* mode pill — shows SIMULATION vs LIVE (toggle real-money on the Strategies page) */
        const liveMode = mode === "LIVE";
        const mc = liveMode ? "var(--live)" : "var(--dryrun)";
        return (
          <span title={liveMode ? "LIVE — real orders are sent" : "Simulation — no real orders are sent"}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 30, padding: "0 12px 0 10px",
              borderRadius: "var(--radius-sm)", background: liveMode ? "var(--live-bg)" : "var(--dryrun-bg)",
              border: "1px solid color-mix(in srgb, " + mc + " 34%, transparent)", color: mc,
              font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: mc, animation: liveMode ? "nt-pulse var(--blink) var(--ease-in-out) infinite" : "none" }} />
            {liveMode ? "LIVE" : "SIMULATION"}
          </span>
        );
      })()}

      {/* STRATEGY — clickable; opens the active strategy's parameters */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setStratOpen((o) => !o)} className="nt-strat-pill" style={{
          ...pill, cursor: "pointer",
          border: "1px solid " + (stratOpen ? "var(--violet-line)" : "var(--border-strong)"),
          background: stratOpen ? "var(--violet-soft)" : "var(--surface-inset)",
        }}>
          <span style={dot(stratActive ? "var(--profit)" : "var(--loss)", stratActive)}></span>
          STRATEGY&nbsp;
          <span style={{ color: "var(--text-primary)", letterSpacing: "var(--ls-snug)", fontWeight: "var(--w-semibold)" }}>{current.name}</span>
          <Ico name="chevron-down" size={13} />
        </button>

        {stratOpen && (
          <React.Fragment>
            <div onClick={closeStrat} style={{ position: "fixed", inset: 0, zIndex: 40 }}></div>
            <div style={{
              position: "absolute", top: 40, left: 0, zIndex: 41, width: 360, padding: 16,
              background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)",
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={dot(stratActive ? "var(--profit)" : "var(--loss)", stratActive)}></span>
                  <span style={{ font: "var(--w-semibold) var(--t-body)/1 var(--font-sans)", letterSpacing: "var(--ls-snug)", whiteSpace: "nowrap" }}>{current.name}</span>
                </span>
                <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", color: stratActive ? "var(--profit)" : "var(--loss)", flex: "none" }}>{stratActive ? "ACTIVE" : "DEACTIVATED"}</span>
              </div>

              {!stratSel ? (
                <React.Fragment>
                  <div style={{ marginTop: 14 }}><SectionLabel>Sizing</SectionLabel></div>
                  <ParamRow k="Trade budget" v={"$" + cp.trade_budget_usd} note="max $ per entry" />
                  <ParamRow k="Max contracts" v={cp.max_contracts_per_trade} note="hard cap per trade" />

                  <div style={{ marginTop: 12 }}><SectionLabel>Exits / risk</SectionLabel></div>
                  <ParamRow k="Stop loss" v={Math.round(cp.stop_loss_pct * 100) + "%"} note={"\u2212" + Math.round(cp.stop_loss_pct * 100) + "% resting stop at Schwab"} />
                  <ParamRow k="Breakeven at" v={"+" + Math.round(cp.breakeven_at_pct * 100) + "%"} note={"at +" + Math.round(cp.breakeven_at_pct * 100) + "%, move stop to breakeven"} />
                  <ParamRow k="Take half at" v={"+" + Math.round(cp.take_half_at_pct * 100) + "%"} note={"at +" + Math.round(cp.take_half_at_pct * 100) + "%, sell half"} />

                  <button onClick={() => setStratSel(true)} style={{
                    marginTop: 14, height: 36, width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                    borderRadius: "var(--radius-sm)", border: "1px solid transparent", background: "var(--accent)", color: "#fff", cursor: "pointer",
                    font: "var(--w-semibold) var(--t-xs)/1 var(--font-sans)",
                  }}>
                    <Ico name="repeat" size={14} /> Change strategy
                  </button>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 14, marginBottom: 2 }}>
                    <button onClick={() => setStratSel(false)} aria-label="Back" style={{ width: 26, height: 26, flex: "none", display: "grid", placeItems: "center", borderRadius: "var(--radius-sm)", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer" }}>
                      <Ico name="arrow-left" size={15} />
                    </button>
                    <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", color: "var(--text-primary)" }}>Select strategy</span>
                  </div>
                  {list.map((s, i) => {
                    const on = s.name === current.name;
                    return (
                      <button key={i} onClick={() => { onActivateStrat && onActivateStrat(s.name); setStratSel(false); }} className="nt-strat-opt" style={{
                        display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", textAlign: "left", cursor: "pointer", width: "100%",
                        borderRadius: "var(--radius-sm)", border: "1px solid " + (on ? "var(--violet-line)" : "var(--border)"),
                        background: on ? "var(--violet-soft)" : "var(--surface-inset)",
                      }}>
                        <span style={{ ...dot(stratStatus[s.status], false), marginTop: 5 }}></span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ font: "var(--w-semibold) var(--t-sm)/1 var(--font-sans)", color: "var(--text-primary)" }}>{s.name}</span>
                            {on && <Ico name="check" size={14} color="var(--accent)" />}
                          </span>
                          <span style={{ display: "block", font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 4 }}>{s.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </React.Fragment>
              )}
            </div>
          </React.Fragment>
        )}
      </div>

      <NT.KillSwitch state={kill} onToggle={async () => {
        const tripping = kill === "ARMED";  // ARMED -> deactivate (kill); else re-arm
        if (tripping && !(await window.NT_CONFIRM("This immediately CLOSES ALL open positions at market and blocks any new trades.", { title: "Deactivate — kill switch", ok: "Deactivate & close all", cancel: "Cancel", danger: true }))) return;
        const prev = kill;
        setKill(tripping ? "TRIPPED" : "ARMED");
        try {
          if (window.NT_CLIENT) {
            const r = await window.NT_CLIENT.from("strategy_params")
              .update({ kill_switch: tripping, updated_at: new Date().toISOString() }).eq("id", 1);
            if (r.error) throw r.error;
          }
        } catch (e) {
          setKill(prev);  // revert the UI if the bot won't have received it
          window.NT_ALERT("Kill switch didn’t save: " + (e.message || e) + "\nCheck the connection and try again.", { title: "Kill switch", danger: true });
        }
      }} />

      <div style={{ flex: 1 }}></div>

      {/* LIVE MARKET SESSION — green(open)/orange(pre)/red(closed), in your local time */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setSessOpen((o) => !o)} className="nt-sess-pill" style={{
          display: "flex", alignItems: "center", gap: 8, height: 30, padding: "0 6px 0 4px",
          background: "transparent", border: "1px solid transparent", borderRadius: "var(--radius-sm)", cursor: "pointer",
          color: "var(--text-tertiary)", font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", whiteSpace: "nowrap",
        }}>
          <span style={dot(sv.c, sv.pulse)}></span>
          <span style={{ color: sv.c }}>{sv.label}</span>
          <span className="num" style={{ color: "var(--text-secondary)", letterSpacing: 0, fontFamily: "var(--font-mono)" }}>{sv.range}</span>
          <Ico name="chevron-down" size={12} />
        </button>

        {sessOpen && (
          <React.Fragment>
            <div onClick={() => setSessOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }}></div>
            <div style={{
              position: "absolute", top: 40, right: 0, zIndex: 41, width: 326, padding: 16,
              background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)",
              display: "flex", flexDirection: "column", gap: 2,
            }}>
              <span style={{ font: "var(--w-semibold) var(--t-xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 4 }}>Trading sessions · your time</span>
              {sessionRow("var(--dryrun)", sess.state === "premarket", "Pre-market", ntFmtTz(sess.pre, TZ) + " \u2013 " + ntFmtTz(sess.open, TZ))}
              {sessionRow("var(--profit)", sess.state === "open", "Regular / open", ntFmtTz(sess.open, TZ) + " \u2013 " + ntFmtTz(sess.close, TZ))}
              {sessionRow("var(--loss)", false, "Closed", "after " + ntFmtTz(sess.close, TZ))}
              {sessionRow("var(--profit)", sess.streaming, "Streaming", ntFmtTz(sess.open, TZ) + " \u2013 " + ntFmtTz(sess.streamEnd, TZ))}
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
      <button style={{ width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: "var(--radius-sm)",
        background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", position: "relative" }}>
        <Ico name="bell" size={16} />
        <span style={{ position: "absolute", top: 7, right: 7, width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }}></span>
      </button>
      <style>{`@property --nt-blink-o{ syntax:"<number>"; inherits:true; initial-value:1; } @keyframes nt-blinkkf{ 0%,100%{ --nt-blink-o:1 } 50%{ --nt-blink-o:0.4 } } html{ animation: nt-blinkkf var(--blink) var(--ease-in-out) infinite; } .nt-strat-pill:hover, .nt-sess-pill:hover{ filter: brightness(1.08); } .nt-sess-pill:hover{ background: var(--surface-inset) !important; } .nt-strat-opt{ transition: border-color var(--dur), background var(--dur); } .nt-strat-opt:hover{ border-color: var(--border-strong); background: var(--surface-hover); }`}</style>
    </header>
  );
}
Object.assign(window, { StatusBar });

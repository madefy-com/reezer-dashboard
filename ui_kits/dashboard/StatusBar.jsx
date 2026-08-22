/* StatusBar — three world-aware clusters + live clock. Brand lives in the sidebar.

   Every control here used to speak only for the options world while wearing a general face:
   "LIVE" ignored swings, "Streaming" was Discord jargon, the strategies pill duplicated the
   sidebar. Each cluster is now a per-world popover:
     · run state  — LIVE/PAPER + freshness per world, with a kill control per world
     · positions  — every open position across all worlds, in its own currency
     · sessions   — each world's market hours + its watch window (from Settings)            */
function StatusBar({ mode, setMode, kill, setKill, clock, onNav, onWorldNav, strategies }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const D = window.NT_DATA;
  const TZ = D.marketHours.display_tz;

  /* live clock driving the session state */
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const sess = ntSession(now);
  const [openPop, setOpenPop] = React.useState(null);   // "mode" | "pos" | "sess" | null

  /* ---------------------------------------------------------------- worlds */
  const optStrats = (strategies || []).filter((s) => (s.category || "options") === "options");
  const futStrats = (strategies || []).filter((s) => s.category === "futures");
  const eqStrats = D.equityStrategies || [];
  const srcFor = (cat) => (D.sources || []).filter((s) => (s.category || "options") === cat)[0] || null;
  const ago = (iso) => (iso ? Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000) : null);
  const agoTxt = (s) => (s == null ? "never" : s < 90 ? Math.round(s) + "s ago" : s < 5400 ? Math.round(s / 60) + "m ago" : Math.round(s / 3600) + "h ago");

  // Freshness per world: options report through the machines heartbeat, the other two through
  // their source's poll stamp. Thresholds follow each world's own cadence — the sheet only
  // polls every ~5 minutes, so judging it by the options heartbeat would cry wolf all day.
  const machSeen = (D.machines || []).map((m) => m.last_seen).filter(Boolean).sort().pop() || null;
  const WORLDS = [
    { id: "options", label: "Options", strats: optStrats, table: "strategies",
      seen: machSeen, staleAfter: 300, killLabel: "Kill & close options",
      killMsg: "This immediately CLOSES ALL open options positions and blocks new trades.",
      trades: "trades", liveVal: "live" },
    { id: "swings", label: "Swings", strats: eqStrats, table: "equity_strategies",
      seen: (srcFor("swings") || {}).last_poll_at, staleAfter: 1200, killLabel: "Stop trading swings",
      killMsg: "This blocks NEW swing orders. Open positions are NOT closed — they stay in the book.",
      trades: "swings-trades", liveVal: "live" },
    { id: "futures", label: "Futures", strats: futStrats, table: "strategies",
      seen: (srcFor("futures") || {}).last_poll_at, staleAfter: 600, killLabel: "Stop trading futures",
      killMsg: "This blocks NEW futures orders. Open positions are NOT closed.",
      trades: "futures-trades", liveVal: "live" },
  ].filter((w) => w.strats.length > 0);

  const wState = (w) => {
    const live = w.strats.some((s) => s.account === w.liveVal && !s.paused);
    const killed = w.strats.length > 0 && w.strats.every((s) => !!s.kill_switch);
    const a = ago(w.seen);
    const stale = a == null || a > w.staleAfter;
    return { live, killed, stale, a };
  };

  const liveWorlds = WORLDS.filter((w) => wState(w).live);
  const anyLiveStale = liveWorlds.some((w) => wState(w).stale);
  const anyKilled = WORLDS.some((w) => wState(w).killed);

  /* ------------------------------------------------------------- positions */
  // Options + futures come from the already-built trades (live status = open, pnl included).
  // Swings live in their own tables — one small fetch, refreshed when the popover opens.
  const futIds = {};
  futStrats.forEach((s) => { futIds[s.id] = true; });
  const optOpen = (D.trades || []).filter((t) => t.status === "live" && !futIds[t.strategyId]);
  const futOpen = (D.trades || []).filter((t) => t.status === "live" && futIds[t.strategyId]);
  const [eqOpen, setEqOpen] = React.useState([]);
  const loadEq = React.useCallback(() => {
    const db = window.NT_CLIENT;
    if (!db || !(window.NT_HAS_SWINGS || eqStrats.length)) return;
    Promise.all([
      db.from("equity_positions").select("*").eq("status", "open"),
      db.from("equity_marks").select("*"),
    ]).then(([p, m]) => {
      const marks = {};
      (m.data || []).forEach((x) => { marks[String(x.symbol).toUpperCase()] = x; });
      setEqOpen((p.data || []).map((x) => {
        const mk = marks[String(x.symbol).toUpperCase()] || {};
        return { sym: x.symbol, qty: Number(x.qty), ccy: mk.ccy || "EUR",
                 pnl: mk.unrealized_pnl != null ? Number(mk.unrealized_pnl) : null };
      }));
    }, () => {});
  }, [eqStrats.length]);
  React.useEffect(() => { loadEq(); }, [loadEq]);
  React.useEffect(() => { if (openPop === "pos") loadEq(); }, [openPop, loadEq]);

  const posCount = optOpen.length + futOpen.length + eqOpen.length;
  const posBreak = [
    eqOpen.length ? eqOpen.length + " swings" : null,
    optOpen.length ? optOpen.length + " options" : null,
    futOpen.length ? futOpen.length + " futures" : null,
  ].filter(Boolean).join(" · ");
  const money = (v, ccy) => {
    if (v == null) return "—";
    const sym = { EUR: "€", GBP: "£", USD: "$", CAD: "C$" }[ccy || "USD"] || "$";
    const r = Math.round(v * 100) / 100;
    return (r < 0 ? "−" : "+") + sym + Math.abs(r).toFixed(Math.abs(r) >= 100 ? 0 : 2);
  };

  /* -------------------------------------------------------------- sessions */
  const hm = (t, tz, h, m) => ntTzInstant(t, tz, h, m);
  const t = now.getTime();
  const dowB = ntTzDow(now, "Europe/Brussels");
  const wkdB = dowB >= 1 && dowB <= 5;
  const euOpen = hm(now, "Europe/Brussels", 9, 0), euClose = hm(now, "Europe/Brussels", 17, 30);
  const euIsOpen = wkdB && t >= euOpen && t < euClose;
  const usIsOpen = sess.state === "open";
  const glbClose = hm(now, "Europe/Brussels", 23, 0);
  const glbIsOpen = wkdB && t < glbClose;
  // Count DISTINCT markets among the worlds present — options and swings both trade the US
  // market, and counting it once per world made "3 markets" read as 4.
  const mset = {};
  WORLDS.forEach((w) => {
    if (w.id === "options" || w.id === "swings") mset.us = usIsOpen;
    if (w.id === "swings") mset.eu = euIsOpen;
    if (w.id === "futures") mset.glb = glbIsOpen;
  });
  const relevant = Object.values(mset);
  const nOpen = relevant.filter(Boolean).length;

  // Watch window per world: the source's own window from Settings wins; with none set, each
  // world falls back to what it truly does — options stream in a fixed window, the sheet is
  // polled all day, the futures watcher never sleeps.
  const etWin = (src) => {
    if (!src || !src.window_start_et || !src.window_end_et) return null;
    const a = ntHM(src.window_start_et), b = ntHM(src.window_end_et);
    return ntFmtTz(hm(now, "America/New_York", a[0], a[1]), TZ) + " – " + ntFmtTz(hm(now, "America/New_York", b[0], b[1]), TZ);
  };
  const watchTxt = {
    options: etWin(srcFor("options")) || (ntFmtTz(sess.streamStart, TZ) + " – " + ntFmtTz(sess.streamEnd, TZ)),
    swings: etWin(srcFor("swings")) || "always · every 5 min",
    futures: etWin(srcFor("futures")) || "always · continuous",
  };

  /* ---------------------------------------------------------------- bits */
  // Inline SVGs, NOT <Ico>: lucide's createIcons() swaps <i data-lucide> nodes for <svg>
  // behind React's back, and this bar re-renders every second with a shape that changes as
  // data arrives. React inserting beside a node lucide already replaced throws Safari's
  // "NotFoundError: The object can not be found here" — the 2026-08-22 black page. A raw
  // <svg> is React's own child; nothing external ever touches it.
  const Chevron = ({ size }) => (
    <svg width={size || 13} height={size || 13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="m6 9 6 6 6-6" /></svg>
  );
  const Bell = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
  );
  const dot = (c, pulse) => ({ width: 7, height: 7, borderRadius: "50%", background: c, flex: "none", opacity: pulse ? "var(--nt-blink-o, 1)" : 1 });
  const pill = {
    display: "inline-flex", alignItems: "center", gap: 7, height: 30, padding: "0 12px",
    borderRadius: "var(--radius-sm)", border: "1px solid var(--border-strong)",
    background: "var(--surface-inset)", color: "var(--text-secondary)",
    font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", whiteSpace: "nowrap",
  };
  const popBox = (w) => ({ position: "absolute", top: 40, zIndex: 41, width: w, padding: 16,
    background: "var(--surface-card)", border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)" });
  const popTitle = { font: "var(--w-semibold) var(--t-xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 6, display: "block" };
  const popNote = { marginTop: 10, font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)" };
  const groupHead = (label, first) => (
    <div style={{ padding: (first ? 9 : 12) + "px 0 3px", font: "var(--w-semibold) 10px/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", color: "var(--text-disabled)" }}>{label}</div>
  );
  const closeAll = () => setOpenPop(null);
  const scrim = <div onClick={closeAll} style={{ position: "fixed", inset: 0, zIndex: 40 }}></div>;

  const badge = (on, label, c) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 9px", flex: "none",
      borderRadius: "var(--radius-pill)", background: "color-mix(in srgb, " + c + " 14%, transparent)",
      color: c, font: "var(--w-semibold) 10px/1 var(--font-sans)", letterSpacing: "var(--ls-caps)" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, opacity: on ? "var(--nt-blink-o, 1)" : 1 }} />
      {label}
    </span>
  );

  /* -------------------------------------------------------- kill per world */
  const killWorld = async (w, st) => {
    const trip = !st.killed;
    const msg = trip ? w.killMsg : "Resume trading for " + w.label.toLowerCase() + "? Strategies act on new signals again.";
    if (!(await window.NT_CONFIRM(msg, { title: w.killLabel, ok: trip ? (w.id === "options" ? "Kill & close" : "Stop trading") : "Resume", danger: trip }))) return;
    try {
      const ids = w.strats.map((s) => s.id).filter((x) => x != null);
      if (!window.NT_CLIENT || !ids.length) throw new Error("no strategies to update");
      const r = await window.NT_CLIENT.from(w.table).update({ kill_switch: trip, updated_at: new Date().toISOString() }).in("id", ids);
      if (r.error) throw r.error;
      if (w.id === "options" && setKill) setKill(trip ? "TRIPPED" : "ARMED");   // keep the app state in step
      if (window.NT_REFRESH) await window.NT_REFRESH();
    } catch (e) {
      window.NT_ALERT("Didn’t save: " + (e.message || e), { title: w.killLabel, danger: true });
    }
  };

  const worldRow = (w) => {
    const st = wState(w);
    const hc = st.stale ? "var(--loss)" : "var(--profit)";
    return (
      <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 0", borderTop: "1px solid var(--row-line)" }}>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span style={{ display: "block", font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)", color: "var(--text-primary)" }}>{w.label}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: st.stale ? "var(--loss)" : "var(--text-secondary)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: hc, flex: "none" }} />
            {st.stale ? "not reporting · last " + agoTxt(st.a) : "reported " + agoTxt(st.a)}
          </span>
        </span>
        {st.killed ? badge(false, "STOPPED", "var(--loss)")
          : st.live ? badge(true, "LIVE", "var(--live)")
          : badge(false, "PAPER", "var(--dryrun)")}
        <button className="nt-killico" title={st.killed ? "Resume " + w.label.toLowerCase() : w.killLabel}
          onClick={() => killWorld(w, st)}
          style={{ width: 26, height: 26, flex: "none", display: "inline-grid", placeItems: "center",
                   borderRadius: "var(--radius-xs)", border: "1px solid transparent", background: "transparent",
                   color: st.killed ? "var(--profit)" : "var(--text-disabled)", cursor: "pointer" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>
        </button>
      </div>
    );
  };

  const posRow = (key, left, sub, pnl, ccy, world, page, first) => (
    <button key={key} onClick={() => { closeAll(); if (onWorldNav) onWorldNav(world, page); else onNav(page); }}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, width: "100%",
               padding: "9px 12px", background: "transparent", border: "none",
               borderTop: first ? "none" : "1px solid var(--row-line)", cursor: "pointer", textAlign: "left" }}>
      <span style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-mono)", color: "var(--text-primary)" }}>
        {left} <span style={{ fontFamily: "var(--font-sans)", color: "var(--text-disabled)", fontWeight: "var(--w-regular)" }}>{sub}</span>
      </span>
      <span style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-mono)", color: pnl == null ? "var(--text-tertiary)" : pnl > 0 ? "var(--profit)" : pnl < 0 ? "var(--loss)" : "var(--text-secondary)", whiteSpace: "nowrap" }}>
        {money(pnl, ccy)} <span style={{ color: "var(--text-disabled)" }}>›</span>
      </span>
    </button>
  );

  const sessRow = (c, on, label, range) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "7px 0", borderTop: "1px solid var(--row-line)" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
        <span style={dot(c, on)}></span>
        <span style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)", color: "var(--text-primary)" }}>{label}</span>
      </span>
      <span className="num" style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-mono)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{range}</span>
    </div>
  );
  const mCol = (open) => (open ? "var(--profit)" : "var(--loss)");

  /* the collapsed mode badge: LIVE only when every live world is actually reporting */
  const modeLabel = anyKilled ? "STOPPED" : liveWorlds.length ? "LIVE" + (WORLDS.length > 1 ? " · " + liveWorlds.length + (liveWorlds.length === 1 ? " WORLD" : " WORLDS") : "") : "SIMULATION";
  const modeC = anyKilled || anyLiveStale ? "var(--loss)" : liveWorlds.length ? "var(--live)" : "var(--dryrun)";
  const modeBg = anyKilled || anyLiveStale ? "var(--loss-bg)" : liveWorlds.length ? "var(--live-bg)" : "var(--dryrun-bg)";

  return (
    <header style={{ height: "var(--topbar-h)", flex: "none", display: "flex", alignItems: "center", gap: 10, padding: "0 22px", borderBottom: "1px solid var(--border)", background: "var(--ink-1)" }}>

      {/* RUN STATE — per-world status + kill */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setOpenPop(openPop === "mode" ? null : "mode")}
          title="Run state per world"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 30, padding: "0 12px 0 10px",
            borderRadius: "var(--radius-sm)", background: modeBg, cursor: "pointer",
            border: "1px solid color-mix(in srgb, " + modeC + " 34%, transparent)", color: modeC,
            font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: modeC, opacity: liveWorlds.length ? "var(--nt-blink-o, 1)" : 1 }} />
          {modeLabel}
        </button>
        {openPop === "mode" && (
          <React.Fragment>
            {scrim}
            <div style={{ ...popBox(330), left: 0 }}>
              <span style={popTitle}>Run state · per world</span>
              {WORLDS.map(worldRow)}
              <div style={popNote}>
                The power icon stops a world — options kills &amp; closes, the others block new orders.
                It always asks first. A world that stops reporting turns red here and on the badge.
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      {/* OPEN POSITIONS — across worlds */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setOpenPop(openPop === "pos" ? null : "pos")} className="nt-strat-pill"
          title="Open positions across all worlds" style={{ ...pill, cursor: "pointer" }}>
          <span><span style={{ color: "var(--text-primary)", fontWeight: "var(--w-semibold)" }}>{posCount}</span> open {posCount === 1 ? "position" : "positions"}</span>
          {posBreak ? <span style={{ color: "var(--text-tertiary)", letterSpacing: 0 }}>· {posBreak}</span> : null}
          <Chevron size={13} />
        </button>
        {openPop === "pos" && (
          <React.Fragment>
            {scrim}
            <div style={{ ...popBox(310), left: 0 }}>
              <span style={popTitle}>Open positions · all worlds</span>
              {WORLDS.map((w, wi) => {
                const rows = w.id === "swings"
                  ? eqOpen.map((p, i) => posRow("eq" + i, p.sym, p.qty + (Math.abs(p.qty) === 1 ? " share" : " shares"), p.pnl, p.ccy, "swings", "swings-trades", i === 0))
                  : (w.id === "options" ? optOpen : futOpen).map((p, i) => posRow(w.id + p.id,
                      (p.tk || "") + " " + (p.strike || ""), p.qty + "x", p.pnl, "USD", w.id, w.trades, i === 0));
                return (
                  <div key={w.id} style={{ marginTop: wi ? 10 : 6 }}>
                    <div style={{ padding: "0 2px 5px", font: "var(--w-semibold) 10px/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{w.label}</div>
                    {/* each world is its own inset box, so the grouping is a shape you can
                        see rather than a label you have to read */}
                    <div style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                      {rows.length ? rows : (
                        <div style={{ padding: "9px 12px", font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-disabled)" }}>nothing open</div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div style={popNote}>Every open position, wherever it lives, in its own currency. A row jumps to that world's Trades page.</div>
            </div>
          </React.Fragment>
        )}
      </div>

      <div style={{ flex: 1 }}></div>

      {/* SESSIONS — per world market + watch window */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setOpenPop(openPop === "sess" ? null : "sess")} className="nt-sess-pill"
          style={{ display: "flex", alignItems: "center", gap: 8, height: 30, padding: "0 6px 0 4px", background: "transparent", border: "1px solid transparent", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-tertiary)", font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", whiteSpace: "nowrap" }}>
          <span style={dot(nOpen ? "var(--profit)" : "var(--loss)", nOpen > 0)}></span>
          <span style={{ color: nOpen ? "var(--profit)" : "var(--loss)" }}>
            {relevant.length <= 1 ? (nOpen ? "MARKET OPEN" : "MARKET CLOSED")
              : nOpen + " OF " + relevant.length + " MARKETS OPEN"}
          </span>
          <Chevron size={12} />
        </button>
        {openPop === "sess" && (
          <React.Fragment>
            {scrim}
            <div style={{ ...popBox(330), right: 0 }}>
              <span style={popTitle}>Trading sessions · your time</span>
              {WORLDS.map((w, wi) => (
                <React.Fragment key={w.id}>
                  {groupHead(w.label, wi === 0)}
                  {w.id === "options" && sessRow(mCol(usIsOpen), usIsOpen, "US market", ntFmtTz(sess.open, TZ) + " – " + ntFmtTz(sess.close, TZ))}
                  {w.id === "swings" && sessRow(mCol(euIsOpen), euIsOpen, "EU market", ntFmtTz(euOpen, TZ) + " – " + ntFmtTz(euClose, TZ))}
                  {w.id === "swings" && sessRow(mCol(usIsOpen), usIsOpen, "US market", ntFmtTz(sess.open, TZ) + " – " + ntFmtTz(sess.close, TZ))}
                  {w.id === "futures" && sessRow(mCol(glbIsOpen), glbIsOpen, "Globex", "Mon 00:00 – Fri 23:00")}
                  {sessRow("var(--accent)", w.id === "options" ? sess.streaming : false, "Watching alerts", watchTxt[w.id])}
                </React.Fragment>
              ))}
              <div style={popNote}>
                Watch windows come from each source in Settings; with none set they show what that
                world really does. Green = that market is open right now. Shown in {TZ.split("/")[1].replace("_", " ")}.
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      <div style={{ width: 1, height: 22, background: "var(--border)" }}></div>
      <span className="num" style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-mono)", color: "var(--text-primary)" }}>{ntFmtTz(now.getTime(), TZ)}</span>
      <span style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>{new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric" }).format(now)}</span>
      <button style={{ width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: "var(--radius-sm)", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", position: "relative" }}>
        <Bell />
        <span style={{ position: "absolute", top: 7, right: 7, width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }}></span>
      </button>
      <style>{`@property --nt-blink-o{ syntax:"<number>"; inherits:true; initial-value:1; } @keyframes nt-blinkkf{ 0%,100%{ --nt-blink-o:1 } 50%{ --nt-blink-o:0.4 } } html{ animation: nt-blinkkf var(--blink) var(--ease-in-out) infinite; } .nt-strat-pill:hover, .nt-sess-pill:hover{ filter: brightness(1.08); } .nt-sess-pill:hover{ background: var(--surface-inset) !important; } .nt-killico:hover{ color: var(--loss) !important; background: var(--loss-bg) !important; border-color: var(--loss-line) !important; }`}</style>
    </header>
  );
}
Object.assign(window, { StatusBar });

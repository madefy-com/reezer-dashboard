/* Sidebar — labeled nav rail with brand + subpages. */
function Ico({ name, size = 20, color = "currentColor", sw = 1.75 }) {
  return <i data-lucide={name} style={{ width: size, height: size, display: "inline-flex", color }} data-sw={sw}></i>;
}

/* Several worlds live side by side: the 0DTE options bot, the swing book, and futures.
   They are picked from a dropdown rather than a segmented switch — three labels do not fit
   a 218px rail, and each world can then carry its own status line ("1 live · 4 paper").
   The picker only appears when more than one world exists. Activity and Settings are shared
   and sit below the divider. */
const NT_WORLD_NAV = {
  options: [
    { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
    { id: "trades", label: "Trades", icon: "candlestick-chart" },
    { id: "log", label: "Alerts", icon: "message-square-dot" },
    { id: "strategies", label: "Strategies", icon: "target" },
    { id: "fronttest", label: "Exit Lab", icon: "flask-conical" },
  ],
  swings: [
    { id: "swings-dashboard", label: "Dashboard", icon: "layout-dashboard" },
    { id: "swings-trades", label: "Trades", icon: "candlestick-chart" },
    { id: "swings-alerts", label: "Alerts", icon: "message-square-dot" },
    { id: "swings-strategies", label: "Strategies", icon: "target" },
  ],
  futures: [
    { id: "futures-dashboard", label: "Dashboard", icon: "layout-dashboard" },
    { id: "futures-trades", label: "Trades", icon: "candlestick-chart" },
    { id: "futures-alerts", label: "Alerts", icon: "message-square-dot" },
    { id: "futures-strategies", label: "Strategies", icon: "target" },
  ],
};

const NT_WORLD_META = {
  options: { label: "Options", icon: "candlestick-chart" },
  swings: { label: "Swings", icon: "trending-up" },
  futures: { label: "Futures", icon: "activity-square" },
};

/* The world picker. Closed it shows the current world + a one-line state; open it lists every
   world with its own state, so the rail answers "where should I be looking?" not just
   "where am I?". */
function WorldPicker({ worlds, current, onPick, state }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const k = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [open]);
  const meta = NT_WORLD_META[current] || NT_WORLD_META.options;
  const row = (id, label, s, on) => (
    <button key={id} type="button" onClick={() => { onPick(id); setOpen(false); }}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        width: "100%", padding: "7px 9px", border: "none", cursor: "pointer", textAlign: "left",
        borderRadius: "var(--radius-xs)", background: on ? "var(--violet-soft)" : "transparent",
        color: on ? "var(--text-primary)" : "var(--text-secondary)",
        font: (on ? "var(--w-medium)" : "var(--w-regular)") + " var(--t-xs)/1.2 var(--font-sans)" }}>
      <span>{label}</span>
      {s ? <span style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)" }}>
        {s.live ? <span style={{ color: "var(--profit)" }}>{s.live} live</span> : null}
        {s.live && s.paper ? <span style={{ color: "var(--text-tertiary)" }}> · </span> : null}
        {s.paper ? <span style={{ color: "var(--text-tertiary)" }}>{s.paper} paper</span> : null}
        {s.problem ? <span style={{ color: "var(--loss)" }}>{(s.live || s.paper) ? " · " : ""}{s.problem}</span> : null}
      </span> : null}
    </button>
  );
  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 10 }}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          width: "100%", padding: "8px 10px", cursor: "pointer", textAlign: "left",
          background: "var(--surface-inset)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)", color: "var(--text-primary)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <Ico name={meta.icon} size={15} color="var(--text-secondary)" />
          <span style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta.label}</span>
        </span>
        <Ico name="chevrons-up-down" size={14} color="var(--text-tertiary)" />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, right: 0, zIndex: 40,
          background: "var(--surface-card)", border: "1px solid var(--violet-line)",
          borderRadius: "var(--radius-sm)", padding: 4, boxShadow: "var(--shadow-pop)" }}>
          {worlds.map((id) => row(id, (NT_WORLD_META[id] || {}).label || id, state[id], id === current))}
        </div>
      )}
    </div>
  );
}

function Sidebar({ page, onNav, world, onWorld }) {
  const D = window.NT_DATA;
  const hasOptions = ((D && D.strategies) || []).length > 0;
  const hasSwings = window.NT_HAS_SWINGS === true;
  const hasFutures = window.NT_HAS_FUTURES === true;
  const worlds = [hasOptions && "options", hasSwings && "swings", hasFutures && "futures"].filter(Boolean);
  // With only one world there is nothing to pick — show that world's pages and no picker.
  const w = worlds.includes(world) ? world : (worlds[0] || "options");
  const nav = NT_WORLD_NAV[w] || NT_WORLD_NAV.options;

  // A one-line state per world: how many strategies are running, and whether the broker
  // behind them is actually healthy. A world with live money must NEVER read green while its
  // broker is stale or disconnected — that is the one case where a status line matters, and
  // showing "1 live" in green while the gateway is down would be worse than showing nothing.
  const hoursSince = (iso) => {
    if (!iso) return null;
    const t = new Date(iso).getTime();
    return isNaN(t) ? null : (Date.now() - t) / 3600000;
  };
  const STALE_H = 26;                       // brokers sync daily; a day and a bit is generous

  // Schwab powers options and futures; IBKR powers swings.
  // Check the account the LIVE strategy is actually linked to — not simply the first row.
  // There are two Schwab accounts and the unused one has not synced in days, so picking by
  // position would raise a false alarm about a broker that is perfectly healthy.
  const liveOpt = ((D && D.strategies) || [])
    .filter((x) => (x.category || "options") === "options" && x.account === "live")[0];
  const linkedId = liveOpt && (liveOpt.broker_account != null ? liveOpt.broker_account
                               : (liveOpt.params && liveOpt.params.broker_account));
  const accounts = (D && D.brokerAccounts) || [];
  const schwab = (linkedId != null && accounts.filter((b) => b.id === linkedId)[0])
    // no explicit link: fall back to the account that actually holds money, then the first
    || accounts.filter((b) => Number((b.settings || {}).account_value) > 0)[0]
    || accounts[0];
  const schwabAge = hoursSince(schwab && schwab.settings && schwab.settings.synced_at);
  const schwabBad = !schwab ? "no broker linked"
    : (schwabAge == null || schwabAge > STALE_H) ? "broker not checked today" : null;

  const ibkr = ((D && D.equityBrokers) || []).filter((b) => b.broker === "ibkr")[0];
  const ibkrAge = hoursSince(ibkr && ibkr.settings && ibkr.settings.synced_at);
  const ibkrBad = !ibkr ? "no broker linked"
    : (ibkr.status && ibkr.status !== "connected") ? "broker " + ibkr.status
    : (ibkrAge == null || ibkrAge > STALE_H) ? "broker not checked today" : null;

  // A world's state as PARTS, so live/paper/problem can each carry their own colour.
  // Only a live strategy behind an unhealthy broker is red — paper is never alarming.
  const state = (rows, cat, brokerProblem) => {
    const mine = rows.filter((x) => (x.category || "options") === cat);
    const live = mine.filter((x) => x.account === "live").length;
    const paper = mine.length - live;
    return { live: live, paper: paper, problem: (live && brokerProblem) ? brokerProblem : null };
  };

  const optRows = ((D && D.strategies) || []).filter((x) => (x.category || "options") === "options");
  const futRows = ((D && D.strategies) || []).filter((x) => (x.category || "options") === "futures");
  const swgRows = ((D && D.equityStrategies) || []).map((x) => ({ account: x.account, category: "swings" }));

  const worldState = {
    options: state((D && D.strategies) || [], "options", schwabBad),
    swings: state(swgRows, "swings", ibkrBad),
    futures: state((D && D.strategies) || [], "futures", schwabBad),
  };

  const navBtn = (n) => {
    const on = page === n.id;
    return (
      <button key={n.id} onClick={() => onNav(n.id)} className="nt-nav" data-on={on ? "" : undefined}
        style={{
          display: "flex", alignItems: "center", gap: 11, height: 38, padding: "0 10px",
          borderRadius: "var(--radius-md)", cursor: "pointer", textAlign: "left",
          fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)",
          transition: "background var(--dur), color var(--dur)",
        }}>
        <Ico name={n.icon} size={18} />
        {n.label}
      </button>
    );
  };

  return (
    <aside style={{
      width: 218, flex: "none", background: "var(--ink-0)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", padding: "16px 14px",
    }}>
      {/* brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 6px 18px" }}>
        <img src="/assets/logo-mark.png" width="30" height="30" alt="Reezer" style={{ borderRadius: 9 }} />
        <span style={{ font: "var(--w-semibold) 17px/1 var(--font-sans)", letterSpacing: "var(--ls-tight)" }}>Reezer</span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {worlds.length > 1 && (
          <WorldPicker worlds={worlds} current={w} state={worldState}
            onPick={(id) => { if (onWorld) onWorld(id); }} />
        )}
        {nav.map(navBtn)}

        {/* shared by both worlds */}
        <div style={{ height: 1, background: "var(--border)", margin: "10px 4px 7px" }} />
        {navBtn({ id: "activity", label: "Activity", icon: "activity" })}

        {/* standout "Ask Reezer" pill — separate from the nav, one blank row above */}
        <button className="nt-askai" data-on={page === "advisor" ? "" : undefined} onClick={() => onNav("advisor")}
          style={{ display: "flex", alignItems: "center", gap: 11, height: 40, marginTop: 34, padding: "0 11px",
            borderRadius: "var(--radius-md)", cursor: "pointer", textAlign: "left", width: "100%",
            font: "var(--w-semibold) var(--t-sm)/1 var(--font-sans)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
            <ellipse cx="12" cy="12" rx="3.6" ry="8" />
            <ellipse cx="12" cy="12" rx="3.6" ry="8" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="3.6" ry="8" transform="rotate(120 12 12)" />
            <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
          </svg>
          Ask Reezer
        </button>
      </nav>

      <div style={{ display: "flex", flexDirection: "column", gap: 3, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
        <button className="nt-nav" data-on={(page === "sources" || page === "settings") ? "" : undefined} onClick={() => onNav("sources")}
          style={{ display: "flex", alignItems: "center", gap: 11, height: 38, padding: "0 10px", borderRadius: "var(--radius-md)", cursor: "pointer", font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)", textAlign: "left" }}>
          <Ico name="settings" size={18} /> Settings
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px 2px" }}>
          <div style={{ width: 30, height: 30, flex: "none", borderRadius: "50%", background: "var(--violet-soft)", border: "1px solid var(--violet-line)", display: "grid", placeItems: "center", font: "var(--w-semibold) 13px/1 var(--font-sans)", color: "var(--accent)" }}>
            {(window.NT_USER_NAME || D.session.user || "G").charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div title={window.NT_USER_EMAIL || ""} style={{ font: "var(--w-semibold) var(--t-sm)/1 var(--font-sans)", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{window.NT_USER_NAME || D.session.user}</div>
            <div style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 3 }}>Trader</div>
          </div>
          <button title="Sign out" aria-label="Sign out"
            onClick={() => window.NT_CLIENT && window.NT_CLIENT.auth.signOut().then(() => location.reload())}
            style={{ flex: "none", background: "transparent", border: "1px solid transparent", color: "var(--text-tertiary)", cursor: "pointer", padding: 6, borderRadius: "var(--radius-md)", display: "grid", placeItems: "center" }}>
            <Ico name="log-out" size={17} />
          </button>
        </div>
        <button onClick={() => onNav("updates")} title="What's new"
          style={{ alignSelf: "flex-end", marginTop: 4, background: "transparent", border: "none", cursor: "pointer",
            padding: "4px 14px", font: "var(--w-medium) var(--t-2xs)/1 var(--font-mono)",
            color: page === "updates" ? "var(--accent)" : "var(--text-tertiary)" }}>
          v{window.NT_VERSION || "1.0"}
        </button>
      </div>
      <style>{`
        .nt-nav{ background: transparent; border: 1px solid transparent; color: var(--text-secondary); font-weight: var(--w-medium); }
        .nt-nav[data-on]{ background: var(--violet-soft); border-color: var(--violet-line); color: var(--accent); font-weight: var(--w-semibold); }
        .nt-nav:not([data-on]):hover{ background: var(--surface-inset); color: var(--text-primary); }
        .nt-askai{ border: 1px solid rgba(255,255,255,0.06); color: #fff;
          background: linear-gradient(100deg, #6a57cf 0%, #8a54bd 52%, #5566c4 100%);
          box-shadow: 0 3px 12px rgba(110,91,242,0.22);
          transition: filter var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out); }
        .nt-askai:hover{ filter: brightness(1.08); box-shadow: 0 5px 16px rgba(110,91,242,0.32); }
        .nt-askai[data-on]{ box-shadow: 0 0 0 1px var(--violet-line), 0 5px 16px rgba(110,91,242,0.34); filter: brightness(1.06); }
      `}</style>
    </aside>
  );
}
Object.assign(window, { Sidebar, Ico });

/* Sidebar — labeled nav rail with brand + subpages. */
function Ico({ name, size = 20, color = "currentColor", sw = 1.75 }) {
  return <i data-lucide={name} style={{ width: size, height: size, display: "inline-flex", color }} data-sw={sw}></i>;
}

function Sidebar({ page, onNav }) {
  const D = window.NT_DATA;
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
    { id: "trades", label: "Trades", icon: "candlestick-chart" },
    { id: "log", label: "Alerts", icon: "message-square-dot" },
    { id: "backtesting", label: "Backtesting", icon: "flask-conical" },
    { id: "fronttest", label: "Fronttesting", icon: "git-compare-arrows" },
    { id: "strategies", label: "Strategies", icon: "target" },
  ];
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
        <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "6px 8px 8px" }}>Workspace</span>
        {nav.map((n) => {
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
        })}
      </nav>

      <div style={{ display: "flex", flexDirection: "column", gap: 3, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
        <button className="nt-nav" style={{ display: "flex", alignItems: "center", gap: 11, height: 38, padding: "0 10px", borderRadius: "var(--radius-md)", background: "transparent", border: "1px solid transparent", color: "var(--text-secondary)", cursor: "pointer", font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)" }}>
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
          style={{ alignSelf: "flex-start", marginTop: 4, background: "transparent", border: "none", cursor: "pointer",
            padding: "4px 8px", font: "var(--w-medium) var(--t-2xs)/1 var(--font-mono)",
            color: page === "updates" ? "var(--accent)" : "var(--text-tertiary)" }}>
          v{window.NT_VERSION || "1.0"} · what's new
        </button>
      </div>
      <style>{`
        .nt-nav{ background: transparent; border: 1px solid transparent; color: var(--text-secondary); font-weight: var(--w-medium); }
        .nt-nav[data-on]{ background: var(--violet-soft); border-color: var(--violet-line); color: var(--accent); font-weight: var(--w-semibold); }
        .nt-nav:not([data-on]):hover{ background: var(--surface-inset); color: var(--text-primary); }
      `}</style>
    </aside>
  );
}
Object.assign(window, { Sidebar, Ico });

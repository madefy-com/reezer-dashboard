/* FuturesPage — the futures world (MNQ & friends, Schwab).

   Deliberately NOT its own design: it renders the SAME components as the options world so
   the two read identically. Alerts is the shared LogPage scoped to this category; the
   dashboard reuses the same two-column layout and the same DiscordLog feed. Only the
   headline cards differ, because there are no futures trades yet to summarise.

   The alert feed is his calls only — other posters in that channel are dropped before they
   are ever recorded, so nothing here needs greying out by author. */

function FuturesPage({ page }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const h = () => force((x) => x + 1);
    window.addEventListener("nt-data", h);
    return () => window.removeEventListener("nt-data", h);
  }, []);
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  const rows = (window.NT_DATA.discord || []).filter((m) => m.cat === "futures");
  const acted = rows.filter((r) => r.fired);
  const entries = acted.filter((r) => String(r.type).toUpperCase() === "ENTRY");
  const exits = acted.filter((r) => String(r.type).toUpperCase() === "CLOSE");
  // Keep the sidebar picker's status line honest.
  window.NT_FUTURES_STATE = rows.length ? acted.length + " acted · " + rows.length + " read" : "reading";

  if (page === "futures-alerts") {
    return <LogPage category="futures" title="Alerts"
      subtitle="Every message from the trader we follow — other posters in the channel are never recorded" />;
  }

  if (page === "futures-dashboard") {
    const card = (label, value, sub, tone) => (
      <NT.Card padding={18}>
        <div style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{label}</div>
        <div className="num" style={{ font: "var(--w-semibold) var(--t-h2)/1 var(--font-sans)", color: tone || "var(--text-primary)", marginTop: 8 }}>{value}</div>
        <div style={{ font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 6 }}>{sub}</div>
      </NT.Card>
    );
    return (
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
        <PageHead title={greeting(window.NT_USER_NAME || "")} subtitle="Futures · following one trader on MNQ · Schwab" />
        <div className="nt-kpi-row">
          {card("alerts read", String(rows.length), "from the futures channel")}
          {card("tradeable", String(acted.length), entries.length + " entries · " + exits.length + " exits")}
          {card("entries", String(entries.length), "his fills, taken at market")}
          {card("trading", "reading only", "no orders until a strategy is on", "var(--dryrun)")}
        </div>
        <div className="nt-body" style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gridTemplateRows: "minmax(0,1fr)", gap: "var(--gap-grid)", alignItems: "stretch" }}>
          <NT.Card title="Trades" padding={20}>
            <div style={{ font: "var(--w-regular) var(--t-sm)/1.6 var(--font-sans)", color: "var(--text-tertiary)", maxWidth: 460 }}>
              No futures trades yet. Every alert is being read and recorded, but nothing is
              ordered until a futures strategy exists and is switched on.
            </div>
          </NT.Card>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <DiscordLog fill category="futures" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title={page === "futures-trades" ? "Trades" : "Strategies"}
        subtitle="Being built — alerts are already being read and recorded" />
      <NT.Card padding={22}>
        <div style={{ font: "var(--w-regular) var(--t-sm)/1.6 var(--font-sans)", color: "var(--text-secondary)", maxWidth: 640 }}>
          {page === "futures-trades"
            ? "No futures trades yet. The channel is being read and every one of his alerts is recorded, but nothing is ordered until a strategy is created and switched on."
            : "No futures strategy yet. The next step is a strategy that takes his entries at market on Schwab and manages the exit with your own rules, the same shape as the options strategies."}
        </div>
      </NT.Card>
    </div>
  );
}

Object.assign(window, { FuturesPage });

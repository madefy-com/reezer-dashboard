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

  // The dashboard is the SAME component the options world uses — same cards, same layout,
  // same feed — just scoped to this category. Most of it is empty until futures trades, and
  // that is the point: the page does not change shape when data arrives.
  if (page === "futures-dashboard") return <DashboardPage category="futures" />;

  // Strategies and Trades are the SAME components the options world uses, scoped to this
  // category — so the futures strategy is edited exactly like an options one, with the same
  // stop / target / max-hold controls, rather than living only in the database.
  if (page === "futures-strategies") return <StrategiesPage category="futures" />;
  if (page === "futures-trades") return <TradesPage category="futures" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Futures" subtitle="Being built" />
    </div>
  );
}

Object.assign(window, { FuturesPage });

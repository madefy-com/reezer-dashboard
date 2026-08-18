/* FuturesPage — the futures world (MNQ & friends, Schwab).

   Reads the SAME `alerts` table as options, filtered to the futures source. Only the
   followed trader's messages are ever written, so there is nothing to grey out here: every
   row is his. What varies is whether we would act on it (`fired`) and why not.

   Trades/Strategies are stubs until the engine lands; Alerts is live now so tomorrow's
   session can be read as it happens. */

const FU_ago = (iso) => {
  if (!iso) return "never";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return Math.round(s) + "s ago";
  if (s < 5400) return Math.round(s / 60) + "m ago";
  if (s < 172800) return Math.round(s / 3600) + "h ago";
  return Math.round(s / 86400) + "d ago";
};
const FU_time = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d) ? "—" : d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};
const FU_day = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

/* Entry/close/cancel carry the trade meaning; everything else is context he posted around
   the trade. Same pill vocabulary as the options feed so the two read alike. */
const FU_PILL = {
  ENTRY: ["var(--live)", "var(--live-bg)"],
  CLOSE: ["var(--violet-400)", "var(--violet-soft)"],
  CANCEL: ["var(--dryrun)", "var(--dryrun-bg)"],
  NOISE: ["var(--text-tertiary)", "var(--surface-inset)"],
};

function FU_Pill({ kind }) {
  const c = FU_PILL[kind] || FU_PILL.NOISE;
  const label = kind === "NOISE" ? "context" : kind.toLowerCase();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 9px",
      borderRadius: "var(--radius-sm)", background: c[1], color: c[0],
      font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)",
      textTransform: "uppercase" }}>{label}</span>
  );
}

function FuturesPage({ page }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const db = window.NT_CLIENT;
  const [rows, setRows] = React.useState(null);
  const [src, setSrc] = React.useState(null);
  const [onlyActed, setOnlyActed] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!db) return;
    const s = await db.from("sources").select("*").eq("category", "futures").limit(1).maybeSingle();
    const source = (s && s.data) || null;
    setSrc(source);
    window.NT_HAS_FUTURES = !!source;
    if (!source) { setRows([]); return; }
    const r = await db.from("alerts").select("*").eq("source_id", source.id)
      .order("discord_ts", { ascending: false, nullsFirst: false }).limit(200);
    const data = (r && r.data) || [];
    setRows(data);
    // Feed the sidebar picker's status line.
    const fired = data.filter((x) => x.fired).length;
    window.NT_FUTURES_STATE = data.length ? fired + " acted · " + data.length + " read" : "no alerts yet";
    window.dispatchEvent(new Event("nt-data"));
  }, [db]);

  React.useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [load]);
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  if (rows === null) return <div style={{ color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)" }}>Loading…</div>;

  const acted = rows.filter((r) => r.fired);
  const shown = onlyActed ? acted : rows;
  const newest = rows[0];
  const entries = acted.filter((r) => r.type === "ENTRY");
  const exits = acted.filter((r) => r.type === "CLOSE");

  // ---- Alerts (and the dashboard, which is the same feed plus headline numbers) ----
  const feed = (
    <NT.Card title="Alerts" padding={20} bodyStyle={{ padding: 0 }}
      action={(
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>
            {acted.length} acted · {rows.length} read
          </span>
          <button type="button" onClick={() => setOnlyActed((v) => !v)}
            style={{ height: 26, padding: "0 10px", borderRadius: "var(--radius-sm)", cursor: "pointer",
              border: "1px solid " + (onlyActed ? "var(--accent)" : "var(--border-strong)"),
              background: onlyActed ? "var(--violet-soft)" : "transparent",
              color: onlyActed ? "var(--accent)" : "var(--text-secondary)",
              font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)" }}>
            {onlyActed ? "Showing tradeable" : "Show tradeable only"}
          </button>
        </span>
      )}>
      {!shown.length ? (
        <div style={{ padding: 20, font: "var(--w-regular) var(--t-sm)/1.5 var(--font-sans)", color: "var(--text-tertiary)" }}>
          Nothing yet. The channel is being watched — his next message appears here within
          about 20 seconds. Only his posts are recorded; everyone else's are dropped.
        </div>
      ) : shown.map((r, i) => (
        <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 13, padding: "12px 18px",
          borderTop: i ? "1px solid var(--border)" : "none", opacity: r.fired ? 1 : 0.72 }}>
          <div style={{ flex: "none", width: 52, textAlign: "right" }}>
            <div style={{ font: "var(--w-medium) var(--t-xs)/1.2 var(--font-mono)", color: "var(--text-secondary)" }}>{FU_time(r.discord_ts || r.ts)}</div>
            <div style={{ font: "var(--w-regular) var(--t-2xs)/1.3 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 2 }}>{FU_day(r.discord_ts || r.ts)}</div>
          </div>
          <span style={{ flex: "none", marginTop: 1 }}><FU_Pill kind={r.type} /></span>
          {r.ticker ? (
            <span style={{ flex: "none", marginTop: 1, font: "var(--w-semibold) var(--t-xs)/22px var(--font-mono)", color: "var(--text-primary)", minWidth: 34 }}>{r.ticker}</span>
          ) : <span style={{ flex: "none", minWidth: 34 }} />}
          {r.direction ? (
            <span style={{ flex: "none", marginTop: 1, font: "var(--w-semibold) var(--t-2xs)/22px var(--font-sans)", letterSpacing: "var(--ls-caps)",
              color: r.direction === "LONG" ? "var(--profit)" : "var(--loss)", minWidth: 42 }}>{r.direction}</span>
          ) : <span style={{ flex: "none", minWidth: 42 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: "var(--w-regular) var(--t-sm)/1.45 var(--font-sans)", color: "var(--text-primary)", wordBreak: "break-word" }}>{r.raw}</div>
            {!r.fired && r.reason ? (
              <div style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 3 }}>{r.reason}</div>
            ) : null}
          </div>
        </div>
      ))}
    </NT.Card>
  );

  if (page === "futures-alerts") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
        <PageHead title="Futures alerts" subtitle={
          "Only PT | Nitro Trades is recorded — other posters in the channel are never stored"
          + (newest ? " · last message " + FU_ago(newest.discord_ts || newest.ts) : "")} />
        {feed}
      </div>
    );
  }

  if (page === "futures-dashboard") {
    const card = (label, value, sub, tone) => (
      <NT.Card padding={18}>
        <div style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{label}</div>
        <div style={{ font: "var(--w-semibold) var(--t-h2)/1 var(--font-sans)", color: tone || "var(--text-primary)", marginTop: 8 }}>{value}</div>
        <div style={{ font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 6 }}>{sub}</div>
      </NT.Card>
    );
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
        <PageHead title="Futures" subtitle="Following PT | Nitro Trades on MNQ and friends · Schwab" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--gap-grid)" }}>
          {card("alerts read", String(rows.length), src ? "from " + src.name : "no source")}
          {card("tradeable", String(acted.length), entries.length + " entries · " + exits.length + " exits")}
          {card("last message", newest ? FU_ago(newest.discord_ts || newest.ts) : "—", "channel is polled every 20s")}
          {card("trading", "not yet", "reading only — no orders placed", "var(--dryrun)")}
        </div>
        {feed}
      </div>
    );
  }

  // Trades / Strategies — deliberately honest placeholders until the engine exists.
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title={page === "futures-trades" ? "Futures trades" : "Futures strategies"}
        subtitle="Being built — alerts are already being read and recorded" />
      <NT.Card padding={22}>
        <div style={{ font: "var(--w-regular) var(--t-sm)/1.6 var(--font-sans)", color: "var(--text-secondary)", maxWidth: 640 }}>
          {page === "futures-trades"
            ? "No futures trades yet. The channel is being read and every one of his alerts is recorded, but nothing is ordered until a strategy is created and switched on."
            : "No futures strategy yet. The next step is a strategy that takes his entries at market on Schwab and manages the exit with your own rules — the same shape as the options strategies."}
        </div>
      </NT.Card>
    </div>
  );
}

Object.assign(window, { FuturesPage });

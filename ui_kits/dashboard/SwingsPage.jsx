/* SwingsPage — the swing / positional world. One component, four views (Dashboard,
   Alerts, Trades, Strategies) picked by the `page` id, all driven by the Macrotrends
   portfolio sheet. Deliberately separate from the 0DTE options pages: its own tables
   (equity_strategies, equity_positions, sheet_signals, sheet_snapshots) and its own money.
   Broker and source configuration live in Settings — never on these pages. */

const SW_INPUT = { height: 38, padding: "0 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-strong)", background: "var(--surface-inset)", color: "var(--text-primary)", colorScheme: "dark", font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)", width: "100%", boxSizing: "border-box" };

function SW_Field({ label, hint, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{label}</span>
      {children}
      {hint ? <span style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)" }}>{hint}</span> : null}
    </label>
  );
}

/* Every number on this page goes through one of these — rounded, thousands-separated,
   and "—" (never NaN) when the underlying field is missing. */
const SW_n = (v) => {
  if (v == null || v === "") return null;
  const x = Number(v);
  return isNaN(x) ? null : x;
};
const SW_cur = (v, ccy) => {
  const x = SW_n(v);
  if (x == null) return "\u2014";
  const sym = { EUR: "\u20ac", GBP: "\u00a3", USD: "$", CAD: "C$" }[ccy] || "$";
  return (x < 0 ? "\u2212" : "") + sym + Math.abs(Math.round(x)).toLocaleString();
};
const SW_money = (v) => {
  const x = SW_n(v);
  if (x == null) return "—";
  return (x < 0 ? "−$" : "$") + Math.abs(Math.round(x)).toLocaleString();
};
const SW_pct = (v) => {
  const x = SW_n(v);
  if (x == null) return "—";
  const r = Math.round(x * 10) / 10;
  return (r > 0 ? "+" : "") + r.toFixed(1) + "%";
};
const SW_dec = (v) => {
  const x = SW_n(v);
  return x == null ? "—" : String(Math.round(x * 10) / 10);
};
const SW_price = (v) => {
  const x = SW_n(v);
  return x == null ? "—" : (Math.round(x * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const SW_ago = (iso) => {
  if (!iso) return "never";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return Math.round(s) + "s ago";
  if (s < 5400) return Math.round(s / 60) + "m ago";
  if (s < 172800) return Math.round(s / 3600) + "h ago";
  return Math.round(s / 86400) + "d ago";
};
const SW_date = (iso) => {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "—";
  return new Date(t).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
/* whole days between two stamps; `to` empty means "until now" (a position still open) */
const SW_days = (from, to) => {
  if (!from) return null;
  const a = new Date(from).getTime();
  const b = to ? new Date(to).getTime() : Date.now();
  if (isNaN(a) || isNaN(b)) return null;
  return Math.max(0, Math.round((b - a) / 86400000));
};

function SW_Pill({ tone, children }) {
  const c = { ok: ["var(--profit)", "rgba(52,199,123,.12)"], warn: ["var(--dryrun)", "var(--dryrun-bg)"],
              bad: ["var(--loss)", "rgba(255,90,90,.12)"], mute: ["var(--text-tertiary)", "var(--surface-inset)"] }[tone || "mute"];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 9px", borderRadius: 999, background: c[1], color: c[0], font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase" }}>{children}</span>;
}

function SwingsPage({ page }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const db = window.NT_CLIENT;
  const [d, setD] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [edit, setEdit] = React.useState(null);
  const announced = React.useRef(false);

  const load = React.useCallback(async () => {
    if (!db) return;
    const y = new Date().getFullYear();
    const [strats, pos, sigs, snaps, bench, fx, brokers] = await Promise.all([
      db.from("equity_strategies").select("*").order("id"),
      db.from("equity_positions").select("*").order("id", { ascending: false }),
      db.from("sheet_signals").select("*").order("detected_at", { ascending: false }).limit(60),
      db.from("sheet_snapshots").select("*").order("fetched_at", { ascending: false }).limit(10),
      db.from("benchmark_prices").select("d,close").eq("symbol", "SPY").gte("d", y + "-01-01").order("d", { ascending: true }),
      // the sheet quotes in $/€/£/C$ but everything here is reported in USD
      db.from("benchmark_prices").select("symbol,close,d").in("symbol", ["EURUSD", "GBPUSD", "CADUSD"]).order("d", { ascending: false }).limit(30),
      db.from("equity_broker_accounts").select("*"),
    ]);
    const strategies = strats.data || [];
    window.NT_HAS_SWINGS = strategies.length > 0;
    // one nudge so the sidebar re-renders and can show the world switcher
    if (!announced.current) { announced.current = true; window.dispatchEvent(new Event("nt-data")); }
    const rates = { USD: 1 };            // newest row per currency wins (list is date-desc)
    (fx.data || []).forEach((r) => { const c = String(r.symbol).slice(0, 3); if (rates[c] == null) rates[c] = Number(r.close); });
    setD({ strats: strategies, pos: pos.data || [], sigs: sigs.data || [],
           snaps: snaps.data || [], bench: bench.data || [], fx: rates, brokers: brokers.data || [] });
  }, [db]);
  React.useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  if (!d) return <div style={{ color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)" }}>Loading…</div>;

  // ---------------------------------------------------------------- derived
  const year = new Date().getFullYear();
  const openPos = d.pos.filter((p) => p.status === "open");
  const closedPos = d.pos.filter((p) => p.status === "closed");
  // Everything is reported in USD. The sheet quotes each holding in its own market's currency
  // (C$ / € / £ / $), so a price is only meaningful together with its unit.
  const fx = d.fx || { USD: 1 };
  const usd = (v, ccy) => { const r = fx[ccy || "USD"]; return (v == null || r == null) ? null : v * r; };
  // Current marks come from the sheet's own price column, stored parsed on the newest snapshot.
  const markSnap = d.snaps.filter((s) => s.tab === "portfolio" && s.prices)[0] || null;
  const marks = (markSnap && markSnap.prices) || {};
  const markOf = (p) => marks[String(p.symbol || "").toUpperCase()] || null;

  const costOf = (p) => usd((SW_n(p.qty) || 0) * (SW_n(p.avg_price) || 0), (markOf(p) || {}).ccy) || 0;
  const openValue = openPos.reduce((a, p) => a + costOf(p), 0);
  const realized = closedPos.reduce((a, p) => a + (SW_n(p.realized_pnl) || 0), 0);
  // Swing positions are held for MONTHS, so realized-only P&L would read zero for most of the
  // year — the unrealized move is the number that actually matters. Marked off the sheet's own
  // price column (the same source the entry was sized on, so entry and mark share a currency).
  const unrealOf = (p) => {
    const m = markOf(p);
    const e = SW_n(p.avg_price), q = SW_n(p.qty);
    if (!m || e == null || q == null) return null;
    return usd((SW_n(m.px) - e) * q, m.ccy);
  };
  const unrealized = openPos.reduce((a, p) => a + (unrealOf(p) || 0), 0);
  const totalPnl = realized + unrealized;

  // Account return comes from the LINKED BROKER's real account value — never a number typed in
  // by hand, and never the sizing amount (that's the notional the sheet's weights apply to, not
  // the account). With nothing linked there is no honest denominator, so the card shows nothing.
  // Straight from the broker — the dashboard never invents an account figure. src/ibkr_broker
  // sync_account() is the only writer; if it hasn't run, these stay null and the cards say so.
  const linkedIds = d.strats.map((s) => s.broker_account_id).filter(Boolean);
  const linked = (d.brokers || []).filter((b) => linkedIds.indexOf(b.id) >= 0);
  const bset = (linked[0] || {}).settings || {};
  const acctValue = SW_n(bset.account_value);
  const buyingPower = SW_n(bset.buying_power);
  const acctCcy = bset.currency || "USD";
  const syncedAt = bset.synced_at || (linked[0] || {}).last_check_at || null;
  const startBal = acctValue != null ? acctValue - totalPnl : 0;   // value today, less what we made
  const acctRet = startBal > 0 ? (totalPnl / startBal) * 100 : null;

  const closedThisYear = closedPos.filter((p) => p.closed_at && new Date(p.closed_at).getFullYear() === year);
  const ytdPnl = closedThisYear.reduce((a, p) => a + (SW_n(p.realized_pnl) || 0), 0) + unrealized;
  const ytdRet = startBal > 0 ? (ytdPnl / startBal) * 100 : null;

  const winners = closedPos.filter((p) => (SW_n(p.realized_pnl) || 0) > 0);
  const winFrac = closedPos.length ? winners.length / closedPos.length : null;

  const retOf = (p) => {
    const e = SW_n(p.avg_price), x = SW_n(p.exit_price);
    return (e != null && e > 0 && x != null) ? ((x - e) / e) * 100 : null;
  };
  const rets = closedPos.map(retOf).filter((v) => v != null);
  const avgRet = rets.length ? rets.reduce((a, v) => a + v, 0) / rets.length : null;
  const holds = closedPos.map((p) => SW_days(p.opened_at, p.closed_at)).filter((v) => v != null);
  const avgHold = holds.length ? holds.reduce((a, v) => a + v, 0) / holds.length : null;

  // The benchmark window. In the FIRST year the strategy is measured from its first buy, not
  // from 1 January — a strategy that started in August has no business being compared with the
  // index's whole year. Once it has run through a new year start, it becomes an ordinary
  // year-to-date comparison (the first buy is then in an earlier year).
  const entryDates = (d.pos || []).map((p) => p.opened_at).filter(Boolean).sort();
  const firstEntry = entryDates.length ? entryDates[0] : null;
  const firstYear = firstEntry ? new Date(firstEntry).getFullYear() : null;
  const sinceInception = firstEntry != null && firstYear === year;
  const benchFrom = sinceInception ? String(firstEntry).slice(0, 10) : (year + "-01-01");
  const bench = d.bench.filter((b) => String(b.d) >= benchFrom);
  const bFirst = bench.length ? SW_n(bench[0].close) : null;
  const bLast = bench.length ? SW_n(bench[bench.length - 1].close) : null;
  const spyYtd = (bench.length >= 2 && bFirst != null && bFirst > 0 && bLast != null) ? ((bLast / bFirst) - 1) * 100 : null;
  const benchLabel = sinceInception ? ("since " + SW_date(firstEntry)) : "YTD";
  // Compare MONEY AT WORK, not the whole account. The strategy starts flat and stays mostly
  // cash for months, so measuring an account that is 0-25% invested against a fully-invested
  // index would report a big negative before a single trade is placed — "you can't be down if
  // you never bought anything". So: return on invested capital, and nothing at all until we
  // have actually traded. Cash drag stays visible on its own card (exposure).
  const investedCost = openPos.reduce((a, p) => a + ((SW_n(p.qty) || 0) * (SW_n(p.avg_price) || 0)), 0);
  const closedCost = closedPos.reduce((a, p) => a + ((SW_n(p.orig_qty) || 0) * (SW_n(p.avg_price) || 0)), 0);
  const capitalUsed = investedCost + closedCost;
  const investedRet = capitalUsed > 0 ? (totalPnl / capitalUsed) * 100 : null;
  const traded = (d.pos || []).length > 0;
  const edge = (traded && investedRet != null && spyYtd != null) ? investedRet - spyYtd : null;

  const portfolioSnap = d.snaps.filter((s) => s.tab === "portfolio")[0] || null;
  const feedAge = portfolioSnap ? (Date.now() - new Date(portfolioSnap.fetched_at).getTime()) / 60000 : null;
  const feedTone = feedAge == null ? "mute" : feedAge < 20 ? "ok" : feedAge < 180 ? "warn" : "bad";
  const feedLabel = feedAge == null ? "no data" : feedTone === "ok" ? "live" : feedTone === "warn" ? "lagging" : "stale";

  const tone = (v) => (v == null ? null : v > 0 ? "profit" : v < 0 ? "loss" : null);
  const pnlColor = (v) => (v == null ? "var(--text-secondary)" : v > 0 ? "var(--profit)" : v < 0 ? "var(--loss)" : "var(--text-secondary)");

  // ---------------------------------------------------------------- writes
  const save = async (row) => {
    setBusy(true);
    try {
      const payload = {
        name: row.name, sizing_mode: row.sizing_mode || "tiers_usd",
        account: row.account === "live" ? "live" : "paper",
        sizing_tiers: (function () {                  // keep only filled-in tiers, as numbers
          const t = row.sizing_tiers || {}, out = {};
          ["1", "2", "3", "3plus"].forEach(function (k) {
            const v = Number(t[k]);
            if (t[k] !== "" && t[k] != null && !isNaN(v) && v > 0) out[k] = v;
          });
          return Object.keys(out).length ? out : null;
        })(),
        start_balance_usd: row.start_balance_usd === "" || row.start_balance_usd == null ? null : Number(row.start_balance_usd),
        max_position_usd: row.max_position_usd === "" || row.max_position_usd == null ? null : Number(row.max_position_usd),
        allowlist: (row.allowlist || "").trim() || null,
        updated_at: new Date().toISOString(),
      };
      const r = row.id ? await db.from("equity_strategies").update(payload).eq("id", row.id)
                       : await db.from("equity_strategies").insert({ ...payload, account: "paper", paused: true });
      if (r.error) throw r.error;
      setEdit(null); await load();
    } catch (e) { await window.NT_ALERT("Couldn’t save: " + (e.message || e), { title: "Swing strategy" }); }
    setBusy(false);
  };
  const togglePause = async (s) => {
    setBusy(true);
    try { await db.from("equity_strategies").update({ paused: !s.paused, updated_at: new Date().toISOString() }).eq("id", s.id); await load(); }
    finally { setBusy(false); }
  };
  const statsFor = (sid) => {
    const mine = d.pos.filter((p) => p.strategy_id === sid);
    const mineOpen = mine.filter((p) => p.status === "open");
    return {
      open: mineOpen.length,
      invested: mineOpen.reduce((a, p) => a + costOf(p), 0),
      realized: mine.reduce((a, p) => a + (SW_n(p.realized_pnl) || 0), 0),
      total: mine.length,
    };
  };

  // ---------------------------------------------------------------- KPI cards
  // Card design copied verbatim from KpiRow.jsx so both worlds read identically.
  const toneCol = (t) => (t === "profit" ? "var(--profit)" : t === "loss" ? "var(--loss)" : "var(--text-primary)");
  const cardStyle = { display: "flex", flexDirection: "column", gap: 10, padding: "18px 18px 16px", background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", minWidth: 0 };
  const labelStyle = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "lowercase", color: "var(--text-tertiary)" };
  const valStyle = (t) => ({ font: "var(--w-light) var(--t-kpi)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", letterSpacing: "var(--ls-tight)", color: toneCol(t) });
  const subStyle = { font: "var(--w-regular) var(--t-xs)/1.3 var(--font-sans)", color: "var(--text-tertiary)" };
  const ring = (frac) => {
    const f = Math.max(0, Math.min(1, frac || 0)), r = 11, c = 2 * Math.PI * r;
    return (
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" style={{ flex: "none" }}>
        <circle cx="15" cy="15" r={r} fill="none" stroke="var(--line-3)" strokeWidth="4" />
        <circle cx="15" cy="15" r={r} fill="none" stroke="var(--profit)" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - f * c} transform="rotate(-90 15 15)" />
      </svg>
    );
  };
  const Kard = ({ label, value, sub, tone, visual }) => (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 30 }}>
        <span style={labelStyle}>{label}</span>
        {visual || null}
      </div>
      <span style={valStyle(tone)}>{value != null ? value : "—"}</span>
      {sub ? <span style={subStyle}>{sub}</span> : null}
    </div>
  );

  const kpiRow = (
    <div className="nt-kpi-row">
      {/* Straight from the broker so you never have to log in there to see it. Buying power
          rides underneath as the small line — it's the number that decides what you can act on. */}
      <Kard label="account value" value={acctValue == null ? "—" : SW_cur(acctValue, acctCcy)}
        sub={acctValue == null ? "needs a linked broker"
          : (buyingPower == null ? "at your broker"
             : SW_cur(buyingPower, acctCcy) + " buying power")} />
      <Kard label="return this year" value={SW_pct(ytdRet)} tone={tone(ytdRet)}
        sub={year + " · " + closedThisYear.length + " closed"}
        visual={<Ico name="calendar" size={17} color="var(--text-tertiary)" />} />
      <Kard label="net p&l" value={SW_money(realized)} tone={tone(realized)}
        sub={"realized · " + SW_money(openValue) + " open"} />
      <Kard label="win rate" value={winFrac == null ? "—" : Math.round(winFrac * 100) + "%"}
        tone={winFrac == null ? null : (winFrac >= 0.5 ? "profit" : "loss")}
        sub={winners.length + " of " + closedPos.length + " closed"} visual={ring(winFrac)} />
      <Kard label="avg return / trade" value={SW_pct(avgRet)} tone={tone(avgRet)}
        sub={avgHold == null ? "no closed trades yet" : "held " + Math.round(avgHold) + "d on average"}
        visual={<Ico name="clock" size={17} color="var(--text-tertiary)" />} />
      <Kard label="vs S&P 500" value={traded ? SW_pct(edge) : "—"} tone={traded ? tone(edge) : null}
        sub={traded
          ? ("your positions " + SW_pct(investedRet) + " · S&P " + SW_pct(spyYtd) + " " + benchLabel)
          : "nothing bought yet · starts at your first buy"} />
      <style>{`
        .nt-kpi-row{ display:grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: var(--gap-grid); }
        @media (max-width: 1240px){ .nt-kpi-row{ grid-template-columns: repeat(3, minmax(0,1fr)); } }
        @media (max-width: 720px){ .nt-kpi-row{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
      `}</style>
    </div>
  );

  // shared table styling (ActivityPage)
  const th = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "10px 14px", textAlign: "left", whiteSpace: "nowrap" };
  const thR = { ...th, textAlign: "right" };
  const td = { font: "var(--w-regular) var(--t-sm)/1.4 var(--font-sans)", padding: "9px 14px", borderTop: "1px solid var(--border)", textAlign: "left", color: "var(--text-secondary)", verticalAlign: "top" };
  const tdR = { ...td, textAlign: "right" };
  const mono = { font: "var(--w-regular) var(--t-sm)/1.4 var(--font-mono)", fontVariantNumeric: "tabular-nums" };
  const emptyBox = (text) => (
    <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-sm)/1.6 var(--font-sans)" }}>{text}</div>
  );

  // ---------------------------------------------------------------- dashboard
  if (page === "swings-dashboard") {
    const tracked = portfolioSnap && portfolioSnap.row_count != null ? portfolioSnap.row_count : "—";
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
        <PageHead title="Dashboard" subtitle="Swing positions from the Macrotrends portfolio sheet" />
        {kpiRow}
        <NT.Card title={"Holdings · " + openPos.length + " of " + tracked + " tracked"} padding={20} bodyStyle={{ padding: 0 }}>
          {openPos.length === 0 ? emptyBox("Nothing bought yet — the strategy starts flat and only buys when the sheet changes.") : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>holding</th>
                  <th style={thR}>sheet weight</th>
                  <th style={thR}>value</th>
                  <th style={thR}>unrealized p&l</th>
                  <th style={thR}>days held</th>
                </tr></thead>
                <tbody>
                  {openPos.map((p) => (
                    <tr key={p.id} className="nt-trow">
                      <td style={{ ...td, color: "var(--text-primary)" }}>
                        <span style={{ fontWeight: 500 }}>{p.symbol}</span>
                        {p.name ? <span style={{ color: "var(--text-tertiary)" }}>{" " + p.name}</span> : null}
                      </td>
                      <td style={{ ...tdR, ...mono }}>{p.target_pct == null ? "—" : SW_dec(p.target_pct) + "%"}</td>
                      <td style={{ ...tdR, ...mono, color: "var(--text-primary)" }}>{SW_money(costOf(p))}</td>
                      <td style={{ ...tdR, ...mono }}>—</td>
                      <td style={{ ...tdR, ...mono }}>{SW_days(p.opened_at, null) == null ? "—" : SW_days(p.opened_at, null) + "d"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </NT.Card>
      </div>
    );
  }

  // ---------------------------------------------------------------- alerts
  if (page === "swings-alerts") {
    const sigText = (s) => {
      if (s.kind === "advice") return (s.from_advies || "—") + " → " + (s.advies || "—");
      if (s.kind === "weight") return SW_dec(s.from_pct) + "% → " + SW_dec(s.target_pct) + "%";
      if (s.kind === "closed") return "publisher exited" + (s.result_pct != null ? " at " + SW_dec(s.result_pct) + "%" : "");
      if (s.kind === "added") return "new holding · " + SW_dec(s.target_pct) + "%";
      return s.kind || "";
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
        <PageHead title="Alerts" subtitle="Every change the publisher makes to the portfolio sheet" />
        <div style={{ display: "flex", alignItems: "center", gap: 10, font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>
          <span>Macrotrends sheet · checked {SW_ago(portfolioSnap && portfolioSnap.fetched_at)}</span>
          <SW_Pill tone={feedTone}>{feedLabel}</SW_Pill>
        </div>
        <NT.Card title={"Sheet changes" + (d.sigs.length ? " · " + d.sigs.length : "")} padding={20} bodyStyle={{ padding: 0 }}>
          {d.sigs.length === 0 ? emptyBox("Nothing yet — the current sheet is stored as the baseline. You’ll see entries here the first time the publisher changes something.") : d.sigs.map((s, i) => {
            const muted = !s.tradeable;
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "11px 20px",
                borderTop: i ? "1px solid var(--border)" : "none", color: muted ? "var(--text-tertiary)" : "var(--text-primary)", opacity: muted ? 0.75 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <SW_Pill tone={muted ? "mute" : s.action === "buy" ? "ok" : s.action === "sell" ? "bad" : "mute"}>{s.action}</SW_Pill>
                  <span style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)" }}>{s.symbol}</span>
                  <span style={{ font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", color: muted ? "var(--text-tertiary)" : "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {sigText(s) + (muted ? " · tracked, never ordered" : "")}
                  </span>
                </div>
                <span style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)", flex: "none" }}>{SW_ago(s.detected_at)}</span>
              </div>
            );
          })}
        </NT.Card>
      </div>
    );
  }

  // ---------------------------------------------------------------- trades
  if (page === "swings-trades") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
        <PageHead title="Trades" subtitle="Every swing position this book has taken" />
        <NT.Card title={"Positions" + (d.pos.length ? " · " + d.pos.length : "")} padding={20} bodyStyle={{ padding: 0 }}>
          {d.pos.length === 0 ? emptyBox("Nothing bought yet — the strategy starts flat and only buys when the sheet changes.") : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>holding</th>
                  <th style={thR}>qty</th>
                  <th style={thR}>entry</th>
                  <th style={thR}>exit</th>
                  <th style={thR}>p&l</th>
                  <th style={thR}>status</th>
                  <th style={thR}>opened</th>
                </tr></thead>
                <tbody>
                  {d.pos.map((p) => (
                    <tr key={p.id} className="nt-trow">
                      <td style={{ ...td, color: "var(--text-primary)" }}>
                        <span style={{ fontWeight: 500 }}>{p.symbol}</span>
                        {p.name ? <span style={{ color: "var(--text-tertiary)" }}>{" " + p.name}</span> : null}
                      </td>
                      <td style={{ ...tdR, ...mono }}>{SW_n(p.qty) == null ? "—" : Math.round(SW_n(p.qty)).toLocaleString()}</td>
                      <td style={{ ...tdR, ...mono }}>{SW_price(p.avg_price)}</td>
                      <td style={{ ...tdR, ...mono }}>{SW_price(p.exit_price)}</td>
                      <td style={{ ...tdR, ...mono, color: pnlColor(SW_n(p.realized_pnl)) }}>{p.realized_pnl == null ? "—" : SW_money(p.realized_pnl)}</td>
                      <td style={tdR}><SW_Pill tone={p.status === "open" ? "ok" : "mute"}>{p.status}</SW_Pill></td>
                      <td style={{ ...tdR, ...mono, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>{SW_date(p.opened_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </NT.Card>
      </div>
    );
  }

  // ---------------------------------------------------------------- strategies
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Strategies" subtitle="How much of your money each sheet weight is worth"
        right={<NT.Button variant="primary" size="md" icon={<Ico name="plus" size={15} />}
          onClick={() => setEdit({ name: "Macrotrends follow", sizing_mode: "tiers_usd", sizing_tiers: {}, max_position_usd: "", allowlist: "" })}>New strategy</NT.Button>} />

      {d.strats.length === 0 ? (
        <NT.Card padding={20}>
          <div style={{ color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-sm)/1.6 var(--font-sans)" }}>
            No swing strategy yet. Create one to decide how much of your money each sheet weight represents —
            a fixed amount, or a share of your account.
          </div>
        </NT.Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(430px,1fr))", gap: "var(--gap-grid)" }}>
          {d.strats.map((s) => {
            const st = statsFor(s.id);
            const T = s.sizing_tiers || {};
            const isPct = s.sizing_mode === "tiers_pct";
            const tierTxt = ["1", "2", "3", "3plus"].map(function (k) {
              const v = SW_n(T[k]);
              return v == null ? null : (k === "3plus" ? "3%+" : k + "%") + " " + (isPct ? SW_dec(v) + "%" : SW_money(v));
            }).filter(Boolean).join("  ·  ");
            const rows = [
              ["Sizing", isPct ? "% of your account, by their weight" : "a set amount per weight"],
              ["Per position", tierTxt || "not set"],
            ];
            rows.push(["Max per position", s.max_position_usd == null ? "no cap" : SW_money(s.max_position_usd)]);
            rows.push(["Only these tickers", s.allowlist || "all from the sheet"]);
            rows.push(["Broker", s.broker_account_id == null ? "not linked" : "linked in Settings"]);
            return (
              <NT.Card key={s.id} padding={20}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ font: "var(--w-semibold) var(--t-lg)/1.2 var(--font-sans)" }}>{s.name}</div>
                    <div style={{ font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 4 }}>
                      Starts flat · buys only on change
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <SW_Pill tone={s.account === "live" ? "bad" : "warn"}>{s.account}</SW_Pill>
                    <SW_Pill tone={s.paused ? "mute" : "ok"}>{s.paused ? "paused" : "active"}</SW_Pill>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, margin: "16px 0 4px", paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                  {[["open", st.open], ["invested", SW_money(st.invested)], ["realized", SW_money(st.realized)], ["trades", st.total]].map((m, i) => (
                    <div key={i}>
                      <div style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{m[0]}</div>
                      <div className="num" style={{ font: "var(--w-medium) var(--t-base)/1.2 var(--font-mono)", marginTop: 5 }}>{m[1]}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
                  {rows.map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, font: "var(--w-regular) var(--t-sm)/1.4 var(--font-sans)" }}>
                      <span style={{ color: "var(--text-tertiary)" }}>{r[0]}</span>
                      <span style={{ color: "var(--text-primary)", textAlign: "right" }}>{r[1]}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                  <NT.Button variant="ghost" size="sm" disabled={busy} onClick={() => togglePause(s)}>{s.paused ? "Activate" : "Pause"}</NT.Button>
                  <NT.Button variant="primary" size="md" icon={<Ico name="settings-2" size={15} />} onClick={() => setEdit({ ...s })}>Edit</NT.Button>
                </div>
              </NT.Card>
            );
          })}
        </div>
      )}

      {edit && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget) setEdit(null); }} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(8,8,10,.55)", display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ width: 520, maxWidth: "94vw", background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-pop)", padding: 24, display: "flex", flexDirection: "column", gap: 18, maxHeight: "90vh", overflowY: "auto" }}>
            <span style={{ font: "var(--w-semibold) var(--t-h3)/1 var(--font-sans)" }}>{edit.id ? "Edit strategy" : "New swing strategy"}</span>

            <SW_Field label="Name"><input value={edit.name || ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} style={SW_INPUT} /></SW_Field>

            {/* Sizing by CONVICTION TIER. The publisher grades every holding 1% / 2% / 3%, so
                each weight gets its own row and you set the curve by hand — a multiplier would
                force a 3% holding to be exactly 3x a 1% one. */}
            {(() => {
              const pctMode = edit.sizing_mode === "tiers_pct";
              const tiers = edit.sizing_tiers || {};
              const setTier = (k, v) => setEdit({ ...edit, sizing_tiers: { ...tiers, [k]: v } });
              const linked = !!edit.broker_account_id;
              const ROWS = [["1", "their 1%"], ["2", "their 2%"], ["3", "their 3%"], ["3plus", "above 3%"]];
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Position size per conviction</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["tiers_usd", "A fixed amount"], ["tiers_pct", "% of my account"]].map((o) => {
                      const on = (edit.sizing_mode || "tiers_usd") === o[0];
                      return (
                        <button key={o[0]} type="button"
                          onClick={() => setEdit({ ...edit, sizing_mode: o[0] })}
                          style={{ flex: 1, height: 40, borderRadius: "var(--radius-sm)", cursor: "pointer",
                            border: "1px solid " + (on ? "var(--accent)" : "var(--border-strong)"),
                            background: on ? "var(--surface-hover)" : "transparent",
                            color: on ? "var(--text-primary)" : "var(--text-tertiary)",
                            font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)" }}>{o[1]}</button>
                      );
                    })}
                  </div>
                  {pctMode && !linked && <span style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--dryrun)" }}>
                    Set this up now if you like, but it can only size once a broker is linked — your account value comes from there, never typed in. Until then nothing will be bought.
                  </span>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "var(--surface-inset)", borderRadius: "var(--radius-sm)" }}>
                    {ROWS.map((r) => (
                      <div key={r[0]} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ width: 88, flex: "none", font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)", color: "var(--text-secondary)" }}>{r[1]}</span>
                        <span style={{ color: "var(--text-tertiary)" }}>→</span>
                        <input type="number" value={tiers[r[0]] == null ? "" : tiers[r[0]]}
                          onChange={(e) => setTier(r[0], e.target.value)}
                          placeholder={pctMode ? "%" : "USD"}
                          style={{ ...SW_INPUT, height: 34, width: 120, flex: "none" }} />
                        <span style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>
                          {pctMode ? "% of account" : "per position"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Paper vs live. Deliberately a two-button choice with a spelled-out warning
                rather than a quiet toggle — this is the switch that starts spending money. */}
            <div>
              <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Mode</span>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {[["paper", "Paper"], ["live", "Live"]].map((o) => {
                  const on = (edit.account || "paper") === o[0];
                  const isLive = o[0] === "live";
                  return (
                    <button key={o[0]} type="button" onClick={() => setEdit({ ...edit, account: o[0] })}
                      style={{ flex: 1, height: 40, borderRadius: "var(--radius-sm)", cursor: "pointer",
                        border: "1px solid " + (on ? (isLive ? "var(--loss)" : "var(--accent)") : "var(--border-strong)"),
                        background: on ? "var(--surface-hover)" : "transparent",
                        color: on ? (isLive ? "var(--loss)" : "var(--text-primary)") : "var(--text-tertiary)",
                        font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)" }}>{o[1]}</button>
                  );
                })}
              </div>
              {edit.account === "live" && (
                <span style={{ display: "block", marginTop: 8, font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--loss)" }}>
                  Live places REAL orders with your own money as soon as the strategy is un-paused
                  and the publisher changes something. It needs a linked broker; nothing is ordered
                  while it stays paused.
                </span>
              )}
            </div>

            <SW_Field label="Max per position (USD)" hint="Safety cap — no single holding may exceed this. Empty = no cap.">
              <input type="number" value={edit.max_position_usd == null ? "" : edit.max_position_usd} onChange={(e) => setEdit({ ...edit, max_position_usd: e.target.value })} style={SW_INPUT} />
            </SW_Field>

            <SW_Field label="Only these tickers" hint="Comma separated. Empty = follow every tradeable holding on the sheet.">
              <input value={edit.allowlist || ""} onChange={(e) => setEdit({ ...edit, allowlist: e.target.value })} placeholder="e.g. OXY,BTU,SDF" style={SW_INPUT} />
            </SW_Field>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, paddingTop: 4 }}>
              <span style={{ font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)", color: "var(--text-tertiary)", maxWidth: 280 }}>
                New strategies start paused and on paper. The broker is linked in Settings.
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <NT.Button variant="ghost" size="md" onClick={() => setEdit(null)}>Cancel</NT.Button>
                <NT.Button variant="primary" size="md" disabled={busy} onClick={() => save(edit)}>{busy ? "Saving…" : "Save"}</NT.Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
Object.assign(window, { SwingsPage });

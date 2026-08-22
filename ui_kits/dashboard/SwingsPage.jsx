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
  return (x < 0 ? "\u2212" : "") + sym + String(Math.abs(Math.round(x)));
};
const SW_curP = (v, ccy) => {
  const x = SW_n(v);
  if (x == null) return "\u2014";
  const sym = { EUR: "\u20ac", GBP: "\u00a3", USD: "$", CAD: "C$" }[ccy] || "$";
  return (x < 0 ? "\u2212" : "") + sym + Math.abs(x).toFixed(2);
};
const SW_money = (v) => {
  const x = SW_n(v);
  if (x == null) return "—";
  return (x < 0 ? "−$" : "$") + String(Math.abs(Math.round(x)));
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
  return x == null ? "—" : (Math.round(x * 100) / 100).toFixed(2);
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

/* The account badge, identical to the options Strategies page (NT_ACCT there): LIVE is
   green with a pulsing dot — it means armed and working, not broken. A red pill on a
   healthy live strategy reads as an alarm, which is why this is shared styling now. */
const SW_ACCT = {
  live: { label: "LIVE", c: "var(--live)", bg: "var(--live-bg)" },
  paper: { label: "PAPER", c: "var(--dryrun)", bg: "var(--dryrun-bg)" },
  draft: { label: "DRAFT", c: "var(--text-tertiary)", bg: "var(--surface-inset)" },
};
function SW_AcctBadge({ account }) {
  const a = account || "draft";
  const b = SW_ACCT[a] || SW_ACCT.draft;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 24, padding: "0 10px", borderRadius: "var(--radius-sm)", background: b.bg, color: b.c, font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", flex: "none" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: b.c, animation: a === "live" ? "nt-pulse var(--blink) var(--ease-in-out) infinite" : "none" }}></span>{b.label}
    </span>
  );
}

function SwingsPage({ page }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const db = window.NT_CLIENT;
  const [d, setD] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [edit, setEdit] = React.useState(null);
  const [tradeFilter, setTradeFilter] = React.useState("all");   // trades page: all | open | closed
  const [macroTab, setMacroTab] = React.useState("open");        // macrotrends page: open | closed
  const announced = React.useRef(false);

  const load = React.useCallback(async () => {
    if (!db) return;
    const y = new Date().getFullYear();
    const [strats, pos, sigs, snaps, bench, fx, brokers, orders, bmarks, src, closedSnap] = await Promise.all([
      db.from("equity_strategies").select("*").order("id"),
      db.from("equity_positions").select("*").order("id", { ascending: false }),
      db.from("sheet_signals").select("*").order("detected_at", { ascending: false }).limit(60),
      db.from("sheet_snapshots").select("*").order("fetched_at", { ascending: false }).limit(10),
      db.from("benchmark_prices").select("d,close").eq("symbol", "SPY").gte("d", y + "-01-01").order("d", { ascending: true }),
      // the sheet quotes in $/€/£/C$ but everything here is reported in USD
      db.from("benchmark_prices").select("symbol,close,d").in("symbol", ["EURUSD", "GBPUSD", "CADUSD"]).order("d", { ascending: false }).limit(30),
      db.from("equity_broker_accounts").select("*"),
      // Orders that left us but have not filled. Real money is committed the moment one of
      // these exists, so it has to be visible — a market order placed after the close rests
      // at the venue until the next auction, and until 2026-08-21 nothing on screen said so.
      db.from("equity_orders").select("*").order("id", { ascending: false }).limit(50),
      // Broker quotes for what we hold. These beat the sheet for OUR P&L: the publisher keeps
      // revising his prices after the exchange shuts, which moved a settled position's P&L.
      db.from("equity_marks").select("*"),
      // The poller's own heartbeat. Snapshot age measures how long the PUBLISHER has been
      // quiet, not whether we are checking — confusing the two produced false "lagging".
      db.from("sources").select("last_poll_at").eq("category", "swings").limit(1),
      db.from("sheet_snapshots").select("raw_csv,fetched_at").eq("tab", "closed").order("fetched_at", { ascending: false }).limit(1),
    ]);
    const strategies = strats.data || [];
    window.NT_HAS_SWINGS = strategies.length > 0;
    // one nudge so the sidebar re-renders and can show the world switcher
    if (!announced.current) { announced.current = true; window.dispatchEvent(new Event("nt-data")); }
    const rates = { USD: 1 };            // newest row per currency wins (list is date-desc)
    (fx.data || []).forEach((r) => { const c = String(r.symbol).slice(0, 3); if (rates[c] == null) rates[c] = Number(r.close); });
    setD({ strats: strategies, pos: pos.data || [], sigs: sigs.data || [],
           snaps: snaps.data || [], bench: bench.data || [], fx: rates, brokers: brokers.data || [],
           orders: orders.data || [], marks: bmarks.data || [],
           pollAt: (((src.data || [])[0] || {}).last_poll_at) || null,
           closedCsv: (((closedSnap.data || [])[0] || {}).raw_csv) || null });
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
  const baseCcy = ((d.brokers || []).map((b) => (b.settings || {}).currency).filter(Boolean)[0] || "USD").toUpperCase();
  // fx is quoted USD-per-unit, so reaching a non-USD base needs the second division. Without
  // it a EUR account's totals were inflated by ~16%.
  const usd = (v, ccy) => {
    const r = fx[ccy || "USD"], b = fx[baseCcy] || 1;
    return (v == null || r == null) ? null : (v * r) / b;
  };
  // Current marks come from the sheet's own price column, stored parsed on the newest snapshot.
  const markSnap = d.snaps.filter((s) => s.tab === "portfolio" && s.prices)[0] || null;
  const marks = (markSnap && markSnap.prices) || {};
  const brokerMarks = {};
  (d.marks || []).forEach((m) => { brokerMarks[String(m.symbol || "").toUpperCase()] = m; });
  // OUR positions are marked at OUR broker, full stop. There is deliberately NO fallback to
  // the publisher's price: a position we hold is worth what our broker says it is worth, and a
  // dashboard that quietly substitutes another source is a dashboard that disagrees with the
  // account. With no broker mark the figures read "—" until one arrives.
  const markOf = (p) => {
    const b = brokerMarks[String(p.symbol || "").toUpperCase()];
    if (!b || b.px == null) return null;
    return { px: SW_n(b.px), ccy: b.ccy || "USD", src: "ibkr" };
  };
  // Currency still has to come from somewhere before the first mark lands.
  const ccyFallback = (p) => (marks[String(p.symbol || "").toUpperCase()] || {}).ccy || "USD";

  const costOf = (p) => usd((SW_n(p.qty) || 0) * (SW_n(p.avg_price) || 0), (markOf(p) || {}).ccy) || 0;
  // The instrument's OWN currency. A position bought in euros is a euro position; converting
  // it to dollars for display is what made the dashboard disagree with the IBKR screen.
  const ccyOf = (p) => (markOf(p) || {}).ccy || ccyFallback(p);
  const natCost = (p) => (SW_n(p.qty) || 0) * (SW_n(p.avg_price) || 0);
  // Market value is what it is WORTH now (shares x current price), not what it cost. The
  // column used to show cost under the label "value", which is a different number entirely.
  const brokerOf = (p) => brokerMarks[String(p.symbol || "").toUpperCase()] || null;
  // IBKR's own market value when it gave us one. Multiplying a price by a share count is how
  // the dashboard kept ending up a few cents away from the broker's screen.
  const natMktValue = (p) => {
    const b = brokerOf(p);
    if (b && b.mkt_value != null) return SW_n(b.mkt_value);
    const m = markOf(p), q = SW_n(p.qty);
    if (!m || q == null || SW_n(m.px) == null) return null;
    return SW_n(m.px) * q;
  };
  // Percentage derived from the SAME two numbers shown beside it, so the row is internally
  // consistent: profit over what the position cost.
  const pnlPct = (p) => {
    const v = natPnl(p), cost = (SW_n(p.qty) || 0) * (SW_n(p.avg_price) || 0);
    if (v == null || !cost) return null;
    return (v / cost) * 100;
  };
  const pnlCol = (v) => (v == null ? "var(--text-tertiary)"
    : v > 0 ? "var(--profit)" : v < 0 ? "var(--loss)" : "var(--text-secondary)");
  const natPnl = (p) => {
    const b = brokerOf(p);
    if (b && b.unrealized_pnl != null) return SW_n(b.unrealized_pnl);
    const m = markOf(p), e = SW_n(p.avg_price), q = SW_n(p.qty);
    if (!m || e == null || q == null) return null;
    return (SW_n(m.px) - e) * q;
  };
  const realized = closedPos.reduce((a, p) => a + (SW_n(p.realized_pnl) || 0), 0);
  // Swing positions are held for MONTHS, so realized-only P&L would read zero for most of the
  // year — the unrealized move is the number that actually matters. Marked off the sheet's own
  // price column (the same source the entry was sized on, so entry and mark share a currency).
  // ONE source of truth: the broker's P&L for the position, converted into the account's
  // currency so several holdings can be added together. Deriving it separately here is how the
  // holdings row said -0.1% while the S&P card said -0.7% for the same position.
  const unrealOf = (p) => {
    const v = natPnl(p);
    return v == null ? null : usd(v, ccyOf(p));
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

  const closedThisYear = closedPos.filter((p) => p.closed_at && new Date(p.closed_at).getFullYear() === year);
  const ytdPnl = closedThisYear.reduce((a, p) => a + (SW_n(p.realized_pnl) || 0), 0) + unrealized;


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
  const before = d.bench.filter((b) => String(b.d) < benchFrom);
  const after = d.bench.filter((b) => String(b.d) >= benchFrom);
  // Baseline = the last index close strictly BEFORE the first buy, so the buy day's own move
  // counts from day one. Anchoring on the buy date's own close pinned the S&P return to 0.0%
  // until two further sessions existed — it looked like the figure was simply missing. In the
  // first calendar year this measures from the first buy (2026-08-21); from 1 Jan of the next
  // year it becomes an ordinary calendar-year comparison automatically (sinceInception flips).
  const bFirst = before.length ? SW_n(before[before.length - 1].close)
                               : (after.length ? SW_n(after[0].close) : null);
  const bLast = d.bench.length ? SW_n(d.bench[d.bench.length - 1].close) : null;
  const spyYtd = (bFirst != null && bFirst > 0 && bLast != null) ? ((bLast / bFirst) - 1) * 100 : null;
  const benchLabel = sinceInception ? ("since " + SW_date(firstEntry)) : "YTD";
  // Compare MONEY AT WORK, not the whole account. The strategy starts flat and stays mostly
  // cash for months, so measuring an account that is 0-25% invested against a fully-invested
  // index would report a big negative before a single trade is placed — "you can't be down if
  // you never bought anything". So: return on invested capital, and nothing at all until we
  // have actually traded. Cash drag stays visible on its own card (exposure).
  // Cost must be converted too. Dividing a converted P&L by an unconverted cost inflated the
  // return by the FX rate — the same currency-mixing bug as the sizing one, third instance.
  const investedCost = openPos.reduce((a, p) => a + (usd((SW_n(p.qty) || 0) * (SW_n(p.avg_price) || 0), ccyOf(p)) || 0), 0);
  const closedCost = closedPos.reduce((a, p) => a + (usd((SW_n(p.orig_qty) || 0) * (SW_n(p.avg_price) || 0), ccyOf(p)) || 0), 0);
  const capitalUsed = investedCost + closedCost;
  const investedRet = capitalUsed > 0 ? (totalPnl / capitalUsed) * 100 : null;
  // Both return cards measure INVESTED CAPITAL — open and closed positions over what they
  // cost — by the user's explicit decision (2026-08-22). The whole-account basis punished the
  // strategy for cash it deliberately leaves idle.
  const ytdRet = capitalUsed > 0 ? (ytdPnl / capitalUsed) * 100 : null;
  const traded = (d.pos || []).length > 0;
  const edge = (traded && investedRet != null && spyYtd != null) ? investedRet - spyYtd : null;

  const portfolioSnap = d.snaps.filter((s) => s.tab === "portfolio")[0] || null;
  // Health = when WE last checked the sheet (the poller runs every ~5 min), never when the
  // publisher last changed it — a snapshot is only written on change, so on a quiet day the
  // newest snapshot ages for hours while everything is fine.
  const feedAge = d.pollAt ? (Date.now() - new Date(d.pollAt).getTime()) / 60000
    : (portfolioSnap ? (Date.now() - new Date(portfolioSnap.fetched_at).getTime()) / 60000 : null);
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
        limit_buffer_pct: row.limit_buffer_pct === "" || row.limit_buffer_pct == null ? null : Number(row.limit_buffer_pct),
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
        sub={"on invested capital · " + closedThisYear.length + " closed"}
        visual={<Ico name="calendar" size={17} color="var(--text-tertiary)" />} />
      <Kard label="p&l" value={SW_cur(totalPnl, baseCcy)} tone={tone(totalPnl)}
        sub={SW_cur(realized, baseCcy) + " realized · " + SW_cur(unrealized, baseCcy) + " unrealized"} />
      <Kard label="invested" value={acctValue ? Math.round((investedCost / acctValue) * 100) + "%" : "—"}
        sub={acctValue ? SW_cur(investedCost, baseCcy) + " of " + SW_cur(acctValue, baseCcy) + " at work" : "needs a linked broker"}
        visual={ring(acctValue ? investedCost / acctValue : 0)} />
      <Kard label="avg return / trade" value={SW_pct(avgRet)} tone={tone(avgRet)}
        sub={avgHold == null ? "no closed trades yet" : "held " + Math.round(avgHold) + "d on average"}
        visual={<Ico name="clock" size={17} color="var(--text-tertiary)" />} />
      <Kard label="vs S&P 500" value={traded ? SW_pct(edge) : "—"} tone={traded ? tone(edge) : null}
        sub={traded
          ? ("you " + SW_pct(investedRet) + " · S&P " + SW_pct(spyYtd))
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
  // Holdings get room to breathe — there are only ever a handful of them.
  const tdTall = { ...td, padding: "15px 14px", verticalAlign: "middle" };
  const tdTallR = { ...tdTall, textAlign: "right" };
  const mono = { font: "var(--w-regular) var(--t-sm)/1.4 var(--font-mono)", fontVariantNumeric: "tabular-nums" };
  const emptyBox = (text) => (
    <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-sm)/1.6 var(--font-sans)" }}>{text}</div>
  );

  // An order still owed to us by the venue: sent, acknowledged, not (fully) filled.
  const resting = (d.orders || []).filter((o) => {
    const st = String(o.status || "").toLowerCase();
    if (st === "filled" || st === "cancelled" || st === "canceled" || st === "rejected") return false;
    return (Number(o.filled_qty) || 0) < (Number(o.qty) || 0);
  });

  // A mark persists until a newer quote replaces it, so outside trading hours the table shows
  // the last price IBKR gave — correct, but it must not be mistaken for a live one.
  const markTimes = (d.marks || []).map((m) => m.quoted_at || m.updated_at).filter(Boolean).sort();
  const markStamp = markTimes.length
    ? "Synced by IBKR · " + SW_ago(markTimes[markTimes.length - 1])
    : (openPos.length ? "waiting for the first broker price" : null);

  // ---------------------------------------------------------------- dashboard
  if (page === "swings-dashboard") {

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
        <PageHead title={greeting(window.NT_USER_NAME || (window.NT_DATA && window.NT_DATA.session && window.NT_DATA.session.user))} />
        {kpiRow}
        {resting.length > 0 ? (
          <NT.Card title={"Resting orders \u00b7 " + resting.length} padding={20} bodyStyle={{ padding: 0 }}>
            <div style={{ padding: "10px 20px 0", color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-xs)/1.5 var(--font-sans)" }}>
              Sent to the broker, not filled yet. Outside market hours these wait for the next auction.
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>order</th>
                  <th style={thR}>qty</th>
                  <th style={thR}>type</th>
                  <th style={thR}>lives until</th>
                  <th style={thR}>filled</th>
                  <th style={thR}>placed</th>
                </tr></thead>
                <tbody>
                  {resting.map((o) => (
                    <tr key={o.id} className="nt-trow">
                      <td style={{ ...td, color: "var(--text-primary)" }}>
                        <span style={{ fontWeight: 500 }}>{o.symbol}</span>
                        <span style={{ color: o.action === "SELL" ? "var(--loss)" : "var(--profit)" }}>{" " + (o.action || "")}</span>
                      </td>
                      <td style={{ ...tdR, ...mono }}>{o.qty == null ? "\u2014" : o.qty}</td>
                      <td style={{ ...tdR, ...mono }}>{o.limit_price == null ? "market" : SW_dec(o.limit_price)}</td>
                      {/* A day order dies at the close of the session it was sent in. That is
                          not obvious from "working", and it silently killed a real entry. */}
                      <td style={{ ...tdR, ...mono, color: o.tif === "GTC" ? "var(--text-secondary)" : "var(--dryrun)" }}>
                        {o.tif === "GTC" ? "cancelled" : o.tif ? "today's close" : "—"}</td>
                      <td style={{ ...tdR, ...mono, color: Number(o.filled_qty) > 0 ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                        {(Number(o.filled_qty) || 0) + " / " + (o.qty == null ? "\u2014" : o.qty)}</td>
                      <td style={{ ...tdR, ...mono, color: "var(--text-tertiary)" }}>
                        {o.placed_at ? String(o.placed_at).slice(5, 16).replace("T", " ") : "\u2014"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </NT.Card>
        ) : null}
        <NT.Card title={openPos.length ? "Your portfolio · " + openPos.length : "Your portfolio"} padding={20} bodyStyle={{ padding: 0 }}
          action={markStamp ? <span style={{ font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>{markStamp}</span> : null}>
          {openPos.length === 0 ? emptyBox("Nothing bought yet — the strategy starts flat and only buys when the sheet changes.") : (
            <div>
            <div style={{ overflowX: "auto" }}>
              {/* fixed layout: the browser otherwise sizes each column to its content, so
                  every column lands at a different distance and the table reads unstructured. */}
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 860 }}>
                <colgroup>
                  <col style={{ width: "23%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "10%" }} />
                </colgroup>
                <thead><tr>
                  <th style={th}>company</th>
                  <th style={thR}>shares</th>
                  <th style={thR}>capital</th>
                  <th style={thR}>buy-in</th>
                  <th style={thR}>current price</th>
                  <th style={thR}>market value</th>
                  <th style={thR}>unrealized p&l</th>
                  <th style={thR}>%</th>
                </tr></thead>
                <tbody>
                  {openPos.map((p) => (
                    <tr key={p.id} className="nt-trow">
                      <td style={{ ...tdTall, color: "var(--text-primary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
                                         width: 36, height: 36, flex: "none", borderRadius: "var(--radius-sm)",
                                         background: "var(--violet-soft)", border: "1px solid var(--violet-line)",
                                         color: "var(--violet-400)",
                                         font: "var(--w-medium) " + (String(p.symbol || "").length > 3 ? "11px" : "12px") + "/1 var(--font-mono)" }}>
                            {p.symbol}
                          </span>
                          <span>
                            <span style={{ display: "block", font: "var(--w-regular) var(--t-body)/1.2 var(--font-sans)" }}>{p.name || p.symbol}</span>
                            <span style={{ display: "block", marginTop: 4, font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>
                              {[p.target_pct == null ? null : SW_dec(p.target_pct) + "% weight",
                                SW_days(p.opened_at, null) == null ? null : SW_days(p.opened_at, null) + "d"].filter(Boolean).join(" · ")}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td style={{ ...tdTallR, ...mono, color: "var(--text-secondary)" }}>{p.qty == null ? "—" : SW_n(p.qty)}</td>
                      {/* Capital = what the position COST, commission included (IBKR's avg
                          cost carries it). Market value = what it is worth now. */}
                      <td style={{ ...tdTallR, ...mono, color: "var(--text-secondary)" }}>{SW_cur(natCost(p), ccyOf(p))}</td>
                      <td style={{ ...tdTallR, ...mono, color: "var(--text-tertiary)" }}>{SW_curP(p.avg_price, ccyOf(p))}</td>
                      <td style={{ ...tdTallR, ...mono, color: "var(--text-primary)" }}>{(markOf(p) || {}).px == null ? "—" : SW_curP(markOf(p).px, ccyOf(p))}</td>
                      <td style={{ ...tdTallR, ...mono, color: "var(--text-primary)" }}>{SW_cur(natMktValue(p), ccyOf(p))}</td>
                      <td style={{ ...tdTallR, ...mono, color: pnlCol(natPnl(p)) }}>
                        {natPnl(p) == null ? "—" : SW_curP(natPnl(p), ccyOf(p))}</td>
                      <td style={{ ...tdTallR }}>
                        {pnlPct(p) == null ? <span style={{ ...mono, color: "var(--text-tertiary)" }}>—</span> : (
                          <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: "var(--radius-pill)",
                                         background: natPnl(p) > 0 ? "var(--profit-bg)" : natPnl(p) < 0 ? "var(--loss-bg)" : "var(--breakeven-bg)",
                                         color: pnlCol(natPnl(p)),
                                         font: "var(--w-medium) var(--t-body)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
                            {SW_pct(pnlPct(p))}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </NT.Card>
      </div>
    );
  }

  // ---------------------------------------------------------------- alerts
  if (page === "swings-alerts") {
    const colLabel = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" };
    const EN = { kopen: "buy", houden: "hold", verkopen: "sell", verkocht: "sold" };
    const en = (v) => EN[String(v || "").trim().toLowerCase()] || String(v || "").trim();

    // Simple BUY / HOLD / SELL — the from→to detail already lives in the advice column, so
    // the badge only answers "what is it NOW".
    const verdictOf = (s) => {
      if (!s.tradeable) return { label: "TRACKED ONLY", color: "var(--text-tertiary)", bg: "var(--surface-inset)", muted: true };
      if (s.kind === "removed" || s.action === "sell") return { label: "SELL", color: "var(--loss)", bg: "var(--loss-bg)" };
      const now = en(s.advies);
      if (now === "buy") return { label: "BUY", color: "var(--profit)", bg: "var(--profit-bg)" };
      if (now === "sell" || now === "sold") return { label: "SELL", color: "var(--loss)", bg: "var(--loss-bg)" };
      if (now === "hold") return { label: "HOLD", color: "var(--dryrun)", bg: "var(--dryrun-bg)" };
      return { label: (now || "change").toUpperCase(), color: "var(--text-secondary)", bg: "var(--surface-inset)" };
    };

    const adviceCell = (s, v) => {
      if (s.kind === "removed") return <span style={{ color: "var(--loss)", fontWeight: 500 }}>dropped</span>;
      if (s.kind === "added") return <span style={{ color: "var(--profit)", fontWeight: 500 }}>{en(s.advies) || "added"}</span>;
      const was = en(s.from_advies), now = en(s.advies);
      if (!was && !now) return <span style={{ color: "var(--text-tertiary)" }}>weight only</span>;
      return (<span>
        <span style={{ color: "var(--text-tertiary)", textDecoration: "line-through" }}>{was || "—"}</span>
        <span style={{ color: "var(--text-tertiary)" }}> → </span>
        <span style={{ color: v.color, fontWeight: 500 }}>{now || "—"}</span>
      </span>);
    };

    // Your money, not his percentage: what a sheet weight is worth under YOUR tier sizing.
    const tiers = (d.strats[0] && d.strats[0].sizing_tiers) || {};
    const plannedUsd = (pct) => {
      const w = SW_n(pct);
      if (w == null) return null;
      const key = w < 2 ? "1" : w < 3 ? "2" : w <= 3 ? "3" : "3plus";
      const v = SW_n(tiers[key]);
      return v == null ? null : v;
    };
    const posOf = (sym) => d.pos.filter((p) => String(p.symbol).toUpperCase() === String(sym).toUpperCase())
      .sort((a, b) => (b.id || 0) - (a.id || 0))[0] || null;
    const unrealPct = (p) => {
      const u = unrealOf(p), c = costOf(p);
      return (u == null || !c) ? null : (u / c) * 100;
    };
    const didWhat = (s, p) => {
      if (!s.tradeable) return "never ordered";
      if (!p) return "not held";
      if (p.status === "open") return "holding" + (SW_days(p.opened_at, null) != null ? " · " + SW_days(p.opened_at, null) + "d" : "");
      return "sold" + (p.realized_pnl != null ? " · " + SW_money(p.realized_pnl) : "");
    };
    const timeOf = (iso) => { try { return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); } catch (e) { return "—"; } };

    // Group by day so a busy day reads as a day, not a wall of rows.
    const dayGroups = (() => {
      const by = {};
      d.sigs.forEach((s) => {
        const k = String(s.detected_at || "").slice(0, 10);
        (by[k] = by[k] || []).push(s);
      });
      const today = new Date().toISOString().slice(0, 10);
      return Object.keys(by).sort().reverse().map((k) => ({
        day: k,
        label: k === today ? "Today · " + SW_date(k) : SW_date(k),
        rows: by[k],
      }));
    })();

    // His whole portfolio, straight off the newest snapshot. A change-only feed is empty on
    // most days — this is the context that makes the page worth opening even when nothing
    // changed, and it is the same data the changes refer to.
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
        <PageHead title="Alerts" />

        <div style={{ display: "flex", alignItems: "center", gap: 10, font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>
          <span>checked {SW_ago(d.pollAt || (portfolioSnap && portfolioSnap.fetched_at))}
            {portfolioSnap ? " · last change " + SW_ago(portfolioSnap.fetched_at) : ""}</span>
          <SW_Pill tone={feedTone}>{feedLabel}</SW_Pill>
        </div>
        {d.sigs.length === 0
          ? <NT.Card padding={20}>{emptyBox("Nothing yet — the current sheet is stored as the baseline. You’ll see entries here the first time the publisher changes something.")}</NT.Card>
          : dayGroups.map((g) => (
            <div key={g.day} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "2px 2px 0" }}>{g.label}</span>
              {g.rows.map((s) => {
                const v = verdictOf(s);
                const meta = marks[String(s.symbol || "").toUpperCase()] || {};
                const pos = posOf(s.symbol);
                const plan = plannedUsd(s.target_pct);
                const wasPlan = s.from_pct != null && s.from_pct !== s.target_pct ? plannedUsd(s.from_pct) : null;
                const pnl = pos ? (pos.status === "open" ? unrealPct(pos) : SW_n(pos.result_pct)) : null;
                return (
                  <div key={s.id} style={{ background: "var(--surface-card)", border: "1px solid var(--border)",
                        borderLeft: "3px solid " + v.color, borderRadius: "var(--radius-md)", padding: "14px 16px",
                        display: "grid", gridTemplateColumns: "1.6fr 0.8fr 1.05fr 0.9fr 0.95fr 0.9fr", gap: 14,
                        alignItems: "center", opacity: v.muted ? 0.62 : 1 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                        <span style={{ font: "var(--w-semibold) var(--t-body)/1 var(--font-mono)", color: "var(--text-primary)" }}>{s.symbol}</span>
                        <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", padding: "3px 7px", borderRadius: "var(--radius-xs)", background: v.bg, color: v.color }}>{v.label}</span>
                      </div>
                      <div style={{ font: "var(--w-regular) var(--t-xs)/1.35 var(--font-sans)", color: "var(--text-secondary)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta.name || s.name || ""}</div>
                    </div>

                    <div>
                      <div style={colLabel}>industry</div>
                      <div style={{ marginTop: 3, font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)", color: meta.theme ? "var(--text-secondary)" : "var(--text-tertiary)" }}>{meta.theme || "—"}</div>
                    </div>

                    <div>
                      <div style={colLabel}>advice</div>
                      <div style={{ marginTop: 3, font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)" }}>{adviceCell(s, v)}</div>
                    </div>

                    <div>
                      <div style={colLabel}>invested</div>
                      <div style={{ marginTop: 3, font: "var(--w-regular) var(--t-sm)/1 var(--font-mono)" }}>
                        {pos
                          ? <span style={{ color: "var(--text-primary)" }}>{SW_money(costOf(pos))}</span>
                          : <span style={{ color: "var(--text-tertiary)" }}>—</span>}
                      </div>
                    </div>

                    <div>
                      <div style={colLabel}>your p&l</div>
                      <div style={{ marginTop: 3, font: "var(--w-regular) var(--t-sm)/1 var(--font-mono)" }}>
                        {pnl == null
                          ? <span style={{ color: "var(--text-tertiary)" }}>—{meta.his_pct != null && <span style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", marginLeft: 6 }}>his {SW_pct(meta.his_pct)}</span>}</span>
                          : <span><span style={{ color: pnl > 0 ? "var(--profit)" : pnl < 0 ? "var(--loss)" : "var(--text-secondary)", fontWeight: 500 }}>{SW_pct(pnl)}</span>
                              <span style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)", marginLeft: 6 }}>{pos.status === "open" ? "live" : "final"}</span></span>}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ font: "var(--w-regular) var(--t-xs)/1 var(--font-mono)", color: "var(--text-secondary)" }}>{timeOf(s.detected_at)}</div>
                      <div style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: pos ? (pos.status === "open" ? "var(--profit)" : "var(--text-secondary)") : "var(--text-tertiary)", marginTop: 3 }}>{didWhat(s, pos)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

      </div>
    );
  }

  // ---------------------------------------------------------------- macrotrends
  // HIS side of the mirror: the publisher's current book as reference data. Deliberately its
  // own page — the alerts feed is a stream you scan, this is a table you consult; pinned to
  // either end of the feed it was invisible as soon as alerts flooded in.
  if (page === "swings-macrotrends") {
    const EN3 = { kopen: "buy", houden: "hold", verkopen: "sell", verkocht: "sold" };
    const en3 = (v) => EN3[String(v || "").trim().toLowerCase()] || String(v || "").trim();
    const posOf3 = (sym) => d.pos.filter((x) => String(x.symbol).toUpperCase() === String(sym).toUpperCase())
      .sort((a, b) => (b.id || 0) - (a.id || 0))[0] || null;
    // Sorted by the publisher's LAST REAL UPDATE to a name — an advice change, a weight
    // change, or a new addition. Nothing else counts: price moves would reshuffle the table
    // daily, and a removal has no row here to sort.
    const UPD_KINDS = { advice: 1, weight: 1, added: 1 };
    const lastUpd = {};
    d.sigs.forEach((x) => {
      if (!UPD_KINDS[String(x.kind || "")]) return;
      const k = String(x.symbol || "").toUpperCase();
      if (!lastUpd[k] || String(x.detected_at) > lastUpd[k]) lastUpd[k] = String(x.detected_at);
    });
    const holdings = Object.keys(marks).map((sym) => ({ sym: sym, ...(marks[sym] || {}) }))
      .filter((h) => h.name || h.px != null)
      .sort((a, b) => {
        const ua = lastUpd[a.sym] || "", ub = lastUpd[b.sym] || "";
        if (ua !== ub) return ub < ua ? -1 : 1;
        return (SW_n(b.his_pct) || -1e9) - (SW_n(a.his_pct) || -1e9);
      });
    // MY p&l % on a name from his book: broker-priced while open, the realized figure once
    // sold. This column answers "how is following him working out for ME".
    const myPct = (pos) => {
      if (!pos) return null;
      if (pos.status === "open") return pnlPct(pos);
      const c = (SW_n(pos.orig_qty) || 0) * (SW_n(pos.avg_price) || 0);
      const v = SW_n(pos.realized_pnl);
      return (v == null || !c) ? null : (v / c) * 100;
    };
    const heldCount = holdings.filter((h) => { const x = posOf3(h.sym); return x && x.status === "open"; }).length;
    const closedRows = (function () {
      const text = d.closedCsv;
      if (!text) return [];
      const out = []; let row = [], cell = "", q = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
        else if (c === '"') q = true;
        else if (c === ",") { row.push(cell); cell = ""; }
        else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); out.push(row); row = []; cell = ""; }
        else cell += c;
      }
      if (cell !== "" || row.length) { row.push(cell); out.push(row); }
      const lc = (v) => String(v || "").trim().toLowerCase();
      const hi = out.findIndex((r) => r.some((c) => ["naam", "name"].indexOf(lc(c)) >= 0)
                                    && r.some((c) => ["symbool", "symbol", "ticker"].indexOf(lc(c)) >= 0));
      if (hi < 0) return [];
      const head = out[hi].map(lc);
      const col = (...names) => { for (const n of names) { const j = head.indexOf(n); if (j >= 0) return j; } return -1; };
      const cN = col("naam", "name"), cS = col("symbool", "symbol", "ticker"),
            cE = col("instap", "entry"), cX = col("verkoop", "exit", "sell"), cR = col("resultaat", "result");
      return out.slice(hi + 1)
        .map((r) => ({ name: (r[cN] || "").trim(), sym: (r[cS] || "").trim().toUpperCase(),
                       entry: (r[cE] || "").trim(), exit: (r[cX] || "").trim(),
                       result: SW_n(String(r[cR] || "").replace("%", "").replace(",", ".")) }))
        .filter((r) => r.sym || r.name);
    })();
    const mbtn = (v, label) => (
      <button key={v} type="button" onClick={() => setMacroTab(v)}
        style={{ padding: "5px 12px", cursor: "pointer", borderRadius: "var(--radius-pill)",
                 border: "1px solid " + (macroTab === v ? "var(--violet-line)" : "var(--border)"),
                 background: macroTab === v ? "var(--violet-soft)" : "transparent",
                 color: macroTab === v ? "var(--text-primary)" : "var(--text-tertiary)",
                 font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)" }}>{label}</button>
    );
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
        <PageHead title="Macrotrends" />
        <NT.Card padding={20} bodyStyle={{ padding: 0 }}
          title={macroTab === "open" ? "Current portfolio · " + holdings.length + " stocks"
                                     : "Closed positions · " + closedRows.length}
          action={(
            <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
              {macroTab === "open" && heldCount ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>
                  <span style={{ width: 7, height: 7, flex: "none", borderRadius: "50%", background: "var(--accent)" }} />
                  you hold {heldCount} of them
                </span>
              ) : null}
              <span style={{ display: "inline-flex", gap: 6 }}>{mbtn("open", "Open")}{mbtn("closed", "Closed")}</span>
            </span>
          )}>
          {macroTab === "closed" ? (
            closedRows.length === 0 ? emptyBox("His sell log hasn't been read yet.") : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
                <thead><tr>
                  <th style={{ ...th, paddingLeft: 20 }}>holding</th>
                  <th style={thR}>his buy-in</th>
                  <th style={thR}>his exit</th>
                  <th style={thR}>result</th>
                </tr></thead>
                <tbody>
                  {closedRows.map((r, i) => (
                    <tr key={r.sym + "|" + i} className="nt-trow">
                      <td style={{ ...td, paddingLeft: 20 }}>
                        <span style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-mono)", color: "var(--text-primary)" }}>{r.sym}</span>
                        <span style={{ color: "var(--text-tertiary)", marginLeft: 8 }}>{r.name}</span>
                      </td>
                      {/* the sheet's own strings — they carry their currency symbol already */}
                      <td style={{ ...tdR, ...mono, color: "var(--text-tertiary)" }}>{r.entry || "—"}</td>
                      <td style={{ ...tdR, ...mono, color: "var(--text-secondary)" }}>{r.exit || "—"}</td>
                      <td style={{ ...tdR, ...mono, color: r.result == null ? "var(--text-tertiary)" : r.result > 0 ? "var(--profit)" : r.result < 0 ? "var(--loss)" : "var(--text-secondary)" }}>{r.result == null ? "—" : SW_pct(r.result)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead><tr>
                <th style={{ ...th, paddingLeft: 20 }}>holding</th>
                <th style={th}>industry</th>
                <th style={th}>advice</th>
                <th style={thR}>weight</th>
                <th style={thR}>his buy-in</th>
                <th style={thR}>current price</th>
                <th style={thR}>result</th>
                <th style={thR}>your p&l</th>
              </tr></thead>
              <tbody>
                {holdings.map((h) => {
                  const adv = en3(h.advies);
                  const mine = posOf3(h.sym);
                  const held = mine && mine.status === "open";
                  const hp = SW_n(h.his_pct);
                  const mp = myPct(mine);
                  return (
                    <tr key={h.sym} className="nt-trow">
                      {/* Every row reserves the dot slot in the PADDING zone (5 + 7 + 8 = 20px),
                          so tickers line up with each other AND with the card title whether the
                          dot is shown or not. */}
                      <td style={{ ...td, paddingLeft: 5 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span title={held ? "you hold this" : undefined}
                                style={{ width: 7, height: 7, flex: "none", borderRadius: "50%",
                                         background: held ? "var(--accent)" : "transparent" }} />
                          <span style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-mono)", color: held ? "var(--violet-400)" : "var(--text-primary)" }}>{h.sym}</span>
                          <span style={{ color: "var(--text-tertiary)" }}>{h.name || ""}</span>
                        </span>
                      </td>
                      <td style={{ ...td, color: h.theme ? "var(--text-secondary)" : "var(--text-tertiary)" }}>{h.theme || "—"}</td>
                      <td style={{ ...td, color: adv === "buy" ? "var(--profit)" : "var(--text-secondary)", fontWeight: adv === "buy" ? 500 : 400 }}>{adv || "—"}</td>
                      <td style={{ ...tdR, ...mono }}>{h.weight_pct == null ? "—" : SW_dec(h.weight_pct) + "%"}</td>
                      <td style={{ ...tdR, ...mono, color: "var(--text-tertiary)" }}>{h.entry_px == null ? "—" : SW_price(h.entry_px)}</td>
                      <td style={{ ...tdR, ...mono, color: "var(--text-secondary)" }}>{h.px == null ? "—" : SW_price(h.px)}</td>
                      <td style={{ ...tdR, ...mono, color: hp == null ? "var(--text-tertiary)" : hp > 0 ? "var(--profit)" : hp < 0 ? "var(--loss)" : "var(--text-secondary)" }}>{hp == null ? "—" : SW_pct(hp)}</td>
                      <td style={{ ...tdR }}>
                        {mp == null ? <span style={{ ...mono, color: "var(--text-tertiary)" }}>—</span> : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 9px", borderRadius: 999,
                                           background: mp > 0 ? "var(--profit-bg)" : mp < 0 ? "var(--loss-bg)" : "var(--breakeven-bg)",
                                           color: mp > 0 ? "var(--profit)" : mp < 0 ? "var(--loss)" : "var(--text-secondary)",
                                           font: "var(--w-semibold) var(--t-2xs)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
                              {SW_pct(mp)}
                            </span>
                            {!held ? <span style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>sold</span> : null}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </NT.Card>
      </div>
    );
  }

  // ---------------------------------------------------------------- trades
  if (page === "swings-trades") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
        <PageHead title="Trades" />
        {/* The SAME cards as the dashboard — one definition, rendered on both pages, so they
            can never drift apart. */}
        {kpiRow}
        {(function () {
          const rows = d.pos.filter((p) => tradeFilter === "all" ? true : p.status === tradeFilter);
          // One row shape for open AND closed: an open row is priced by the broker mark, a
          // closed one by its own exit — same columns, so the page reads like the portfolio.
          const rQty = (p) => SW_n(p.status === "open" ? p.qty : (p.orig_qty || p.qty));
          const rCap = (p) => { const q = rQty(p), e = SW_n(p.avg_price); return (q == null || e == null) ? null : q * e; };
          const rPx = (p) => p.status === "open" ? ((markOf(p) || {}).px != null ? SW_n(markOf(p).px) : null) : SW_n(p.exit_price);
          const rVal = (p) => p.status === "open" ? natMktValue(p) : ((rQty(p) != null && SW_n(p.exit_price) != null) ? rQty(p) * SW_n(p.exit_price) : null);
          const rPnl = (p) => p.status === "open" ? natPnl(p) : SW_n(p.realized_pnl);
          const rPct = (p) => { const v = rPnl(p), c = rCap(p); return (v == null || !c) ? null : (v / c) * 100; };
          const fbtn = (v, label) => (
            <button key={v} type="button" onClick={() => setTradeFilter(v)}
              style={{ padding: "5px 12px", cursor: "pointer", borderRadius: "var(--radius-pill)",
                       border: "1px solid " + (tradeFilter === v ? "var(--violet-line)" : "var(--border)"),
                       background: tradeFilter === v ? "var(--violet-soft)" : "transparent",
                       color: tradeFilter === v ? "var(--text-primary)" : "var(--text-tertiary)",
                       font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)" }}>{label}</button>
          );
          return (
        <NT.Card title={"Positions" + (rows.length ? " · " + rows.length : "")} padding={20} bodyStyle={{ padding: 0 }}
          action={<span style={{ display: "inline-flex", gap: 6 }}>{fbtn("all", "All")}{fbtn("open", "Open")}{fbtn("closed", "Closed")}</span>}>
          {rows.length === 0 ? emptyBox(tradeFilter === "closed" ? "Nothing closed yet." : "Nothing bought yet — the strategy starts flat and only buys when the sheet changes.") : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 920 }}>
                <colgroup>
                  <col style={{ width: "21%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "8%" }} />
                </colgroup>
                <thead><tr>
                  <th style={th}>company</th>
                  <th style={thR}>shares</th>
                  <th style={thR}>capital</th>
                  <th style={thR}>buy-in</th>
                  <th style={thR}>current price</th>
                  <th style={thR}>market value</th>
                  <th style={thR}>p&l</th>
                  <th style={thR}>%</th>
                  <th style={thR}>status</th>
                </tr></thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} className="nt-trow">
                      <td style={{ ...tdTall, color: "var(--text-primary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
                                         width: 36, height: 36, flex: "none", borderRadius: "var(--radius-sm)",
                                         background: "var(--violet-soft)", border: "1px solid var(--violet-line)",
                                         color: "var(--violet-400)",
                                         font: "var(--w-medium) " + (String(p.symbol || "").length > 3 ? "11px" : "12px") + "/1 var(--font-mono)" }}>
                            {p.symbol}
                          </span>
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: "block", font: "var(--w-regular) var(--t-body)/1.2 var(--font-sans)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name || p.symbol}</span>
                            <span style={{ display: "block", marginTop: 4, font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>
                              {[SW_date(p.opened_at), p.status === "closed" && p.closed_at ? "→ " + SW_date(p.closed_at) : null].filter(Boolean).join(" ")}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td style={{ ...tdTallR, ...mono, color: "var(--text-secondary)" }}>{rQty(p) == null ? "—" : String(Math.round(rQty(p)))}</td>
                      <td style={{ ...tdTallR, ...mono, color: "var(--text-secondary)" }}>{SW_cur(rCap(p), ccyOf(p))}</td>
                      <td style={{ ...tdTallR, ...mono, color: "var(--text-tertiary)" }}>{SW_curP(p.avg_price, ccyOf(p))}</td>
                      <td style={{ ...tdTallR, ...mono, color: "var(--text-primary)" }}>{rPx(p) == null ? "—" : SW_curP(rPx(p), ccyOf(p))}</td>
                      <td style={{ ...tdTallR, ...mono, color: "var(--text-primary)" }}>{rVal(p) == null ? "—" : SW_cur(rVal(p), ccyOf(p))}</td>
                      <td style={{ ...tdTallR, ...mono, color: pnlColor(rPnl(p)) }}>{rPnl(p) == null ? "—" : SW_curP(rPnl(p), ccyOf(p))}</td>
                      <td style={{ ...tdTallR }}>
                        {rPct(p) == null ? <span style={{ ...mono, color: "var(--text-tertiary)" }}>—</span> : (
                          <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 9px", borderRadius: 999,
                                         background: rPnl(p) > 0 ? "var(--profit-bg)" : rPnl(p) < 0 ? "var(--loss-bg)" : "var(--breakeven-bg)",
                                         color: pnlColor(rPnl(p)),
                                         font: "var(--w-semibold) var(--t-2xs)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
                            {SW_pct(rPct(p))}
                          </span>
                        )}
                      </td>
                      <td style={{ ...tdTallR }}><SW_Pill tone={p.status === "open" ? "ok" : "mute"}>{p.status}</SW_Pill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </NT.Card>
          );
        })()}
      </div>
    );
  }

  // ---------------------------------------------------------------- strategies
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Strategies"
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
              return v == null ? null : (k === "3plus" ? "3%+" : k + "%") + " " + (isPct ? SW_dec(v) + "%" : SW_cur(v, acctCcy));
            }).filter(Boolean).join("  ·  ");
            const rows = [
              ["Sizing", isPct ? "% of your account, by their weight" : "a set amount per weight"],
              ["Per position", tierTxt || "not set"],
            ];
            rows.push(["Max per position", s.max_position_usd == null ? "no cap" : SW_cur(s.max_position_usd, acctCcy)]);
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
                    <SW_AcctBadge account={s.account} />
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
                          placeholder={pctMode ? "%" : acctCcy}
                          style={{ ...SW_INPUT, height: 34, width: 120, flex: "none" }} />
                        <span style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>
                          {pctMode ? "% of account" : acctCcy + " per position"}
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

            {/* Not a price opinion — it trades certainty of filling against how bad the worst
                case can be on a thin book. 2% suits the free delayed quotes; lower it only
                with real-time data, raise it for illiquid names that don't fill. */}
            <SW_Field label="Bid above the offer (%)"
              hint="How far through the current offer the limit is placed so it fills straight away. You normally pay the offer, not this — it's the ceiling. Empty = 2%.">
              <input type="number" step="0.1" value={edit.limit_buffer_pct == null ? "" : edit.limit_buffer_pct}
                onChange={(e) => setEdit({ ...edit, limit_buffer_pct: e.target.value })} placeholder="2" style={SW_INPUT} />
            </SW_Field>

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

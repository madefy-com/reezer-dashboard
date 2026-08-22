/* CryptoPage — the crypto world (Revolut X), BETA.

   Same shape as Swings — dashboard, trades, alerts, strategies — reading its OWN tables
   (crypto_strategies / crypto_positions / crypto_orders / crypto_marks / crypto_signals /
   crypto_broker_accounts). Nothing here touches the other worlds' data. Every page carries
   the BETA banner so nobody mistakes an empty table for a broken feed: the signal sheet and
   the engine come after this. */

const CR_n = (v) => { if (v == null || v === "") return null; const x = Number(v); return isNaN(x) ? null : x; };
const CR_usd = (v, dec) => { const x = CR_n(v); if (x == null) return "—"; return (x < 0 ? "−$" : "$") + Math.abs(x).toFixed(dec == null ? 2 : dec); };
const CR_pct = (v) => { const x = CR_n(v); if (x == null) return "—"; const r = Math.round(x * 10) / 10; return (r > 0 ? "+" : "") + r.toFixed(1) + "%"; };
const CR_ago = (iso) => {
  if (!iso) return "never";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  return s < 90 ? Math.round(s) + "s ago" : s < 5400 ? Math.round(s / 60) + "m ago" : s < 172800 ? Math.round(s / 3600) + "h ago" : Math.round(s / 86400) + "d ago";
};

/* The one BETA pill, used everywhere the world is named: menu, top bar, page heads, banner. */
function CryptoBetaPill({ small, tone }) {
  const amber = tone === "amber";
  return (
    <span style={{ display: "inline-block", font: "var(--w-semibold) " + (small ? "9px" : "var(--t-2xs)") + "/1 var(--font-sans)", letterSpacing: "var(--ls-wide)",
      color: amber ? "var(--chip-entry)" : "var(--violet)", padding: small ? "2px 5px" : "3px 7px",
      border: "1px solid " + (amber ? "var(--chip-entry)" : "var(--violet-line)"), borderRadius: 999, verticalAlign: "middle" }}>BETA</span>
  );
}

function CryptoBetaBanner() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
      background: "var(--chip-entry-bg)", borderRadius: "var(--radius-sm)" }}>
      <CryptoBetaPill tone="amber" />
      <span style={{ font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-secondary)" }}>
        Crypto on Revolut X is being built. The broker is connected and read daily; the signal sheet and the trading engine come next. Paper only — no real crypto orders yet.
      </span>
    </div>
  );
}

function CryptoPage({ page }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const [d, setD] = React.useState({ strategies: [], positions: [], orders: [], marks: [], signals: [], brokers: [], loaded: false });
  const load = React.useCallback(() => {
    const db = window.NT_CLIENT;
    if (!db) return;
    Promise.all([
      db.from("crypto_strategies").select("*").order("id"),
      db.from("crypto_positions").select("*").order("opened_at", { ascending: false }).limit(200),
      db.from("crypto_orders").select("*").order("id", { ascending: false }).limit(50),
      db.from("crypto_marks").select("*"),
      db.from("crypto_signals").select("*").order("detected_at", { ascending: false }).limit(100),
      db.from("crypto_broker_accounts").select("*").order("id"),
    ]).then((r) => {
      const strategies = (r[0] && r[0].data) || [];
      window.NT_HAS_CRYPTO = strategies.length > 0;
      setD({ strategies, positions: (r[1] && r[1].data) || [], orders: (r[2] && r[2].data) || [],
             marks: (r[3] && r[3].data) || [], signals: (r[4] && r[4].data) || [],
             brokers: (r[5] && r[5].data) || [], loaded: true });
    }, () => {});
  }, []);
  React.useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  const broker = d.brokers[0] || null;
  const bs = (broker && broker.settings) || {};
  const markOf = (sym) => d.marks.filter((m) => String(m.symbol).toUpperCase() === String(sym).toUpperCase())[0] || null;
  const openPos = d.positions.filter((p) => p.status === "open");
  const closedPos = d.positions.filter((p) => p.status !== "open");
  const working = d.orders.filter((o) => o.status === "working");
  const unreal = (p) => { const m = markOf(p.symbol); return m && m.unrealized_pnl != null ? CR_n(m.unrealized_pnl) : null; };
  const pnlPct = (p) => { const m = markOf(p.symbol); const c = (CR_n(p.qty) || 0) * (CR_n(p.avg_price) || 0); return (m && c) ? ((CR_n(m.px) * CR_n(p.qty)) - c) / c * 100 : null; };
  const realized = closedPos.reduce((a, p) => a + (CR_n(p.realized_pnl) || 0), 0);
  const unrealTotal = openPos.reduce((a, p) => a + (unreal(p) || 0), 0);

  // Same KPI card, table and empty-state styles as the Swings pages — the world must read
  // identically, only the data differs.
  const toneCol = (t) => (t === "up" ? "var(--profit)" : t === "down" ? "var(--loss)" : "var(--text-primary)");
  const cardStyle = { display: "flex", flexDirection: "column", gap: 10, padding: "18px 18px 16px", background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", minWidth: 0 };
  const labelStyle = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "lowercase", color: "var(--text-tertiary)" };
  const valStyle = (t) => ({ font: "var(--w-light) var(--t-kpi)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", letterSpacing: "var(--ls-tight)", color: toneCol(t) });
  const subStyle = { font: "var(--w-regular) var(--t-xs)/1.3 var(--font-sans)", color: "var(--text-tertiary)" };
  const Kard = ({ label, value, sub, tone }) => (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 30 }}>
        <span style={labelStyle}>{label}</span>
      </div>
      <span style={valStyle(tone)}>{value != null ? value : "\u2014"}</span>
      {sub ? <span style={subStyle}>{sub}</span> : null}
    </div>
  );
  const th = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "10px 14px", textAlign: "left", whiteSpace: "nowrap" };
  const td = { font: "var(--w-regular) var(--t-sm)/1.4 var(--font-sans)", padding: "9px 14px", borderTop: "1px solid var(--row-line)", textAlign: "left", color: "var(--text-secondary)", verticalAlign: "top", fontVariantNumeric: "tabular-nums" };
  const empty = (text) => (
    <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-sm)/1.6 var(--font-sans)" }}>{text}</div>
  );
  const pill = (txt, on) => (
    <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", padding: "3px 8px", borderRadius: 999,
      color: on ? "var(--profit)" : "var(--text-tertiary)", border: "1px solid " + (on ? "var(--profit-line, var(--border))" : "var(--border)") }}>{txt}</span>
  );

  const positionsTable = (rows, withStatus) => (
    <div style={{ overflowX: "auto" }}>
      {rows.length === 0 ? empty(withStatus ? "No crypto trades yet." : "No open crypto positions — the first one appears here when the engine buys.") : (
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 860 }}>
          <colgroup>
            <col style={{ width: "23%" }} /><col style={{ width: "9%" }} /><col style={{ width: "11%" }} /><col style={{ width: "11%" }} />
            <col style={{ width: "12%" }} /><col style={{ width: "12%" }} /><col style={{ width: "12%" }} /><col style={{ width: "10%" }} />{withStatus ? <col style={{ width: "10%" }} /> : null}
          </colgroup>
          <thead><tr>
            <th style={th}>Coin</th><th style={th}>Amount</th><th style={th}>Capital</th><th style={th}>Buy-in</th>
            <th style={th}>Price</th><th style={th}>Value</th><th style={th}>Profit</th><th style={th}>%</th>{withStatus ? <th style={th}>Status</th> : null}
          </tr></thead>
          <tbody>{rows.map((p) => {
            const m = markOf(p.symbol); const px = p.status === "open" ? (m && CR_n(m.px)) : CR_n(p.exit_price);
            const cap = (CR_n(p.qty) || 0) * (CR_n(p.avg_price) || 0);
            const val = px != null ? px * (CR_n(p.qty) || 0) : null;
            const pnl = p.status === "open" ? unreal(p) : CR_n(p.realized_pnl);
            const pct = p.status === "open" ? pnlPct(p) : (cap ? (CR_n(p.realized_pnl) || 0) / cap * 100 : null);
            return (
              <tr key={p.id}>
                <td style={td}><b>{String(p.symbol || "").replace("-USD", "")}</b><div style={{ font: "var(--w-regular) var(--t-2xs)/1.3 var(--font-sans)", color: "var(--text-tertiary)" }}>{p.name || "Revolut X"}</div></td>
                <td style={td}>{CR_n(p.qty)}</td><td style={td}>{CR_usd(cap)}</td><td style={td}>{CR_usd(p.avg_price)}</td>
                <td style={td}>{px != null ? CR_usd(px) : "—"}</td><td style={td}>{val != null ? CR_usd(val) : "—"}</td>
                <td style={{ ...td, color: pnl == null ? "var(--text-tertiary)" : pnl >= 0 ? "var(--profit)" : "var(--loss)" }}>{pnl == null ? "—" : CR_usd(pnl)}</td>
                <td style={{ ...td, color: pct == null ? "var(--text-tertiary)" : pct >= 0 ? "var(--profit)" : "var(--loss)" }}>{CR_pct(pct)}</td>
                {withStatus ? <td style={td}>{pill(p.status === "open" ? "OPEN" : "CLOSED", p.status === "open")}</td> : null}
              </tr>
            );
          })}</tbody>
        </table>
      )}
    </div>
  );

  if (page === "crypto-trades") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
        <PageHead title="Trades" />
        <CryptoBetaBanner />
        <NT.Card padding={20} bodyStyle={{ padding: 0 }} title={"Positions" + (d.positions.length ? " \u00b7 " + d.positions.length : "")}>{positionsTable(d.positions, true)}</NT.Card>
      </div>
    );
  }

  if (page === "crypto-alerts") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
        <PageHead title="Alerts" />
        <CryptoBetaBanner />
        <NT.Card padding={20} bodyStyle={{ padding: 0 }} title={"Signals" + (d.signals.length ? " \u00b7 " + d.signals.length : "")}>
          {d.signals.length === 0 ? empty("No signals yet. The crypto signal sheet is the next piece to build.") : (
            <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead><tr><th style={th}>When</th><th style={th}>Coin</th><th style={th}>Signal</th><th style={th}>Weight</th><th style={th}>Status</th></tr></thead>
              <tbody>{d.signals.map((s) => (
                <tr key={s.id}><td style={td}>{CR_ago(s.detected_at)}</td><td style={td}><b>{s.symbol}</b></td>
                  <td style={td}>{String(s.action || s.kind || "").toUpperCase()}</td><td style={td}>{s.target_pct != null ? s.target_pct + "%" : "—"}</td>
                  <td style={td}>{pill(String(s.status || "").toUpperCase(), s.status === "acted")}</td></tr>
              ))}</tbody></table></div>
          )}
        </NT.Card>
      </div>
    );
  }

  if (page === "crypto-strategies") {
    const db = window.NT_CLIENT;
    const flip = (s, field) => {
      if (!db) return;
      const msg = field === "kill_switch" && !s.kill_switch ? "Stop trading crypto for this strategy? New orders are blocked; open positions stay." : null;
      if (msg && !window.confirm(msg)) return;
      db.from("crypto_strategies").update({ [field]: !s[field], updated_at: new Date().toISOString() }).eq("id", s.id).then(() => load());
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
        <PageHead title="Strategies" />
        <CryptoBetaBanner />
        <NT.Card padding={20} bodyStyle={{ padding: 0 }} title={"Strategies" + (d.strategies.length ? " \u00b7 " + d.strategies.length : "")}>
          {d.strategies.length === 0 ? empty("No crypto strategies.") : (
            <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <thead><tr><th style={th}>Name</th><th style={th}>Account</th><th style={th}>Sizing</th><th style={th}>Trading</th><th style={th}>Kill switch</th></tr></thead>
              <tbody>{d.strategies.map((s) => (
                <tr key={s.id}>
                  <td style={td}><b>{s.name}</b><div style={{ font: "var(--w-regular) var(--t-2xs)/1.3 var(--font-sans)", color: "var(--text-tertiary)", maxWidth: 420 }}>{s.description}</div></td>
                  <td style={td}>{pill(String(s.account || "paper").toUpperCase(), s.account === "live")}</td>
                  <td style={td}>{s.sizing_mode || "tiers"} · USD</td>
                  <td style={td}><NT.Button variant="ghost" size="sm" onClick={() => flip(s, "paused")}>{s.paused ? "Paused — resume" : "Active — pause"}</NT.Button></td>
                  <td style={td}><NT.Button variant="ghost" size="sm" onClick={() => flip(s, "kill_switch")}>{s.kill_switch ? "Tripped — reset" : "Armed"}</NT.Button></td>
                </tr>
              ))}</tbody></table></div>
          )}
        </NT.Card>
      </div>
    );
  }

  // dashboard
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title={greeting(window.NT_USER_NAME || (window.NT_DATA && window.NT_DATA.session && window.NT_DATA.session.user))} />
      <CryptoBetaBanner />
      <div className="nt-kpi-row">
        <Kard label="account value" value={bs.account_value != null ? CR_usd(bs.account_value, 0) : "—"}
          sub={broker ? ("Revolut X · checked " + CR_ago(bs.synced_at)) : "no broker row"} />
        <Kard label="cash" value={bs.cash != null ? CR_usd(bs.cash, 0) : "—"} sub="USD available on the exchange" />
        <Kard label="open positions" value={String(openPos.length)} sub={working.length ? working.length + " order(s) working" : "no orders working"} />
        <Kard label="p&l" value={CR_usd(realized + unrealTotal, 0)} tone={realized + unrealTotal > 0 ? "up" : realized + unrealTotal < 0 ? "down" : null}
          sub={"realized " + CR_usd(realized, 0) + " · unrealized " + CR_usd(unrealTotal, 0)} />
        <style>{`
          .nt-kpi-row{ display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: var(--gap-grid); }
          @media (max-width: 720px){ .nt-kpi-row{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
        `}</style>
      </div>
      <NT.Card padding={20} bodyStyle={{ padding: 0 }} title={"Your portfolio" + (openPos.length ? " \u00b7 " + openPos.length : "")}
        action={bs.synced_at ? <span style={{ font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>{"Revolut X \u00b7 " + CR_ago(bs.synced_at)}</span> : null}>{positionsTable(openPos, false)}</NT.Card>
    </div>
  );
}

Object.assign(window, { CryptoPage, CryptoBetaPill });

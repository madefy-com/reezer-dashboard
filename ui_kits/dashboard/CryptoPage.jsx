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
  const [d, setD] = React.useState({ strategies: [], positions: [], orders: [], marks: [], signals: [], brokers: [], briefs: [], loaded: false });
  const [openBrief, setOpenBrief] = React.useState(null);
  const [playing, setPlaying] = React.useState(null);     // brief id whose player is loaded
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
      db.from("crypto_video_briefs").select("id,channel_name,video_id,title,url,published_at,status,sentiment,sentiment_score,headline,short_title,summary_short,playbook,summary,signals,model,summarized_at,error").order("published_at", { ascending: false }).limit(60),
    ]).then((r) => {
      const strategies = (r[0] && r[0].data) || [];
      window.NT_HAS_CRYPTO = strategies.length > 0;
      setD({ strategies, positions: (r[1] && r[1].data) || [], orders: (r[2] && r[2].data) || [],
             marks: (r[3] && r[3].data) || [], signals: (r[4] && r[4].data) || [],
             brokers: (r[5] && r[5].data) || [], briefs: (r[6] && r[6].data) || [], loaded: true });
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
      <span style={valStyle(tone)}>{value != null ? value : "—"}</span>
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
        <NT.Card padding={20} bodyStyle={{ padding: 0 }} title={"Positions" + (d.positions.length ? " · " + d.positions.length : "")}>{positionsTable(d.positions, true)}</NT.Card>
      </div>
    );
  }

  if (page === "crypto-sentiment") {
    // Option A (22 Aug): Score · Video · Date · BTC · XRP. The score tile carries the
    // sentiment (colour = direction, number = strength); each leader gets a PLAYBOOK tile —
    // what to do now → what to prepare for · the trigger · a conviction bar. Alts and other
    // coins live only inside the opened brief. Money colours only for actions.
    const actCol = (a) => (/buy/.test(a) ? "var(--profit)" : /hold/.test(a) ? "var(--chip-entry)" : /reduce|sell/.test(a) ? "var(--loss)" : "var(--text-tertiary)");
    // Tile lean: the move he is SETTING UP FOR (next) colours the frame and the bar; the
    // current state stays as the small first word. "Hold -> prepare to buy" reads as a buy
    // setup, not as a hold. Borders are soft: 22% alpha, like the card hairlines.
    const actLine = (a) => (/buy/.test(a) ? "rgba(33,199,122,0.22)" : /hold/.test(a) ? "rgba(245,165,36,0.22)" : /reduce|sell/.test(a) ? "rgba(240,69,75,0.22)" : "var(--border)");
    const scoreCol = (sv) => (sv === "bullish" ? "var(--profit)" : sv === "bearish" ? "var(--loss)" : "var(--text-secondary)");
    const scoreBg = (sv) => (sv === "bullish" ? "var(--profit-bg)" : sv === "bearish" ? "var(--loss-bg)" : "var(--surface-inset)");
    const when = (iso) => (iso ? new Date(iso) : null);
    const dayTxt = (iso) => { const d = when(iso); return d ? d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }) : ""; };
    const timeTxt = (iso) => { const d = when(iso); return d ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : ""; };
    const cap = (x) => (x ? x.charAt(0).toUpperCase() + x.slice(1) : "");
    const actWord = { font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", whiteSpace: "nowrap" };

    const Tile = ({ sym, pb }) => {
      // ONE status word (what to do now); the move he is setting up for is the grey line.
      const x = pb || {};
      const now = x.now || "neutral", next = x.next && x.next !== "none" ? x.next : null;
      const conv = CR_n(x.conviction) || 0;
      const nowTxt = now === "buy" && conv >= 85 ? "strong buy" : now === "sell" && conv >= 85 ? "strong sell" : now.replace("_", " ");
      const trig = x.trigger ? x.trigger.replace(/^(if|on|when)\s+/i, "") : "";
      // Grey line: a DIFFERENT next move with its trigger; otherwise the reason in his words.
      let line;
      if (next && next !== now.replace("conditional_", "")) line = "prepare to " + (next === "sell" ? "take profit / sell" : next) + (trig ? " if " + trig : "");
      else if (now === "conditional_buy" && trig) line = "buy if " + trig;
      else line = now === "neutral" ? "not discussed" : (x.reason || (trig ? "if " + trig : ""));
      if (x.via_alts) line += " · via his alts call";
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: "9px 11px", borderRadius: "var(--radius-sm)", background: "var(--surface-inset)", border: "1px solid " + actLine(now), minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-mono)", color: "var(--text-secondary)", width: 30 }}>{sym}</span>
            <span style={{ ...actWord, color: actCol(now), opacity: now === "conditional_buy" ? 0.85 : 1 }}>{nowTxt}</span>
          </div>
          <div style={{ font: "var(--w-regular) var(--t-2xs)/1.35 var(--font-sans)", color: "var(--text-tertiary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.7em" }}>{line}</div>
          <div style={{ height: 3, borderRadius: 2, background: "var(--border)", position: "relative" }}>
            <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 2, width: Math.max(0, Math.min(100, CR_n(x.conviction) || 0)) + "%", background: actCol(now), opacity: 0.8 }}></span>
          </div>
        </div>
      );
    };

    const cols = "52px minmax(300px,1fr) 110px 250px 250px 24px";
    const rowStyle = (on) => ({ display: "grid", gridTemplateColumns: cols, gap: 18, alignItems: "center", padding: "14px 20px", borderTop: "1px solid var(--row-line)", cursor: "pointer", background: on ? "var(--surface-inset)" : "transparent" });
    const briefs = d.briefs.filter((b) => b.status === "summarized");
    const pending = d.briefs.filter((b) => b.status !== "summarized");
    const dirCol = (dir) => (/buy|add/.test(dir) ? "var(--profit)" : /sell|reduce|take_profit/.test(dir) ? "var(--loss)" : "var(--text-secondary)");
    const kicker = { ...th, padding: 0, margin: "16px 0 8px" };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
        <PageHead title="Sentiment" />
        <CryptoBetaBanner />
        <NT.Card padding={20} bodyStyle={{ padding: 0 }} title={"Video briefs" + (briefs.length ? " · " + briefs.length : "")}
          action={<span style={{ font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>Blockchain Backer · read by Reezer AI</span>}>
          {briefs.length === 0 ? empty("No video briefs yet — the next upload on the channel appears here within minutes of its captions being ready.") : (
            <div>
              <div style={{ ...rowStyle(false), borderTop: "none", cursor: "default", padding: "10px 20px" }}>
                {["Score", "Video", "Date", "BTC", "XRP", ""].map((h, i) => <span key={i} style={{ ...th, padding: 0 }}>{h}</span>)}
              </div>
              {briefs.map((b) => {
                const on = openBrief === b.id;
                const pb = b.playbook || {};
                const L = (b.summary && b.summary.leaders) || {};
                const sigs = b.signals || [];
                return (
                  <div key={b.id}>
                    <div style={rowStyle(on)} onClick={() => setOpenBrief(on ? null : b.id)}>
                      <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", background: scoreBg(b.sentiment), color: scoreCol(b.sentiment), font: "var(--w-medium) 16px/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{b.sentiment_score}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ font: "var(--w-medium) var(--t-sm)/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{b.short_title || b.title}</div>
                        <div style={{ font: "var(--w-regular) var(--t-xs)/1.45 var(--font-sans)", color: "var(--text-secondary)", marginTop: 3 }}>{b.summary_short || b.headline}</div>
                      </div>
                      <div style={{ font: "var(--w-regular) var(--t-xs)/1.5 var(--font-mono)", color: "var(--text-secondary)" }}>{dayTxt(b.published_at)}<div style={{ color: "var(--text-tertiary)", fontSize: 11 }}>{timeTxt(b.published_at)}</div></div>
                      <Tile sym="BTC" pb={pb.BTC} />
                      <Tile sym="XRP" pb={pb.XRP} />
                      <Ico name={on ? "chevron-up" : "chevron-down"} size={16} color="var(--text-tertiary)" />
                    </div>
                    {on ? (
                      <div style={{ padding: "4px 20px 20px", borderTop: "1px solid var(--row-line)", background: "var(--surface-inset)", display: "grid", gridTemplateColumns: cols, gap: 18 }}>
                        {/* Same grid as the row: the read sits exactly under the BTC/XRP tiles. */}
                        <div style={{ gridColumn: "1 / 4", minWidth: 0 }}>
                          {/* The video, in place: a quiet play button first (no thumbnail clutter);
                              YouTube's own player loads on click and autoplays. */}
                          <div style={{ display: "grid", gridTemplateColumns: "320px minmax(0,1fr)", gap: 18, marginTop: 16, alignItems: "start" }}>
                            <div>
                              {playing === b.id ? (
                                <div style={{ position: "relative", aspectRatio: "16/9", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border)", background: "#000" }}>
                                  <iframe src={"https://www.youtube-nocookie.com/embed/" + b.video_id + "?autoplay=1&rel=0"} title={b.title} allow="autoplay; accelerometer; encrypted-media; picture-in-picture" allowFullScreen
                                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}></iframe>
                                </div>
                              ) : (
                                <button type="button" onClick={(e) => { e.stopPropagation(); setPlaying(b.id); }} title="Play the video here"
                                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", aspectRatio: "16/9", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "#000", cursor: "pointer", padding: 0 }}>
                                  <span style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ width: 0, height: 0, borderStyle: "solid", borderWidth: "9px 0 9px 16px", borderColor: "transparent transparent transparent #08080A", marginLeft: 4 }}></span>
                                  </span>
                                </button>
                              )}
                              <div style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 6 }}><a href={b.url} target="_blank" rel="noreferrer" style={{ color: "var(--violet)" }}>open on YouTube</a></div>
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ ...th, padding: 0, margin: "0 0 8px" }}>Thesis</div>
                              <div style={{ font: "var(--w-medium) var(--t-body)/1.45 var(--font-sans)", color: "var(--text-primary)" }}>{b.headline}</div>
                              <div style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 8 }}>{b.title}</div>
                            </div>
                          </div>
                          <div style={kicker}>What he said</div>
                          <ul style={{ margin: 0, paddingLeft: 18, font: "var(--w-regular) var(--t-sm)/1.55 var(--font-sans)", color: "var(--text-secondary)" }}>
                            {((b.summary && b.summary.bullets) || []).map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                          </ul>
                          {((b.summary && b.summary.risks) || []).length ? (
                            <div>
                              <div style={kicker}>What would invalidate it</div>
                              <ul style={{ margin: 0, paddingLeft: 18, font: "var(--w-regular) var(--t-xs)/1.5 var(--font-sans)", color: "var(--text-secondary)" }}>
                                {b.summary.risks.map((t, i) => <li key={i}>{t}</li>)}
                              </ul>
                            </div>
                          ) : null}
                          <div style={{ marginTop: 14, font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)" }}>
                            Transcript quality: {(b.summary && b.summary.data_quality) || "—"} · read by Reezer AI {b.summarized_at ? "at " + timeTxt(b.summarized_at) : ""}
                          </div>
                        </div>
                        <div style={{ gridColumn: "4 / 6", marginTop: 16, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                            <span style={{ font: "var(--w-light) 34px/1 var(--font-mono)", letterSpacing: "var(--ls-tight)", color: scoreCol(b.sentiment), fontVariantNumeric: "tabular-nums" }}>{b.sentiment_score}</span>
                            <div><div style={{ ...th, padding: 0 }}>Sentiment</div><div style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", color: scoreCol(b.sentiment), marginTop: 6 }}>{b.sentiment}</div></div>
                          </div>
                          <div style={{ padding: "14px 16px", background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginTop: 10 }}>
                            <div style={{ ...th, padding: 0 }}>Playbook</div>
                            {["BTC", "XRP"].map((k) => {
                              const x = pb[k] || {};
                              return (
                                <div key={k} style={{ marginTop: 10 }}>
                                  <Tile sym={k} pb={x} />
                                  <div style={{ font: "var(--w-regular) var(--t-xs)/1.45 var(--font-sans)", color: "var(--text-secondary)", margin: "6px 4px 0" }}>{x.reason || (L[k] && L[k].reason) || ""}</div>
                                  {x.positioning ? <div style={{ font: "var(--w-regular) var(--t-2xs)/1.45 var(--font-sans)", color: "var(--text-tertiary)", margin: "4px 4px 0" }}>His positioning: {x.positioning}</div> : null}
                                </div>
                              );
                            })}
                            {L.ETH && L.ETH.verdict && L.ETH.verdict !== "not_discussed" ? <div style={{ font: "var(--w-regular) var(--t-xs)/1.45 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 10 }}>ETH · {L.ETH.verdict}: {L.ETH.reason}</div> : null}
                          </div>
                          <div style={{ padding: "14px 16px", background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginTop: 10 }}>
                            <div style={{ ...th, padding: 0 }}>Every call he made{sigs.length ? " · " + sigs.length : ""}</div>
                            {sigs.length === 0 ? <div style={{ font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 8 }}>No explicit buy or sell call in this video.</div>
                              : sigs.map((sg, i) => (
                              <div key={i} style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 12, padding: "10px 0", borderTop: i ? "1px solid var(--row-line)" : "none" }}>
                                <div>
                                  <div style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-mono)", color: "var(--text-primary)" }}>{sg.asset}</div>
                                  <div style={{ ...actWord, color: dirCol(sg.direction), marginTop: 5 }}>{String(sg.direction || "").replace("_", " ")}</div>
                                  <div style={{ font: "var(--w-regular) var(--t-2xs)/1.3 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 5 }}>{sg.strength} · {sg.confidence}</div>
                                </div>
                                <div>
                                  {sg.conditional && sg.condition ? <div style={{ font: "var(--w-regular) var(--t-xs)/1.45 var(--font-sans)", color: "var(--text-secondary)" }}><span style={{ color: "var(--chip-entry)", fontWeight: 500 }}>If</span> {sg.condition}</div> : null}
                                  {(sg.levels || []).length ? <div style={{ font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-mono)", color: "var(--text-tertiary)", marginTop: 4 }}>{sg.levels.join(" · ")}</div> : null}
                                  <div style={{ font: "var(--w-regular) var(--t-xs)/1.45 var(--font-sans)", color: "var(--text-tertiary)", marginTop: 6, paddingLeft: 10, borderLeft: "2px solid var(--border-strong)" }}>“{sg.quote}”</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </NT.Card>
        {pending.length ? (
          <NT.Card padding={20} bodyStyle={{ padding: 0 }} title={"Waiting for captions · " + pending.length}>
            {pending.map((b) => (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 20px", borderTop: "1px solid var(--row-line)", font: "var(--w-regular) var(--t-xs)/1.4 var(--font-sans)", color: "var(--text-secondary)" }}>
                <span>{b.title}</span><span style={{ color: b.status === "failed" ? "var(--loss)" : "var(--text-tertiary)" }}>{b.status === "failed" ? "failed — " + (b.error || "") : "captions not ready, retrying"}</span>
              </div>
            ))}
          </NT.Card>
        ) : null}
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
        <NT.Card padding={20} bodyStyle={{ padding: 0 }} title={"Strategies" + (d.strategies.length ? " · " + d.strategies.length : "")}>
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
        <Kard label="cash" value={bs.cash != null ? CR_usd(bs.cash, 0) : "—"}
          sub={bs.cash_by_ccy ? Object.keys(bs.cash_by_ccy).map((c) => ({ EUR: "€", GBP: "£", USD: "$" }[c] || c) + Math.round(bs.cash_by_ccy[c])).join(" + ") + " on the exchange, in USD" : "on the exchange, in USD"} />
        <Kard label="open positions" value={String(openPos.length)} sub={working.length ? working.length + " order(s) working" : "no orders working"} />
        <Kard label="p&l" value={CR_usd(realized + unrealTotal, 0)} tone={realized + unrealTotal > 0 ? "up" : realized + unrealTotal < 0 ? "down" : null}
          sub={"realized " + CR_usd(realized, 0) + " · unrealized " + CR_usd(unrealTotal, 0)} />
        <style>{`
          .nt-kpi-row{ display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: var(--gap-grid); }
          @media (max-width: 720px){ .nt-kpi-row{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
        `}</style>
      </div>
      <NT.Card padding={20} bodyStyle={{ padding: 0 }} title={"Your portfolio" + (openPos.length ? " · " + openPos.length : "")}
        action={bs.synced_at ? <span style={{ font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>{"Revolut X · " + CR_ago(bs.synced_at)}</span> : null}>{positionsTable(openPos, false)}</NT.Card>
    </div>
  );
}

Object.assign(window, { CryptoPage, CryptoBetaPill });

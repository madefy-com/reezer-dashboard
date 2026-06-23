/* TradeDetail — slides over the right column (chart + firing log), perfectly aligned. */
function TradeDetail({ trade, onClose }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const [shown, setShown] = React.useState(false);
  const [detail, setDetail] = React.useState(null);   // { samples, events } — lazy-loaded
  const [hover, setHover] = React.useState(null);      // { idx, w } for the chart crosshair/tooltip
  const panelRef = React.useRef(null);
  React.useEffect(() => { const r = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(r); }, []);
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.75 } }); });
  // Pull the real price path + action log for this trade when the drawer opens.
  const tradeId = trade && trade.id;
  React.useEffect(() => {
    let alive = true; setDetail(null);   // null = still loading (so we never flash a fake chart)
    if (window.NT_TRADE_DETAIL && tradeId != null) {
      window.NT_TRADE_DETAIL(tradeId).then((d) => { if (alive) setDetail(d || { samples: [], events: [] }); });
    } else {
      setDetail({ samples: [], events: [] });   // nothing to fetch -> "no data", not loading forever
    }
    return () => { alive = false; };
  }, [tradeId]);
  if (!trade) return null;

  const tr = trade;
  const up = tr.pnl > 0, flat = tr.pnl === 0;
  const c = up ? "var(--profit)" : flat ? "var(--breakeven)" : "var(--loss)";
  const money = (n) => (n > 0 ? "+$" + n.toFixed(2) : n < 0 ? "\u2212$" + Math.abs(n).toFixed(2) : "$0.00");
  const pct = (n) => (n > 0 ? "+" : n < 0 ? "\u2212" : "") + Math.abs(n).toFixed(1) + "%";
  const capital = (tr.entry * tr.qty * 100).toFixed(0);
  const exitNum = tr.exit === null ? null : parseFloat(String(tr.exit));
  const close = () => { setShown(false); setTimeout(onClose, 200); };

  // close when clicking anywhere outside the panel (but let a click on another
  // trade row switch the open trade instead of closing).
  React.useEffect(() => {
    const onDown = (e) => {
      const t = e.target;
      if (panelRef.current && panelRef.current.contains(t)) return;
      if (t && t.closest && t.closest(".nt-trow")) return;
      close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const Field = ({ label, value, color }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: "11px 0", borderTop: "1px solid var(--border)" }}>
      <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "lowercase", color: "var(--text-tertiary)" }}>{label}</span>
      <span className="num" style={{ font: "var(--w-regular) var(--t-body)/1 var(--font-mono)", color: color || "var(--text-primary)" }}>{value}</span>
    </div>
  );

  // ----- chart: ONLY the REAL recorded price path. While the fetch is in flight we
  // show a loading skeleton (never a fake curve); if it finishes with no path, a note.
  const pw = 392, ph = 64, padX = 10, padTop = 8, padBot = 8;
  const loading = detail === null;
  const samples = (detail && detail.samples) || [];
  const events = (detail && detail.events) || [];
  const hasReal = samples.length > 1;
  const Tms = (iso) => new Date(iso).getTime();
  let linePath = "", marks = [], entryY = null, pts = [];

  if (hasReal) {
    const tMin = Tms(samples[0].ts), tMax = Tms(samples[samples.length - 1].ts);
    const tSpan = (tMax - tMin) || 1;
    let pLo = Infinity, pHi = -Infinity;
    samples.forEach((s) => { const v = +s.price; if (v < pLo) pLo = v; if (v > pHi) pHi = v; });
    pLo = Math.min(pLo, tr.entry); pHi = Math.max(pHi, tr.entry);
    const pSpan = (pHi - pLo) || 1;
    const X = (iso) => padX + ((Tms(iso) - tMin) / tSpan) * (pw - 2 * padX);
    const Y = (v) => padTop + (1 - (+v - pLo) / pSpan) * (ph - padTop - padBot);
    linePath = samples.map((s, i) => (i ? "L" : "M") + X(s.ts).toFixed(1) + " " + Y(s.price).toFixed(1)).join(" ");
    entryY = Y(tr.entry);
    pts = samples.map((s) => ({ x: X(s.ts), y: Y(s.price), price: +s.price, ts: s.ts, gain: (+s.price / tr.entry - 1) * 100 }));
    const colorOf = (t) => t === "trim" ? "var(--profit)" : t === "stop" ? "var(--loss)" : t === "entry" ? "var(--text-secondary)" : "var(--breakeven)";
    marks = events.filter((e) => e.type !== "stop_set" && e.price != null).map((e) => ({
      x: X(e.ts), y: Y(e.price), c: colorOf(e.type),
      label: e.type + (e.qty ? " " + e.qty : "") + " @ $" + (+e.price).toFixed(2),
    }));
  }

  // ----- "what happened": the action log, newest update on top -----
  const fmtT = (iso) => { try { const tz = (window.NT_DATA && window.NT_DATA.marketHours && window.NT_DATA.marketHours.display_tz) || "Europe/Amsterdam"; return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date(iso)); } catch (e) { return String(iso).slice(11, 19); } };
  const describe = (e) => {
    const p = e.price != null ? "$" + (+e.price).toFixed(2) : "";
    const n = (e.note || "").toLowerCase();
    const why = e.note ? " · " + e.note : "";   // the real trigger (alert phrase / rule)
    switch (e.type) {
      case "entry": return { label: "Entry · bought " + e.qty, at: p, src: "alert" };
      case "trim": return { label: "Partial · sold " + e.qty + why, at: p, src: "alert" };
      case "stop_set":
        if (n.indexOf("breakeven") >= 0) return { label: "Stop → breakeven", at: p, src: "rule" };
        if (n.indexOf("trail") >= 0) return { label: "Trail stop → " + p, at: "", src: "rule" };
        return { label: "Stop set" + (e.note ? " (" + e.note + ")" : ""), at: p, src: "rule" };
      case "stop": return { label: "Stopped out · sold " + e.qty, at: p, src: "rule" };
      case "close": return { label: "Closed · sold " + e.qty + why, at: p, src: "alert" };
      case "take_half": return { label: "Took half · sold " + e.qty + why, at: p, src: "rule" };
      case "take_profit": return { label: "Take-profit · sold " + e.qty + why, at: p, src: "rule" };
      case "target": return { label: "Target hit · sold " + e.qty + why, at: p, src: "rule" };
      case "eod": return { label: "EOD flatten · sold " + e.qty, at: p, src: "rule" };
      default: return { label: e.type + (e.qty ? " " + e.qty : "") + why, at: p, src: "rule" };
    }
  };
  const timeline = events.slice().reverse();   // newest first

  return (
    <div ref={panelRef} style={{
      position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column",
      background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-pop)", overflow: "hidden",
      transform: shown ? "translateX(0)" : "translateX(14px)", opacity: shown ? 1 : 0,
      transition: "transform var(--dur-slow) var(--ease-out), opacity var(--dur) var(--ease-out)",
    }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--border)", flex: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <NT.StatusDot status={tr.status} />
          <span style={{ font: "var(--w-semibold) var(--t-h3)/1 var(--font-sans)", letterSpacing: "var(--ls-snug)", whiteSpace: "nowrap" }}>
            {tr.tk} {tr.strike} <span style={{ color: "var(--text-tertiary)", fontWeight: "var(--w-regular)" }}>×{tr.qty}</span>
          </span>
          <NT.ResultBadge result={tr.result} size="sm" />
        </div>
        <button onClick={close} aria-label="Close" style={{ width: 30, height: 30, flex: "none", display: "grid", placeItems: "center", borderRadius: "var(--radius-sm)", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer" }}>
          <i data-lucide="x" style={{ width: 16, height: 16 }}></i>
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "lowercase", color: "var(--text-tertiary)" }}>
            {tr.status === "live" ? "unrealized p&l" : "realized p&l"}
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 8 }}>
            <span className="num" style={{ font: "var(--w-light) 36px/1 var(--font-mono)", letterSpacing: "var(--ls-tight)", color: c }}>{money(tr.pnl)}</span>
            <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 8px", borderRadius: "var(--radius-xs)", background: up ? "var(--profit-bg)" : flat ? "var(--breakeven-bg)" : "var(--loss-bg)", color: c, font: "var(--w-semibold) var(--t-xs)/1 var(--font-mono)" }}>{pct(tr.pct)}</span>
          </div>
        </div>

        <div style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", color: "var(--text-tertiary)" }}>CONTRACT PRICE</span>
            <span className="num" style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-mono)", color: "var(--text-tertiary)" }}>{tr.t.slice(0, 5)} → {tr.close.slice(0, 5)}</span>
          </div>
          {loading ? (
            <div style={{ height: 64, borderRadius: "var(--radius-sm)", background: "var(--surface-hover)", animation: "nt-pulse var(--blink) var(--ease-in-out) infinite" }} />
          ) : !hasReal ? (
            <div style={{ height: 64, display: "grid", placeItems: "center", color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)" }}>No price path recorded for this trade</div>
          ) : (
          <div style={{ position: "relative", cursor: "crosshair" }}
            onMouseMove={pts.length ? (e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              if (!rect.width) return;
              const vbX = (e.clientX - rect.left) / rect.width * pw;
              let best = 0, bd = Infinity;
              for (let i = 0; i < pts.length; i++) { const d = Math.abs(pts[i].x - vbX); if (d < bd) { bd = d; best = i; } }
              setHover({ idx: best, w: rect.width });
            } : undefined}
            onMouseLeave={() => setHover(null)}>
            <svg viewBox={`0 0 ${pw} ${ph}`} width="100%" style={{ display: "block" }} preserveAspectRatio="none">
              {entryY != null && (
                <line x1={padX} y1={entryY} x2={pw - padX} y2={entryY} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="3 3" />
              )}
              <path d={linePath} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {marks.map((m, i) => (
                <circle key={i} cx={Number(m.x).toFixed(1)} cy={Number(m.y).toFixed(1)} r="3.5" fill={m.c} stroke="var(--surface-inset)" strokeWidth="1">
                  {m.label ? <title>{m.label}</title> : null}
                </circle>
              ))}
              {hover && pts[hover.idx] && (
                <g>
                  <line x1={pts[hover.idx].x} y1={0} x2={pts[hover.idx].x} y2={ph} stroke="var(--text-tertiary)" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
                  <circle cx={pts[hover.idx].x} cy={pts[hover.idx].y} r="4" fill={c} stroke="var(--surface-card)" strokeWidth="1.5" />
                </g>
              )}
            </svg>
            {hover && pts[hover.idx] && (() => {
              const g = pts[hover.idx].gain;
              const gc = g > 0 ? "var(--profit)" : g < 0 ? "var(--loss)" : "var(--breakeven)";
              const left = Math.max(42, Math.min(pts[hover.idx].x / pw * hover.w, hover.w - 42));
              return (
                <div style={{ position: "absolute", top: -2, left: left, transform: "translateX(-50%)", pointerEvents: "none",
                  background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)", boxShadow: "var(--shadow-pop)", padding: "5px 9px", whiteSpace: "nowrap" }}>
                  <span className="num" style={{ font: "var(--w-semibold) var(--t-sm)/1 var(--font-mono)", color: gc }}>{(g > 0 ? "+" : g < 0 ? "−" : "") + Math.abs(g).toFixed(1) + "%"}</span>
                  <span className="num" style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-mono)", color: "var(--text-tertiary)", marginLeft: 7 }}>${pts[hover.idx].price.toFixed(2)} · {fmtT(pts[hover.idx].ts)}</span>
                </div>
              );
            })()}
          </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 20 }}>
          <Field label="side" value={tr.side === "C" ? "Call" : "Put"} />
          <Field label="quantity" value={"×" + tr.qty} />
          <Field label="entry" value={tr.entry.toFixed(2)} />
          <Field label="exit" value={tr.exit === null ? "—" : tr.exit} color={tr.exit === null ? "var(--text-tertiary)" : undefined} />
          <Field label="capital" value={"$" + capital} />
          <Field label="result" value={flat ? "Breakeven" : up ? "Win" : "Loss"} color={c} />
          <Field label="opened" value={tr.t.slice(0, 5)} />
          <Field label="closed" value={tr.close.slice(0, 5)} />
          <Field label="hold time" value={tr.hold} />
          <Field label="strategy" value={tr.strat} />
        </div>
        {tr.stopped && (
          <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 24, padding: "0 10px", borderRadius: "var(--radius-sm)", background: "var(--loss-bg)", color: "var(--loss)", font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)" }}>
            <i data-lucide="octagon-x" style={{ width: 13, height: 13 }}></i> STOPPED OUT
          </div>
        )}

        <div>
          <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Triggered by</span>
          <div style={{ marginTop: 8, display: "flex", alignItems: "flex-start", gap: 11, padding: "13px 14px", background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
            <NT.TypeChip type={tr.trigger.type} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ font: "var(--w-regular) var(--t-sm)/1.4 var(--font-sans)", color: "var(--text-primary)" }}>
                {tr.trigger.msg}
              </span>
              <div style={{ marginTop: 8 }}><NT.FiredBadge fired /></div>
            </div>
          </div>
        </div>

        {timeline.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>What happened</span>
              <span style={{ display: "inline-flex", gap: 10, font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><i data-lucide="bell" style={{ width: 11, height: 11 }}></i> alert</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><i data-lucide="cog" style={{ width: 11, height: 11 }}></i> rule</span>
              </span>
            </div>
            <div style={{ marginTop: 8, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              {timeline.map((e, i) => {
                const d = describe(e);
                const isAlert = d.src === "alert";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderTop: i ? "1px solid var(--border)" : "none", background: "var(--surface-inset)" }}>
                    <span className="num" style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-mono)", color: "var(--text-tertiary)", width: 58, flex: "none" }}>{fmtT(e.ts)}</span>
                    <span style={{ width: 15, flex: "none", display: "inline-flex", color: isAlert ? "var(--fired)" : "var(--text-tertiary)" }}>
                      <i data-lucide={isAlert ? "bell" : "cog"} style={{ width: 13, height: 13 }}></i>
                    </span>
                    <span style={{ flex: 1, minWidth: 0, font: "var(--w-regular) var(--t-sm)/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{d.label}</span>
                    {d.at ? <span className="num" style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-mono)", color: "var(--text-secondary)", flex: "none" }}>{d.at}</span> : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
Object.assign(window, { TradeDetail });

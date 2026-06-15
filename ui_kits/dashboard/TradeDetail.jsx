/* TradeDetail — slides over the right column (chart + firing log), perfectly aligned. */
function TradeDetail({ trade, onClose }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const [shown, setShown] = React.useState(false);
  const panelRef = React.useRef(null);
  React.useEffect(() => { const r = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(r); }, []);
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.75 } }); });
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

  const pathPts = exitNum === null
    ? [[0, 0.5], [0.5, 0.42], [1, 0.4]]
    : (() => {
        const lo = Math.min(tr.entry, exitNum), hi = Math.max(tr.entry, exitNum);
        const norm = (v) => hi === lo ? 0.5 : 1 - (v - lo) / (hi - lo);
        const mid = up ? norm(tr.entry) - 0.12 : norm(tr.entry) + 0.12;
        return [[0, norm(tr.entry)], [0.45, Math.max(0.05, Math.min(0.95, mid))], [1, norm(exitNum)]];
      })();
  const pw = 392, ph = 60;
  const linePath = pathPts.map((p, i) => (i ? "L" : "M") + (10 + p[0] * (pw - 20)).toFixed(1) + " " + (6 + p[1] * (ph - 12)).toFixed(1)).join(" ");

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
          <svg viewBox={`0 0 ${pw} ${ph}`} width="100%" style={{ display: "block" }} preserveAspectRatio="none">
            <path d={linePath} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={10} cy={6 + pathPts[0][1] * (ph - 12)} r="3" fill="var(--text-tertiary)" />
            <circle cx={pw - 10} cy={6 + pathPts[pathPts.length - 1][1] * (ph - 12)} r="3.5" fill={c} />
          </svg>
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
      </div>
    </div>
  );
}
Object.assign(window, { TradeDetail });

/* PnlChart — session P&L. Two modes:
   - "combo": per-item diverging bars (win/loss) + a cumulative equity line.
   - "wfall": waterfall — each item steps the running total from $0 to net.
   Range 1D = today's closed trades; 1W/1M = daily roll-up. Unit $ or %. */
function PnlChart({ onSelect, range: rangeProp, onRange }) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const D = window.NT_DATA;
  const [hover, setHover] = React.useState(-1);
  const [rangeI, setRangeI] = React.useState("1D");
  const range = rangeProp || rangeI;
  const setRange = onRange || setRangeI;
  const [mode, setMode] = React.useState("combo");   // combo | wfall
  const [unit, setUnit] = React.useState("$");        // $ | %

  /* ---- build the series for the active range ---- */
  const tradingDates = (n) => {
    const out = []; const d = new Date(2026, 5, 13);
    while (out.length < n) { const w = d.getDay(); if (w !== 0 && w !== 6) out.unshift(new Date(d)); d.setDate(d.getDate() - 1); }
    return out;
  };
  const series = React.useMemo(() => {
    if (range === "1D") {
      return D.trades.filter((t) => t.status !== "live").slice().reverse()
        .map((tr) => ({ label: tr.tk, $: tr.pnl, pct: tr.pct, tr }));
    }
    const n = range === "1W" ? 5 : 22;
    const slice = D.daily.slice(-n);
    const dates = tradingDates(n);
    return slice.map((d, i) => {
      // prefer the real session date carried on each daily entry; fall back to
      // the synthetic trading-day sequence for legacy/demo data.
      const dt = d.date ? new Date(d.date + "T00:00:00") : (dates[i] || dates[dates.length - 1]);
      return {
        label: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        shortLabel: dt.toLocaleDateString("en-US", { weekday: "short" }),
        $: d.pnl, pct: d.pct,
      };
    });
  }, [range, D]);   // D (window.NT_DATA) is a fresh object each rebuild — recompute when the date filter changes the data

  const val = (it) => (unit === "$" ? it.$ : it.pct);
  const cum = []; series.reduce((a, it, i) => (cum[i] = a + val(it)), 0);
  const net = cum.length ? cum[cum.length - 1] : 0;

  /* ---- geometry & shared value scale (bars + line + waterfall) ---- */
  const W = 920, H = 264, mL = 54, mR = 16, mT = 18, mB = 30;
  const plotH = H - mT - mB, plotW = W - mL - mR;
  let lo = 0, hi = 0;
  series.forEach((it, i) => { const v = val(it); lo = Math.min(lo, v, cum[i]); hi = Math.max(hi, v, cum[i]); });
  const pad = (hi - lo) * 0.12 || 1; lo -= pad; hi += pad;
  const y = (v) => mT + plotH * (1 - (v - lo) / (hi - lo));
  const zeroY = y(0);
  const slot = plotW / Math.max(series.length, 1);
  const bw = Math.min(unit === "$" && range !== "1D" ? 30 : 38, slot * 0.56);
  const cx = (i) => mL + slot * i + slot / 2;

  const fmt = (v) => unit === "$"
    ? (v > 0 ? "+$" + Math.round(v) : v < 0 ? "\u2212$" + Math.abs(Math.round(v)) : "$0")
    : ((v > 0 ? "+" : v < 0 ? "\u2212" : "") + Math.abs(v).toFixed(1) + "%");

  /* nice round y ticks, always including the zero baseline */
  const niceStep = (r) => { const raw = (r / 4) || 1; const mag = Math.pow(10, Math.floor(Math.log10(raw))); const n = raw / mag; return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag; };
  const step = niceStep(hi - lo);
  const ticks = (() => {
    const out = [];
    for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-6; t += step) out.push(Math.round(t * 100) / 100);
    if (!out.some((v) => Math.abs(v) < 1e-6)) out.push(0);
    return out.sort((a, b) => a - b);
  })();

  const Seg = ({ value, set, opts }) => (
    <div style={{ display: "inline-flex", padding: 2, gap: 2, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-strong)", background: "var(--surface-card)" }}>
      {opts.map((o) => {
        const on = value === o.id;
        return (
          <button key={o.id} onClick={() => set(o.id)} style={{
            height: 22, padding: "0 9px", borderRadius: "var(--radius-xs)", cursor: "pointer",
            border: "1px solid " + (on ? "var(--border-strong)" : "transparent"),
            background: on ? "var(--surface-hover)" : "transparent",
            color: on ? "var(--text-primary)" : "var(--text-tertiary)",
            font: `${on ? "var(--w-semibold)" : "var(--w-medium)"} var(--t-2xs)/1 var(--font-sans)`, letterSpacing: "var(--ls-wide)", whiteSpace: "nowrap",
          }}>{o.label}</button>
        );
      })}
    </div>
  );

  const cumColor = net >= 0 ? "var(--profit)" : "var(--loss)";
  const linePath = series.map((it, i) => (i ? "L" : "M") + cx(i).toFixed(1) + " " + y(cum[i]).toFixed(1)).join(" ");
  const areaPath = series.length ? linePath + " L" + cx(series.length - 1).toFixed(1) + " " + zeroY.toFixed(1) + " L" + cx(0).toFixed(1) + " " + zeroY.toFixed(1) + " Z" : "";

  const rangeLabel = range === "1D" ? series.length + " closed trades" : series.length + " sessions";

  return (
    <NT.Card title="P&L" padding={20}
      action={<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Seg value={mode} set={setMode} opts={[{ id: "combo", label: "Trades" }, { id: "wfall", label: "Waterfall" }]} />
        <Seg value={unit} set={setUnit} opts={[{ id: "$", label: "$" }, { id: "%", label: "%" }]} />
        <Seg value={range} set={setRange} opts={[{ id: "1D", label: "1D" }, { id: "1W", label: "1W" }, { id: "1M", label: "1M" }]} />
      </div>}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
        <span className="num" style={{ font: "var(--w-light) 34px/1 var(--font-mono)", letterSpacing: "var(--ls-tight)", color: cumColor }}>{fmt(net)}{unit === "$" ? ".00" : ""}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, height: 20, padding: "0 7px", borderRadius: "var(--radius-xs)",
          background: net >= 0 ? "var(--profit-bg)" : "var(--loss-bg)", color: cumColor, font: "var(--w-semibold) var(--t-2xs)/1 var(--font-mono)" }}>
          {net >= 0 ? "\u2191" : "\u2193"} {unit === "$" ? D.kpis.netPnl.delta : fmt(net)}</span>
        <span style={{ font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>net {unit === "$" ? "realized" : "return"} · {rangeLabel}</span>
      </div>

      <div style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
          {ticks.map((v, i) => (
            <g key={i}>
              <line x1={mL} y1={y(v)} x2={W - mR} y2={y(v)} stroke="var(--border)" strokeWidth={Math.abs(v) < 1e-6 ? 1.2 : 1} strokeDasharray={Math.abs(v) < 1e-6 ? "none" : "3 4"} />
              <text x={mL - 10} y={y(v) + 4} textAnchor="end" fill="var(--text-tertiary)" style={{ font: "var(--w-regular) 11px/1 var(--font-mono)" }}>{fmt(v)}</text>
            </g>
          ))}

          {mode === "combo" && areaPath && <path d={areaPath} fill={cumColor} opacity="0.08" />}

          {series.map((it, i) => {
            const v = val(it), up = v > 0, flat = v === 0;
            const c = up ? "var(--profit)" : flat ? "var(--breakeven)" : "var(--loss)";
            let top, h, bc = c;
            if (mode === "wfall") {
              const a = y(cum[i] - v), b = y(cum[i]);
              top = Math.min(a, b); h = Math.max(2, Math.abs(a - b));
            } else {
              top = flat ? zeroY - 1 : up ? y(v) : zeroY; h = flat ? 2 : Math.max(2, Math.abs(y(v) - zeroY));
            }
            const on = hover === i;
            return (
              <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(-1)}
                 onClick={() => it.tr && onSelect && onSelect(it.tr)} style={{ cursor: it.tr && onSelect ? "pointer" : "default" }}>
                <rect x={cx(i) - slot / 2} y={mT} width={slot} height={plotH} fill="transparent" />
                <rect x={cx(i) - bw / 2} y={top} width={bw} height={h} rx={3} fill={bc} opacity={on ? 1 : 0.82} style={{ transition: "opacity var(--dur)" }} />
                {(range !== "1M" || i % 4 === 0) && (
                  <text x={cx(i)} y={H - 9} textAnchor="middle" fill={on ? "var(--text-secondary)" : "var(--text-tertiary)"} style={{ font: "var(--w-medium) 10px/1 var(--font-sans)" }}>
                    {range === "1W" ? it.shortLabel : it.label}
                  </text>
                )}
              </g>
            );
          })}

          {mode === "combo" && series.length > 1 && (
            <g>
              <path d={linePath} fill="none" stroke={cumColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              {series.map((it, i) => <circle key={i} cx={cx(i)} cy={y(cum[i])} r={hover === i ? 3.6 : 2.4} fill={cumColor} />)}
            </g>
          )}
        </svg>

        {hover >= 0 && series[hover] && (() => {
          const it = series[hover], v = val(it), up = v > 0, flat = v === 0;
          const c = up ? "var(--profit)" : flat ? "var(--breakeven)" : "var(--loss)";
          const leftPct = (cx(hover) / W) * 100;
          return (
            <div style={{ position: "absolute", left: leftPct + "%", top: 0, transform: "translate(-50%,-6px)", pointerEvents: "none",
              background: "var(--surface-inset)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)", boxShadow: "var(--shadow-pop)", padding: "8px 10px", whiteSpace: "nowrap", zIndex: 2 }}>
              <div style={{ font: "var(--w-semibold) var(--t-xs)/1 var(--font-sans)", color: "var(--text-primary)" }}>
                {it.tr ? it.tr.tk + " " + it.tr.strike + " ×" + it.tr.qty : it.label}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 6, alignItems: "baseline" }}>
                <span className="num" style={{ font: "var(--w-medium) var(--t-sm)/1 var(--font-mono)", color: c }}>{fmt(v)}{unit === "$" ? ".00" : ""}</span>
                <span className="num" style={{ font: "var(--w-regular) var(--t-2xs)/1 var(--font-mono)", color: "var(--text-tertiary)" }}>cum {fmt(cum[hover])}</span>
              </div>
            </div>
          );
        })()}
      </div>
    </NT.Card>
  );
}
Object.assign(window, { PnlChart });

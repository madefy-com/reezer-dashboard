/* Shared — greeting helper + DateFilter control. */
function greeting(name) {
  const h = new Date().getHours();
  const g = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${g}, ${name}`;
}

const NT_FMT = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
function ntRangeLabel(value, custom) {
  const now = new Date();
  if (value === "custom" && custom) return NT_FMT(custom.from) + " – " + NT_FMT(custom.to);
  if (value === "week") { const s = new Date(now); s.setDate(now.getDate() - 6); return NT_FMT(s) + " – " + NT_FMT(now); }
  if (value === "month") { const s = new Date(now.getFullYear(), now.getMonth(), 1); return NT_FMT(s) + " – " + NT_FMT(now); }
  return now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
const NT_ISO = (d) => d.toISOString().slice(0, 10);

function DateFilter({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [custom, setCustom] = React.useState(null);
  const now = new Date();
  const [from, setFrom] = React.useState(NT_ISO(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = React.useState(NT_ISO(now));
  const opts = [["today", "Today"], ["week", "This week"], ["month", "This month"]];
  const label = ntRangeLabel(value, custom);

  const pick = (id) => { setCustom(null); setOpen(false); onChange(id); };
  const apply = () => {
    const f = new Date(from + "T00:00:00"), t = new Date(to + "T00:00:00");
    setCustom({ from: f <= t ? f : t, to: f <= t ? t : f });
    setOpen(false); onChange("custom");
  };

  const inputStyle = {
    height: 32, padding: "0 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-strong)",
    background: "var(--surface-inset)", color: "var(--text-primary)", colorScheme: "dark",
    font: "var(--w-medium) var(--t-xs)/1 var(--font-mono)",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)} style={{
        display: "inline-flex", alignItems: "center", gap: 7, height: 32, padding: "0 12px",
        borderRadius: "var(--radius-sm)", cursor: "pointer",
        border: "1px solid " + (value === "custom" || open ? "var(--violet-line)" : "var(--border-strong)"),
        background: value === "custom" || open ? "var(--violet-soft)" : "var(--surface-card)",
        color: value === "custom" ? "var(--accent)" : "var(--text-secondary)", font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)",
      }}>
        <Ico name="calendar" size={14} />
        <span style={{ color: value === "custom" ? "var(--accent)" : "var(--text-primary)" }}>{label}</span>
        <Ico name="chevron-down" size={13} />
      </button>

      <div style={{ display: "inline-flex", padding: 3, gap: 2, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-strong)", background: "var(--surface-card)" }}>
        {opts.map(([id, lbl]) => {
          const on = value === id;
          return (
            <button key={id} onClick={() => pick(id)} style={{
              height: 24, padding: "0 11px", borderRadius: "var(--radius-xs)", cursor: "pointer",
              border: "1px solid " + (on ? "var(--border-strong)" : "transparent"),
              background: on ? "var(--surface-hover)" : "transparent",
              color: on ? "var(--text-primary)" : "var(--text-tertiary)",
              font: `${on ? "var(--w-semibold)" : "var(--w-medium)"} var(--t-2xs)/1 var(--font-sans)`, letterSpacing: "var(--ls-wide)", whiteSpace: "nowrap",
            }}>{lbl}</button>
          );
        })}
      </div>

      {open && (
        <React.Fragment>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }}></div>
          <div style={{
            position: "absolute", top: 40, left: 0, zIndex: 41, width: 280, padding: 16,
            background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <span style={{ font: "var(--w-semibold) var(--t-xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Custom range</span>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-secondary)" }}>From</span>
              <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", color: "var(--text-secondary)" }}>To</span>
              <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} style={inputStyle} />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 2 }}>
              <NT_Btn onClick={() => setOpen(false)} ghost>Cancel</NT_Btn>
              <NT_Btn onClick={apply}>Apply</NT_Btn>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

function NT_Btn({ onClick, ghost, children }) {
  return (
    <button onClick={onClick} style={{
      height: 30, padding: "0 14px", borderRadius: "var(--radius-sm)", cursor: "pointer",
      border: "1px solid " + (ghost ? "var(--border-strong)" : "transparent"),
      background: ghost ? "transparent" : "var(--accent)", color: ghost ? "var(--text-secondary)" : "#fff",
      font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)",
    }}>{children}</button>
  );
}

function PageHead({ title, subtitle, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ margin: 0, font: "var(--w-semibold) var(--t-h1)/1.1 var(--font-sans)", letterSpacing: "var(--ls-tight)", color: "var(--text-primary)" }}>{title}</h1>
        {subtitle && <p style={{ margin: "6px 0 0", font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)", color: "var(--text-tertiary)" }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

/* ============================================================
   LIVE MARKET SESSION HELPERS
   Market state is computed in the exchange's timezone (NY, auto DST);
   every time is DISPLAYED in marketHours.display_tz (your zone, auto DST).
   ============================================================ */
function ntTzOffset(date, tz) {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const p = {}; f.formatToParts(date).forEach((x) => { if (x.type !== "literal") p[x.type] = x.value; });
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUTC - date.getTime();
}
function ntTzYMD(now, tz) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const p = {}; f.formatToParts(now).forEach((x) => { if (x.type !== "literal") p[x.type] = x.value; });
  return { y: +p.year, m: +p.month, d: +p.day };
}
/* UTC epoch (ms) for a wall-clock hh:mm on the tz's current calendar day. */
function ntTzInstant(now, tz, hh, mm) {
  const { y, m, d } = ntTzYMD(now, tz);
  const guess = Date.UTC(y, m - 1, d, hh, mm, 0);
  return guess - ntTzOffset(new Date(guess), tz);
}
function ntTzDow(now, tz) {
  const s = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(now);
  return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[s];
}
function ntHM(s) { const a = String(s).split(":"); return [Number(a[0]), Number(a[1])]; }
/* Format an epoch (ms) in the display timezone as HH:MM. */
function ntFmtTz(ms, tz) {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(ms));
}
/* Current market session: { state: open|premarket|closed, streaming, instants... } */
function ntSession(now) {
  const MH = window.NT_DATA.marketHours;
  const SP = window.NT_DATA.strategyParams;
  const tz = MH.market_tz;
  const dow = ntTzDow(now, tz);
  const weekend = dow === 0 || dow === 6;
  const pmHM = ntHM(MH.premarket_open_et), roHM = ntHM(MH.regular_open_et), rcHM = ntHM(MH.regular_close_et);
  const pre   = ntTzInstant(now, tz, pmHM[0], pmHM[1]);
  const open  = ntTzInstant(now, tz, roHM[0], roHM[1]);
  const close = ntTzInstant(now, tz, rcHM[0], rcHM[1]);
  const streamEnd = open + SP.streaming.window_hours * 3600 * 1000;
  const t = now.getTime();
  let state = "closed";
  if (!weekend && t >= pre && t < open) state = "premarket";
  else if (!weekend && t >= open && t < close) state = "open";
  const streaming = !weekend && t >= open && t < streamEnd;
  return { state, streaming, pre, open, close, streamEnd, weekend, now: t };
}
/* Next future regular-open epoch (skips weekends), for the "closed" label. */
function ntNextOpen(now) {
  const MH = window.NT_DATA.marketHours;
  const hm = ntHM(MH.regular_open_et);
  for (let i = 0; i < 9; i++) {
    const probe = new Date(now.getTime() + i * 86400000);
    const dow = ntTzDow(probe, MH.market_tz);
    const inst = ntTzInstant(probe, MH.market_tz, hm[0], hm[1]);
    if (dow !== 0 && dow !== 6 && inst > now.getTime()) return inst;
  }
  return null;
}
function ntNextOpenLabel(now) {
  const ms = ntNextOpen(now);
  if (ms == null) return "\u2014";
  const tz = window.NT_DATA.marketHours.display_tz;
  const dayOf = (x) => new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(x));
  const sameDay = dayOf(ms) === dayOf(now.getTime());
  const wd = sameDay ? "" : new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(new Date(ms)) + " ";
  return wd + ntFmtTz(ms, tz);
}

Object.assign(window, { greeting, DateFilter, PageHead,
  ntSession, ntFmtTz, ntNextOpen, ntNextOpenLabel, ntTzInstant, ntTzDow });

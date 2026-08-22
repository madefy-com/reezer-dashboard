/* ActivityPage — the central operational log (bot_events), streamed from every box.
   Answers "which Mac ran the session and what did it size / enter / exit?" straight
   from reezer.io, instead of living only in a local stdout file on one machine.
   Fetches its own rows so `category` is present (live.js's cached copy may predate it);
   the cached list stays as the fallback while/if that fetch fails. */
function ActivityPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const cached = window.NT_DATA.events || [];
  const [fetched, setFetched] = React.useState(null);
  const [box, setBox] = React.useState("all");
  const [cat, setCat] = React.useState("all");
  const [problemsOnly, setProblemsOnly] = React.useState(false);

  // Own fetch (+ a 20s refresh) — live.js may hand us rows without the category column.
  React.useEffect(() => {
    let alive = true;
    const load = () => {
      const db = window.NT_CLIENT;
      if (!db) return;
      db.from("bot_events").select("*").order("ts", { ascending: false }).limit(400)
        .then(function (r) { if (alive && r && !r.error && r.data) setFetched(r.data); },
              function () { /* keep the cached NT_DATA.events fallback */ });
    };
    load();
    const id = setInterval(load, 20000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const all = fetched || cached;
  const catOf = (e) => e.category || "options";              // missing => the original world
  const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);

  const isProblem = (e) => e.level === "warn" || e.level === "error";
  const boxes = Array.from(new Set(all.map((e) => e.machine_id).filter(Boolean)));
  // Derived, never hardcoded — a future 'futures' category shows up here on its own.
  const cats = Array.from(new Set(all.map(catOf))).sort();
  const catCount = (c) => all.filter((e) => catOf(e) === c).length;

  let rows = all;
  if (cat !== "all") rows = rows.filter((e) => catOf(e) === cat);
  if (box !== "all") rows = rows.filter((e) => e.machine_id === box);
  const problemCount = rows.filter(isProblem).length;
  if (problemsOnly) rows = rows.filter(isProblem);

  const tz = (window.NT_DATA.marketHours || {}).display_tz || "Europe/Amsterdam";
  const fmt = (iso) => {
    try {
      return new Intl.DateTimeFormat("en-GB", { timeZone: tz, month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date(iso));
    } catch (e) { return String(iso || ""); }
  };
  const lvlColor = (l) => (l === "error" ? "var(--loss)" : l === "warn" ? "var(--dryrun)" : "var(--fired)");
  const evColor = (e) => ({ entry: "var(--accent)", exit: "var(--chip-close)", session: "var(--text-secondary)", reload: "var(--open)", error: "var(--loss)" }[e] || "var(--text-secondary)");
  // Stable per-world colour so a row's world is readable at a glance.
  const catColor = (c) => (c === "options" ? "var(--accent)" : c === "swings" ? "var(--profit)" : "var(--text-tertiary)");
  const catPill = (c) => (
    <span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 9px", borderRadius: 999, background: "var(--surface-inset)", border: "1px solid var(--border)", color: catColor(c), font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{c}</span>
  );

  const filterBtn = { padding: "6px 11px", borderRadius: "var(--radius-pill)", border: "1px solid var(--border)", cursor: "pointer",
    font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)", background: "transparent", color: "var(--text-secondary)" };

  const th = { font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "10px 14px", textAlign: "left", whiteSpace: "nowrap", position: "sticky", top: 0, background: "var(--surface-card)", zIndex: 1 };
  const td = { font: "var(--w-regular) var(--t-sm)/1.4 var(--font-sans)", padding: "9px 14px", borderTop: "1px solid var(--row-line)", textAlign: "left", color: "var(--text-secondary)", verticalAlign: "top" };
  const mono = { font: "var(--w-regular) var(--t-2xs)/1.3 var(--font-mono)" };

  const emptyText = cat === "all"
    ? "No activity recorded yet. The next bot session will populate this — sizing decisions, entries, exits and session start/stop from each server."
    : "No activity for " + cap(cat) + " yet.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
      <PageHead title="Activity" subtitle="Live operational log from every server — sizing basis, entries, exits and session lifecycle"
        right={
          <div style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setProblemsOnly((v) => !v)} className="nt-boxfilter" data-on={problemsOnly ? "" : undefined}
              style={filterBtn}>
              {"⚠ Problems only" + (problemCount ? " · " + problemCount : "")}
            </button>
            <span style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }} />
            {["all", ...boxes].map((b) => (
              <button key={b} onClick={() => setBox(b)} className="nt-boxfilter" data-on={box === b ? "" : undefined}
                style={filterBtn}>
                {b === "all" ? "All servers" : b}
              </button>
            ))}
          </div>
        } />

      {/* Category (world) filter — derived from the rows, so new worlds appear by themselves. */}
      <div style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={() => setCat("all")} className="nt-boxfilter" data-on={cat === "all" ? "" : undefined} style={filterBtn}>
          {"All" + (all.length ? " · " + all.length : "")}
        </button>
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className="nt-boxfilter" data-on={cat === c ? "" : undefined} style={filterBtn}>
            {cap(c) + " · " + catCount(c)}
          </button>
        ))}
      </div>

      <NT.Card title={"Events" + (rows.length ? " · " + rows.length : "")} padding={20} bodyStyle={{ padding: 0 }}>
        {rows.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-tertiary)", font: "var(--w-regular) var(--t-sm)/1.5 var(--font-sans)" }}>
            {emptyText}
          </div>
        ) : (
          <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 230px)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={th}>time</th>
                <th style={th}>category</th>
                <th style={th}>box</th>
                <th style={th}>event</th>
                <th style={{ ...th, width: "100%" }}>detail</th>
              </tr></thead>
              <tbody>
                {rows.map((e, i) => (
                  <tr key={e.id != null ? e.id : i} className="nt-trow" title={e.data ? JSON.stringify(e.data) : undefined}
                    style={e.level === "error" ? { background: "rgba(239,68,68,0.08)" } : undefined}>
                    <td style={{ ...td, ...mono, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>{fmt(e.ts)}</td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>{catPill(catOf(e))}</td>
                    <td style={{ ...td, ...mono, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{e.machine_id || "—"}</td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: lvlColor(e.level) }} />
                        <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: evColor(e.event) }}>{e.event}</span>
                      </span>
                    </td>
                    <td style={{ ...td, color: "var(--text-primary)" }}>{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </NT.Card>
      <style>{`.nt-boxfilter[data-on]{ background: var(--violet-soft) !important; border-color: var(--violet-line) !important; color: var(--accent) !important; } .nt-boxfilter:not([data-on]):hover{ color: var(--text-primary); }`}</style>
    </div>
  );
}
Object.assign(window, { ActivityPage });

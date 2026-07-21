/* AI Advisor — a chat-first "personal assistant" page, deliberately unlike the
   rest of the dashboard. It analyses every recorded trade in the browser (the
   real replay engine via Pyodide + window.Replay), asks Claude (via the
   advisor-chat edge function — the key never touches the browser) to design ONE
   complete strategy, validates it on the real trades, and lets you chat about it.

   Self-contained: depends only on React (global), window.NT_CLIENT (supabase),
   window.NT_SUPABASE (url/key), window.Replay. Styles are injected below. */
(function () {
  const { useState, useRef, useEffect } = React;

  // ------------------------------------------------------------------ styles
  const CSS = `
  .adv-wrap{position:relative;height:100%;display:flex;flex-direction:column;
    color:var(--text-primary);overflow:hidden}
  .adv-bg{position:absolute;inset:0;z-index:0;pointer-events:none;
    background:
      radial-gradient(60% 45% at 50% 0%, rgba(110,91,242,.28), transparent 70%),
      radial-gradient(50% 40% at 85% 15%, rgba(242,74,141,.16), transparent 70%),
      radial-gradient(55% 45% at 12% 25%, rgba(74,141,247,.18), transparent 70%),
      var(--bg-app);}
  .adv-scroll{position:relative;z-index:1;flex:1;min-height:0;overflow-y:auto;
    display:flex;flex-direction:column;align-items:center}
  .adv-inner{width:100%;max-width:840px;padding:26px 20px 250px;
    display:flex;flex-direction:column;align-items:center}
  /* orb */
  .adv-orbstage{position:relative;width:196px;height:196px;display:grid;place-items:center;
    animation:adv-float 7s ease-in-out infinite}
  .adv-orbstage.sm{width:64px;height:64px;animation:none}
  .adv-orbglow{position:absolute;width:184px;height:184px;border-radius:50%;pointer-events:none;
    background:radial-gradient(circle at 50% 44%,rgba(139,92,246,.60),rgba(242,74,141,.34) 40%,rgba(34,211,238,.16) 62%,transparent 72%);
    filter:blur(34px);animation:adv-breathe 5.5s ease-in-out infinite}
  .adv-orbstage.sm .adv-orbglow{width:60px;height:60px;filter:blur(11px)}
  .adv-orbstage.busy .adv-orbglow{animation-duration:2.4s}
  .adv-orb{position:relative;width:150px;height:150px;border-radius:50%;
    -webkit-mask:radial-gradient(circle at 50% 50%,#000 58%,rgba(0,0,0,.5) 69%,transparent 78%);
            mask:radial-gradient(circle at 50% 50%,#000 58%,rgba(0,0,0,.5) 69%,transparent 78%);
    filter:drop-shadow(0 26px 58px rgba(110,91,242,.45))}
  .adv-orb.sm{width:54px;height:54px;filter:drop-shadow(0 8px 18px rgba(110,91,242,.5))}
  .adv-orb .band{position:absolute;inset:-28%;filter:blur(8px) saturate(1.3) brightness(1.05);
    background:conic-gradient(from 200deg,#6E5BF2,#8B5CF6,#C04AF2,#F24A8D,#FB7185,#F5A524,#4A8DF7,#22D3EE,#6E5BF2);
    animation:adv-spin 17s linear infinite}
  .adv-orb .band.b2{inset:-6%;filter:blur(18px) saturate(1.1);opacity:.5;mix-blend-mode:screen;
    animation:adv-spinrev 24s linear infinite}
  .adv-orb .sweep{position:absolute;inset:-2%;mix-blend-mode:screen;opacity:.6;
    background:conic-gradient(from 0deg,transparent 0deg,rgba(255,255,255,.55) 22deg,transparent 60deg);
    animation:adv-spin 7s linear infinite}
  .adv-orb .sheen{position:absolute;inset:0;border-radius:50%;
    background:radial-gradient(circle at 34% 23%,rgba(255,255,255,.95),rgba(255,255,255,0) 34%),
               radial-gradient(circle at 72% 84%,rgba(6,3,22,.62),transparent 50%)}
  .adv-orb .rim{position:absolute;inset:0;border-radius:50%;mix-blend-mode:screen;
    background:radial-gradient(circle at 50% 50%,transparent 57%,rgba(190,170,255,.5) 70%,transparent 79%)}
  .adv-orbstage.busy .band{animation-duration:6s}
  .adv-orbstage.busy .sweep{animation-duration:3.5s}
  @keyframes adv-spin{to{transform:rotate(360deg)}}
  @keyframes adv-spinrev{to{transform:rotate(-360deg)}}
  @keyframes adv-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
  @keyframes adv-breathe{0%,100%{opacity:.72;transform:scale(1)}50%{opacity:1;transform:scale(1.09)}}
  /* hero */
  .adv-hero-h{font:var(--w-semibold) 40px/1.08 var(--font-sans);letter-spacing:-.02em;
    text-align:center;margin:26px 0 10px;background:linear-gradient(180deg,#fff,#c9c2ff);
    -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
  .adv-hero-p{color:var(--text-tertiary);font:var(--w-regular) var(--t-body)/1.5 var(--font-sans);
    text-align:center;max-width:520px;margin:0 0 26px}
  /* chips */
  .adv-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:4px}
  .adv-chip{cursor:pointer;border:1px solid var(--violet-line);background:var(--violet-soft);
    color:#d9d3ff;border-radius:999px;padding:9px 15px;font:var(--w-medium) var(--t-sm)/1 var(--font-sans);
    transition:all var(--dur) var(--ease-out);white-space:nowrap}
  .adv-chip:hover{background:rgba(110,91,242,.28);border-color:var(--accent);transform:translateY(-1px)}
  .adv-chip.primary{background:var(--accent);border-color:var(--accent);color:#fff}
  .adv-chip.primary:hover{background:#7d6cff}
  .adv-chip[disabled]{opacity:.4;pointer-events:none}
  /* conversation */
  .adv-convo{width:100%;display:flex;flex-direction:column;gap:16px;margin-top:8px}
  .adv-msg{display:flex;gap:12px;max-width:100%}
  .adv-msg.me{justify-content:flex-end}
  .adv-bubble{border-radius:16px;padding:13px 16px;font:var(--w-regular) var(--t-body)/1.55 var(--font-sans);
    white-space:pre-wrap;word-break:break-word}
  .adv-msg.me .adv-bubble{background:var(--accent);color:#fff;border-bottom-right-radius:5px;max-width:78%}
  .adv-msg.ai .adv-bubble{background:rgba(255,255,255,.04);border:1px solid var(--border);
    color:var(--text-secondary);border-bottom-left-radius:5px;max-width:88%;backdrop-filter:blur(6px)}
  .adv-think{color:var(--text-tertiary);font:var(--w-regular) var(--t-sm)/1.4 var(--font-sans);display:flex;
    align-items:center;gap:9px;padding:4px 2px}
  .adv-dot{width:7px;height:7px;border-radius:50%;background:var(--accent);animation:adv-pulse 1.1s ease-in-out infinite}
  @keyframes adv-pulse{0%,100%{opacity:.35;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}
  /* proposal card */
  .adv-card{width:100%;border:1px solid var(--violet-line);border-radius:var(--radius-lg);
    background:linear-gradient(180deg,rgba(110,91,242,.10),rgba(110,91,242,.02));
    padding:20px;backdrop-filter:blur(8px);box-shadow:0 10px 40px rgba(110,91,242,.14)}
  .adv-card h4{font:var(--w-semibold) var(--t-h3)/1.2 var(--font-sans);margin:0 0 3px;
    display:flex;align-items:center;gap:9px}
  .adv-card .sub{color:var(--text-tertiary);font:var(--w-regular) var(--t-sm)/1.4 var(--font-sans);margin:0 0 16px}
  .adv-metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;border-top:1px solid var(--violet-line);
    border-bottom:1px solid var(--violet-line);padding:13px 0;margin-bottom:16px}
  .adv-metrics .m{display:flex;flex-direction:column;gap:3px}
  .adv-metrics .k{font:var(--w-medium) var(--t-2xs)/1 var(--font-sans);letter-spacing:var(--ls-caps);
    text-transform:uppercase;color:var(--text-tertiary)}
  .adv-metrics .v{font:var(--w-semibold) var(--t-body)/1 var(--font-mono)}
  .adv-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px 26px}
  @media(max-width:620px){.adv-cols{grid-template-columns:1fr}.adv-metrics{grid-template-columns:repeat(3,1fr)}
    .adv-inner{padding-bottom:190px}}
  .adv-grp-h{font:var(--w-semibold) var(--t-sm)/1 var(--font-sans);color:var(--text-secondary);
    padding-bottom:8px;margin-bottom:8px;border-bottom:1px solid var(--border-strong);
    display:flex;align-items:center;gap:7px}
  .adv-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;
    font:var(--w-regular) var(--t-sm)/1.3 var(--font-sans)}
  .adv-row .l{color:var(--text-tertiary)}
  .adv-row .r{font-family:var(--font-mono);color:var(--text-primary)}
  .adv-row .r.off{color:var(--text-tertiary)}
  .adv-rat{margin-top:14px;padding-top:13px;border-top:1px solid var(--violet-line);
    color:var(--text-secondary);font:var(--w-regular) var(--t-sm)/1.6 var(--font-sans)}
  /* composer */
  .adv-composer{position:absolute;left:0;right:0;bottom:0;z-index:5;display:flex;justify-content:center;
    padding:16px 20px 22px;background:linear-gradient(180deg,transparent,var(--bg-app) 42%)}
  .adv-composer-in{width:100%;max-width:840px}
  .adv-box{display:flex;align-items:flex-end;gap:8px;background:var(--surface-card);
    border:1px solid var(--border-strong);border-radius:18px;padding:8px 8px 8px 16px;
    box-shadow:var(--shadow-pop)}
  .adv-box:focus-within{border-color:var(--violet-line)}
  .adv-box textarea{flex:1;background:transparent;border:0;outline:0;resize:none;color:var(--text-primary);
    font:var(--w-regular) var(--t-body)/1.4 var(--font-sans);max-height:140px;padding:6px 0}
  .adv-send{flex:none;width:38px;height:38px;border-radius:12px;border:0;cursor:pointer;background:var(--accent);
    color:#fff;display:flex;align-items:center;justify-content:center;transition:background var(--dur)}
  .adv-send:hover{background:#7d6cff}.adv-send[disabled]{opacity:.4;cursor:default}
  .adv-note{text-align:center;color:var(--dryrun);font:var(--w-regular) var(--t-xs)/1.4 var(--font-sans);margin:0 0 9px}
  .adv-err{color:var(--loss);font:var(--w-regular) var(--t-sm)/1.5 var(--font-sans)}
  `;
  function injectCSS() {
    if (document.getElementById("advisor-css")) return;
    const s = document.createElement("style"); s.id = "advisor-css"; s.textContent = CSS;
    document.head.appendChild(s);
  }

  // --------------------------------------------------------------- constants
  const HORIZON_MIN = 30, STEP_S = 15, MAX_CONTRACTS = 1;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const dt = (s) => new Date(String(s));
  const dayShort = (iso) => { try { return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short" }).format(new Date(iso)); } catch (e) { return "?"; } };

  // neutral pivot for the isolation sweeps (Config-field kwargs; rules-only, 1 contract)
  const NEUTRAL_CFG = {
    trade_budget_usd: 1e9, max_contracts_per_trade: 1, allowlist: ["QQQ"],
    stop_loss_pct: null, breakeven_at_pct: null, breakeven_after_partial: true,
    take_profit_pct: null, take_half_at_pct: null, trailing_tiers: [],
    max_hold_minutes: HORIZON_MIN, max_price_slippage_usd: null, max_trades_per_day: 999999,
    ignore_exit_alerts: true, exit_mode: "rules", budget_day_pct: {},
    kill_switch: false, paused: false, dry_run: true,
  };
  // row form (csv allowlist / jsonb tiers) for the runStrategy paths (exit-mode + validation)
  const NEUTRAL_ROW = {
    trade_budget_usd: 1e9, max_contracts_per_trade: 1, allowlist: "",
    stop_loss_pct: null, breakeven_at_pct: null, breakeven_after_partial: true,
    take_profit_pct: null, take_half_at_pct: null, trailing_tiers: null,
    max_hold_minutes: HORIZON_MIN, max_price_slippage_usd: null, max_trades_per_day: 999999,
    ignore_exit_alerts: true, exit_mode: "rules", budget_day_pct: {},
    kill_switch: false, paused: false, dry_run: true,
  };

  const PROPOSAL_SCHEMA = {
    type: "object", additionalProperties: false,
    required: ["trade_budget_usd", "budget_day_pct", "exit_mode", "stop_loss_pct", "breakeven_at_pct",
      "breakeven_after_partial", "take_profit_pct", "take_half_at_pct", "trailing_tiers", "max_hold_minutes", "rationale"],
    properties: {
      trade_budget_usd: { type: "number" },
      budget_day_pct: {
        type: "object", additionalProperties: false, required: ["mon", "tue", "wed", "thu", "fri"],
        properties: { mon: { type: "number" }, tue: { type: "number" }, wed: { type: "number" }, thu: { type: "number" }, fri: { type: "number" } },
      },
      exit_mode: { type: "string", enum: ["rules", "rules_close", "alerts"] },
      stop_loss_pct: { anyOf: [{ type: "number" }, { type: "null" }] },
      breakeven_at_pct: { anyOf: [{ type: "number" }, { type: "null" }] },
      breakeven_after_partial: { type: "boolean" },
      take_profit_pct: { anyOf: [{ type: "number" }, { type: "null" }] },
      take_half_at_pct: { anyOf: [{ type: "number" }, { type: "null" }] },
      trailing_tiers: { type: "array", items: { type: "array", items: { type: "number" } } },
      max_hold_minutes: { anyOf: [{ type: "integer" }, { type: "null" }] },
      rationale: { type: "string" },
    },
  };

  const SYSTEM =
    "You are an options-trading strategy designer inside the Reezer dashboard. You are given the REAL " +
    "recorded price path of every trade (entry to +30 min, 15s resolution), the trader's own feed messages " +
    "per day, per-parameter sensitivity sweeps run through the actual backtest engine, and a per-weekday " +
    "performance breakdown. Fractions are decimals (0.20 = 20%; null = off). trailing_tiers is a list of " +
    "[peak_gain, give_back] pairs. budget_day_pct is a % multiplier per weekday (100=full, 0=skip). " +
    "IMPORTANT: max contracts is FIXED at 1, so trade_budget_usd is NOT leverage — it is a max-premium-per-" +
    "contract filter (a trade whose price*100 exceeds budget*day% is SKIPPED). Use it plus budget_day_pct to " +
    "avoid expensive premium and skip weak days. When designing, return one complete strategy justified by the " +
    "data. When answering questions, be concise and specific and cite the real numbers from the analysis.";

  // ------------------------------------------------------------- analysis
  async function loadPoolTrades(db, onStatus) {
    const poolRes = await db.from("replay_pool").select("*").order("entry_ts");
    if (poolRes.error) throw poolRes.error;
    const pool = poolRes.data || [];
    const alRes = await db.from("alerts").select("ts,type,ticker").in("type", ["PARTIAL", "CLOSE"]).eq("fired", 1).order("ts");
    const exitAlerts = alRes.error ? [] : (alRes.data || []);
    const entriesByTicker = {};
    pool.forEach((t) => { (entriesByTicker[t.ticker] = entriesByTicker[t.ticker] || []).push(t.entry_ts); });
    Object.keys(entriesByTicker).forEach((k) => entriesByTicker[k].sort());
    const alertsFor = (t) => {
      const arr = entriesByTicker[t.ticker] || []; let end = null;
      for (let j = 0; j < arr.length; j++) { if (arr[j] > t.entry_ts) { end = arr[j]; break; } }
      return exitAlerts.filter((a) => a.ticker === t.ticker && a.ts >= t.entry_ts && (end == null || a.ts < end)).map((a) => ({ ts: a.ts, type: a.type }));
    };
    const out = [];
    for (let i = 0; i < pool.length; i++) {
      const t = pool[i];
      onStatus && onStatus("loading trade " + (i + 1) + "/" + pool.length + " (" + (t.ticker || "?") + ")");
      const e0 = dt(t.entry_ts).getTime();
      const end = new Date(e0 + HORIZON_MIN * 60000).toISOString();
      const tres = await db.from("fronttest_tape").select("ts,price,bid,ask")
        .eq("position_id", t.position_id).gte("ts", t.entry_ts).lte("ts", end).order("ts").limit(6000);
      if (tres.error) throw tres.error;
      const tape = (tres.data || []).map((r) => [r.ts, r.price, r.bid, r.ask]);
      if (!tape.length) continue;
      out.push({ t: t, tape: tape, alerts: alertsFor(t) });
    }
    return out;
  }

  function profile(pt) {
    const t = pt.t, entry = Number(t.entry_price), e0 = dt(t.entry_ts).getTime();
    const series = pt.tape.map((r) => [Math.max(0, (dt(r[0]).getTime() - e0) / 1000), Number(r[1])]).sort((a, b) => a[0] - b[0]);
    const path = []; let i = 0, cur = entry;
    for (let s = 0; s <= HORIZON_MIN * 60; s += STEP_S) {
      while (i < series.length && series[i][0] <= s) { cur = series[i][1]; i++; }
      path.push(Math.round((cur / entry - 1) * 1000) / 10);
    }
    let gi = 0, di = 0;
    for (let k = 1; k < path.length; k++) { if (path[k] > path[gi]) gi = k; if (path[k] < path[di]) di = k; }
    return {
      ticker: t.ticker, side: t.side === "C" ? "call" : "put", day: dayShort(t.entry_ts),
      date: new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(dt(t.entry_ts)),
      entry_price: Math.round(entry * 100) / 100,
      max_gain_pct: path[gi], max_gain_min: Math.round(gi * STEP_S / 6) / 10,
      max_drawdown_pct: path[di], max_drawdown_min: Math.round(di * STEP_S / 6) / 10,
      pct_at_30min: path[path.length - 1], path_pct_15s: path,
    };
  }

  async function dailyFeed(db) {
    const al = await db.from("alerts").select("ts,type,ticker,raw,fired").order("ts");
    const byDay = {};
    (al.data || []).forEach((a) => {
      const raw = (a.raw || "").trim().replace(/\s+/g, " "); if (!raw) return;
      const d = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(dt(a.ts));
      const hm = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hour12: false }).format(dt(a.ts));
      const line = hm + " [" + a.type + (a.fired ? "" : "/chatter") + "]" + (a.ticker ? " " + a.ticker : "") + ": " + raw.slice(0, 200);
      (byDay[d] = byDay[d] || []).push(line);
    });
    return byDay;
  }

  function sizeFor(row, px, ts) {
    const dp = row.budget_day_pct || {};
    const pct = dp[dayShort(ts).toLowerCase().slice(0, 3)] != null ? Number(dp[dayShort(ts).toLowerCase().slice(0, 3)]) : 100;
    const eff = Number(row.trade_budget_usd || 0) * pct / 100;
    const cost = Number(px) * 100;
    let q = cost > 0 ? Math.floor(eff / cost) : 0;
    const cap = Number(row.max_contracts_per_trade || 0);
    return cap > 0 ? Math.min(q, cap) : q;
  }

  function metrics(vals) {
    const n = vals.length, wins = vals.filter((v) => v > 0).length;
    const g = vals.filter((v) => v > 0).reduce((a, v) => a + v, 0);
    const l = -vals.filter((v) => v < 0).reduce((a, v) => a + v, 0);
    return {
      total: Math.round(vals.reduce((a, v) => a + v, 0)), n: n,
      win_pct: n ? Math.round(100 * wins / n) : 0,
      profit_factor: l ? Math.round(g / l * 100) / 100 : (g ? null : 0),
      avg: n ? Math.round(vals.reduce((a, v) => a + v, 0) / n) : 0,
    };
  }
  function drawdown(rows) { // rows [{v,ts}] -> max equity drawdown $
    let eq = 0, peak = 0, mdd = 0;
    rows.slice().sort((a, b) => (a.ts < b.ts ? -1 : 1)).forEach((r) => { eq += r.v; peak = Math.max(peak, eq); mdd = Math.max(mdd, peak - eq); });
    return Math.round(mdd);
  }

  function sweepCfg(pts, field, values) {
    return values.map((v) => {
      const cfg = Object.assign({}, NEUTRAL_CFG); cfg[field] = v;
      const vals = pts.map((p) => window.Replay.run(cfg, { ticker: p.t.ticker, osi_symbol: String(p.t.ticker), side: p.t.side, strike: p.t.strike, qty: 1, fill_price: Number(p.t.entry_price), opened_at: p.t.entry_ts }, p.tape).realized);
      const m = metrics(vals);
      return { value: v, total_per_contract: m.total, win_pct: m.win_pct, avg: m.avg };
    });
  }
  function sweepExitMode(pts, values) {
    return values.map((v) => {
      const row = Object.assign({}, NEUTRAL_ROW, { exit_mode: v });
      const vals = pts.map((p) => window.Replay.runStrategy(row, { ticker: p.t.ticker, osi_symbol: String(p.t.ticker), side: p.t.side, strike: p.t.strike, qty: 1, fill_price: Number(p.t.entry_price), opened_at: p.t.entry_ts }, p.tape, p.alerts).realized);
      const m = metrics(vals);
      return { value: v, total_per_contract: m.total, win_pct: m.win_pct, avg: m.avg };
    });
  }
  function budgetSweep(pts, values) {
    return values.map((b) => {
      const row = Object.assign({}, NEUTRAL_ROW, { trade_budget_usd: b, max_contracts_per_trade: MAX_CONTRACTS });
      const taken = [];
      pts.forEach((p) => {
        const q = sizeFor(row, p.t.entry_price, p.t.entry_ts);
        if (q > 0) taken.push(window.Replay.runStrategy(row, { ticker: p.t.ticker, osi_symbol: String(p.t.ticker), side: p.t.side, strike: p.t.strike, qty: q, fill_price: Number(p.t.entry_price), opened_at: p.t.entry_ts }, p.tape, null).realized);
      });
      const m = metrics(taken);
      return { budget: b, trades_taken: taken.length, total: m.total, win_pct: m.win_pct };
    });
  }

  async function analyze(db, onStatus) {
    onStatus("waking the engine (first run ~5s)…");
    await window.Replay.ensure(onStatus);
    onStatus("loading your trades…");
    const pts = await loadPoolTrades(db, onStatus);
    if (!pts.length) throw new Error("No trades with recorded price tape were found.");
    const profiles = pts.map(profile);
    const feed = await dailyFeed(db);

    const sw = {}; let step = 0;
    const grid = [
      ["stop_loss_pct", [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, null]],
      ["take_profit_pct", [null, 0.15, 0.25, 0.40, 0.60, 0.80, 1.00, 1.50]],
      ["take_half_at_pct", [null, 0.25, 0.40, 0.50, 0.75, 1.00]],
      ["breakeven_at_pct", [null, 0.10, 0.20, 0.30, 0.50]],
      ["max_hold_minutes", [5, 10, 15, 20, 25, 30]],
    ];
    for (const [field, values] of grid) { onStatus("testing " + field.replace(/_/g, " ") + "…"); sw[field] = sweepCfg(pts, field, values); await sleep(0); step++; }
    onStatus("testing trailing stops…");
    sw.trailing_tiers = sweepCfg(pts, "trailing_tiers", [[], [[0.30, 0.25]], [[0.30, 0.25], [0.50, 0.15]], [[0.50, 0.20]], [[0.40, 0.30], [0.80, 0.15]]]); await sleep(0);
    onStatus("testing exit modes…"); sw.exit_mode = sweepExitMode(pts, ["rules", "rules_close", "alerts"]); await sleep(0);
    onStatus("testing budget filter…"); sw.trade_budget_usd = budgetSweep(pts, [150, 200, 250, 300, 400, 600, 1000]); await sleep(0);

    // weekday breakdown (1 contract, rules-only ride to 30m)
    const byday = {};
    pts.forEach((p) => {
      const v = window.Replay.run(NEUTRAL_CFG, { ticker: p.t.ticker, osi_symbol: String(p.t.ticker), side: p.t.side, strike: p.t.strike, qty: 1, fill_price: Number(p.t.entry_price), opened_at: p.t.entry_ts }, p.tape).realized;
      (byday[dayShort(p.t.entry_ts)] = byday[dayShort(p.t.entry_ts)] || []).push(v);
    });
    const weekday = {};
    Object.keys(byday).forEach((d) => { const vs = byday[d]; weekday[d] = { total_per_contract: Math.round(vs.reduce((a, v) => a + v, 0)), win_pct: Math.round(100 * vs.filter((v) => v > 0).length / vs.length), trades: vs.length }; });

    const payload = {
      note: "All sweep/weekday P&L is per 1 contract, rules-only isolation over the real tape. Horizon = entry to +30 min. Max contracts is fixed at 1.",
      n_trades: pts.length, trades: profiles, daily_feed: feed,
      weekday_performance: weekday, sensitivity_sweeps: sw,
    };
    return { payload: payload, pts: pts };
  }

  function validate(pts, prop) {
    const row = Object.assign({}, NEUTRAL_ROW, {
      trade_budget_usd: prop.trade_budget_usd, max_contracts_per_trade: MAX_CONTRACTS,
      budget_day_pct: prop.budget_day_pct, exit_mode: prop.exit_mode,
      stop_loss_pct: prop.stop_loss_pct, breakeven_at_pct: prop.breakeven_at_pct,
      breakeven_after_partial: prop.breakeven_after_partial, take_profit_pct: prop.take_profit_pct,
      take_half_at_pct: prop.take_half_at_pct,
      trailing_tiers: (prop.trailing_tiers || []).map((x) => [x[0], x[1]]),
      max_hold_minutes: prop.max_hold_minutes, ignore_exit_alerts: prop.exit_mode === "rules",
    });
    const rows = [];
    pts.forEach((p) => {
      const q = sizeFor(row, p.t.entry_price, p.t.entry_ts);
      const v = q > 0 ? window.Replay.runStrategy(row, { ticker: p.t.ticker, osi_symbol: String(p.t.ticker), side: p.t.side, strike: p.t.strike, qty: q, fill_price: Number(p.t.entry_price), opened_at: p.t.entry_ts }, p.tape, p.alerts).realized : 0;
      rows.push({ v: v, ts: p.t.entry_ts });
    });
    const m = metrics(rows.map((r) => r.v)); m.max_drawdown = drawdown(rows);
    return m;
  }

  // ------------------------------------------------------------- claude relay
  async function callClaude(body) {
    const SB = window.NT_SUPABASE || {};
    let jwt = SB.key;
    try { const s = await window.NT_CLIENT.auth.getSession(); if (s && s.data && s.data.session) jwt = s.data.session.access_token; } catch (e) {}
    const r = await fetch((SB.url || "") + "/functions/v1/advisor-chat", {
      method: "POST", headers: { Authorization: "Bearer " + jwt, apikey: SB.key, "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) throw new Error(j.error ? (j.detail ? j.error + " — " + j.detail : j.error) : "HTTP " + r.status);
    const text = (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    return { text: text, usage: j.usage };
  }
  async function checkReady() {
    const SB = window.NT_SUPABASE || {};
    let jwt = SB.key;
    try { const s = await window.NT_CLIENT.auth.getSession(); if (s && s.data && s.data.session) jwt = s.data.session.access_token; } catch (e) {}
    try {
      const r = await fetch((SB.url || "") + "/functions/v1/advisor-chat?action=status", { headers: { Authorization: "Bearer " + jwt, apikey: SB.key } });
      const j = await r.json(); return !!j.ready;
    } catch (e) { return false; }
  }

  // ------------------------------------------------------------- rendering
  const pctS = (v) => v == null ? "off" : Math.round(v * 100) + "%";
  function Orb(props) {
    const sm = props.sm ? " sm" : "";
    return (<div className={"adv-orbstage" + sm + (props.busy ? " busy" : "")}>
      <div className="adv-orbglow" />
      <div className={"adv-orb" + sm}>
        <div className="band" /><div className="band b2" /><div className="sweep" />
        <div className="sheen" /><div className="rim" />
      </div>
    </div>);
  }
  function ProposalCard(props) {
    const p = props.p, m = props.m;
    const tiers = (p.trailing_tiers || []);
    const trail = !tiers.length ? "No" : tiers.map((t) => "+" + Math.round(t[0] * 100) + "%→give " + Math.round(t[1] * 100) + "%").join(" · ");
    const bd = p.budget_day_pct;
    const days = ["mon", "tue", "wed", "thu", "fri"].map((d) => d[0].toUpperCase() + d.slice(1) + " " + Math.round(bd[d]) + "%").join(" · ");
    const row = (l, v, off) => (<div className="adv-row"><span className="l">{l}</span><span className={"r" + (off ? " off" : "")}>{v}</span></div>);
    const M = (k, v, tone) => (<div className="m"><span className="k">{k}</span><span className="v" style={tone ? { color: tone } : null}>{v}</span></div>);
    return (<div className="adv-card">
      <h4><Orb sm /> Proposed strategy</h4>
      <p className="sub">Designed from your {props.n} trades · validated on the real tape</p>
      <div className="adv-metrics">
        {M("Total P&L", "$" + m.total, m.total >= 0 ? "var(--profit)" : "var(--loss)")}
        {M("Win rate", m.win_pct + "%")}
        {M("Profit factor", m.profit_factor == null ? "∞" : m.profit_factor)}
        {M("Avg / trade", "$" + m.avg, m.avg >= 0 ? "var(--profit)" : "var(--loss)")}
        {M("Max drawdown", "$" + m.max_drawdown, "var(--loss)")}
      </div>
      <div className="adv-cols">
        <div>
          <div className="adv-grp-h">Sizing</div>
          {row("Trade budget", "$" + Math.round(p.trade_budget_usd))}
          {row("Max contracts", "1 (fixed)", true)}
          {row("Budget / weekday", days)}
        </div>
        <div>
          <div className="adv-grp-h">Exits & risk</div>
          {row("Exits", p.exit_mode)}
          {row("Initial stop", pctS(p.stop_loss_pct), p.stop_loss_pct == null)}
          {row("Breakeven stop", p.breakeven_at_pct == null ? "off" : "arms at +" + Math.round(p.breakeven_at_pct * 100) + "%", p.breakeven_at_pct == null)}
          {row("BE after exit", p.breakeven_after_partial ? "on" : "off", !p.breakeven_after_partial)}
          {row("Take profit", pctS(p.take_profit_pct), p.take_profit_pct == null)}
          {row("Take half at", pctS(p.take_half_at_pct), p.take_half_at_pct == null)}
          {row("Trailing stop", trail, trail === "No")}
          {row("Max hold", p.max_hold_minutes == null ? "ride to 30m" : p.max_hold_minutes + "m")}
        </div>
      </div>
      <div className="adv-rat"><b style={{ color: "var(--text-primary)" }}>Why:</b> {p.rationale}</div>
    </div>);
  }

  const DESIGN_CHIPS = ["Design a strategy"];
  const ASK_CHIPS = ["Why no stop?", "Which day loses money?", "What if Wednesday runs full budget?", "Design a new one"];

  function AdvisorPage() {
    const [msgs, setMsgs] = useState([]);       // {role:'me'|'ai', kind:'text'|'proposal', text?, p?, m?, n?}
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState("");
    const [ready, setReady] = useState(null);
    const convo = useRef([]);                    // raw anthropic message history
    const analysisRef = useRef(null);            // {payload, pts}
    const endRef = useRef(null);
    useEffect(() => { injectCSS(); checkReady().then(setReady); }, []);
    useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs, status]);

    const started = msgs.length > 0;
    const push = (m) => setMsgs((x) => x.concat([m]));

    async function ensureAnalysis() {
      if (analysisRef.current) return analysisRef.current;
      const a = await analyze(window.NT_CLIENT, setStatus);
      analysisRef.current = a; return a;
    }

    async function design() {
      if (busy) return; setBusy(true); setStatus("starting…");
      push({ role: "me", kind: "text", text: "Design a strategy from my trades." });
      try {
        const a = await ensureAnalysis();
        setStatus("Claude is designing the strategy…");
        const messages = [{ role: "user", content: [
          { type: "text", text: "Full analysis of my recorded trades (JSON):\n" + JSON.stringify(a.payload), cache_control: { type: "ephemeral" } },
          { type: "text", text: "Design one complete strategy now." },
        ] }];
        const res = await callClaude({ system: SYSTEM, messages: messages, max_tokens: 12000, thinking: { type: "adaptive" }, output_config: { effort: "high", format: { type: "json_schema", schema: PROPOSAL_SCHEMA } } });
        const prop = JSON.parse(res.text);
        const m = validate(a.pts, prop);
        convo.current = messages.concat([{ role: "assistant", content: res.text + "\n\n[Validated on the real tape: total $" + m.total + ", win " + m.win_pct + "%, profit factor " + (m.profit_factor == null ? "inf" : m.profit_factor) + ", avg $" + m.avg + "/trade, max drawdown $" + m.max_drawdown + ".]" }]);
        push({ role: "ai", kind: "proposal", p: prop, m: m, n: a.pts.length });
      } catch (e) { push({ role: "ai", kind: "text", text: "", err: String(e.message || e) }); }
      setBusy(false); setStatus("");
    }

    async function ask(q) {
      if (busy || !q.trim()) return;
      if (/design (a )?(new )?strateg/i.test(q) && !/why|explain/i.test(q)) { setInput(""); return design(); }
      setBusy(true); setInput(""); push({ role: "me", kind: "text", text: q });
      try {
        if (!convo.current.length) {              // asked before designing -> run analysis first, seed context
          const a = await ensureAnalysis();
          convo.current = [{ role: "user", content: [{ type: "text", text: "Full analysis of my recorded trades (JSON):\n" + JSON.stringify(a.payload), cache_control: { type: "ephemeral" } }, { type: "text", text: "I'll ask questions about this data." }] }, { role: "assistant", content: "Understood — I've studied all your trades, the price paths, your feed, and the sensitivity sweeps. Ask away." }];
        }
        convo.current.push({ role: "user", content: q });
        setStatus("thinking…");
        const res = await callClaude({ system: SYSTEM, messages: convo.current, max_tokens: 4000, thinking: { type: "adaptive" }, output_config: { effort: "medium" } });
        convo.current.push({ role: "assistant", content: res.text });
        push({ role: "ai", kind: "text", text: res.text });
      } catch (e) { push({ role: "ai", kind: "text", text: "", err: String(e.message || e) }); }
      setBusy(false); setStatus("");
    }

    const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } };
    const chips = started ? ASK_CHIPS : DESIGN_CHIPS;

    return (<div className="adv-wrap">
      <div className="adv-bg" />
      <div className="adv-scroll"><div className="adv-inner">
        {!started && (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "6vh" }}>
          <Orb busy={busy} />
          <h1 className="adv-hero-h">Let's find your edge.</h1>
          <p className="adv-hero-p">I'll study every trade you've taken — the full price path to +30 min and your own feed — then design a strategy from it, and you can ask me anything about it.</p>
        </div>)}

        <div className="adv-convo">
          {msgs.map((m, i) => (<div key={i} className={"adv-msg " + (m.role === "me" ? "me" : "ai")}>
            {m.kind === "proposal"
              ? <ProposalCard p={m.p} m={m.m} n={m.n} />
              : <div className="adv-bubble">{m.err ? <span className="adv-err">⚠ {m.err}</span> : m.text}</div>}
          </div>))}
          {busy && (<div className="adv-msg ai"><div className="adv-think"><span className="adv-dot" />{status || "working…"}</div></div>)}
          <div ref={endRef} />
        </div>

        {!started && (<div className="adv-chips" style={{ marginTop: 8 }}>
          {chips.map((c) => (<button key={c} className={"adv-chip" + (c === "Design a strategy" ? " primary" : "")} disabled={busy} onClick={() => ask(c)}>{c}</button>))}
        </div>)}
      </div></div>

      <div className="adv-composer"><div className="adv-composer-in">
        {ready === false && (<p className="adv-note">Add your ANTHROPIC_API_KEY in Supabase → Edge Functions → Secrets to enable the advisor.</p>)}
        {started && (<div className="adv-chips" style={{ marginBottom: 10 }}>
          {ASK_CHIPS.map((c) => (<button key={c} className="adv-chip" disabled={busy} onClick={() => ask(c)}>{c}</button>))}
        </div>)}
        <div className="adv-box">
          <textarea rows={1} value={input} placeholder="Ask about your trades, or design a strategy…"
            onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} disabled={busy} />
          <button className="adv-send" disabled={busy || !input.trim()} onClick={() => ask(input)} title="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
          </button>
        </div>
      </div></div>
    </div>);
  }

  Object.assign(window, { AdvisorPage });
})();

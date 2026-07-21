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
      linear-gradient(to bottom, var(--bg-app), transparent 15%),
      linear-gradient(to top, var(--bg-app), transparent 18%),
      linear-gradient(to right, var(--bg-app), transparent 12%),
      linear-gradient(to left, var(--bg-app), transparent 12%),
      radial-gradient(52% 46% at 50% 46%, rgba(110,91,242,.32), transparent 66%),
      radial-gradient(42% 40% at 68% 40%, rgba(242,74,141,.16), transparent 70%),
      radial-gradient(46% 42% at 33% 52%, rgba(74,141,247,.17), transparent 70%),
      var(--bg-app);}
  .adv-scroll{position:relative;z-index:1;flex:1;min-height:0;overflow-y:auto;
    display:flex;flex-direction:column;align-items:center;scroll-padding-bottom:215px}
  .adv-inner{width:100%;max-width:840px;padding:26px 20px 250px;
    display:flex;flex-direction:column;align-items:center}
  /* orb — organic morphing blob (SVG turbulence + halftone grain) */
  .adv-orbstage{position:relative;width:250px;height:250px;display:grid;place-items:center;
    animation:adv-float 7s ease-in-out infinite}
  .adv-orbstage.sm{width:64px;height:64px;animation:none}
  .adv-orbglow{position:absolute;width:186px;height:186px;border-radius:50%;pointer-events:none;
    background:radial-gradient(circle at 50% 48%,rgba(139,92,246,.4),rgba(242,74,141,.2) 44%,transparent 70%);
    filter:blur(30px);animation:adv-breathe 5.5s ease-in-out infinite}
  .adv-orbstage.sm .adv-orbglow{width:52px;height:52px;filter:blur(9px)}
  .adv-orbstage.busy .adv-orbglow{animation-duration:2.4s}
  .adv-orbgif{position:relative;width:132%;height:132%;object-fit:contain;
    filter:hue-rotate(-66deg) saturate(1.32) brightness(1.04) drop-shadow(0 16px 38px rgba(139,91,242,.5))}
  @keyframes adv-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
  @keyframes adv-breathe{0%,100%{opacity:.72;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
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
  .adv-box{display:flex;align-items:center;gap:8px;background:var(--surface-card);
    border:1px solid var(--border-strong);border-radius:18px;padding:7px 7px 7px 18px;
    box-shadow:var(--shadow-pop)}
  .adv-box:focus-within{border-color:var(--violet-line)}
  .adv-box textarea{flex:1;background:transparent;border:0;outline:0;resize:none;color:var(--text-primary);
    font:var(--w-regular) var(--t-body)/1.5 var(--font-sans);max-height:140px;padding:0;display:block}
  .adv-send{flex:none;width:38px;height:38px;border-radius:12px;border:0;cursor:pointer;background:var(--accent);
    color:#fff;display:flex;align-items:center;justify-content:center;transition:background var(--dur)}
  .adv-send:hover{background:#7d6cff}.adv-send[disabled]{opacity:.4;cursor:default}
  .adv-mic{flex:none;width:38px;height:38px;border-radius:12px;border:1px solid var(--border-strong);cursor:pointer;
    background:transparent;color:var(--text-secondary);display:flex;align-items:center;justify-content:center;transition:all var(--dur)}
  .adv-mic:hover{color:var(--text-primary);border-color:var(--violet-line)}
  .adv-mic[data-on]{background:var(--loss);border-color:var(--loss);color:#fff;box-shadow:0 0 0 4px rgba(240,69,75,.22);animation:adv-breathe 1.1s ease-in-out infinite}
  .adv-mic[disabled]{opacity:.4;cursor:default}
  .adv-voice{display:inline-flex;align-items:center;gap:6px;background:transparent;border:1px solid var(--border);
    color:var(--text-tertiary);border-radius:999px;padding:5px 11px;font:var(--w-medium) var(--t-xs)/1 var(--font-sans);cursor:pointer;transition:all var(--dur)}
  .adv-voice:hover{color:var(--text-secondary);border-color:var(--border-strong)}
  .adv-voice.on{background:var(--violet-soft);border-color:var(--violet-line);color:var(--accent)}
  .adv-note{text-align:center;color:var(--dryrun);font:var(--w-regular) var(--t-xs)/1.4 var(--font-sans);margin:0 0 9px}
  .adv-err{color:var(--loss);font:var(--w-regular) var(--t-sm)/1.5 var(--font-sans)}
  /* AI answers are unframed — plain text, like a natural assistant reply */
  .adv-answer{color:var(--text-primary);font:var(--w-regular) var(--t-body)/1.65 var(--font-sans);
    max-width:100%;word-break:break-word;padding:1px 2px}
  .adv-bubble ul,.adv-answer ul{margin:9px 0;padding-left:19px;display:flex;flex-direction:column;gap:6px}
  .adv-bubble li,.adv-answer li{margin:0;padding-left:2px}
  .adv-answer li::marker{color:var(--accent)}
  .adv-bubble b,.adv-answer b{color:var(--text-primary);font-weight:var(--w-semibold)}
  .adv-bubble i,.adv-answer i{color:var(--text-primary);font-style:italic}
  .adv-bubble code,.adv-answer code{font-family:var(--font-mono);background:rgba(255,255,255,.07);padding:1px 6px;border-radius:6px;font-size:.9em;color:#d9d3ff}
  .adv-bubble .adv-sp,.adv-answer .adv-sp{height:8px}
  .adv-progress{width:min(440px,100%);background:rgba(255,255,255,.04);border:1px solid var(--border);
    border-radius:14px;padding:13px 16px;backdrop-filter:blur(6px)}
  .adv-prog-label{display:flex;align-items:center;gap:9px;color:var(--text-secondary);
    font:var(--w-medium) var(--t-sm)/1.3 var(--font-sans);margin-bottom:11px}
  .adv-prog-pct{margin-left:auto;font-family:var(--font-mono);color:var(--accent)}
  .adv-prog-track{height:7px;border-radius:999px;background:rgba(255,255,255,.09);overflow:hidden}
  .adv-prog-fill{height:100%;border-radius:999px;position:relative;overflow:hidden;
    background:linear-gradient(90deg,#6E5BF2,#C04AF2,#F24A8D);box-shadow:0 0 12px rgba(139,92,246,.55);
    transition:width .35s var(--ease-out)}
  .adv-prog-fill::after{content:"";position:absolute;inset:0;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent);
    transform:translateX(-100%);animation:adv-shimmer 1.25s ease-in-out infinite}
  @keyframes adv-shimmer{to{transform:translateX(100%)}}
  /* indeterminate — a stripe that keeps travelling while Reezer designs (no frozen bar) */
  .adv-prog-track.indet .adv-prog-fill{position:absolute;width:38%;transition:none;
    animation:adv-indet 1.35s cubic-bezier(.5,0,.3,1) infinite}
  .adv-prog-track.indet{position:relative}
  @keyframes adv-indet{0%{left:-40%}100%{left:100%}}
  .adv-scope{width:min(560px,100%);border:1px solid var(--violet-line);border-radius:16px;
    background:linear-gradient(180deg,rgba(110,91,242,.10),rgba(110,91,242,.02));padding:18px;backdrop-filter:blur(8px)}
  .adv-scope-h{font:var(--w-semibold) var(--t-body)/1.3 var(--font-sans);color:var(--text-primary);margin-bottom:14px}
  .adv-scope-row{display:flex;flex-wrap:wrap;gap:9px;margin-bottom:15px}
  .adv-scope-custom{display:flex;flex-wrap:wrap;align-items:center;gap:9px;color:var(--text-tertiary);
    font:var(--w-regular) var(--t-sm)/1 var(--font-sans);border-top:1px solid var(--violet-line);padding-top:15px}
  .adv-scope-custom input[type=date]{background:var(--surface-inset);border:1px solid var(--border-strong);
    color:var(--text-primary);border-radius:9px;padding:7px 10px;font:var(--w-regular) var(--t-sm) var(--font-mono);color-scheme:dark}
  `;
  function injectCSS() {
    if (document.getElementById("advisor-css")) return;
    const s = document.createElement("style"); s.id = "advisor-css"; s.textContent = CSS;
    document.head.appendChild(s);
  }

  // --------------------------------------------------------------- constants
  const HORIZON_MIN = 30, STEP_S = 15, MAX_CONTRACTS = 1;
  const TTS_VOICE = "George";   // ElevenLabs voice name (resolved server-side); change to re-voice Reezer
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
      rationale: { type: "string", description: "Markdown, structured for easy reading. Line 1: ONE bold summary sentence (the core idea, <=16 words). Then a blank line, then 3-5 bullet points ('- '), each starting with a bold 2-3 word label + ' — ' + a short plain-language reason tied to the real numbers (e.g. '- **Exit mode** — followed your close alerts: +$210 vs +$60 rules-only'). One line per bullet, no nested bullets, no headings." },
    },
  };

  const SYSTEM =
    "You are Reezer, the user's personal options-trading assistant inside the Reezer dashboard. Always speak as " +
    "Reezer — never call yourself Claude, an AI model, or anything else. " +
    "When designing a strategy you are given the REAL recorded price path of every trade (entry to +30 min, 15s " +
    "resolution), the trader's own feed messages per day, per-parameter sensitivity sweeps run through the actual " +
    "backtest engine, and a per-weekday performance breakdown. Fractions are decimals (0.20 = 20%; null = off). " +
    "trailing_tiers is a list of [peak_gain, give_back] pairs. budget_day_pct is a % multiplier per weekday " +
    "(100=full, 0=skip). max contracts is fixed at 1, so trade_budget_usd is a max-premium-per-contract filter (a " +
    "trade whose price*100 exceeds budget*day% is SKIPPED), not leverage. " +
    "EXIT MODE IS A KEY LEVER — do NOT default to rules-only. exit_mode='rules' ignores the trader's exit alerts; " +
    "'rules_close' applies your rules but ALSO honors the trader's CLOSE alerts; 'alerts' follows the trader's " +
    "partial/close calls. The exit_mode sweep gives the real P&L of each, and every trade carries the trader's " +
    "entry note and exit alerts. Read the alert sentiment (e.g. 'locked in majority', 'choppy today') and " +
    "genuinely weigh rules_close and alerts against pure rules — many traders time their exits well. Return one " +
    "complete strategy justified by the data, and say WHY you chose that exit_mode. " +
    "You are also the user's assistant for questions: alongside any analysis you may be given the user's strategies " +
    "(with settings and P&L), recent trades, and P&L by day and strategy — use that to answer how a day went, how " +
    "a specific trade or strategy did, or what to change. Be concise, cite the real numbers, and never invent data.";

  // ------------------------------------------------------------- analysis
  async function loadPoolTrades(db, onStatus, range) {
    let q = db.from("replay_pool").select("*").order("entry_ts");
    if (range && range.from) q = q.gte("entry_ts", range.from);
    if (range && range.to) q = q.lte("entry_ts", range.to);
    const poolRes = await q;
    if (poolRes.error) throw poolRes.error;
    const pool = poolRes.data || [];
    const alRes = await db.from("alerts").select("ts,type,ticker,raw").in("type", ["ENTRY", "PARTIAL", "CLOSE"]).eq("fired", 1).order("ts");
    const allAl = alRes.error ? [] : (alRes.data || []);
    const exitAlerts = allAl.filter((a) => a.type === "PARTIAL" || a.type === "CLOSE");
    const entriesByTicker = {};
    pool.forEach((t) => { (entriesByTicker[t.ticker] = entriesByTicker[t.ticker] || []).push(t.entry_ts); });
    Object.keys(entriesByTicker).forEach((k) => entriesByTicker[k].sort());
    const windowEnd = (t) => { const arr = entriesByTicker[t.ticker] || []; for (let j = 0; j < arr.length; j++) { if (arr[j] > t.entry_ts) return arr[j]; } return null; };
    const clean = (s) => (s || "").trim().replace(/\s+/g, " ");
    const alertsFor = (t) => { const end = windowEnd(t); return exitAlerts.filter((a) => a.ticker === t.ticker && a.ts >= t.entry_ts && (end == null || a.ts < end)).map((a) => ({ ts: a.ts, type: a.type })); };
    const notesFor = (t) => {
      const e0 = dt(t.entry_ts).getTime(), end = windowEnd(t);
      const ent = allAl.filter((a) => a.type === "ENTRY" && a.ticker === t.ticker).map((a) => ({ d: Math.abs(dt(a.ts).getTime() - e0), raw: clean(a.raw) })).sort((x, y) => x.d - y.d)[0];
      const exits = exitAlerts.filter((a) => a.ticker === t.ticker && a.ts >= t.entry_ts && (end == null || a.ts < end)).map((a) => ({ type: a.type, note: clean(a.raw).slice(0, 140) }));
      return { entry: ent && ent.d < 900000 ? ent.raw.slice(0, 140) : null, exits: exits };
    };
    const out = [];
    for (let i = 0; i < pool.length; i++) {
      const t = pool[i];
      onStatus && onStatus(i + 1, pool.length);
      const e0 = dt(t.entry_ts).getTime();
      const end = new Date(e0 + HORIZON_MIN * 60000).toISOString();
      const tres = await db.from("fronttest_tape").select("ts,price,bid,ask")
        .eq("position_id", t.position_id).gte("ts", t.entry_ts).lte("ts", end).order("ts").limit(6000);
      if (tres.error) throw tres.error;
      const tape = (tres.data || []).map((r) => [r.ts, r.price, r.bid, r.ask]);
      if (!tape.length) continue;
      out.push({ t: t, tape: tape, alerts: alertsFor(t), notes: notesFor(t) });
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
      trader_entry_note: pt.notes ? pt.notes.entry : null,
      trader_exit_alerts: pt.notes ? pt.notes.exits : [],
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

  // Broad context for Q&A: strategies (+settings), recent trades, P&L rollups by strategy/day.
  async function loadContext(db) {
    const [str, pos] = await Promise.all([
      db.from("strategies").select("*").order("id"),
      db.from("positions").select("ticker,strike,side,entry_ts,exit_ts,entry_price,exit_price,realized_pnl,strategy_id,status,orig_qty").order("entry_ts", { ascending: false }).limit(400),
    ]);
    const strategies = (str.data || []).map((s) => ({
      id: s.id, name: s.name, account: s.account, trade_budget_usd: s.trade_budget_usd,
      max_contracts: s.max_contracts_per_trade, stop_loss_pct: s.stop_loss_pct, take_profit_pct: s.take_profit_pct,
      take_half_at_pct: s.take_half_at_pct, breakeven_at_pct: s.breakeven_at_pct, trailing_tiers: s.trailing_tiers,
      max_hold_minutes: s.max_hold_minutes, exit_mode: s.exit_mode, budget_day_pct: s.budget_day_pct, allowlist: s.allowlist,
    }));
    const nameById = {}; strategies.forEach((s) => { nameById[s.id] = s.name; });
    const trades = (pos.data || []).map((p) => ({
      ticker: p.ticker, side: p.side === "C" ? "call" : "put", strike: p.strike, qty: p.orig_qty,
      day: dayShort(p.entry_ts), date: new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(dt(p.entry_ts)),
      time_et: new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hour12: false }).format(dt(p.entry_ts)),
      entry: p.entry_price, exit: p.exit_price, pnl: p.realized_pnl == null ? null : Math.round(p.realized_pnl),
      strategy: nameById[p.strategy_id] || ("#" + p.strategy_id), status: p.status,
    }));
    const round = (o) => { const r = {}; Object.keys(o).forEach((k) => r[k] = Math.round(o[k])); return r; };
    const byStrat = {}, byDay = {};
    trades.forEach((t) => { const v = Number(t.pnl || 0); byStrat[t.strategy] = (byStrat[t.strategy] || 0) + v; byDay[t.date] = (byDay[t.date] || 0) + v; });
    return { strategies: strategies, pnl_by_strategy: round(byStrat), pnl_by_day: round(byDay), n_trades: trades.length, trades: trades };
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

  async function analyze(db, onP, range) {
    const P = 0.58, W = 0.30, TOTAL = 9; let done = 0;
    const at = () => P + W * (done / TOTAL);
    onP("Waking the analysis engine…", 0.04);
    await window.Replay.ensure(() => onP("Waking the analysis engine (first run ~5s)…", 0.09));
    onP("Loading your trades…", 0.15);
    const pts = await loadPoolTrades(db, (i, n) => onP("Loading trades (" + i + "/" + n + ")…", 0.15 + 0.40 * (i / n)), range);
    if (!pts.length) throw new Error(range && range.label && range.label !== "all trades" ? "No trades with recorded tape in that range (" + range.label + ")." : "No trades with recorded price tape were found.");
    onP("Reading your feed…", 0.56);
    const profiles = pts.map(profile);
    const feed = await dailyFeed(db);

    const sw = {};
    const grid = [
      ["stop_loss_pct", [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, null], "stop loss"],
      ["take_profit_pct", [null, 0.15, 0.25, 0.40, 0.60, 0.80, 1.00, 1.50], "take profit"],
      ["take_half_at_pct", [null, 0.25, 0.40, 0.50, 0.75, 1.00], "take half"],
      ["breakeven_at_pct", [null, 0.10, 0.20, 0.30, 0.50], "breakeven"],
      ["max_hold_minutes", [5, 10, 15, 20, 25, 30], "max hold time"],
    ];
    for (const [field, values, name] of grid) { onP("Testing " + name + "…", at()); sw[field] = sweepCfg(pts, field, values); done++; await sleep(0); }
    onP("Testing trailing stops…", at()); sw.trailing_tiers = sweepCfg(pts, "trailing_tiers", [[], [[0.30, 0.25]], [[0.30, 0.25], [0.50, 0.15]], [[0.50, 0.20]], [[0.40, 0.30], [0.80, 0.15]]]); done++; await sleep(0);
    onP("Testing exit modes…", at()); sw.exit_mode = sweepExitMode(pts, ["rules", "rules_close", "alerts"]); done++; await sleep(0);
    onP("Testing budget filter…", at()); sw.trade_budget_usd = budgetSweep(pts, [150, 200, 250, 300, 400, 600, 1000]); done++; await sleep(0);
    onP("Testing weekday patterns…", at());

    // weekday breakdown (1 contract, rules-only ride to 30m)
    const byday = {};
    pts.forEach((p) => {
      const v = window.Replay.run(NEUTRAL_CFG, { ticker: p.t.ticker, osi_symbol: String(p.t.ticker), side: p.t.side, strike: p.t.strike, qty: 1, fill_price: Number(p.t.entry_price), opened_at: p.t.entry_ts }, p.tape).realized;
      (byday[dayShort(p.t.entry_ts)] = byday[dayShort(p.t.entry_ts)] || []).push(v);
    });
    const weekday = {};
    Object.keys(byday).forEach((d) => { const vs = byday[d]; weekday[d] = { total_per_contract: Math.round(vs.reduce((a, v) => a + v, 0)), win_pct: Math.round(100 * vs.filter((v) => v > 0).length / vs.length), trades: vs.length }; });

    onP("Compiling the analysis…", 0.90);
    const payload = {
      note: "All sweep/weekday P&L is per 1 contract, rules-only isolation over the real tape. Horizon = entry to +30 min. Max contracts is fixed at 1.",
      scope: (range && range.label) || "all trades",
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
  async function callClaude(body, timeoutMs) {
    const SB = window.NT_SUPABASE || {};
    let jwt = SB.key;
    try { const s = await window.NT_CLIENT.auth.getSession(); if (s && s.data && s.data.session) jwt = s.data.session.access_token; } catch (e) {}
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), timeoutMs || 180000);
    let r;
    try {
      r = await fetch((SB.url || "") + "/functions/v1/advisor-chat", {
        method: "POST", headers: { Authorization: "Bearer " + jwt, apikey: SB.key, "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal,
      });
    } catch (e) {
      if (e && e.name === "AbortError") throw new Error("That took too long to respond. Tap “Analyse again” to retry.");
      throw new Error("Couldn't reach Reezer — check your connection and retry.");
    } finally { clearTimeout(to); }
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
  // Fetch premium (ElevenLabs) speech audio for `text`; returns a playable blob URL, or null to fall back.
  async function ttsFetch(text) {
    const SB = window.NT_SUPABASE || {};
    let jwt = SB.key;
    try { const s = await window.NT_CLIENT.auth.getSession(); if (s && s.data && s.data.session) jwt = s.data.session.access_token; } catch (e) {}
    try {
      const r = await fetch((SB.url || "") + "/functions/v1/tts", {
        method: "POST", headers: { Authorization: "Bearer " + jwt, apikey: SB.key, "Content-Type": "application/json" },
        body: JSON.stringify({ text: text, voice: TTS_VOICE }),
      });
      if (!r.ok) return null;
      const blob = await r.blob();
      if (!blob || !blob.size) return null;
      return URL.createObjectURL(blob);
    } catch (e) { return null; }
  }
  async function ttsReadyCheck() {
    const SB = window.NT_SUPABASE || {};
    let jwt = SB.key;
    try { const s = await window.NT_CLIENT.auth.getSession(); if (s && s.data && s.data.session) jwt = s.data.session.access_token; } catch (e) {}
    try {
      const r = await fetch((SB.url || "") + "/functions/v1/tts?action=status", { headers: { Authorization: "Bearer " + jwt, apikey: SB.key } });
      const j = await r.json(); return !!j.ready;
    } catch (e) { return false; }
  }

  // ------------------------------------------------------------- rendering
  const pctS = (v) => v == null ? "off" : Math.round(v * 100) + "%";
  // tiny, safe markdown -> html for chat replies (bold, italic, code, bullet lists)
  function mdEsc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function mdInline(s) {
    return mdEsc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*(?!\*)/g, "$1<i>$2</i>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  function mdToHtml(t) {
    const lines = String(t == null ? "" : t).split(/\n/);
    let html = "", inList = false;
    const close = () => { if (inList) { html += "</ul>"; inList = false; } };
    for (const raw of lines) {
      const line = raw.replace(/\s+$/, "");
      const m = line.match(/^\s*[-*•]\s+(.*)$/);
      if (m) { if (!inList) { html += "<ul>"; inList = true; } html += "<li>" + mdInline(m[1]) + "</li>"; continue; }
      close();
      if (!line.trim()) { html += "<div class='adv-sp'></div>"; continue; }
      html += "<div>" + mdInline(line) + "</div>";
    }
    close();
    return html;
  }
  // Pick the most natural speech voice the OS/browser offers (Siri / neural /
  // enhanced beat the robotic default). No Anthropic TTS API exists, so this is
  // the best free option; a premium provider would need a key + an edge relay.
  function bestVoice() {
    const synth = window.speechSynthesis; if (!synth) return null;
    const vs = synth.getVoices() || []; if (!vs.length) return null;
    const en = vs.filter((v) => /^en(\b|[-_])/i.test(v.lang || ""));
    const pool = en.length ? en : vs;
    const rank = (v) => { const n = (v.name || "").toLowerCase();
      if (/siri/.test(n)) return 7;
      if (/natural|neural/.test(n)) return 6;
      if (/premium|enhanced/.test(n)) return 5;
      if (/google/.test(n)) return 4;
      if (/(ava|samantha|allison|serena|zoe|jamie|nathan|evan)/.test(n)) return 3;
      if (v.localService === false) return 2;
      return 1; };
    return pool.slice().sort((a, b) => rank(b) - rank(a))[0] || null;
  }
  const THINK_LINES = ["Let me take a look at that…", "Give me a moment to think this through…",
    "One sec — let me dig into your trades…", "Okay, let me work through that…"];
  function Orb(props) {
    const sm = props.sm ? " sm" : "";
    return (<div className={"adv-orbstage" + sm + (props.busy ? " busy" : "")}>
      <div className="adv-orbglow" />
      <img className="adv-orbgif" src="/assets/orb.webp?v=102" alt="" draggable="false" />
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
    </div>);
  }

  const ASK_CHIPS = ["Why no stop?", "Which day loses money?", "What if Wednesday runs full budget?", "Analyse again"];

  function AdvisorPage() {
    const [msgs, setMsgs] = useState([]);       // {role:'me'|'ai', kind:'text'|'proposal', text?, p?, m?, n?}
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState("");
    const [prog, setProg] = useState(null);      // {label, pct} during analysis
    const [ready, setReady] = useState(null);
    const [scopeMode, setScopeMode] = useState(false);   // asking which trades to analyse, in-chat
    const [listening, setListening] = useState(false);   // voice input active
    const [speak, setSpeak] = useState(false);           // read replies aloud
    const [ttsReady, setTtsReady] = useState(false);     // ElevenLabs premium voice available
    const recRef = useRef(null);
    const audioRef = useRef(null);               // currently-playing premium audio
    const convo = useRef([]);                    // raw anthropic message history
    const analysisRef = useRef(null);            // {payload, pts}
    const endRef = useRef(null);
    useEffect(() => { injectCSS(); checkReady().then(setReady); ttsReadyCheck().then(setTtsReady);
      if (window.speechSynthesis) { try { window.speechSynthesis.getVoices(); window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices(); } catch (e) {} } }, []);
    useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, status, prog, scopeMode]);

    const started = msgs.length > 0;
    const push = (m) => setMsgs((x) => x.concat([m]));

    const scopeDays = (n) => ({ from: new Date(Date.now() - n * 86400000).toISOString(), to: null, label: "last " + n + " days" });
    const scopeMonth = () => { const d = new Date(); return { from: new Date(d.getFullYear(), d.getMonth(), 1).toISOString(), to: null, label: "this month" }; };
    const openScope = () => {
      if (busy) return;
      push({ role: "ai", kind: "text", text: "**Which trades should I analyse?** Tap a range below — or type dates like `2026-07-01 to 2026-07-15`, or `last 2 weeks`." });
      setScopeMode(true);
    };
    const chooseScope = (range) => { setScopeMode(false); design(range); };
    const stopVoice = () => {
      try { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } } catch (e) {}
      try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    };
    const browserSay = (text, rate) => {   // fallback when ElevenLabs isn't available
      if (!window.speechSynthesis) return;
      try { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text);
        const v = bestVoice(); if (v) u.voice = v; u.rate = rate || 1.0; u.pitch = 1.02;
        window.speechSynthesis.speak(u); } catch (e) {}
    };
    // Speak `raw` aloud: premium ElevenLabs voice when configured, else the browser voice.
    const voiceSay = (raw) => {
      const plain = String(raw || "").replace(/```[\s\S]*?```/g, "").replace(/[*_`#>|[\]-]/g, " ").replace(/\s+/g, " ").trim();
      if (!plain) return;
      stopVoice();
      if (ttsReady) {
        ttsFetch(plain).then((url) => {
          if (!url) { browserSay(plain, 1.0); return; }
          try { const a = new Audio(url); audioRef.current = a;
            a.onended = () => { URL.revokeObjectURL(url); if (audioRef.current === a) audioRef.current = null; };
            a.play().catch(() => browserSay(plain, 1.0));
          } catch (e) { browserSay(plain, 1.0); }
        });
      } else browserSay(plain, 1.0);
    };
    const speakText = (t) => { if (speak) voiceSay(t); };
    // natural conversation: say "let me think" up front, then go quiet while working
    const sayThinking = () => { if (speak) voiceSay(THINK_LINES[Math.floor(Math.random() * THINK_LINES.length)]); };
    const toggleMic = () => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { push({ role: "ai", kind: "text", text: "Voice input isn't supported in this browser — try Chrome or Safari." }); return; }
      if (listening) { try { recRef.current && recRef.current.stop(); } catch (e) {} setListening(false); return; }
      try {
        const r = new SR(); r.lang = "en-US"; r.interimResults = false; r.maxAlternatives = 1;
        r.onresult = (e) => { const txt = e.results[0][0].transcript; setListening(false); if (txt && txt.trim()) ask(txt.trim()); };
        r.onerror = () => setListening(false); r.onend = () => setListening(false);
        recRef.current = r; setListening(true); r.start();
      } catch (e) { setListening(false); }
    };
    const parseScope = (text) => {
      const t = String(text).trim().toLowerCase();
      if (!t) return null;
      if (/^all\b|all trades|everything/.test(t)) return { from: null, to: null, label: "all trades" };
      if (/this month/.test(t)) return scopeMonth();
      const m = t.match(/last\s+(\d+)\s*(day|week|month)/);
      if (m) return scopeDays(parseInt(m[1], 10) * (m[2][0] === "w" ? 7 : m[2][0] === "m" ? 30 : 1));
      const iso = (s) => { const p = s.replace(/\//g, "-").split("-"); let y, mo, d; if (p[0].length === 4) { y = p[0]; mo = p[1]; d = p[2]; } else { d = p[0]; mo = p[1]; y = p[2]; } if (!y || !mo || !d) return null; return new Date(+y, +mo - 1, +d).toISOString(); };
      const toks = t.match(/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/g);
      if (toks && toks.length) { const from = iso(toks[0]); const to = toks[1] ? iso(toks[1]) : null; return { from: from, to: to, label: toks.join(" → ") + (to ? "" : " → now") }; }
      return null;
    };

    async function ensureAnalysis(range, force) {
      if (analysisRef.current && !force) return analysisRef.current;
      const a = await analyze(window.NT_CLIENT, (label, pct) => setProg({ label: label, pct: pct }), range);
      analysisRef.current = a; return a;
    }

    async function design(range) {
      if (busy) return; setBusy(true); setProg({ label: "Starting…", pct: 0.02 });
      const scopeTxt = range && range.label && range.label !== "all trades" ? " · " + range.label : "";
      push({ role: "me", kind: "text", text: "Analyse my trades" + scopeTxt });
      sayThinking();
      try {
        const a = await ensureAnalysis(range, true);
        const t0 = Date.now();
        const tick = setInterval(() => setProg({ label: "Reezer is designing your strategy…", pct: 0.95, indet: true, secs: Math.round((Date.now() - t0) / 1000) }), 1000);
        setProg({ label: "Reezer is designing your strategy…", pct: 0.95, indet: true, secs: 0 });
        const messages = [{ role: "user", content: [
          { type: "text", text: "Full analysis of my recorded trades (JSON):\n" + JSON.stringify(a.payload), cache_control: { type: "ephemeral" } },
          { type: "text", text: "Design one complete strategy now." },
        ] }];
        let res;
        try { res = await callClaude({ system: SYSTEM, messages: messages, max_tokens: 8000, thinking: { type: "adaptive" }, output_config: { effort: "medium", format: { type: "json_schema", schema: PROPOSAL_SCHEMA } } }); }
        finally { clearInterval(tick); }
        const prop = JSON.parse(res.text);
        const m = validate(a.pts, prop);
        const ctx = await loadContext(window.NT_CLIENT);
        convo.current = [
          { role: "user", content: [
            { type: "text", text: "My Reezer trading data (strategies + settings, P&L by strategy and day, recent trades):\n" + JSON.stringify(ctx) + "\n\nAnd the deep sweep analysis used to design a strategy:\n" + JSON.stringify(a.payload), cache_control: { type: "ephemeral" } },
            { type: "text", text: "You designed a strategy from the sweep." },
          ] },
          { role: "assistant", content: res.text + "\n\n[Validated on the real tape: total $" + m.total + ", win " + m.win_pct + "%, profit factor " + (m.profit_factor == null ? "inf" : m.profit_factor) + ", avg $" + m.avg + "/trade, max drawdown $" + m.max_drawdown + ".]" },
        ];
        push({ role: "ai", kind: "proposal", p: prop, m: m, n: a.pts.length });
        push({ role: "ai", kind: "text", text: "**Why this strategy**\n\n" + prop.rationale });
        speakText("Here's the strategy I designed. " + prop.rationale);
      } catch (e) { push({ role: "ai", kind: "text", text: "", err: String(e.message || e) }); }
      setBusy(false); setStatus(""); setProg(null);
    }

    async function ask(q) {
      if (busy || !q.trim()) return;
      if (scopeMode) {
        setInput("");
        const r = parseScope(q);
        if (r) return chooseScope(r);
        push({ role: "me", kind: "text", text: q });
        push({ role: "ai", kind: "text", text: "I couldn't read that as a date range. Try `2026-07-01 to 2026-07-15`, `last 2 weeks`, or tap a range above." });
        return;
      }
      if (/^\s*(analy[sz]e|design)\b/i.test(q) && /trade|strateg/i.test(q) && !/why|explain|what if/i.test(q)) { setInput(""); return openScope(); }
      setBusy(true); setInput(""); push({ role: "me", kind: "text", text: q });
      sayThinking();
      try {
        if (!convo.current.length) {              // first question -> seed with the user's trading data (fast, no full sweep)
          setStatus("Loading your trades & strategies…");
          const ctx = await loadContext(window.NT_CLIENT);
          convo.current = [
            { role: "user", content: [{ type: "text", text: "My Reezer trading data (strategies + settings, P&L by strategy and day, recent trades):\n" + JSON.stringify(ctx), cache_control: { type: "ephemeral" } }, { type: "text", text: "I'll ask questions about my trading." }] },
            { role: "assistant", content: "Loaded — I can see your strategies, trades, and daily P&L. Ask me anything." },
          ];
        }
        convo.current.push({ role: "user", content: q });
        setStatus("");
        const t0 = Date.now();
        const tick = setInterval(() => setProg({ label: "Reezer is thinking…", pct: 0.95, indet: true, secs: Math.round((Date.now() - t0) / 1000) }), 1000);
        setProg({ label: "Reezer is thinking…", pct: 0.95, indet: true, secs: 0 });
        let res;
        try { res = await callClaude({ system: SYSTEM, messages: convo.current, max_tokens: 4000, thinking: { type: "adaptive" }, output_config: { effort: "medium" } }); }
        finally { clearInterval(tick); }
        convo.current.push({ role: "assistant", content: res.text });
        push({ role: "ai", kind: "text", text: res.text });
        speakText(res.text);
      } catch (e) { push({ role: "ai", kind: "text", text: "", err: String(e.message || e) }); }
      setBusy(false); setStatus(""); setProg(null);
    }

    const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } };

    return (<div className="adv-wrap">
      <div className="adv-bg" />
      <div className="adv-scroll"><div className="adv-inner">
        {!started && (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "72vh", justifyContent: "center" }}>
          <Orb busy={busy} />
          <h1 className="adv-hero-h">Let's find your edge.</h1>
          <p className="adv-hero-p">I'll study your recorded trades — the full price path to +30 min and your own feed — then design a complete strategy from it, and you can ask me anything about it.</p>
          {!busy && (<button className="adv-chip primary" style={{ marginTop: 6 }} onClick={openScope}>Analyse my trades</button>)}
        </div>)}

        {started && (<div style={{ display: "flex", justifyContent: "center", margin: "2px 0 18px" }}><Orb sm busy={busy} /></div>)}

        <div className="adv-convo">
          {msgs.map((m, i) => (<div key={i} className={"adv-msg " + (m.role === "me" ? "me" : "ai")}>
            {m.kind === "proposal"
              ? <ProposalCard p={m.p} m={m.m} n={m.n} />
              : m.err
                ? <div className="adv-bubble"><span className="adv-err">⚠ {m.err}</span></div>
                : m.role === "ai"
                  ? <div className="adv-answer" dangerouslySetInnerHTML={{ __html: mdToHtml(m.text) }} />
                  : <div className="adv-bubble">{m.text}</div>}
          </div>))}
          {busy && (<div className="adv-msg ai">{prog
            ? <div className="adv-progress">
                <div className="adv-prog-label"><span className="adv-dot" />{prog.label}<span className="adv-prog-pct">{prog.indet ? (prog.secs ? prog.secs + "s" : "") : Math.round(prog.pct * 100) + "%"}</span></div>
                <div className={"adv-prog-track" + (prog.indet ? " indet" : "")}><div className="adv-prog-fill" style={prog.indet ? undefined : { width: Math.max(3, Math.round(prog.pct * 100)) + "%" }} /></div>
              </div>
            : <div className="adv-think"><span className="adv-dot" />{status || "working…"}</div>}</div>)}
          <div ref={endRef} />
        </div>

      </div></div>

      <div className="adv-composer"><div className="adv-composer-in">
        {ready === false && (<p className="adv-note">Add your ANTHROPIC_API_KEY in Supabase → Edge Functions → Secrets to enable the advisor.</p>)}
        {started && (<div className="adv-chips" style={{ marginBottom: 10 }}>
          {scopeMode
            ? [["All trades", { from: null, to: null, label: "all trades" }], ["Last 7 days", scopeDays(7)], ["Last 30 days", scopeDays(30)], ["This month", scopeMonth()]].map((e) => (
                <button key={e[0]} className={"adv-chip" + (e[0] === "All trades" ? " primary" : "")} disabled={busy} onClick={() => chooseScope(e[1])}>{e[0]}</button>))
            : ASK_CHIPS.map((c) => (<button key={c} className="adv-chip" disabled={busy} onClick={() => c === "Analyse again" ? openScope() : ask(c)}>{c}</button>))}
        </div>)}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button className={"adv-voice" + (speak ? " on" : "")} onClick={() => { const n = !speak; setSpeak(n); if (!n) stopVoice(); }} title="Read replies aloud">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /></svg>
            {speak ? (ttsReady ? "Voice on" : "Read aloud on") : "Read aloud"}
          </button>
        </div>
        <div className="adv-box">
          <textarea rows={1} value={input} placeholder={scopeMode ? "Type a date range… e.g. 2026-07-01 to 2026-07-15" : (listening ? "Listening…" : "Ask about your trades…")}
            onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} disabled={busy} />
          <button className="adv-mic" data-on={listening ? "" : undefined} disabled={busy} onClick={toggleMic} title="Speak">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
          </button>
          <button className="adv-send" disabled={busy || !input.trim()} onClick={() => ask(input)} title="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
          </button>
        </div>
      </div></div>
    </div>);
  }

  Object.assign(window, { AdvisorPage });
})();

/* In-browser replay — runs the REAL Python trading engine over recorded tapes via
   Pyodide. No server, no duplicated logic: it loads the exact engine modules the bot
   uses (bundled in pyengine.json) and calls src.replay_engine.replay_trade.

   window.Replay.ensure()                          -> Promise (loads Pyodide + engine, once)
   window.Replay.run(cfgKwargs, entry, tape)       -> {events, realized, peak_gain_pct, ...}
   window.Replay.selfTest()                         -> Promise<{ok, got, want}>  (sanity)

   cfgKwargs: object keyed by Config field names (stop_loss_pct, take_half_at_pct, ...)
   entry:     {ticker, osi_symbol, side:"C"|"P", strike, qty, fill_price}
   tape:      [[ts, last, bid, ask], ...]
*/
(function () {
  const PYODIDE_VER = "0.26.4";
  const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VER}/full/`;
  let _pyodide = null;
  let _ready = null;       // the in-flight / resolved ensure() promise
  let _runFn = null;       // the Python entry callable

  function _loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = () => rej(new Error("failed to load " + src));
      document.head.appendChild(s);
    });
  }

  async function ensure(onStatus) {
    if (_ready) return _ready;
    _ready = (async () => {
      const say = (m) => { try { onStatus && onStatus(m); } catch (_) {} };
      say("loading Pyodide…");
      if (!window.loadPyodide) await _loadScript(PYODIDE_URL + "pyodide.js");
      _pyodide = await window.loadPyodide({ indexURL: PYODIDE_URL });

      say("loading engine…");
      // absolute path: the dashboard page is served from "/", not this dir.
      // cache-bust on the bundle so an engine update is picked up.
      const bundle = await (await fetch("/ui_kits/dashboard/pyengine.json?v=" + Date.now())).json();
      for (const [path, src] of Object.entries(bundle.files)) {
        const dir = "/pyengine/" + path.substring(0, path.lastIndexOf("/"));
        _pyodide.FS.mkdirTree(dir);
        _pyodide.FS.writeFile("/pyengine/" + path, src);
      }
      _runFn = await _pyodide.runPythonAsync(`
import sys, json
if "/pyengine" not in sys.path:
    sys.path.insert(0, "/pyengine")
from src.config import Config
from src.models import Right
from src.remote_config import row_to_kwargs
from src.replay_engine import replay_trade

def _entry(e):
    e["right"] = Right.CALL if (e.get("side") or "C").upper().startswith("C") else Right.PUT
    return e

def _alerts(j):
    return json.loads(j) if (j and j != "null") else None

def _run(cfg_json, entry_json, tape_json, alerts_json):   # cfg = explicit Config kwargs (self-test)
    cfg = Config(**json.loads(cfg_json))
    tape = [tuple(t) for t in json.loads(tape_json)]
    return json.dumps(replay_trade(cfg, _entry(json.loads(entry_json)), tape, alerts=_alerts(alerts_json)))

def _run_row(row_json, entry_json, tape_json, alerts_json):   # row = a strategy_params row
    cfg = Config(**row_to_kwargs(json.loads(row_json)))
    tape = [tuple(t) for t in json.loads(tape_json)]
    return json.dumps(replay_trade(cfg, _entry(json.loads(entry_json)), tape, alerts=_alerts(alerts_json)))

{"cfg": _run, "row": _run_row}
`);
      say("ready");
      return _pyodide;
    })();
    return _ready;
  }

  function _call(which, cfgOrRow, entry, tape, alerts) {
    if (!_runFn) throw new Error("Replay.ensure() must resolve first");
    const fn = _runFn.get(which);
    const out = fn(JSON.stringify(cfgOrRow || {}),
                   JSON.stringify(entry || {}),
                   JSON.stringify(tape || []),
                   JSON.stringify(alerts || null));
    fn.destroy();
    return JSON.parse(out);
  }

  // explicit Config kwargs (used by the self-test)
  function run(cfgKwargs, entry, tape) { return _call("cfg", cfgKwargs, entry, tape, null); }

  // a real strategy_params row -> the bot's row_to_kwargs -> Config; alerts = the trade's
  // recorded PARTIAL/CLOSE alerts (applied only if the strategy doesn't ignore exit alerts)
  function runStrategy(row, entry, tape, alerts) { return _call("row", row, entry, tape, alerts); }

  async function selfTest(onStatus) {
    await ensure(onStatus);
    // the deterministic harness case: +50% take-half then stop-out through breakeven -> +$90
    const cfg = { stop_loss_pct: 0.20, breakeven_at_pct: 0.20, take_half_at_pct: 0.50,
                  trailing_tiers: [], take_profit_pct: null, max_hold_minutes: null,
                  breakeven_after_partial: true };
    const entry = { ticker: "QQQ", osi_symbol: "QQQ   260623C00714000", side: "C",
                    strike: 714.0, qty: 2, fill_price: 2.0 };
    const tape = [["t1", 2.0, 2.0, 2.0], ["t2", 3.0, 3.0, 3.0], ["t3", 1.9, 1.9, 1.9]];
    const r = run(cfg, entry, tape);
    // same case via the REAL strategy path: a strategy_params-shaped row -> row_to_kwargs
    const row = { trade_budget_usd: 400, max_contracts_per_trade: 10, allowlist: "QQQ",
                  stop_loss_pct: 0.20, breakeven_at_pct: 0.20, take_half_at_pct: 0.50,
                  trailing_tiers: null, breakeven_after_partial: true };
    const r2 = runStrategy(row, entry, tape);
    const ok = r.realized === 90.0 && r2.realized === 90.0;
    return { ok, got: r.realized, gotRow: r2.realized, want: 90.0, full: r };
  }

  // Orchestrate a full strategy replay: fetch its real trades + tapes, run each
  // through the in-browser engine, write ONE revertible snapshot to replay_results.
  // Never touches positions/trade_events/price_samples. Paper/draft only.
  //   db = window.NT_CLIENT (supabase-js, carries the user's session)
  async function replayStrategy(strat, db, onStatus, overrides) {
    const say = (m) => { try { onStatus && onStatus(m); } catch (_) {} };
    if (!db) throw new Error("no Supabase client");

    // 1) the EXACT strategies row the bot reads (so config maps identically)
    const sres = await db.from("strategies").select("*").eq("id", strat.id).single();
    if (sres.error) throw sres.error;
    const base = sres.data;
    // 2) hard guard: paper/draft only — a live strategy is refused before any work
    if (base.account !== "fronttest" && base.account !== "draft") {
      throw new Error("Replay is paper/draft only (this is “" + base.account + "”).");
    }
    // what-if overrides are layered on top of the strategy's real settings and NEVER saved back.
    // No overrides -> baseline, which reproduces the recorded card exactly.
    const ov = overrides || {};
    const hasOv = Object.keys(ov).length > 0;
    const row = Object.assign({}, base, ov);

    say("loading engine…");
    await ensure(say);

    say("loading this strategy's recorded trades…");
    // BASELINE = this strategy's OWN recorded trades (all of them), so opening Replay with
    // nothing changed reproduces the strategy card exactly, trade for trade. What-if overrides
    // re-run each trade on its own recorded tape — the recorded trades are never touched.
    const ownRes = await db.from("positions")
      .select("id,ticker,symbol,strike,side,entry_ts,entry_price,orig_qty,realized_pnl,exit_price,pinned")
      .eq("strategy_id", strat.id).eq("status", "closed").order("entry_ts");
    if (ownRes.error) throw ownRes.error;
    const own = ownRes.data || [];

    // the trader's recorded exit alerts (partials/closes), bounded to each trade's own session
    const alRes = await db.from("alerts").select("ts,type,ticker").in("type", ["PARTIAL", "CLOSE"]).eq("fired", 1).order("ts");
    const exitAlerts = alRes.error ? [] : (alRes.data || []);
    const entriesByTicker = {};
    own.forEach((t) => { (entriesByTicker[t.ticker] = entriesByTicker[t.ticker] || []).push(t.entry_ts); });
    Object.keys(entriesByTicker).forEach((k) => entriesByTicker[k].sort());
    const alertsFor = (t) => {
      const arr = entriesByTicker[t.ticker] || [];
      let end = null;
      for (let j = 0; j < arr.length; j++) { if (arr[j] > t.entry_ts) { end = arr[j]; break; } }
      return exitAlerts.filter((a) => a.ticker === t.ticker && a.ts >= t.entry_ts && (end == null || a.ts < end))
                       .map((a) => ({ ts: a.ts, type: a.type }));
    };

    // sizing — only recomputed when a what-if changes the budget / weekday % / contract cap
    const dayKey = (iso) => { try { return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short" }).format(new Date(iso)).toLowerCase().slice(0, 3); } catch (e) { return ""; } };
    const sizeFor = (entryPx, entryTs) => {
      const dp = row.budget_day_pct || {};
      const pct = dp[dayKey(entryTs)] != null ? Number(dp[dayKey(entryTs)]) : 100;
      const eff = Number(row.trade_budget_usd || 0) * (pct / 100);
      const costPer = entryPx * 100;
      let q = costPer > 0 ? Math.floor(eff / costPer) : 0;
      const cap = Number(row.max_contracts_per_trade || 0);
      if (cap > 0) q = Math.min(q, cap);
      return q;
    };
    const resize = hasOv && (("trade_budget_usd" in ov) || ("max_contracts_per_trade" in ov) || ("budget_day_pct" in ov));

    const trades = [];
    let skipped = 0, unaffordable = 0;
    for (let i = 0; i < own.length; i++) {
      const t = own[i];
      const recorded = Number(t.realized_pnl || 0);
      // BASELINE (no what-if): return the recorded outcome verbatim -> Replay == the card.
      if (!hasOv) {
        trades.push({ position_id: t.id, ticker: t.ticker, side: t.side, strike: t.strike,
                      entry_price: Number(t.entry_price), orig_qty: Number(t.orig_qty || 0), entry_ts: t.entry_ts,
                      realized: recorded, exit_price: t.exit_price != null ? Number(t.exit_price) : null,
                      peak_gain_pct: null, orig_realized: recorded, events: [] });
        continue;
      }
      say("replaying " + (i + 1) + "/" + own.length + " (" + (t.ticker || "?") + ")…");
      const qty = resize ? sizeFor(Number(t.entry_price), t.entry_ts) : Number(t.orig_qty || 0);
      const sessEnd = new Date(new Date(t.entry_ts).getTime() + 8 * 3600 * 1000).toISOString();
      const tres = await db.from("fronttest_tape").select("ts,price,bid,ask")
        .eq("position_id", t.id).gte("ts", t.entry_ts).lt("ts", sessEnd).order("ts").limit(6000);
      if (tres.error) throw tres.error;
      const tape = (tres.data || []).map((r) => [r.ts, r.price, r.bid, r.ask]);
      if (qty < 1 || !tape.length) {
        if (qty < 1) unaffordable++; else skipped++;
        trades.push({ position_id: t.id, ticker: t.ticker, side: t.side, strike: t.strike,
                      entry_price: Number(t.entry_price), orig_qty: qty, entry_ts: t.entry_ts,
                      realized: qty < 1 ? 0 : recorded, exit_price: t.exit_price != null ? Number(t.exit_price) : null,
                      peak_gain_pct: null, orig_realized: recorded, events: [] });
        continue;
      }
      const entry = { ticker: t.ticker, osi_symbol: String(t.symbol || t.ticker || ""), side: t.side, strike: t.strike,
                      qty: qty, fill_price: Number(t.entry_price), opened_at: t.entry_ts };
      const r = runStrategy(row, entry, tape, alertsFor(t));
      const pinned = !!t.pinned;   // manual override -> keep its recorded result
      trades.push({ position_id: t.id, ticker: t.ticker, side: t.side, strike: t.strike,
                    entry_price: Number(t.entry_price), orig_qty: qty, entry_ts: t.entry_ts,
                    realized: pinned ? recorded : r.realized,
                    exit_price: pinned && t.exit_price != null ? Number(t.exit_price) : r.exit_price,
                    peak_gain_pct: r.peak_gain_pct, orig_realized: recorded, events: r.events });
    }

    const sum = (f) => Math.round(trades.reduce((a, t) => a + f(t), 0) * 100) / 100;
    const summary = { trades: trades.length, matched: own.length, skipped: skipped, unaffordable: unaffordable,
                      realized: sum((t) => t.realized), orig_realized: sum((t) => t.orig_realized) };
    say("done");
    return { strategy_id: strat.id, replayed_at: null, summary: summary, trades: trades };
  }

  window.Replay = { ensure, run, runStrategy, replayStrategy, selfTest };
})();

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
  async function replayStrategy(strat, db, onStatus) {
    const say = (m) => { try { onStatus && onStatus(m); } catch (_) {} };
    if (!db) throw new Error("no Supabase client");

    // 1) the EXACT strategies row the bot reads (so config maps identically)
    const sres = await db.from("strategies").select("*").eq("id", strat.id).single();
    if (sres.error) throw sres.error;
    const row = sres.data;
    // 2) hard guard: paper/draft only — a live strategy is refused before any work
    if (row.account !== "fronttest" && row.account !== "draft") {
      throw new Error("Replay is paper/draft only (this is “" + row.account + "”).");
    }

    say("loading engine…");
    await ensure(say);

    // what this strategy would ACT ON: its allowlist (tickers) + its sources (alert channels).
    // Replay always works off the shared pool of recorded alert-trades — NOT just this
    // strategy's own positions — so a brand-new strategy still has trades to replay.
    const allow = (row.allowlist || "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
    const srcRes = await db.from("strategy_sources").select("source_id").eq("strategy_id", strat.id);
    if (srcRes.error) throw srcRes.error;
    const listen = (srcRes.data || []).map((r) => r.source_id);   // [] = listens to every source

    say("loading available trades…");
    const poolRes = await db.from("replay_pool").select("*").order("entry_ts");
    if (poolRes.error) throw poolRes.error;
    const pool = (poolRes.data || []).filter((t) => {
      const okTicker = !allow.length || allow.indexOf(String(t.ticker || "").toUpperCase()) >= 0;
      const okSource = !listen.length || t.source_id == null || listen.indexOf(t.source_id) >= 0;
      return okTicker && okSource;
    });

    // For each alert this strategy actually TRADED, use its OWN position (its own tape,
    // entry price and recorded P&L) so "recorded" is its own result — never another
    // strategy's. Fall back to the pool representative only for alerts it never traded.
    const ownRes = await db.from("positions")
      .select("id,ticker,strike,side,entry_ts,entry_price,realized_pnl").eq("strategy_id", strat.id);
    if (ownRes.error) throw ownRes.error;
    const keyOf = (x) => x.ticker + "|" + Number(x.strike) + "|" + x.side + "|" + String(x.entry_ts).slice(0, 16);
    const ownByKey = {};
    (ownRes.data || []).forEach((p) => { ownByKey[keyOf(p)] = p; });
    // the recorded P&L to compare against = this strategy's OWN result for the alert (if it
    // traded it), else the representative's. The TAPE always comes from the clean pool rep
    // (the strategy's own position may have no tape recorded).
    const recordedFor = (t) => {
      const own = ownByKey[keyOf(t)];
      return own ? Number(own.realized_pnl || 0) : Number(t.recorded_pnl || 0);
    };

    // size each matched trade to THIS strategy's budget (+ weekday %, capped), like the live entry rule
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

    // the trader's recorded exit alerts (partials/closes). A strategy that follows alerts
    // (ignore_exit_alerts off) replays them; a rules-only strategy ignores them (engine guard).
    const alRes = await db.from("alerts").select("ts,type,ticker").in("type", ["PARTIAL", "CLOSE"]).eq("fired", 1).order("ts");
    const exitAlerts = alRes.error ? [] : (alRes.data || []);
    const entriesByTicker = {};
    (poolRes.data || []).forEach((t) => { (entriesByTicker[t.ticker] = entriesByTicker[t.ticker] || []).push(t.entry_ts); });
    Object.keys(entriesByTicker).forEach((k) => entriesByTicker[k].sort());
    const alertsFor = (t) => {
      const arr = entriesByTicker[t.ticker] || [];
      let end = null;
      for (let j = 0; j < arr.length; j++) { if (arr[j] > t.entry_ts) { end = arr[j]; break; } }
      return exitAlerts.filter((a) => a.ticker === t.ticker && a.ts >= t.entry_ts && (end == null || a.ts < end))
                       .map((a) => ({ ts: a.ts, type: a.type }));
    };

    const trades = [];
    let skipped = 0, unaffordable = 0;
    for (let i = 0; i < pool.length; i++) {
      const t = pool[i];
      say("replaying " + (i + 1) + "/" + pool.length + " (" + (t.ticker || "?") + ")…");
      const qty = sizeFor(t.entry_price, t.entry_ts);
      if (qty < 1) { unaffordable++; continue; }   // budget can't afford one contract -> not taken
      // clip the tape to THIS trade's own session — guards against old ID-clobbered
      // ticks from other days being stapled onto a reused position_id
      const sessEnd = new Date(new Date(t.entry_ts).getTime() + 8 * 3600 * 1000).toISOString();
      const tres = await db.from("fronttest_tape").select("ts,price,bid,ask")
        .eq("position_id", t.position_id).gte("ts", t.entry_ts).lt("ts", sessEnd).order("ts").limit(6000);
      if (tres.error) throw tres.error;
      const tape = (tres.data || []).map((r) => [r.ts, r.price, r.bid, r.ask]);
      if (!tape.length) { skipped++; continue; }
      const entry = { ticker: t.ticker, osi_symbol: String(t.ticker || ""), side: t.side, strike: t.strike,
                      qty: qty, fill_price: t.entry_price, opened_at: t.entry_ts };
      const r = runStrategy(row, entry, tape, alertsFor(t));
      trades.push({ position_id: t.position_id, ticker: t.ticker, side: t.side, strike: t.strike,
                    entry_price: Number(t.entry_price), orig_qty: qty, entry_ts: t.entry_ts,
                    realized: r.realized, exit_price: r.exit_price, peak_gain_pct: r.peak_gain_pct,
                    orig_realized: recordedFor(t), events: r.events });
    }

    const sum = (f) => Math.round(trades.reduce((a, t) => a + f(t), 0) * 100) / 100;
    const summary = { trades: trades.length, matched: pool.length, skipped: skipped, unaffordable: unaffordable,
                      realized: sum((t) => t.realized), orig_realized: sum((t) => t.orig_realized) };
    const snap = { strategy_id: strat.id, replayed_at: new Date().toISOString(),
                   settings_hash: JSON.stringify([row.stop_loss_pct, row.breakeven_at_pct, row.take_profit_pct,
                     row.take_half_at_pct, row.trailing_tiers, row.max_hold_minutes, row.breakeven_after_partial,
                     row.ignore_exit_alerts, row.budget_day_pct]),
                   summary: summary, trades: trades };

    say("saving…");
    const wres = await db.from("replay_results").upsert(snap, { onConflict: "strategy_id" });
    if (wres.error) throw wres.error;
    say("done");
    return snap;   // {strategy_id, replayed_at, settings_hash, summary, trades}
  }

  window.Replay = { ensure, run, runStrategy, replayStrategy, selfTest };
})();

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

def _run(cfg_json, entry_json, tape_json):       # cfg = explicit Config kwargs (self-test)
    cfg = Config(**json.loads(cfg_json))
    tape = [tuple(t) for t in json.loads(tape_json)]
    return json.dumps(replay_trade(cfg, _entry(json.loads(entry_json)), tape))

def _run_row(row_json, entry_json, tape_json):   # row = a strategy_params row (real strategy)
    cfg = Config(**row_to_kwargs(json.loads(row_json)))
    tape = [tuple(t) for t in json.loads(tape_json)]
    return json.dumps(replay_trade(cfg, _entry(json.loads(entry_json)), tape))

{"cfg": _run, "row": _run_row}
`);
      say("ready");
      return _pyodide;
    })();
    return _ready;
  }

  function _call(which, cfgOrRow, entry, tape) {
    if (!_runFn) throw new Error("Replay.ensure() must resolve first");
    const fn = _runFn.get(which);
    const out = fn(JSON.stringify(cfgOrRow || {}),
                   JSON.stringify(entry || {}),
                   JSON.stringify(tape || []));
    fn.destroy();
    return JSON.parse(out);
  }

  // explicit Config kwargs (used by the self-test)
  function run(cfgKwargs, entry, tape) { return _call("cfg", cfgKwargs, entry, tape); }

  // a real strategy_params row -> the bot's row_to_kwargs -> Config
  function runStrategy(row, entry, tape) { return _call("row", row, entry, tape); }

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

    say("loading trades…");
    const pres = await db.from("positions").select("*").eq("strategy_id", strat.id).order("entry_ts");
    if (pres.error) throw pres.error;
    const positions = pres.data || [];

    const trades = [];
    let skipped = 0;
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      say("replaying " + (i + 1) + "/" + positions.length + " (" + (p.ticker || "?") + ")…");
      const tres = await db.from("fronttest_tape").select("ts,price,bid,ask")
        .eq("position_id", p.id).order("ts").limit(6000);
      if (tres.error) throw tres.error;
      const tape = (tres.data || []).map((r) => [r.ts, r.price, r.bid, r.ask]);
      if (!tape.length) { skipped++; continue; }   // no tape -> can't replay this one
      const entry = { ticker: p.ticker, osi_symbol: p.symbol, side: p.side, strike: p.strike,
                      qty: (p.orig_qty || p.qty || 1), fill_price: p.entry_price, opened_at: p.entry_ts };
      const r = runStrategy(row, entry, tape);
      trades.push({ position_id: p.id, ticker: p.ticker, side: p.side, strike: p.strike,
                    entry_price: Number(p.entry_price), orig_qty: entry.qty, entry_ts: p.entry_ts,
                    realized: r.realized, exit_price: r.exit_price, peak_gain_pct: r.peak_gain_pct,
                    orig_realized: Number(p.realized_pnl || 0), events: r.events });
    }

    const sum = (f) => Math.round(trades.reduce((a, t) => a + f(t), 0) * 100) / 100;
    const summary = { trades: trades.length, skipped: skipped,
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

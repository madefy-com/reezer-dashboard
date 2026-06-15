/* Reezer dashboard — LIVE data loader.
   Reads the Reezer Supabase tables (positions, alerts, runs) and rebuilds
   window.NT_DATA in the same shape the design components expect. Falls back to
   the bundled demo data when the DB is empty or unreachable, so the dashboard
   always renders. Sections we don't yet record (backtest, strategies) keep the
   demo values. */
(function () {
  function headers() {
    var c = window.NT_SUPABASE || {};
    return { apikey: c.key, Authorization: "Bearer " + c.key };
  }
  function api(path) {
    var c = window.NT_SUPABASE;
    return fetch(c.url + "/rest/v1/" + path, { headers: headers() }).then(function (r) {
      if (!r.ok) throw new Error(path + " -> " + r.status);
      return r.json();
    });
  }
  var tOf = function (iso) { if (!iso) return "—"; var m = String(iso).split("T")[1]; return m ? m.slice(0, 8) : "—"; };
  var strikeOf = function (n) { return String(Number(n)); };
  function holdOf(p) {
    if (!p.entry_ts || !p.exit_ts) return "open";
    var s = Math.max(0, Math.round((new Date(p.exit_ts) - new Date(p.entry_ts)) / 1000));
    return Math.floor(s / 60) + "m " + (s % 60) + "s";
  }
  function resultOf(p) {
    if (p.status !== "closed") return "OPEN";
    var x = Number(p.realized_pnl || 0);
    return x > 0 ? "WIN" : x < 0 ? "LOSS" : "BE";
  }
  var money = function (v) { return (v >= 0 ? "+" : "−") + "$" + Math.abs(Math.round(v)).toLocaleString(); };
  var pctS = function (v) { return (v >= 0 ? "+" : "−") + Math.abs(v) + "%"; };

  function buildTrades(positions, stratName) {
    return positions.map(function (p) {
      var entry = Number(p.entry_price), exit = p.exit_price == null ? null : Number(p.exit_price);
      var pct = entry ? Math.round((((exit == null ? entry : exit) / entry - 1) * 100) * 10) / 10 : 0;
      var label = strikeOf(p.strike) + (p.side || "");
      return {
        t: tOf(p.entry_ts), close: p.exit_ts ? tOf(p.exit_ts) : "—",
        tk: p.ticker, strike: label, side: p.side, qty: p.qty,
        entry: entry, exit: exit, pnl: Math.round(Number(p.realized_pnl || 0)), pct: pct,
        result: resultOf(p), status: p.status === "closed" ? "done" : "live",
        strat: stratName, hold: holdOf(p), stopped: false,
        trigger: { type: "ENTRY", user: "alerts", msg: p.ticker + " " + label },
      };
    });
  }
  function buildKpis(trades) {
    var closed = trades.filter(function (t) { return t.result !== "OPEN"; });
    var net = trades.reduce(function (a, t) { return a + (t.pnl || 0); }, 0);
    var wins = closed.filter(function (t) { return t.result === "WIN"; }).length;
    var losses = closed.filter(function (t) { return t.result === "LOSS"; }).length;
    var be = closed.filter(function (t) { return t.result === "BE"; }).length;
    var open = trades.filter(function (t) { return t.result === "OPEN"; });
    var best = closed.slice().sort(function (a, b) { return b.pct - a.pct; })[0];
    var worst = closed.slice().sort(function (a, b) { return a.pct - b.pct; })[0];
    var avg = closed.length ? Math.round((closed.reduce(function (a, t) { return a + t.pct; }, 0) / closed.length) * 10) / 10 : 0;
    return {
      netPnl: { value: money(net), delta: "", tone: net >= 0 ? "profit" : "loss" },
      bestTrade: best ? { value: pctS(best.pct), sub: best.tk + " " + best.strike + " ×" + best.qty, tone: "profit" } : { value: "—", sub: "no trades" },
      worstTrade: worst ? { value: pctS(worst.pct), sub: worst.tk + " " + worst.strike + " ×" + worst.qty, tone: "loss" } : { value: "—", sub: "no trades" },
      avgReturn: { value: pctS(avg), sub: "per closed trade" },
      winRate: { value: (closed.length ? Math.round(wins / closed.length * 100) : 0) + "%", sub: wins + "W / " + losses + "L" + (be ? " · " + be + " BE" : "") },
      openPos: { value: String(open.length), sub: open.length ? "live" : "none", tone: "profit" },
    };
  }
  function buildDiscord(alerts) {
    return alerts.map(function (a) {
      return { t: tOf(a.ts), type: a.type, user: "alerts", ch: "alerts",
        symbol: a.ticker || "—", msg: a.raw, fired: !!a.fired,
        reason: a.reason || "", latency: "", action: "" };
    });
  }

  window.NT_LIVE = function () {
    if (!window.NT_SUPABASE || !window.NT_SUPABASE.url) return Promise.resolve(null);
    var base = window.NT_DATA || {};
    var stratName = (base.strategyParams || {}).name || "Strategy";
    return Promise.all([
      api("positions?order=entry_ts.desc&limit=300"),
      api("alerts?order=ts.desc&limit=300"),
      api("runs?order=id.desc&limit=1"),
    ]).then(function (res) {
      var positions = res[0] || [], alerts = res[1] || [], runs = res[2] || [];
      if (!positions.length && !alerts.length) return null;  // empty DB -> keep demo
      var trades = buildTrades(positions, stratName);
      var run = runs[0] || {};
      var fired = alerts.filter(function (a) { return a.fired; }).length;
      return Object.assign({}, base, {
        trades: trades,
        kpis: buildKpis(trades),
        discord: buildDiscord(alerts),
        summary14d: { fired: fired, filtered: alerts.length - fired },
        session: Object.assign({}, base.session || {}, {
          mode: run.mode === "live" ? "LIVE" : "DRY-RUN",
          budget: run.budget != null ? "$" + Math.round(run.budget) : (base.session || {}).budget,
        }),
      });
    }).catch(function (e) { console.warn("NT_LIVE failed:", e); return null; });
  };
})();

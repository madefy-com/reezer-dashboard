/* Reezer dashboard — LIVE data loader.
   Reads the Reezer Supabase tables (positions, alerts, runs) and rebuilds
   window.NT_DATA in the same shape the design components expect. Falls back to
   the bundled demo data when the DB is empty or unreachable, so the dashboard
   always renders. Sections we don't yet record (backtest, strategies) keep the
   demo values. */
(function () {
  // Reads go through the shared Supabase client (NT_CLIENT). After Google login
  // it carries the user's session, so RLS authorizes reads for the allow-listed
  // email. (Reading with the bare anon key would be denied post-lockdown.)
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
      var entry = Number(p.entry_price);
      var closed = p.status === "closed";
      var exit = p.exit_price == null ? null : Number(p.exit_price);
      var last = p.last_price == null ? null : Number(p.last_price);
      // mark = price we value the trade at right now: exit if closed, else the
      // live contract price (falls back to entry until the first tick lands).
      var mark = closed ? (exit == null ? entry : exit) : (last == null ? entry : last);
      var pct = entry ? Math.round(((mark / entry - 1) * 100) * 10) / 10 : 0;
      var qty = Number(p.qty), realized = Number(p.realized_pnl || 0);
      // open: realized (locked-in from partials) + live unrealized on the remaining
      // contracts. closed: realized is the final number. Both tick as `last` moves.
      var pnl = Math.round(realized + (closed ? 0 : (mark - entry) * 100 * qty));
      var label = strikeOf(p.strike) + (p.side || "");
      return {
        t: tOf(p.entry_ts), close: p.exit_ts ? tOf(p.exit_ts) : "—",
        tk: p.ticker, strike: label, side: p.side, qty: p.qty,
        entry: entry, exit: closed ? exit : last, pnl: pnl, pct: pct,
        result: resultOf(p), status: closed ? "done" : "live",
        partial: !closed && !!p.half_sold,  // ½ sold, still open
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

  function mapStrategy(sp, trades) {
    if (!sp) return null;
    var closed = (trades || []).filter(function (t) { return t.result !== "OPEN"; });
    var pnl = (trades || []).reduce(function (a, t) { return a + (t.pnl || 0); }, 0);
    var wins = closed.filter(function (t) { return t.result === "WIN"; }).length;
    var avg = closed.length ? Math.round((closed.reduce(function (a, t) { return a + t.pct; }, 0) / closed.length) * 10) / 10 : 0;
    return {
      name: sp.name || "Nitro 0DTE", status: sp.kill_switch ? "paused" : "live",
      desc: sp.description || "Reads 0DTE options alerts and trades them on Schwab.",
      trades: (trades || []).length, winRate: closed.length ? Math.round(wins / closed.length * 100) : 0,
      pnl: Math.round(pnl), avgReturn: avg, alloc: "$" + Math.round(Number(sp.trade_budget_usd || 0)) + "/trade",
      params: {
        trade_budget_usd: Number(sp.trade_budget_usd), max_contracts_per_trade: Number(sp.max_contracts_per_trade),
        allowlist: sp.allowlist || "", stop_loss_pct: Number(sp.stop_loss_pct), breakeven_at_pct: Number(sp.breakeven_at_pct),
        take_half_at_pct: sp.take_half_at_pct == null ? null : Number(sp.take_half_at_pct),
        max_hold_minutes: sp.max_hold_minutes == null ? null : Number(sp.max_hold_minutes),
        max_price_multiple: Number(sp.max_price_multiple),
        max_trades_per_day: Number(sp.max_trades_per_day),
        kill_switch: !!sp.kill_switch, dry_run: !!sp.dry_run,
      },
    };
  }

  window.NT_LIVE = function () {
    var c = window.NT_CLIENT;
    if (!c) return Promise.resolve(null);
    var base = window.NT_DATA || {};
    return Promise.all([
      c.from("positions").select("*").order("entry_ts", { ascending: false }).limit(300),
      c.from("alerts").select("*").order("ts", { ascending: false }).limit(300),
      c.from("runs").select("*").order("id", { ascending: false }).limit(1),
      c.from("strategy_params").select("*").eq("id", 1).maybeSingle(),
    ]).then(function (res) {
      var positions = (res[0] && res[0].data) || [], alerts = (res[1] && res[1].data) || [], runs = (res[2] && res[2].data) || [];
      var sp = (res[3] && res[3].data) || null;
      var sName = (sp && sp.name) || "Nitro 0DTE";
      var trades = positions.length ? buildTrades(positions, sName) : null;
      var strat = mapStrategy(sp, trades);
      var fired = alerts.filter(function (a) { return a.fired; }).length;
      var out = Object.assign({}, base, {
        trades: trades || base.trades,
        kpis: trades ? buildKpis(trades) : base.kpis,
        discord: alerts.length ? buildDiscord(alerts) : base.discord,
        summary14d: alerts.length ? { fired: fired, filtered: alerts.length - fired } : base.summary14d,
        session: Object.assign({}, base.session || {}, {
          mode: (runs[0] && runs[0].mode === "live") ? "LIVE" : (sp && sp.dry_run === false ? "LIVE" : "DRY-RUN"),
          budget: sp ? "$" + Math.round(Number(sp.trade_budget_usd)) : (runs[0] && runs[0].budget != null ? "$" + Math.round(runs[0].budget) : (base.session || {}).budget),
          strategy: sName,
        }),
      });
      if (strat) { out.strategy = strat; out.strategies = [strat]; }
      return out;
    }).catch(function (e) { console.warn("NT_LIVE failed:", e); return null; });
  };
})();

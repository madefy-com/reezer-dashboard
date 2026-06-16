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
  var dispTz = function () { return (window.NT_DATA && window.NT_DATA.marketHours && window.NT_DATA.marketHours.display_tz) || "Europe/Amsterdam"; };
  // Render a stored UTC instant as HH:MM:SS in the operator's display timezone.
  var tOf = function (iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) { var m = String(iso).split("T")[1]; return m ? m.slice(0, 8) : "—"; }
    try {
      return new Intl.DateTimeFormat("en-GB", { timeZone: dispTz(), hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(d);
    } catch (e) { var m2 = String(iso).split("T")[1]; return m2 ? m2.slice(0, 8) : "—"; }
  };
  var dayKey = function (iso) {
    try { return new Intl.DateTimeFormat("en-CA", { timeZone: dispTz(), year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso)); }
    catch (e) { return String(iso).slice(0, 10); }
  };
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
      var total = Number(p.orig_qty || p.qty);            // total contracts in the trade
      var remaining = Number(p.qty);                       // still open after partials
      var last = p.last_price == null ? null : Number(p.last_price);
      var mark = (!closed && last != null) ? last : entry; // live mark for open legs
      var realized = Number(p.realized_pnl || 0);
      // Whole-trade P&L: banked realized + live unrealized on the remaining legs.
      var pnl = Math.round(realized + (closed ? 0 : (mark - entry) * 100 * remaining));
      var cost = entry * 100 * total;                      // original capital at risk
      var pct = cost ? Math.round((pnl / cost * 100) * 10) / 10 : 0;  // total return %
      // Exit price shown: closed -> blended average across all sells (derived from
      // realized P&L over the full size); open -> the live mark.
      var exitShown = closed ? Math.round((entry + realized / (100 * total)) * 100 + 1e-6) / 100
                             : last;
      var stop = p.stop_price == null ? null : Number(p.stop_price);
      var label = strikeOf(p.strike) + (p.side || "");
      return {
        t: tOf(p.entry_ts), close: p.exit_ts ? tOf(p.exit_ts) : "—",
        tk: p.ticker, strike: label, side: p.side, qty: total,
        entry: entry, exit: exitShown, pnl: pnl, pct: pct,
        stop: stop, atBreakeven: stop != null && Math.abs(stop - entry) < 0.005,
        result: resultOf(p), status: closed ? "done" : "live",
        partial: !closed && !!p.half_sold,  // ½ sold, still open
        strat: stratName, hold: holdOf(p), stopped: false,
        trigger: { type: "ENTRY", user: "alerts", msg: p.ticker + " " + label },
      };
    });
  }
  // Per-day roll-up for the 1W / 1M chart ranges (was empty -> chart went blank).
  function buildDaily(positions) {
    var byDay = {};
    positions.forEach(function (p) {
      if (p.status !== "closed" || !p.exit_ts) return;
      var k = dayKey(p.exit_ts);
      var total = Number(p.orig_qty || p.qty), entry = Number(p.entry_price);
      if (!byDay[k]) byDay[k] = { date: k, pnl: 0, cost: 0 };
      byDay[k].pnl += Number(p.realized_pnl || 0);
      byDay[k].cost += entry * 100 * total;
    });
    return Object.keys(byDay).sort().map(function (k) {
      var d = byDay[k];
      return { date: k, pnl: Math.round(d.pnl), pct: d.cost ? Math.round((d.pnl / d.cost * 100) * 10) / 10 : 0 };
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
  // Drop the Discord embed boilerplate ("Comment" labels, "Comments:none")
  // and collapse the rest into one readable line.
  function cleanMsg(raw) {
    return String(raw || "")
      .replace(/comments?\s*:\s*none/gi, "")            // "Comments:none"
      .split("\n")
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s && !/^comments?$/i.test(s); })  // bare "Comment"/"Comments" label
      .join(" · ")
      .replace(/\s+/g, " ")
      .trim();
  }
  // Unrecognized alerts are noise, not a real signal — label them as such.
  function typeLabel(t) {
    return String(t || "").toUpperCase() === "UNKNOWN" ? "noise" : t;
  }
  function buildDiscord(alerts) {
    return alerts.map(function (a) {
      return { t: tOf(a.ts), type: typeLabel(a.type), user: "alerts", ch: "alerts",
        symbol: a.ticker || "—", msg: cleanMsg(a.raw), fired: !!a.fired,
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
        trailing_stop_pct: sp.trailing_stop_pct == null ? null : Number(sp.trailing_stop_pct),
        max_hold_minutes: sp.max_hold_minutes == null ? null : Number(sp.max_hold_minutes),
        max_price_multiple: Number(sp.max_price_multiple),
        max_trades_per_day: Number(sp.max_trades_per_day),
        kill_switch: !!sp.kill_switch, dry_run: !!sp.dry_run,
      },
    };
  }

  // ---- Local cache of the raw DB rows. NT_LIVE fills it from Supabase ONCE
  //      (initial load + manual refresh); after that, realtime pushes patch it
  //      in place via NT_APPLY — no per-event network round-trip, so each update
  //      renders the instant the websocket message lands. ----
  var RAW = { positions: [], alerts: [], runs: [], sp: null };

  function rebuild() {
    var base = window.NT_DATA || {};
    var positions = RAW.positions, alerts = RAW.alerts, runs = RAW.runs, sp = RAW.sp;
    var sName = (sp && sp.name) || "Nitro 0DTE";
    var trades = positions.length ? buildTrades(positions, sName) : null;
    var strat = mapStrategy(sp, trades);
    var fired = alerts.filter(function (a) { return a.fired; }).length;
    var out = Object.assign({}, base, {
      trades: trades || base.trades,
      kpis: trades ? buildKpis(trades) : base.kpis,
      daily: positions.length ? buildDaily(positions) : base.daily,
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
  }

  window.NT_LIVE = function () {
    var c = window.NT_CLIENT;
    if (!c) return Promise.resolve(null);
    return Promise.all([
      c.from("positions").select("*").order("entry_ts", { ascending: false }).limit(300),
      c.from("alerts").select("*").order("ts", { ascending: false }).limit(300),
      c.from("runs").select("*").order("id", { ascending: false }).limit(1),
      c.from("strategy_params").select("*").eq("id", 1).maybeSingle(),
    ]).then(function (res) {
      RAW.positions = (res[0] && res[0].data) || [];
      RAW.alerts = (res[1] && res[1].data) || [];
      RAW.runs = (res[2] && res[2].data) || [];
      RAW.sp = (res[3] && res[3].data) || null;
      return rebuild();
    }).catch(function (e) { console.warn("NT_LIVE failed:", e); return null; });
  };

  // Apply ONE realtime change in place (using the row the websocket delivered)
  // and re-render immediately — no Supabase query, so this is as fast as the
  // push arrives. Returns true if handled.
  window.NT_APPLY = function (table, eventType, newRow, oldRow) {
    if (table === "strategy_params") {
      if (newRow) RAW.sp = newRow;
    } else if (table === "positions" || table === "alerts") {
      var arr = RAW[table], row = newRow || oldRow;
      if (!row) return false;
      var i = arr.findIndex(function (r) { return r.id === row.id; });
      if (eventType === "DELETE") { if (i >= 0) arr.splice(i, 1); }
      else if (i >= 0) { arr[i] = newRow; }    // in-place update keeps row order
      else { arr.unshift(newRow); }            // brand-new row -> newest first
    } else {
      return false;
    }
    window.NT_DATA = rebuild();
    window.dispatchEvent(new Event("nt-data"));
    return true;
  };
})();

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
        id: p.id, runId: p.run_id, strategyId: p.strategy_id, entryTs: p.entry_ts, exitTs: p.exit_ts,  // detail chart + grouping
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
  function buildDiscord(alerts, srcName, srcType) {
    srcName = srcName || {}; srcType = srcType || {};
    var cap = function (s) { s = String(s || ""); return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—"; };
    return alerts.map(function (a) {
      // discord_ts = when the trader posted; ts = when the bot received/acted.
      // latency = the gap = Discord->order delay (the slippage-relevant window).
      var dts = a.discord_ts ? new Date(a.discord_ts) : null;
      var rts = a.ts ? new Date(a.ts) : null;
      var lat = (dts && rts && !isNaN(dts.getTime()) && !isNaN(rts.getTime()))
        ? Math.max(0, Math.round((rts - dts) / 1000)) : null;
      var ACT = { ENTRY: "entered", PARTIAL: "trimmed", CLOSE: "closed", WATCH: "staged" };
      return { t: tOf(a.ts), alertT: dts ? tOf(a.discord_ts) : "—",
        type: typeLabel(a.type), user: "alerts",
        src: (a.source_id != null && cap(srcType[a.source_id])) || "Discord",
        ch: (a.source_id != null && srcName[a.source_id]) || "alerts", srcId: a.source_id,
        symbol: a.ticker || "—", msg: cleanMsg(a.raw), fired: !!a.fired,
        reason: a.reason || "", latency: lat == null ? "" : lat + "s",
        action: (a.fired && ACT[String(a.type).toUpperCase()]) || "" };
    });
  }

  function _params(sp) {
    return {
      trade_budget_usd: Number(sp.trade_budget_usd), max_contracts_per_trade: Number(sp.max_contracts_per_trade),
      allowlist: sp.allowlist || "",
      stop_loss_pct: sp.stop_loss_pct == null ? null : Number(sp.stop_loss_pct),
      breakeven_at_pct: sp.breakeven_at_pct == null ? null : Number(sp.breakeven_at_pct),
      breakeven_after_partial: sp.breakeven_after_partial !== false,
      take_profit_pct: sp.take_profit_pct == null ? null : Number(sp.take_profit_pct),
      take_half_at_pct: sp.take_half_at_pct == null ? null : Number(sp.take_half_at_pct),
      trailing_tiers: Array.isArray(sp.trailing_tiers) ? sp.trailing_tiers : [],
      max_hold_minutes: sp.max_hold_minutes == null ? null : Number(sp.max_hold_minutes),
      max_price_slippage_usd: sp.max_price_slippage_usd == null ? null : Number(sp.max_price_slippage_usd),
      max_trades_per_day: Number(sp.max_trades_per_day),
      kill_switch: !!sp.kill_switch, paused: !!sp.paused, dry_run: !!sp.dry_run,
    };
  }
  function _stats(trades) {
    var closed = (trades || []).filter(function (t) { return t.result !== "OPEN"; });
    var pnl = (trades || []).reduce(function (a, t) { return a + (t.pnl || 0); }, 0);
    var wins = closed.filter(function (t) { return t.result === "WIN"; }).length;
    var avg = closed.length ? Math.round((closed.reduce(function (a, t) { return a + t.pct; }, 0) / closed.length) * 10) / 10 : 0;
    return { trades: (trades || []).length, winRate: closed.length ? Math.round(wins / closed.length * 100) : 0,
             pnl: Math.round(pnl), avgReturn: avg, closed: closed.length };
  }
  // legacy single strategy_params row -> strategy object (fallback path)
  function mapStrategy(sp, trades) {
    if (!sp) return null;
    var s = _stats(trades);
    return Object.assign({ name: sp.name || "Nitro 0DTE", account: sp.dry_run === false ? "live" : "fronttest",
      status: sp.paused ? "paused" : (sp.dry_run === false ? "live" : "fronttest"),
      desc: sp.description || "Reads 0DTE options alerts and trades them on Schwab.",
      alloc: "$" + Math.round(Number(sp.trade_budget_usd || 0)) + "/trade", sourceIds: [], params: _params(sp) }, s);
  }
  // a `strategies` table row -> strategy object (the multi-strategy path)
  function mapStrategyRow(row, trades, subById) {
    var s = _stats(trades);
    var account = String(row.account || "draft").toLowerCase();
    return Object.assign({ id: row.id, account: account, name: row.name || "strategy",
      status: account === "draft" ? "draft" : (row.paused ? "paused" : account),
      desc: row.description || "Reads 0DTE options alerts and trades them on Schwab.",
      alloc: "$" + Math.round(Number(row.trade_budget_usd || 0)) + "/trade",
      sourceIds: (subById && subById[row.id]) || [], params: _params(row) }, s);
  }

  // ---- Local cache of the raw DB rows. NT_LIVE fills it from Supabase ONCE
  //      (initial load + manual refresh); after that, realtime pushes patch it
  //      in place via NT_APPLY — no per-event network round-trip, so each update
  //      renders the instant the websocket message lands. ----
  var RAW = { positions: [], alerts: [], runs: [], sp: null, flags: [],
              strategies: [], sources: [], strategySources: [] };

  function rebuild() {
    var base = window.NT_DATA || {};
    var positions = RAW.positions, alerts = RAW.alerts, sp = RAW.sp;
    var sName = (sp && sp.name) || "Nitro 0DTE";
    var trades = positions.length ? buildTrades(positions, sName) : null;

    // source id -> name/type (for the alerts feed); strategy id -> [source_id]
    var srcName = {}, srcType = {};
    (RAW.sources || []).forEach(function (s) { srcName[s.id] = s.name; srcType[s.id] = s.type; });
    var subById = {};
    (RAW.strategySources || []).forEach(function (r) { (subById[r.strategy_id] = subById[r.strategy_id] || []).push(r.source_id); });

    // strategies from the `strategies` table (multi); fall back to the single strategy_params row
    var stratList;
    if ((RAW.strategies || []).length) {
      stratList = RAW.strategies.map(function (row) {
        var tr = (trades || []).filter(function (t) { return t.strategyId === row.id; });
        return mapStrategyRow(row, tr, subById);
      });
    } else if (sp) {
      stratList = [mapStrategy(sp, trades)];
    } else {
      stratList = (base.strategies || []);
    }
    var anyLive = stratList.some(function (s) { return s.account === "live"; });
    var totBudget = stratList.reduce(function (a, s) { return a + (Number(s.params && s.params.trade_budget_usd) || 0); }, 0);

    // dashboard view filter: 'all' | 'live' | <strategy_id>. Scopes the KPIs / trades /
    // P&L to one strategy; the Strategies page + comparison always use the full set.
    var view = "all";
    try { view = (window.localStorage && localStorage.getItem("nt_view_strategy")) || "all"; } catch (e) {}
    var liveIds = {};
    stratList.forEach(function (s) { if (s.account === "live") liveIds[s.id] = true; });
    var inView = function (sid) {
      if (view === "all") return true;
      if (view === "live") return !!liveIds[sid];
      return String(sid) === String(view);
    };
    // date filter (shared, persisted) — applied ALONGSIDE the strategy view so trades,
    // KPIs and the P&L chart all reflect the selected range (not just the trades table).
    var dr = "week", custom = null;
    try { dr = (window.localStorage && localStorage.getItem("nt_date_range")) || "week"; } catch (e) {}
    if (dr === "custom") { try { var cc = JSON.parse(localStorage.getItem("nt_date_custom")); if (cc) custom = { from: new Date(cc.from), to: new Date(cc.to) }; } catch (e) {} }
    var dateBounds = window.ntRangeBounds ? window.ntRangeBounds(dr, custom) : null;
    var inDate = function (ts) { if (!dateBounds || !ts) return true; var d = new Date(ts); return d >= dateBounds.from && d <= dateBounds.to; };
    var vTrades = (trades || []).filter(function (t) { return inView(t.strategyId) && inDate(t.entryTs); });
    var vPositions = positions.filter(function (p) { return inView(p.strategy_id) && inDate(p.entry_ts); });

    var sc = RAW.sessionConfig || base.sessionConfig || null;
    var fired = alerts.filter(function (a) { return a.fired; }).length;
    var out = Object.assign({}, base, {
      trades: trades ? vTrades : base.trades,
      kpis: trades ? buildKpis(vTrades) : base.kpis,
      daily: positions.length ? buildDaily(vPositions) : base.daily,
      discord: alerts.length ? buildDiscord(alerts, srcName, srcType) : base.discord,
      summary14d: alerts.length ? { fired: fired, filtered: alerts.length - fired } : base.summary14d,
      // streaming window is the single source of truth (session_config); ntSession + the
      // bot both read it. Inject the ET start/end into marketHours so the helpers see them.
      marketHours: Object.assign({}, base.marketHours, sc ? { streaming_start_et: sc.streaming_start_et, streaming_end_et: sc.streaming_end_et } : {}),
      sessionConfig: sc || base.sessionConfig || null,
      session: Object.assign({}, base.session || {}, {
        mode: anyLive ? "LIVE" : "SIMULATION",
        budget: totBudget ? "$" + Math.round(totBudget) : (base.session || {}).budget,
        strategy: (stratList[0] && stratList[0].name) || sName,
        window: sc ? (sc.streaming_start_et + " – " + sc.streaming_end_et + " ET") : (base.session || {}).window,
      }),
    });
    out.strategies = stratList;
    out.strategy = stratList[0] || null;
    out.viewStrategy = view;
    out.dateRange = dr;
    out.dateBounds = dateBounds;
    out.sources = (RAW.sources || []);
    out.brokerAccounts = (RAW.brokerAccounts || []);
    out.machines = (RAW.machines || []);
    out.machineCommands = (RAW.machineCommands || []);
    out.flags = RAW.flags || [];
    return out;
  }

  // Set the dashboard view filter (persisted) and re-render.
  window.NT_SET_VIEW = function (v) {
    try { window.localStorage.setItem("nt_view_strategy", v); } catch (e) {}
    window.NT_DATA = rebuild();
    window.dispatchEvent(new Event("nt-data"));
  };

  // Set the shared date filter (persisted across pages) and re-render. `bounds` is
  // only stored for custom ranges; presets are recomputed each render (so "this week"
  // stays current). Mirrors NT_SET_VIEW.
  window.NT_SET_RANGE = function (value, bounds) {
    try {
      window.localStorage.setItem("nt_date_range", value);
      if (value === "custom" && bounds) window.localStorage.setItem("nt_date_custom", JSON.stringify({ from: bounds.from, to: bounds.to }));
    } catch (e) {}
    window.NT_DATA = rebuild();
    window.dispatchEvent(new Event("nt-data"));
  };

  window.NT_LIVE = function () {
    var c = window.NT_CLIENT;
    if (!c) return Promise.resolve(null);
    return Promise.all([
      c.from("positions").select("*").order("entry_ts", { ascending: false }).limit(300),
      c.from("alerts").select("*").order("ts", { ascending: false }).limit(300),
      c.from("runs").select("*").order("id", { ascending: false }).limit(1),
      c.from("strategy_params").select("*").eq("id", 1).maybeSingle(),
      c.from("operator_flags").select("*").order("ts", { ascending: false }).limit(50),
      c.from("strategies").select("*").order("id"),
      c.from("sources").select("*").order("id"),
      c.from("strategy_sources").select("strategy_id,source_id"),
      c.from("broker_accounts").select("*").order("id"),
      c.from("machines").select("*").order("machine_id"),
      c.from("machine_commands").select("*").order("id", { ascending: false }).limit(40),
      c.from("session_config").select("*").eq("id", 1).maybeSingle(),
    ]).then(function (res) {
      RAW.positions = (res[0] && res[0].data) || [];
      RAW.alerts = (res[1] && res[1].data) || [];
      RAW.runs = (res[2] && res[2].data) || [];
      RAW.sp = (res[3] && res[3].data) || null;
      RAW.flags = (res[4] && res[4].data) || [];
      RAW.strategies = (res[5] && res[5].data) || [];
      RAW.sources = (res[6] && res[6].data) || [];
      RAW.strategySources = (res[7] && res[7].data) || [];
      RAW.brokerAccounts = (res[8] && res[8].data) || [];
      RAW.machines = (res[9] && res[9].data) || [];
      RAW.machineCommands = (res[10] && res[10].data) || [];
      RAW.sessionConfig = (res[11] && res[11].data) || null;
      return rebuild();
    }).catch(function (e) { console.warn("NT_LIVE failed:", e); return null; });
  };

  // Refetch everything and re-render (used after a dashboard write when we want the
  // canonical server state rather than an optimistic patch).
  window.NT_REFRESH = function () {
    return window.NT_LIVE().then(function (d) {
      if (d) { window.NT_DATA = d; window.dispatchEvent(new Event("nt-data")); }
      return d;
    });
  };

  // Lazy per-trade detail: the real price path + the action log for ONE position.
  // Fetched only when the trade drawer opens, so we never bulk-load every tick.
  window.NT_TRADE_DETAIL = function (positionId) {
    var c = window.NT_CLIENT;
    if (!c || positionId == null) return Promise.resolve(null);
    return Promise.all([
      c.from("price_samples").select("ts,price,bid,ask").eq("position_id", positionId).order("ts", { ascending: true }).limit(2000),
      c.from("trade_events").select("ts,type,qty,price,note").eq("position_id", positionId).order("ts", { ascending: true }).limit(200),
    ]).then(function (res) {
      return { samples: (res[0] && res[0].data) || [], events: (res[1] && res[1].data) || [] };
    }).catch(function (e) { console.warn("NT_TRADE_DETAIL failed:", e); return null; });
  };

  // Apply ONE realtime change in place (using the row the websocket delivered)
  // and re-render immediately — no Supabase query, so this is as fast as the
  // push arrives. Returns true if handled.
  window.NT_APPLY = function (table, eventType, newRow, oldRow) {
    if (table === "strategy_params") {
      if (newRow) RAW.sp = newRow;
    } else if (table === "positions" || table === "alerts" || table === "operator_flags") {
      var arr = RAW[table === "operator_flags" ? "flags" : table], row = newRow || oldRow;
      if (!row) return false;
      var i = arr.findIndex(function (r) { return r.id === row.id; });
      if (eventType === "DELETE") { if (i >= 0) arr.splice(i, 1); }
      else if (i >= 0) { arr[i] = newRow; }    // in-place update keeps row order
      else { arr.unshift(newRow); }            // brand-new row -> newest first
    } else if (table === "strategies" || table === "sources") {
      var sarr = RAW[table === "strategies" ? "strategies" : "sources"], srow = newRow || oldRow;
      if (!srow) return false;
      var si = sarr.findIndex(function (r) { return r.id === srow.id; });
      if (eventType === "DELETE") { if (si >= 0) sarr.splice(si, 1); }
      else if (si >= 0) { sarr[si] = newRow; }
      else { sarr.push(newRow); sarr.sort(function (a, b) { return (a.id || 0) - (b.id || 0); }); }
    } else {
      return false;
    }
    window.NT_DATA = rebuild();
    window.dispatchEvent(new Event("nt-data"));
    return true;
  };
})();

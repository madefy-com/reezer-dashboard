/* Reezer · dashboard mock data
   A single morning session (Jun 14, 09:30–~12:00 ET). All numbers are
   internally consistent: the trades roll up into the KPIs, stats and
   per-trade P&L columns. Attached to window.NT_DATA. */
(function () {
  // ---- Live trades (newest first) ----
  const trades = [
    { t: "11:42:08", close: "—",        tk: "SPY", strike: "589C", side: "C", qty: 4, entry: 1.38, exit: null,     pnl: +96,  pct: +17.4, result: "OPEN", status: "live", strat: "0DTE Momentum", hold: "open", trigger: { type: "ENTRY", user: "alerts", msg: "in SPY 589c @ 1.38, 0dte runner" } },
    { t: "11:18:55", close: "11:21:33", tk: "QQQ", strike: "503C", side: "C", qty: 3, entry: 2.05, exit: "2.46/be", pnl: +123, pct: +20.0, result: "WIN",  status: "done", strat: "0DTE Momentum", hold: "2m 38s", trigger: { type: "ENTRY", user: "alerts", msg: "QQQ 503c reclaim, runner on" } },
    { t: "10:54:31", close: "10:55:18", tk: "IWM", strike: "214P", side: "P", qty: 6, entry: 0.92, exit: 0.71,      pnl: -126, pct: -22.8, result: "LOSS", status: "done", strat: "Fade Open", hold: "0m 47s", stopped: true, trigger: { type: "ENTRY", user: "alerts", msg: "IWM 214p, fade the pop" } },
    { t: "10:37:12", close: "10:38:01", tk: "SPY", strike: "588C", side: "C", qty: 4, entry: 1.42, exit: "1.80/be", pnl: +152, pct: +26.7, result: "WIN",  status: "done", strat: "0DTE Momentum", hold: "0m 49s", trigger: { type: "ENTRY", user: "alerts", msg: "SPY 588c here, size on" } },
    { t: "10:11:46", close: "10:14:02", tk: "NVDA",strike: "131C", side: "C", qty: 2, entry: 1.74, exit: 1.74,      pnl: 0,    pct: 0.0,   result: "BE",   status: "done", strat: "Lotto", hold: "2m 16s", trigger: { type: "ENTRY", user: "alerts", msg: "lotto NVDA 131c small" } },
    { t: "09:58:03", close: "10:01:40", tk: "QQQ", strike: "502P", side: "P", qty: 2, entry: 2.10, exit: 1.62,      pnl: -96,  pct: -22.9, result: "LOSS", status: "done", strat: "Fade Open", hold: "3m 37s", trigger: { type: "ENTRY", user: "alerts", msg: "QQQ 502p, fade the open" } },
    { t: "09:47:20", close: "09:49:55", tk: "TSLA",strike: "248C", side: "C", qty: 3, entry: 1.20, exit: "1.58/be", pnl: +114, pct: +31.7, result: "WIN",  status: "done", strat: "0DTE Momentum", hold: "2m 35s", trigger: { type: "ENTRY", user: "alerts", msg: "TSLA 248c momo" } },
    { t: "09:41:03", close: "09:43:18", tk: "SPY", strike: "587C", side: "C", qty: 5, entry: 1.05, exit: 1.39,      pnl: +170, pct: +32.4, result: "WIN",  status: "done", strat: "0DTE Momentum", hold: "2m 15s", trigger: { type: "ENTRY", user: "alerts", msg: "SPY 587c, momo long" } },
    { t: "09:36:18", close: "09:37:02", tk: "AMD", strike: "168P", side: "P", qty: 4, entry: 0.84, exit: 0.62,      pnl: -88,  pct: -26.2, result: "LOSS", status: "done", strat: "Fade Open", hold: "0m 44s", stopped: true, trigger: { type: "ENTRY", user: "alerts", msg: "AMD 168p stab" } },
    { t: "09:33:09", close: "09:35:44", tk: "QQQ", strike: "501C", side: "C", qty: 3, entry: 1.66, exit: "2.01/be", pnl: +105, pct: +21.1, result: "WIN",  status: "done", strat: "0DTE Momentum", hold: "2m 35s", trigger: { type: "ENTRY", user: "alerts", msg: "QQQ 501c off the open" } },
  ];

  // ---- KPI headline metrics (order: net, best, worst, avg return, win rate, open) ----
  const kpis = {
    netPnl:     { value: "+$354.00", delta: "+4.2%", tone: "profit" },
    bestTrade:  { value: "+32.4%",   sub: "SPY 587C ×5",  tone: "profit" },
    worstTrade: { value: "\u221226.2%", sub: "AMD 168P ×4", tone: "loss" },
    avgReturn:  { value: "+9.7%",    sub: "per closed trade" },
    winRate:    { value: "56%",      sub: "5W / 3L · 1 BE" },
    openPos:    { value: "1",        sub: "+$96 unrealized", tone: "profit" },
  };

  // ---- Discord firing log (enriched) ----
  // type: WATCH | ENTRY | PARTIAL | CLOSE ; fired ; reason ; symbol ; latency ; action
  const discord = [
    { t: "11:42:08", type: "ENTRY",   user: "alerts",  ch: "0dte-alerts", symbol: "SPY 589C",  msg: "in SPY 589c @ 1.38, 0dte runner", fired: true,  latency: "0.9s", action: "BUY ×4 @ 1.38" },
    { t: "11:40:51", type: "WATCH",   user: "alerts",  ch: "0dte-alerts", symbol: "SPY",       msg: "SPY reclaiming VWAP, watching 589c", fired: true, latency: "1.2s", action: "armed watch" },
    { t: "11:39:10", type: "WATCH",   user: "hypeguy", ch: "general",     symbol: "—",         msg: "WE ARE SO BACK \ud83d\ude80\ud83d\ude80", fired: false, reason: "hype" },
    { t: "11:21:33", type: "CLOSE",   user: "alerts",  ch: "0dte-alerts", symbol: "QQQ 503C",  msg: "out QQQ 503c, took the 20%", fired: true, latency: "0.7s", action: "SELL ×3 @ 2.46" },
    { t: "11:19:02", type: "PARTIAL", user: "alerts",  ch: "0dte-alerts", symbol: "QQQ 503C",  msg: "trim QQQ 503c half here, stop to be", fired: true, latency: "1.1s", action: "SELL ×1 @ 2.46" },
    { t: "11:05:44", type: "WATCH",   user: "moonboy", ch: "general",     symbol: "—",         msg: "+23% already, LOCKED IN MAJORITY \ud83d\udcb0", fired: false, reason: "P&L brag" },
    { t: "10:55:18", type: "CLOSE",   user: "alerts",  ch: "0dte-alerts", symbol: "IWM 214P",  msg: "stopped IWM 214p, -22%", fired: true, latency: "0.6s", action: "SELL ×6 @ 0.71" },
    { t: "10:38:01", type: "CLOSE",   user: "alerts",  ch: "0dte-alerts", symbol: "SPY 588C",  msg: "closing SPY 588c, runner stopped at be", fired: true, latency: "0.8s", action: "SELL ×4 @ 1.80" },
    { t: "10:37:12", type: "ENTRY",   user: "alerts",  ch: "0dte-alerts", symbol: "SPY 588C",  msg: "SPY 588c here, size on", fired: true, latency: "1.0s", action: "BUY ×4 @ 1.42" },
    { t: "10:30:27", type: "WATCH",   user: "hypeguy", ch: "general",     symbol: "—",         msg: "EZ money day boys \ud83e\udd11", fired: false, reason: "hype" },
    { t: "10:12:40", type: "ENTRY",   user: "alerts",  ch: "0dte-alerts", symbol: "NVDA 131C", msg: "lotto NVDA 131c small", fired: true, latency: "1.4s", action: "BUY ×2 @ 1.74" },
    { t: "09:58:33", type: "ENTRY",   user: "alerts",  ch: "0dte-alerts", symbol: "QQQ 502P",  msg: "QQQ 502p, fade the open", fired: true, latency: "0.9s", action: "BUY ×2 @ 2.10" },
    { t: "09:50:02", type: "WATCH",   user: "moonboy", ch: "general",     symbol: "—",         msg: "account up 4x this week \ud83d\udcc8\ud83d\udcc8", fired: false, reason: "P&L brag" },
    { t: "09:41:03", type: "ENTRY",   user: "alerts",  ch: "0dte-alerts", symbol: "SPY 587C",  msg: "SPY 587c, momo long", fired: true, latency: "0.8s", action: "BUY ×5 @ 1.05" },
    { t: "09:36:18", type: "ENTRY",   user: "alerts",  ch: "0dte-alerts", symbol: "AMD 168P",  msg: "AMD 168p stab", fired: true, latency: "1.3s", action: "BUY ×4 @ 0.84" },
    { t: "09:33:09", type: "ENTRY",   user: "alerts",  ch: "0dte-alerts", symbol: "QQQ 501C",  msg: "QQQ 501c off the open", fired: true, latency: "1.0s", action: "BUY ×3 @ 1.66" },
  ];

  const summary14d = { fired: 41, filtered: 112 };

  // ---- Strategies ----
  const strategies = [
    { name: "0DTE Momentum", status: "live",   desc: "Buys 0DTE calls/puts on VWAP reclaims from the alerts channel.", trades: 6, winRate: 83, pnl: +570, avgReturn: +24.9, alloc: "$300/trade",
      params: { trade_budget_usd: 300, max_contracts_per_trade: 10, stop_loss_pct: 0.20, breakeven_at_pct: 0.20, take_half_at_pct: 0.50 } },
    { name: "Fade Open",     status: "paused", desc: "Fades the opening drive; tight stop. Disabled after 3 reds.", trades: 3, winRate: 0,  pnl: -310, avgReturn: -23.9, alloc: "$300/trade",
      params: { trade_budget_usd: 300, max_contracts_per_trade: 10, stop_loss_pct: 0.15, breakeven_at_pct: 0.15, take_half_at_pct: 0.40 } },
    { name: "Lotto",         status: "live",   desc: "Small size on far-OTM end-of-day lottos. Capped exposure.", trades: 1, winRate: 0,  pnl: 0,    avgReturn: 0.0,   alloc: "$100/trade",
      params: { trade_budget_usd: 100, max_contracts_per_trade: 5, stop_loss_pct: 0.40, breakeven_at_pct: 0.30, take_half_at_pct: 0.60 } },
    { name: "Earnings IV",   status: "off",    desc: "Pre-earnings IV expansion plays. Off during 0DTE hours.", trades: 0, winRate: 0,  pnl: 0,    avgReturn: 0.0,   alloc: "$500/trade",
      params: { trade_budget_usd: 500, max_contracts_per_trade: 8, stop_loss_pct: 0.25, breakeven_at_pct: 0.25, take_half_at_pct: 0.50 } },
  ];

  // ---- Backtest (0DTE Momentum, 30 sessions) ----
  const backtest = {
    strategy: "0DTE Momentum",
    range: "Last 30 sessions",
    stats: [
      { label: "total return", value: "+38.4%", tone: "profit" },
      { label: "net p&l", value: "+$11,520", tone: "profit" },
      { label: "win rate", value: "61%" },
      { label: "profit factor", value: "1.94" },
      { label: "max drawdown", value: "\u22128.7%", tone: "loss" },
      { label: "sharpe", value: "2.31" },
      { label: "trades", value: "248" },
      { label: "avg hold", value: "5m 48s" },
    ],
    // cumulative % equity over 30 sessions (with drawdowns)
    equity: [0, 3.2, 1.8, 5.4, 8.1, 6.2, 9.8, 13.1, 11.0, 14.6, 18.2, 16.1, 12.9, 15.8, 19.4, 22.1, 20.0, 24.3, 27.8, 25.1, 28.9, 31.2, 29.0, 26.5, 30.1, 33.4, 31.8, 35.0, 37.2, 38.4],
  };

  // ---- Daily roll-up for the P&L chart's 1W / 1M ranges.
  //      Derived from the 30-session equity curve: per-session % change,
  //      with $ scaled at ~$90 per percentage-point on this account. ----
  const daily = (() => {
    const eq = backtest.equity, out = [];
    for (let i = 1; i < eq.length; i++) {
      const dPct = Math.round((eq[i] - eq[i - 1]) * 10) / 10;
      out.push({ pct: dPct, pnl: Math.round(dPct * 90) });
    }
    return out; // 29 sessions, oldest -> newest
  })();

  // ============================================================
  // STRATEGY SETTINGS — single source of truth for the bot's sizing,
  // exit/risk and streaming rules. This is the canonical config the
  // operator edits to retune the active strategy.
  //   >> CLAUDE CODE: edit these values to change bot behaviour. <<
  // ============================================================
  const strategyParams = {
    name: "0DTE Momentum",
    sizing: {
      trade_budget_usd: 300,         // max $ per entry
      max_contracts_per_trade: 10,   // hard cap
      // Quantity = floor(budget / (live_ask * 100)); market order; 0DTE / nearest-listed expiry
      order_type: "market",
      expiry: "0DTE / nearest-listed",
      quantity_formula: "floor(budget \u00f7 (live_ask \u00d7 100))",
    },
    exits: {
      stop_loss_pct: 0.20,      // -20% resting stop at Schwab
      breakeven_at_pct: 0.20,   // at +20%, move stop to breakeven
      take_half_at_pct: 0.50,   // at +50%, sell half
      // Partial/scale = sell half (round up); position-aware:
      // 2nd scale closes the runner; 1 contract -> close fully
      scale_note: "Sell half (round up); position-aware: 2nd scale closes the runner; 1 contract \u2192 close fully",
    },
    streaming: {
      // STREAMING WINDOW — the live-trades feed and the header "streaming"
      // dot are green/blinking ONLY inside the first N hours after the
      // regular open (09:30 ET); red outside it.
      //   >> CLAUDE CODE: change window_hours to widen/narrow streaming. <<
      window_hours: 2.5,
    },
  };

  // ---- Market hours. State is computed in market_tz (auto DST); ALL times
  //      are DISPLAYED in display_tz (the operator's own zone, auto DST). ----
  const marketHours = {
    market_tz: "America/New_York",   // NYSE — where the exchange lives
    display_tz: "Europe/Amsterdam",  // YOUR timezone — every time on screen is shown here
    premarket_open_et: "04:00",      // pre-market opens (ET)
    regular_open_et: "09:30",        // regular session opens (ET)
    regular_close_et: "16:00",       // regular session closes (ET)
  };

  window.NT_DATA = { trades, kpis, discord, summary14d, strategies, backtest, daily,
    strategyParams, marketHours,
    session: { date: "Jun 14", window: "09:30 \u2013 12:00 ET", budget: "$300", mode: "DRY-RUN", strategy: "0DTE Momentum", user: "Gianni" } };
})();

/* Reezer dashboard — EMPTY scaffold. No demo data. Everything real comes from
   Supabase via live.js (NT_LIVE) + realtime.js. This only provides the shape so
   the UI renders an empty state if there's no data yet / before live loads. */
(function () {
  window.NT_DATA = {
    trades: [],
    kpis: {
      accountReturn: { value: "—", sub: "" },
      netPnl:       { value: "$0", tone: "" },
      winRate:      { value: "0%", sub: "0 wins · 0 losses", frac: 0 },
      avgWinLoss:   { ratio: null, avgWin: 0, avgLoss: 0, winShare: 0.5 },
      profitFactor: { value: "—", sub: "profit ÷ loss", share: 0 },
      expectancy:   { value: "—", sub: "per trade", frac: 0 },
    },
    discord: [],
    summary14d: { fired: 0, filtered: 0 },
    strategies: [{
      name: "Nitro 0DTE", status: "live", desc: "", trades: 0, winRate: 0, pnl: 0,
      avgReturn: 0, alloc: "$300/trade",
      params: {
        trade_budget_usd: 300, max_contracts_per_trade: 10,
        allowlist: "QQQ,NVDA,TSLA,AAPL,SPY,PLTR", stop_loss_pct: 0.20,
        breakeven_at_pct: 0.20, take_half_at_pct: 0.50, max_hold_minutes: 60,
        max_price_multiple: 3.0, kill_switch: false, dry_run: true,
      },
    }],
    backtest: { strategy: "Nitro 0DTE", range: "—", stats: [], equity: [] },
    daily: [],
    // strategyParams.streaming + marketHours are static session config (NOT from
    // live data) — the market-session/streaming helpers in Shared.jsx require them.
    strategyParams: { name: "Nitro 0DTE", streaming: { window_hours: 2.5 } },
    marketHours: {
      market_tz: "America/New_York", display_tz: "Europe/Amsterdam",
      premarket_open_et: "04:00", regular_open_et: "09:30", regular_close_et: "16:00",
    },
    session: {
      date: "", window: "09:30 – 12:00 ET", budget: "$300",
      mode: "SIMULATION", strategy: "Nitro 0DTE", user: "Trader",
    },
  };
})();

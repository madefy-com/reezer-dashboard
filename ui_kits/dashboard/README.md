# UI Kit · Reezer Operator Dashboard

The full real-time dashboard the operator watches during the morning session (09:30–~12:00 ET). One screen, densely composed from the design-system primitives.

## Run it
Open `index.html`. It links the global `styles.css`, loads the compiled `_ds_bundle.js` (built automatically from this project's components), Lucide icons, then the screen modules below. The live clock and pulsing status dots give the "real-time feel"; mode pill and kill switch are interactive.

## Files
- `index.html` — page shell + script load order; renders `<App/>`.
- `data.js` — `window.NT_DATA`: one internally-consistent session (trades roll up into the KPIs and per-trade P&L columns) plus `strategies` and `backtest` datasets; each trade carries its strategy, hold time and triggering Discord message for the detail panel.
- `App.jsx` — shell + **page router**: sidebar + status bar + scrolling content. Holds the active page, mode/kill state, the ET clock, the selected-trade drawer, and the Lucide `createIcons` pass.
- `Sidebar.jsx` — labeled nav rail (brand + Trades/Log/Backtesting/Strategies + settings + Gianni). Defines the shared `Ico` Lucide helper.
- `Shared.jsx` — `greeting()` (time-of-day + first name), the `DateFilter` segmented control (Today/7D/30D, default Today), and `PageHead`.
- `StatusBar.jsx` — `ModePill`, budget pill, live-strategy pill, `KillSwitch`, session window, live clock, date, bell. All pills share the `radius-sm` rounded-rect shape.
- `KpiRow.jsx` — six `KpiCard`s in order: net p&l, best trade, worst trade, avg return, win rate, open positions; responsive 6→3→2 cols.
- `PnlChart.jsx` — per-trade P&L column chart (diverging green/red bars from a zero baseline, gray for breakeven; hoverable tooltip; bars click through to the detail panel). Pure SVG built from `trades`.
- `TradeDetail.jsx` — slide-over preview opened by clicking a trade row or chart bar: headline P&L, contract-price path, full field grid (side, qty, entry/exit, capital, hold time, strategy), stop-out flag, and the triggering Discord message.
- `TradesLog.jsx` — live trades table (clickable rows): status dot, time, contract, qty, entry, exit (incl. `1.80/be` partials), P&L $/%, `ResultBadge`.
- `DiscordLog.jsx` — enriched firing feed: time, `TypeChip`, symbol, `@user` message, fire latency, `FiredBadge`; filtered (hype / P&L-brag) rows muted; 14-day summary in the header.

## Pages
- `TradesPage.jsx` — greeting + date filter + KPI grid + (live trades · per-trade P&L chart) + Discord firing feed.
- `LogPage.jsx` — full firing-log table with All/Fired/Filtered tabs and channel / symbol / latency / action columns.
- `BacktestingPage.jsx` — strategy selector + date range + equity-curve chart + results-stat grid.
- `StrategiesPage.jsx` — strategy status cards (live / paused / off) with trades, win rate, P&L, avg return, budget and actions.

## Composition notes
Screens read DS primitives off `window.NitroTraderDesignSystem_95e598` (`KpiCard`, `Card`, `ResultBadge`, `StatusDot`, `TypeChip`, `FiredBadge`, `ModePill`, `KillSwitch`, `Button`). Bespoke layout (chart, tables, feed) is built fresh here — it is *not* part of the primitive set. To theme light, set `data-theme="light"` on `<html>`. All numeric values use Geist Mono tabular figures so columns stay aligned as values tick.

/* Reezer dashboard — user-facing product version + changelog.
   CONVENTION: every dashboard change bumps NT_VERSION by +0.001 (1.001 -> 1.002 ...)
   and adds an entry {v, date, note} at the TOP of NT_CHANGELOG (newest first). The
   Updates page GROUPS entries by day. Separate from the ?v= asset cache-buster. */
window.NT_VERSION = "1.021";

window.NT_CHANGELOG = [
  // ---- 2026-06-21
  { v: "1.021", date: "2026-06-21", note: "Reorganized this Updates page by day and backfilled the full change history." },
  { v: "1.020", date: "2026-06-21", note: "Added a version number (bottom of the sidebar) and this Updates page." },
  // ---- 2026-06-18
  { v: "1.019", date: "2026-06-18", note: "Trade detail shows a loading placeholder instead of briefly flashing a fake chart when you open it." },
  { v: "1.018", date: "2026-06-18", note: "You can now hover the trade chart to read your % gain at any point along the line." },
  { v: "1.017", date: "2026-06-18", note: "Trade detail now shows the real recorded price path with entry / partial / exit markers, plus a “what happened” timeline (newest first) tagged alert- vs rule-driven." },
  { v: "1.016", date: "2026-06-18", note: "Alerts page now shows the Discord post-time and the delay until the order was placed; moved the live/idle streaming dot onto the Alerts panel." },
  { v: "1.015", date: "2026-06-18", note: "Red “review needed” banner when the bot can’t tell which open trade an alert refers to." },
  // ---- 2026-06-16
  { v: "1.014", date: "2026-06-16", note: "New Fronttesting page; each contract’s price is now recorded for 30 min after it closes, so exit strategies can be replayed." },
  { v: "1.013", date: "2026-06-16", note: "Strategies page: pause control, multi-card layout, take-profit, optional exits, and a dollar-based slippage cap." },
  { v: "1.012", date: "2026-06-16", note: "On-brand confirm dialogs, fixed the modal close icon, and a Simulation/Live toggle in settings." },
  { v: "1.011", date: "2026-06-16", note: "Renamed “Dry-run” to “Simulation”, and made the ACTIVE toggle a real kill switch." },
  { v: "1.010", date: "2026-06-16", note: "Trailing-stop strategy option, including a tiered editor and a “give back N points of profit” model with clearer wording." },
  { v: "1.009", date: "2026-06-16", note: "Trades table polish: added a stop column, tidier alignment, and it now fills the card width evenly." },
  { v: "1.008", date: "2026-06-16", note: "Streaming dot blinks when live; alert feed and badge polish." },
  { v: "1.007", date: "2026-06-16", note: "Instant realtime updates — pushed changes patch in place with no refresh." },
  { v: "1.006", date: "2026-06-16", note: "Live mark-to-market P&L on open trades, and partial (½-sold) trades shown live." },
  { v: "1.005", date: "2026-06-16", note: "Dashboard shows real data only — no demo numbers." },
  { v: "1.004", date: "2026-06-16", note: "Strategies page: edit and save all strategy settings to the bot (budget, allowlist, stops, take-half, max-hold), with a warning before going live." },
  { v: "1.003", date: "2026-06-16", note: "Locked the dashboard to your Google account; login splash, plus sidebar name and sign-out." },
  // ---- 2026-06-15
  { v: "1.002", date: "2026-06-15", note: "Polished the login screen with the Reezer logo." },
  { v: "1.001", date: "2026-06-15", note: "Launched the dashboard: live trades, alerts and P&L from the bot, behind a Google login." },
];

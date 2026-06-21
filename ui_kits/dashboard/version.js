/* Reezer dashboard — user-facing product version + changelog.
   CONVENTION: the version is PER DAY. The first dashboard change on a new day bumps
   NT_VERSION by +0.001 and adds a new {v, date, notes:[]} entry at the TOP of
   NT_CHANGELOG (newest first); further changes the SAME day just append a bullet to
   that day's `notes` (version unchanged). Separate from the ?v= asset cache-buster. */
window.NT_VERSION = "1.004";

window.NT_CHANGELOG = [
  {
    v: "1.004", date: "2026-06-21",
    notes: [
      "Added a version number (bottom of the sidebar) and this Updates page, with the full history grouped by day.",
      "Strategies are now multiple cards, each linked to a live, fronttest (paper) or draft account — create, duplicate, delete, pick which sources it trades, and compare them side by side on the same alerts.",
      "New Settings page to manage alert channels and broker accounts; the Alerts page can filter by source.",
      "Top bar now shows a strategy summary (e.g. “1 live · 2 paper”) instead of a single-strategy picker.",
      "Dashboard and Trades share a strategy filter (top right, on-brand dropdown) — show all strategies, only the live ones, or a single one; set the default under Settings.",
      "Alerts feed: shows the real channel name and the action the bot took, a cleaner result, and clearer type colours — CLOSE and PARTIAL share a bright colour to stand out, ENTRY is calmer.",
      "Polish: strategy cards line up to equal height; native dropdowns restyled to match the app.",
      "Renamed Fronttesting → Exit Lab (and hid Backtesting for now); Alerts page gains a Source column; alert type colours softened (ENTRY/PARTIAL/CLOSE share a calmer amber, WATCH blue); strategy-card buttons aligned; Settings rebuilt into consistent Dashboard / Alert sources / Broker accounts sections.",
    ],
  },
  {
    v: "1.003", date: "2026-06-18",
    notes: [
      "Red “review needed” banner when the bot can’t tell which open trade an alert refers to.",
      "Alerts page now shows the Discord post-time and the delay until the order; moved the streaming dot onto the Alerts panel.",
      "Trade detail now shows the real recorded price path with entry / partial / exit markers, plus a “what happened” timeline (newest first).",
      "Hover the trade chart to read your % gain at any point along the line.",
      "Trade detail shows a loading placeholder instead of briefly flashing a fake chart.",
    ],
  },
  {
    v: "1.002", date: "2026-06-16",
    notes: [
      "Locked the dashboard to your Google account; login splash, plus sidebar name and sign-out.",
      "Strategies page: edit and save all strategy settings to the bot (budget, allowlist, stops, take-half, max-hold), with a warning before going live.",
      "Dashboard shows real data only — no demo numbers.",
      "Live mark-to-market P&L on open trades, and partial (½-sold) trades shown live.",
      "Instant realtime updates — pushed changes patch in place with no refresh.",
      "Trades table polish: stop column, tidier alignment, fills the card width evenly.",
      "Streaming dot blinks when live; alert feed and badge polish.",
      "Trailing-stop strategy option, including a tiered editor and a “give back N points of profit” model.",
      "Renamed “Dry-run” to “Simulation”, and made the ACTIVE toggle a real kill switch.",
      "On-brand confirm dialogs, fixed the modal close icon, and a Simulation/Live toggle.",
      "Strategies page: pause control, multi-card layout, take-profit, optional exits, and a dollar-based slippage cap.",
      "New Fronttesting page; each contract’s price is recorded for 30 min after it closes.",
    ],
  },
  {
    v: "1.001", date: "2026-06-15",
    notes: [
      "Launched the dashboard: live trades, alerts and P&L from the bot, behind a Google login.",
      "Polished the login screen with the Reezer logo.",
    ],
  },
];

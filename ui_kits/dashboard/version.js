/* Reezer dashboard — user-facing product version + changelog.
   CONVENTION: bump NT_VERSION by +0.001 (1.001 -> 1.002 -> ...) on every dashboard
   change and add a short, plain-language entry at the TOP of NT_CHANGELOG (newest
   first). Separate from the ?v= asset cache-buster in index.html. */
window.NT_VERSION = "1.011";

window.NT_CHANGELOG = [
  {
    v: "1.011", date: "2026-06-21",
    notes: ["Added a version number (bottom of the sidebar) and this Updates page."],
  },
  {
    v: "1.010", date: "2026-06-18",
    notes: ["Trade detail now shows a loading placeholder instead of briefly flashing a fake chart when you open it."],
  },
  {
    v: "1.009", date: "2026-06-18",
    notes: ["You can now hover the trade chart to read your % gain at any point along the line."],
  },
  {
    v: "1.008", date: "2026-06-18",
    notes: [
      "Trade detail now shows the real recorded price path with entry / partial / exit markers.",
      "Added a “what happened” timeline (newest first) listing every partial, stop, breakeven and trail — tagged as alert- vs rule-driven.",
    ],
  },
  {
    v: "1.007", date: "2026-06-18",
    notes: [
      "Alerts page now shows the Discord post-time and the delay until the order was placed.",
      "Moved the live/idle streaming dot onto the Alerts panel.",
    ],
  },
  {
    v: "1.006", date: "2026-06-18",
    notes: ["Red “review needed” banner when the bot can’t tell which open trade an alert refers to."],
  },
  {
    v: "1.005", date: "2026-06-16",
    notes: ["New Fronttesting page; each contract’s price is now recorded for 30 min after it closes, so exit strategies can be replayed."],
  },
  {
    v: "1.004", date: "2026-06-16",
    notes: ["Strategies page: pause control, multi-card layout, take-profit, optional exits, and a dollar-based slippage cap."],
  },
  {
    v: "1.003", date: "2026-06-16",
    notes: ["On-brand confirm dialogs, fixed the modal close icon, and a Simulation/Live toggle in settings."],
  },
  {
    v: "1.002", date: "2026-06-16",
    notes: ["Renamed “Dry-run” to “Simulation”, and made the ACTIVE toggle a real kill switch."],
  },
  {
    v: "1.001", date: "2026-06-16",
    notes: ["Trailing stop reworked to a “give back N points of profit” model, with clearer wording on the dashboard."],
  },
];

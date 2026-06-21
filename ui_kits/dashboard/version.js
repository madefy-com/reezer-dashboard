/* Reezer dashboard — user-facing product version + changelog.
   CONVENTION: bump NT_VERSION's sub-number on every dashboard change and add a
   short, plain-language entry at the TOP of NT_CHANGELOG (newest first). This is
   separate from the ?v= asset cache-buster in index.html. */
window.NT_VERSION = "1.1";

window.NT_CHANGELOG = [
  {
    v: "1.1", date: "2026-06-21",
    notes: [
      "Added a version number (bottom of the sidebar) and this Updates page.",
    ],
  },
  {
    v: "1.0", date: "2026-06-21",
    notes: [
      "Trade detail now shows the real recorded price path with entry / partial / exit markers.",
      "Added a “what happened” timeline (newest first) listing every partial, stop, breakeven and trail — tagged as alert- vs rule-driven.",
      "Hover the trade chart to read your % gain at any point along the line.",
      "Alerts page now shows the Discord post-time and the delay until the order was placed.",
      "Red “review needed” banner when the bot can’t tell which open trade an alert refers to.",
      "Moved the live/idle streaming dot onto the Alerts panel.",
    ],
  },
];

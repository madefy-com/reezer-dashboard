/* Reezer dashboard — user-facing product version + changelog.
   CONVENTION: the version is PER DAY. The first dashboard change on a new day bumps
   NT_VERSION by +0.001 and adds a new {v, date, notes:[]} entry at the TOP of
   NT_CHANGELOG (newest first); further changes the SAME day just append a bullet to
   that day's `notes` (version unchanged). Separate from the ?v= asset cache-buster. */
window.NT_VERSION = "1.007";

window.NT_CHANGELOG = [
  {
    v: "1.007", date: "2026-06-24",
    notes: [
      "Exit Lab fix: the per-strategy stats now ALWAYS cover all strategies (date filter only), as agreed — the strategy filter narrows only the Trades table above it. Yesterday's change had wrongly made the stats follow the strategy filter too.",
      "New strategy option “Manage exits by rules only”: the strategy still takes new ENTRY alerts but ignores the trader’s partial/close alerts — exits come purely from your own stop / breakeven / trailing / targets. Lets a strategy run its full plan.",
      "New per-strategy “Budget by weekday (%)”: trade a percentage of the budget on each weekday (Mon–Fri). e.g. Monday 50% on a $400 budget = $200/trade that day. 100% = full size.",
      "Fix: those two new options now stick. They were saving to the database fine, but the dashboard wasn't reading them back, so reopening the editor showed the old values. The editor now shows what you saved.",
      "Strategy cards are easier to read: each section (Sizing, Exits & risk, Sources) now has a clear header with an icon and a divider line, the settings are laid out in two columns instead of one long list, and default/“off” values are dimmed so your customised settings stand out.",
      "New “Replay” on paper/draft strategy cards: re-run every recorded alert-trade this strategy would have taken (matched by its allowlist + sources, and sized to its budget) through its CURRENT settings — instantly, right in your browser. Works off the shared pool of recorded trades, so even a brand-new strategy with no trades of its own has something to replay. Shows replay vs recorded P&L and a per-trade list; click any trade for its replayed price chart and full action log. Saved separately, so your real trades are never touched. (Runs the exact same engine the bot uses, so every setting — now and future — is reflected automatically.)",
    ],
  },
  {
    v: "1.006", date: "2026-06-23",
    notes: [
      "Machines: an offline/stale box now has a Remove button so you can clear a duplicate or a box you no longer use (it reappears on its own if it checks in again). Boxes also use a stable name now, so one Mac can’t show up twice.",
      "New safety alert: during the streaming window, if no box is actually trading, a red “Session at risk” banner appears at the top of every page — so a crashed, asleep, or offline box can never fail silently again.",
      "Recovered last week’s trades (the June 16 and June 18 wins) that had been dropped from the cloud, and fixed the underlying ID clash that caused them to be overwritten.",
      "The date filter now changes everything: Trades, the P&L chart and the stat cards all follow the selected range — not just the trades list. (Alerts always show the latest, regardless of range.)",
      "New “Default date range” in Settings → Dashboard, alongside Default view — pick the range the dashboard opens on.",
      "Exit Lab: the per-strategy stats now follow the same strategy filter as the trades above them, so the “left on table” numbers can’t disagree (e.g. 13.6% above vs 63% below).",
      "Per-trade P&L charts fixed: today’s trades were drawing a flat, week-wide line because of leftover samples from the ID clash — cleaned, so each chart now spans just its own trade.",
      "The trade log now shows the REAL trigger of every exit: rule-driven take-halves/targets show a ⚙️ with the reason (e.g. “+32% rule”), and alert-driven exits show a 🔔 with the actual alert (e.g. “Closed · LOCKED IN MAJORITY”) — so a rule no longer looks like an alert, and “Closed” no longer hides which alert caused it.",
      "A scale alert (“LOCKED IN MAJORITY”) no longer force-closes your runner — it takes half once to lock in profit, then lets the runner ride its stop (so a trailing strategy can actually trail).",
    ],
  },
  {
    v: "1.005", date: "2026-06-22",
    notes: [
      "New Machines panel in Settings — see each of your boxes at a glance: online/offline, which one is currently active (trading), when it was last seen, and its Schwab / Discord / Supabase connection health. Updates live.",
      "Groundwork for unattended daily auto-run with automatic failover across multiple boxes (most of it is bot-side); the dashboard now surfaces box status + re-auth reminders.",
      "“Connect a box” now matches how your Macs actually work: since the nitro-trader folder is in iCloud, it’s already on every Mac — so connecting one is just opening Documents → nitro-trader and double-clicking the installer. No download, no copying files. Each box keeps its own private login/data locally so they can’t clash.",
      "Settings page rebuilt to match the rest of the app: each section (Dashboard, Alert sources, Broker accounts, Machines) is now a full-width panel with its title inside the card and a proper table — no more everything squeezed into narrow cards on the right.",
      "Better contrast everywhere: secondary text, captions and table/card borders are lighter on dark (and darker on light) so labels and dividers are easier to read across all pages.",
      "Machines status is clearer: a box outside its trading window now reads “OFF-HOURS” (it auto-starts at the next session) instead of an alarming “OFFLINE”. A box only shows OFFLINE if it goes missing during a live session. You set up each Mac once — nothing is ever run daily.",
      "Streaming hours are now a real, editable setting (Settings → Streaming window): set when the trader streams — in US Eastern, with your local time shown beneath — plus how many minutes early the bot wakes. The top-bar Streaming row and the box “should it be running” logic both read it.",
      "The bot now runs on the streaming window, not the whole market day. It scans from your lead time before the start through the end, then keeps managing any still-open trades until they close (with a market-close safety net) and stops as soon as it’s flat — instead of idling until the 16:00 ET close every day.",
      "Exit behaviour: a “LOCKED IN MAJORITY”-style scale alert no longer force-closes your runner once you’ve already taken half — the runner now rides its stop (trailing / breakeven), so a trailing strategy can catch a bigger move. An explicit “closed” alert still closes fully.",
    ],
  },
  {
    v: "1.004", date: "2026-06-21",
    notes: [
      "Added a version number (bottom of the sidebar) and this Updates page, with the full history grouped by day.",
      "Strategies are now multiple cards, each linked to a live, paper or draft account — create, duplicate, delete, pick which sources it trades, and compare them side by side on the same alerts.",
      "New Settings page to manage alert channels and broker accounts; the Alerts page can filter by source.",
      "Top bar now shows a strategy summary (e.g. “1 live · 2 paper”) instead of a single-strategy picker.",
      "Dashboard and Trades share a strategy filter (top right, on-brand dropdown) — show all strategies, only the live ones, or a single one; set the default under Settings.",
      "Alerts feed: shows the real channel name and the action the bot took, a cleaner result, and clearer type colours — CLOSE and PARTIAL share a bright colour to stand out, ENTRY is calmer.",
      "Polish: strategy cards line up to equal height; native dropdowns restyled to match the app.",
      "Renamed Fronttesting → Exit Lab (and hid Backtesting for now); Alerts page gains a Source column; alert type colours softened (ENTRY/PARTIAL/CLOSE share a calmer amber, WATCH blue); strategy-card buttons aligned; Settings rebuilt into consistent Dashboard / Alert sources / Broker accounts sections.",
      "Renamed the “fronttest” account type to “Paper” everywhere (clearer now the page is Exit Lab); internal value unchanged.",
      "New strategy option “Stop to breakeven after first exit” (off = let the runner ride on its trailing/initial stop). The bot used to always do this; now it’s per-strategy — which is what lets a trailing strategy actually catch a runner.",
      "Strategy comparison moved to the Exit Lab: it now lists every trade across all strategies (with a strategy column + the shared strategy filter) and a per-strategy stats rollup below. The Strategies page is back to just the cards.",
      "Exit Lab: a date filter up top now scopes the whole page; the strategy filter moved into the Trades frame (its only consumer); the per-strategy stats always cover all strategies. “Realized %” counts partials (P&L ÷ cost basis).",
      "The date filter now remembers your choice across every page that uses it (like the strategy filter), and defaults to This week — a calendar week, Monday to Sunday.",
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

/* Reezer dashboard — user-facing product version + changelog.
   CONVENTION: the version is PER DAY. The first dashboard change on a new day bumps
   NT_VERSION by +0.001 and adds a new {v, date, notes:[]} entry at the TOP of
   NT_CHANGELOG (newest first); further changes the SAME day just append a bullet to
   that day's `notes` (version unchanged). Separate from the ?v= asset cache-buster. */
window.NT_VERSION = "1.011";

window.NT_CHANGELOG = [
  {
    v: "1.011", date: "2026-06-30",
    notes: [
      "New headline metric cards (dashboard + Trades): Account return and Net P&L stay; the rest are now Trade win % (with a win/loss donut), Avg profit/trade (avg % per closed trade), Profit factor (gross profit ÷ gross loss, with a green/red split bar — above 1.0 = profitable), and Trade expectancy (average $ you win/lose per closed trade).",
    ],
  },
  {
    v: "1.010", date: "2026-06-29",
    notes: [
      "Settings → Machines: after a box command (Verify / Restart / etc.) finishes, the “done” note now clears itself after about a minute instead of lingering — it’s just a transient “last action” status.",
      "Settings layout: Dashboard + Streaming window sit side by side, and Alert sources + Broker accounts side by side, instead of stacked full-width — much less wide and empty on big screens (stacks back to one column on narrow ones). Paired cards line up to equal height.",
      "Trades page: fixed a stray “…” showing after the LOSS badge in the Result column — that column was too narrow and was clipping the badge.",
      "Strategies page: the cards now fill the full page width (and add columns on wide monitors) instead of staying a fixed width with empty space on the right.",
      "Settings page decluttered: Alert sources drops the long channel URL (it’s on hover now) and uses compact icon buttons; Machines shows one health dot (hover for Schwab/Discord/Supabase detail) with icon controls; helper text trimmed.",
    ],
  },
  {
    v: "1.009", date: "2026-06-26",
    notes: [
      "The dashboard and every page now use the full width of larger monitors instead of staying pinned to a fixed column with empty side margins. (It still caps on very wide ultrawide screens so tables don’t over-stretch.)",
      "The trade date is now its own DAY/MONTH column (Trades page + dashboard trades list) instead of being stacked above the time. It appears whenever there’s room — always on the wide Trades page, and on the dashboard list only when that panel is wide enough.",
      "Trades page table now fills the screen width with even, controlled column spacing — no more half-empty black area on wide monitors, and no big gaps between columns either. Long strategy names shorten with “…” (hover to read the full name).",
      "Secondary text — table headers, labels and captions — is brighter again on dark for easier reading.",
      "New “Activity” page: a live operational log streamed from every box — each session start/stop, and every entry/exit with its exact sizing basis (e.g. “×2 @ $1.78 — 60% day-budget”). You can finally see what each Mac did without opening it; filter by box. (Previously this only existed in a local file on whichever box was the leader.)",
      "Fix: when a second Mac ran the session, its trades could reuse low id numbers and overwrite older cloud data (it briefly stapled 4-day-old prices onto one of today’s trade charts). Each box now writes into its own id range, so two machines can never collide again.",
    ],
  },
  {
    v: "1.008", date: "2026-06-25",
    notes: [
      "Dashboard cards: “best trade” and “worst trade” are replaced by AVERAGE WIN % and AVERAGE LOSS % per trade — a clearer read on how the wins and losses actually size up.",
      "New first card: ACCOUNT RETURN % — your total P&L as a percentage of the account. For paper strategies it’s measured against a starting balance (set to $2,000); live strategies use the real Schwab balance. (Replaces the “open positions” card.)",
      "Trade chart shows just the trade again (entry → exit) by default, with a “full tape” toggle in the chart header to see the full recorded path (to ~30 min past close) when you want it.",
      "Fixed: the Trades page had gone blank — it was still wired to the old best/worst-trade cards. It now uses the new avg-win/avg-loss figures and loads again.",
      "Trades, the dashboard trade log and the Alerts feed now show a subtle DAY/MONTH divider line between days, so you can see which day each trade and alert belongs to.",
      "Closed trades show their stop level again (the final stop the trade rode) on both the dashboard and the Trades page.",
      "Removed the “on $2,000” line under Account return — it wasn’t useful.",
      "Full-tape chart: the entry/exit markers are kept in view so they always show, even on the longer recorded path.",
      "Account return is now a static, all-time figure (lifetime P&L ÷ starting balance) — it no longer moves when you change the date filter, since it’s a property of the account, not the window.",
      "Trades & trade log: dropped the day divider in favour of a regular date (DAY/MONTH) shown on each row, just above the time.",
      "Avg win and avg loss are shown in plain white now (no green/red).",
      "The Trades page uses the exact same six cards as the dashboard.",
      "Alerts page: added a Date column. The dashboard Alerts feed keeps its day divider, now with clearer spacing above each date.",
    ],
  },
  {
    v: "1.007", date: "2026-06-24",
    notes: [
      "Exit Lab fix: the per-strategy stats now ALWAYS cover all strategies (date filter only), as agreed — the strategy filter narrows only the Trades table above it. Yesterday's change had wrongly made the stats follow the strategy filter too.",
      "New strategy option “Manage exits by rules only”: the strategy still takes new ENTRY alerts but ignores the trader’s partial/close alerts — exits come purely from your own stop / breakeven / trailing / targets. Lets a strategy run its full plan.",
      "New per-strategy “Budget by weekday (%)”: trade a percentage of the budget on each weekday (Mon–Fri). e.g. Monday 50% on a $400 budget = $200/trade that day. 100% = full size.",
      "Fix: those two new options now stick. They were saving to the database fine, but the dashboard wasn't reading them back, so reopening the editor showed the old values. The editor now shows what you saved.",
      "Strategy cards are easier to read: each section (Sizing, Exits & risk, Sources) now has a clear header with an icon and a divider line, the settings are laid out in two columns instead of one long list, and default/“off” values are dimmed so your customised settings stand out.",
      "Replay fix: the “Recorded P&L” column now shows THIS strategy’s own result for each trade (e.g. Options live’s QQQ 724C = +$111, matching the trade detail) instead of accidentally borrowing another strategy’s number for the same alert.",
      "Replay fix: for a few older trades the replay was reading the WRONG price tape — old ID-clobbered ticks from a different day were stapled onto the trade, so a real winner (e.g. QQQ 724C, +$111) showed as a loss and the price chart never went green. Replay now uses each trade’s own clean session and picks the uncontaminated recording, so winners read as winners.",
      "New “Replay” on paper/draft strategy cards: re-run every recorded alert-trade this strategy would have taken (matched by its allowlist + sources, and sized to its budget) through its CURRENT settings — instantly, right in your browser. Works off the shared pool of recorded trades, so even a brand-new strategy with no trades of its own has something to replay. Shows replay vs recorded P&L and a per-trade list; click any trade for its replayed price chart and full action log. Saved separately, so your real trades are never touched. Strategies that follow the trader’s alerts replay those partial/close alerts too (a “rules only” strategy ignores them, exactly as it would live — so its replay can look worse than the recorded trades, which were closed by those alerts). (Runs the exact same engine the bot uses, so every setting — now and future — is reflected automatically.)",
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

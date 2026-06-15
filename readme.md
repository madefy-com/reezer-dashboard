# Reezer · Design System

A flat, dark-native **fintech dashboard** system for **Reezer** — an automated bot that reads options alerts out of a private Discord and places **0DTE** (zero-days-to-expiry) option orders through the **Charles Schwab API**. It runs in **DRY-RUN** (paper / simulation) or **LIVE** (real money) mode, with a hardware-style **kill switch**.

The product is a single real-time operator dashboard, watched during the morning session (**09:30 – ~12:00 ET**) while the bot fires. Everything on screen updates live: P&L ticks, the trade log streams, the Discord firing feed scrolls. This system exists to make that dashboard feel **fast, legible, and trustworthy** — the kind of surface you'd stake real money on.

> **Sources.** No codebase or Figma was provided. The system was derived from the product brief plus three reference screenshots the user supplied (`uploads/IMG_4926–4928.WEBP`). The user's favourite, **IMG_4926** (a credit-score dashboard), sets the core aesthetic: ultra-clean flat dark surfaces, hairline borders, big light-weight numbers, generous rounding, a single violet accent. **IMG_4928** (the "FundedX" prop-firm dashboard) informed the structure — KPI cards, an equity line chart, data-dense tables. **IMG_4927** (a crypto wallet) was a secondary reference; its gradient panels were deliberately *not* adopted (the brief calls for no gradients).

---

## Brand at a glance

- **Name:** Reezer (always capitalized, one word).
- **Mark:** a flat electric-violet rounded square with a white **“R”** monogram (`assets/logo-mark.png`). No gradient — the violet is a single solid fill.
- **Accent:** electric violet `#6E5BF2`. Used for brand, focus, the active nav item, the active strategy pill. **Never** used to signal money — that is strictly green/red.
- **Voice:** terse, factual, trader-desk. Real numbers, no hype. (See Content Fundamentals.)

---

## CONTENT FUNDAMENTALS

How Reezer writes copy. The whole product is an instrument panel, so language is **dense, literal, and unsentimental** — the opposite of the Discord hype it's built to filter out.

- **Tone:** operator-grade. Reads like a Bloomberg terminal or a flight deck, not a consumer fintech app. No exclamation marks, no encouragement, no emoji in the UI. The bot states what happened; the trader decides.
- **Casing:** the brand name is always capitalized `Reezer`. UI labels are **Title Case** for nav and headings ("Open positions", "Win rate"), **UPPERCASE** for status/type tokens only (`LIVE`, `DRY-RUN`, `WIN`, `LOSS`, `OPEN`, `FIRED`, `WATCH`, `ENTRY`, `PARTIAL`, `CLOSE`). Micro-labels above metrics are lowercase or sentence case ("net p&l", "avg return / trade").
- **Person:** the UI rarely addresses the user. It narrates the bot: "filtered — hype", "fired at 9:41:03", "stopped out". When it does address you it's imperative and short: "Arm kill switch", "Switch to LIVE".
- **Numbers are the content.** Money is the loudest thing on the page. Always signed for P&L (`+$1,240`, `−$380`), always 2-dp for prices (`1.80`), always with the unit (`$`, `%`). Percentages carry a sign too (`+23%`). Partial exits use the desk shorthand `1.80/be` (took 1.80, rest moved to breakeven).
- **Time:** ET, 24h-ish desk style with seconds where it matters in the live log (`9:41:03`), relative elsewhere ("2m ago", "today"). The session window 09:30–12:00 ET is sacred context.
- **Tickers & contracts:** uppercase ticker + strike + side + qty, e.g. `SPY 588C ×4`, `QQQ 502P ×2`. `C`/`P` for call/put.
- **What the bot says vs. what Discord says.** Discord messages are quoted verbatim and often hype-y ("LOCKED IN MAJORITY 🚀", "+23% EZ"). Reezer renders them faithfully but stamps them `FILTERED` (muted, greyed) when they're noise, or `FIRED` (green) when they triggered a real order. The contrast between the loud quote and the calm system stamp is the core content tension.
- **No filler.** Every number on screen is actionable. There are no testimonials, no marketing, no decorative stats.

**Example copy:**
- KPI label / value: `net p&l` → `+$2,840.50`
- Trade row: `9:41:03 · SPY 588C ×4 · entry 1.42 · exit 1.80/be · +$152 · +26.7% · WIN`
- Discord fired: `ENTRY` · *"in SPY 588c here, size on"* · `FIRED 9:41:03`
- Discord filtered: `PARTIAL` · *"+23% already, LOCKED IN MAJORITY 🚀"* · `FILTERED · hype`
- Status line: `LIVE · budget $300/trade · kill switch ARMED · stopped out 1`

---

## VISUAL FOUNDATIONS

**Overall vibe.** Flat, dark-native, instrument-panel fintech. Surfaces are near-black planes separated by **hairline borders**, not shadows. One violet accent, green/red for money, everything else neutral. Calm and dense — information per pixel is high but never noisy, because color is rationed.

**Color.**
- *Neutrals* carry the layout. A 5-step ink ramp from `--ink-0` `#08080A` (deepest) through `--ink-2` `#151518` (card surface) to `--ink-4` `#232328` (hover). Light mode flips to a `#F6F6F8` page with pure-white cards.
- *Brand* violet `#6E5BF2` is used **sparingly**: logo, active nav, focus ring, the active strategy pill, the chart range toggle, primary buttons. If violet is doing more than ~5% of the screen, it's overused.
- *Money is green/red, always.* `--profit #21C77A` / `--loss #F0454B`. These never mean anything other than gain/loss. Wins, up-days, positive deltas → green; losses, dips, drawdown → red. `--open #4A8DF7` (blue) for live/unrealized, `--breakeven #8A8A94` (gray) for flat.
- *Discord chips* get their own hues: WATCH blue, ENTRY purple, PARTIAL amber, CLOSE teal — each as a soft-tinted pill (14–16% alpha fill + solid-color text), so the feed is scannable by type.
- Color is applied as **soft-tint backgrounds** (12–16% alpha) with a solid-color foreground for badges/chips, never as saturated fills. No gradients anywhere — flat fills only.

**Type.** `Geist` for everything UI, `Geist Mono` for every number. Big metrics are **light weight (300)** at large sizes — the "630" hero look from the reference — which reads as confident and modern. Labels are `medium (500)`, headings `semibold (600)`. Numeric data uses **tabular figures** (`font-variant-numeric: tabular-nums`) so columns align and live-ticking values never reflow. Tight negative tracking on display sizes (`-0.02em`), wide positive tracking on uppercase micro-labels (`0.08em`).

**Spacing & layout.** 8px base grid. The dashboard is a fixed 64px icon **sidebar** + a 60px **top status bar** + a scrolling content column (max ~1440px) on the `--ink-1` page. KPI cards sit in a responsive grid (6-up → wrapping). Generous internal card padding (20–24px), 16px grid gaps. Layout is calm and gridded, never asymmetric or playful.

**Cards.** The signature surface: `--ink-2` fill, **1px hairline border** (`rgba(255,255,255,0.07)`), `--radius-lg 16px` (outer panels go to `20px`). In dark mode shadows are essentially absent — the border does the separating. In light mode cards are pure white and lift off the gray page with a *whisper* shadow (`0 1px 2px / 0 4px 16px` at 5–7% alpha). Never a colored left-border accent stripe; never a heavy drop shadow.

**Borders & dividers.** Hairlines everywhere — `rgba(255,255,255,0.07)` dark, `rgba(15,15,20,0.09)` light. Table rows are separated by these, not by zebra striping. Stronger `0.12` border for inputs/interactive outlines.

**Backgrounds.** Solid flat color only. No imagery, no texture, no gradient, no noise. The depth comes purely from the ink ramp + hairlines. (This is the deliberate departure from reference IMG_4927, which leaned on gradient glass.)

**Shadows.** Minimal by design. Dark: borders only, except pop-overs (`--shadow-pop`) which get a soft `0 8px 28px rgba(0,0,0,0.4)`. Light: cards get `--shadow-sm/md`. No inner shadows, no glows — except the one allowed accent: a faint colored ring on focus (`0 0 0 3px var(--violet-soft)`).

**Corner radii.** Chips `6px`, buttons/inputs/badges `9px`, list rows/nested panels `12px`, cards `16px`, outer panels `20px`, status dots & mode pills fully round (`999px`).

**Motion.** Restrained and functional. `--ease-out cubic-bezier(0.22,1,0.36,1)` for entrances, 120–280ms. The signature motion is the **live status dot**: a 2-color pulse (`nt-pulse`, 1.6s) for live/streaming states, a one-shot `nt-ping` ring on new events, and a brief violet **`nt-tick-in`** flash on a table row when a value updates (then fades to transparent) — so the operator's eye catches what just changed. No bounces, no parallax, no decorative loops. All animation respects `prefers-reduced-motion`.

**Hover / press.** Hover = surface steps up one ink level (`--ink-2`→`--ink-4`) and/or border strengthens to `0.12`; never a color shift on neutral elements. Buttons darken/lighten ~6% on hover. Press = subtle `scale(0.98)` + the darker shade. Focus = the violet ring. Disabled = `--fg-4` text, 50% opacity, no pointer.

**Transparency & blur.** Used only for tinted semantic backgrounds (the 12–16% alpha fills on badges/chips) and the focus ring. No frosted-glass panels, no backdrop blur in the core dashboard — it stays flat and opaque for legibility and performance during live ticking.

---

## ICONOGRAPHY

- **System:** [**Lucide**](https://lucide.dev) — open-source, 1.5–2px stroke, rounded line caps. It matches the reference screenshots' thin, geometric, outline-only icon language (the home/calendar/chart glyphs in IMG_4926 and the sidebar glyphs in IMG_4928 are all this weight and style). Lucide is loaded from CDN (`https://unpkg.com/lucide@latest`) in cards and kits; document any pinned version in each file.
- **Style rules:** outline only (the brand `R` monogram is the only solid mark), uniform `1.75` stroke width, `20px` default in nav / `16px` inline, colored by `currentColor` so they inherit text color (neutral by default, semantic only when paired with a semantic value). Icons are functional, never decorative.
- **Brand mark** (`assets/logo-mark.png`) is the violet `R` square. `assets/bolt.svg` (`currentColor`) is kept as a secondary speed glyph for the live/"firing" indicator and loading state.
- **Status dots** are not icons but tiny `8px` rounded `<span>`s tinted by state (live/done/cancelled, profit/loss) — the blinking ones use the `nt-pulse` keyframe.
- **Emoji:** never authored by Reezer's own UI. The *only* place emoji appear is **inside quoted Discord messages** (e.g. "🚀"), rendered verbatim as user content — which is exactly the hype the bot filters. This contrast is intentional; don't add emoji anywhere else.
- **Substitution flag:** Lucide is a substitution for a (non-existent) bespoke set — it's a faithful match for the references' icon weight, so no visual compromise, but swap freely if a branded set is later commissioned.

---

## FONT SUBSTITUTION (please confirm)

The reference favourite uses a **paid grotesk** (the letterforms read as PP Neue Montreal / General Sans). I substituted **Geist** + **Geist Mono** (Vercel, free, on Google Fonts) as the closest freely-hostable match — a clean neutral geometric grotesk with a true tabular-figure monospace partner, ideal for a trading UI. **If you have the original font files, send them** and I'll swap the `@font-face` declarations in `tokens/fonts.css`.

---

## INDEX / MANIFEST

**Root**
- `styles.css` — global entry; `@import`s the four token files. Consumers link this only.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skill front-matter wrapper for portable use.

**`tokens/`** — `fonts.css` · `colors.css` (dark default + light override + semantic/P&L/chip aliases) · `typography.css` (Geist + scale + tabular figures) · `spacing.css` (8px grid, radii, shadows, motion + keyframes).

**`assets/`** — `logo-mark.png` (violet square + `R`) · `bolt.svg` (currentColor speed glyph).

**`components/`** — reusable React primitives (each: `.jsx` + `.d.ts` + `.prompt.md`, one card per dir):
- `core/` — `Button`, `Card`, `ModePill`, `KillSwitch`
- `trading/` — `KpiCard`, `ResultBadge`, `StatusDot`, `TypeChip`, `FiredBadge`

**`ui_kits/`**
- `dashboard/` — the full Reezer operator workspace (`index.html` + screen JSX) with a labeled sidebar routing four subpages: **Trades** (personalized greeting, date filter, KPI grid, live trades + per-trade P&L column chart, Discord firing feed), **Log** (full firing-log table with All/Fired/Filtered tabs), **Backtesting** (strategy equity curve + results), **Strategies** (status cards). Top status bar carries mode, budget, live-strategy and kill switch; clicking any trade opens a slide-over detail panel.

**Design System tab** — foundation specimen cards live next to the tokens/assets and are tagged `@dsCard` (groups: Type, Colors, Spacing, Brand, Components, Dashboard).

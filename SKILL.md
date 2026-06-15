---
name: Reezer-design
description: Use this skill to generate well-branded interfaces and assets for Reezer, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping. Reezer is a flat dark-capable fintech dashboard for an automated 0DTE options bot (Discord-driven, Charles Schwab API, DRY-RUN / LIVE).
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick map
- `readme.md` — the full design guide: brand, content fundamentals, visual foundations, iconography, font substitution note, and a file index. **Start here.**
- `styles.css` — the only stylesheet to link; `@import`s all tokens + fonts.
- `tokens/` — `colors.css` (dark default + `[data-theme="light"]` override; P&L green/red, Discord chip hues, mode/kill states), `typography.css` (Geist + Geist Mono, tabular figures), `spacing.css` (8px grid, radii, shadows, motion keyframes), `fonts.css`.
- `assets/` — `logo-mark.png` (violet square + bolt), `bolt.svg` (currentColor glyph).
- `components/` — React primitives: `core/` (Button, Card, ModePill, KillSwitch), `trading/` (KpiCard, ResultBadge, StatusDot, TypeChip, FiredBadge). Each has a `.d.ts`, `.prompt.md`, and a `@dsCard` demo HTML.
- `ui_kits/dashboard/` — the full operator dashboard recreation (open `index.html`).
- `guidelines/` — foundation specimen cards (colors, type, spacing, brand).

## Non-negotiables
- Flat fintech, **no gradients** anywhere. Surfaces separated by hairline borders, not heavy shadows.
- **Money is green (profit) / red (loss), always** — never the violet brand color. Blue = open/unrealized, gray = breakeven.
- One violet accent, rationed (~5% of screen): logo, focus, active nav, the live-strategy pill, primary buttons.
- Numbers use Geist Mono with tabular figures. Big metrics are light-weight (300).
- Emoji appear ONLY inside quoted Discord messages (the hype the bot filters) — never in Reezer's own UI.
- Lowercase brand name `Reezer`; UPPERCASE only for status/type tokens (LIVE, DRY-RUN, WIN, FIRED, ENTRY…).
- Supports light + dark via `data-theme` on `<html>`.

## Font note
Geist / Geist Mono substitute for the reference's paid grotesk — swap `tokens/fonts.css` if licensing the original.

import React from "react";

/**
 * ResultBadge — outcome of a trade. The core P&L semantic token.
 * WIN=green, LOSS=red, OPEN=blue (live/unrealized), BE/breakeven=gray.
 */
export function ResultBadge({ result = "OPEN", size = "md", style, ...rest }) {
  const r = String(result).toUpperCase();
  const map = {
    WIN:  { c: "var(--profit)",    bg: "var(--profit-bg)",    label: "WIN" },
    LOSS: { c: "var(--loss)",      bg: "var(--loss-bg)",      label: "LOSS" },
    OPEN: { c: "var(--open)",      bg: "var(--open-bg)",      label: "OPEN" },
    BE:   { c: "var(--breakeven)", bg: "var(--breakeven-bg)", label: "BE" },
    BREAKEVEN: { c: "var(--breakeven)", bg: "var(--breakeven-bg)", label: "BE" },
  };
  const v = map[r] || map.OPEN;
  const h = size === "sm" ? 18 : 22;
  const fs = size === "sm" ? "var(--t-2xs)" : "var(--t-xs)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: h,
        padding: "0 8px",
        borderRadius: "var(--radius-xs)",
        background: v.bg,
        color: v.c,
        font: `var(--w-semibold) ${fs}/1 var(--font-sans)`,
        letterSpacing: "var(--ls-caps)",
        ...style,
      }}
      {...rest}
    >
      {v.label}
    </span>
  );
}

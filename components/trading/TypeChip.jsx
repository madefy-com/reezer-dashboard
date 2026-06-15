import React from "react";

/**
 * TypeChip — classifies a Discord message in the firing log.
 * WATCH=blue, ENTRY=purple, PARTIAL=amber, CLOSE=teal.
 * Soft-tinted pill with solid-color text.
 */
export function TypeChip({ type = "WATCH", style, ...rest }) {
  const t = String(type).toUpperCase();
  const map = {
    WATCH:   { c: "var(--chip-watch)",   bg: "var(--chip-watch-bg)" },
    ENTRY:   { c: "var(--chip-entry)",   bg: "var(--chip-entry-bg)" },
    PARTIAL: { c: "var(--chip-partial)", bg: "var(--chip-partial-bg)" },
    CLOSE:   { c: "var(--chip-close)",   bg: "var(--chip-close-bg)" },
  };
  const v = map[t] || map.WATCH;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: 20,
        minWidth: 58,
        padding: "0 9px",
        borderRadius: "var(--radius-xs)",
        background: v.bg,
        color: v.c,
        font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)",
        letterSpacing: "var(--ls-caps)",
        ...style,
      }}
      {...rest}
    >
      {t}
    </span>
  );
}

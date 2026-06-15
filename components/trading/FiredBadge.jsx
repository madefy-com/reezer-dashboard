import React from "react";

/**
 * FiredBadge — did a Discord message trigger a real order?
 * FIRED = green, executed. FILTERED = muted/greyed, with an optional
 * reason (e.g. "hype", "+23% brag", "dupe").
 */
export function FiredBadge({ fired = false, reason = null, style, ...rest }) {
  if (fired) {
    return (
      <span
        style={{
          display: "inline-flex", alignItems: "center", gap: 5, height: 20, padding: "0 8px 0 7px",
          borderRadius: "var(--radius-xs)", background: "var(--fired-bg)", color: "var(--fired)",
          font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)",
          ...style,
        }}
        {...rest}
      >
        <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--fired)" }} />
        FIRED
      </span>
    );
  }
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5, height: 20, padding: "0 8px",
        borderRadius: "var(--radius-xs)", background: "var(--filtered-bg)", color: "var(--filtered)",
        font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-wide)",
        border: "1px solid var(--border)",
        ...style,
      }}
      {...rest}
    >
      FILTERED{reason ? ` · ${reason}` : ""}
    </span>
  );
}

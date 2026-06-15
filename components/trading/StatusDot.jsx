import React from "react";

/**
 * StatusDot — a small blinking status indicator for live processes.
 * live = pulsing green ring (streaming/firing), done = solid gray,
 * cancelled = hollow red, plus profit/loss/open passthroughs.
 * Optional text label.
 */
export function StatusDot({ status = "live", label = null, size = 8, style, ...rest }) {
  const map = {
    live:      { c: "var(--profit)",    pulse: true,  text: "live" },
    firing:    { c: "var(--accent)",    pulse: true,  text: "firing" },
    done:      { c: "var(--breakeven)", pulse: false, text: "done" },
    cancelled: { c: "var(--loss)",      pulse: false, text: "cancelled", hollow: true },
    open:      { c: "var(--open)",      pulse: true,  text: "open" },
    profit:    { c: "var(--profit)",    pulse: false, text: "" },
    loss:      { c: "var(--loss)",      pulse: false, text: "" },
  };
  const v = map[status] || map.live;
  const text = label === true ? v.text : label;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, ...style }} {...rest}>
      <span style={{ position: "relative", display: "inline-flex", width: size, height: size, flex: "none", color: v.c }}>
        {v.pulse && (
          <span aria-hidden style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: v.c, opacity: 0.5,
            animation: "nt-pulse var(--blink) var(--ease-in-out) infinite",
          }} />
        )}
        <span style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: v.hollow ? "transparent" : v.c,
          border: v.hollow ? `2px solid ${"var(--loss)"}` : "none",
          boxSizing: "border-box",
        }} />
      </span>
      {text && (
        <span style={{ font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)", color: "var(--text-secondary)", letterSpacing: "var(--ls-snug)" }}>
          {text}
        </span>
      )}
    </span>
  );
}

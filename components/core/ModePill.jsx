import React from "react";

/**
 * ModePill — the run-mode indicator in the top status bar.
 * LIVE = real money (green, pulsing dot). DRY-RUN = simulation (amber).
 * Clickable when onToggle is provided.
 */
export function ModePill({ mode = "DRY-RUN", onToggle, style, ...rest }) {
  const live = mode === "LIVE";
  const c = live ? "var(--live)" : "var(--dryrun)";
  const bg = live ? "var(--live-bg)" : "var(--dryrun-bg)";
  const label = live ? "LIVE" : "DRY-RUN";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="nt-modepill"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        height: 30,
        padding: "0 12px 0 10px",
        borderRadius: "var(--radius-sm)",
        background: bg,
        border: `1px solid color-mix(in srgb, ${c} 34%, transparent)`,
        color: c,
        font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)",
        letterSpacing: "var(--ls-caps)",
        cursor: onToggle ? "pointer" : "default",
        transition: "filter var(--dur)",
        ...style,
      }}
      {...rest}
    >
      <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: c, animation: live ? "nt-pulse var(--blink) var(--ease-in-out) infinite" : "none" }} />
      </span>
      {label}
      <style>{`.nt-modepill:hover{ filter: brightness(1.12); }`}</style>
    </button>
  );
}

import React from "react";

/**
 * KillSwitch — the bot's hardware-style safety toggle.
 * ACTIVE (green) = bot may place orders. DEACTIVATED (red) = all trading halted.
 * Deliberately heavier than a normal switch; this stops real money.
 */
export function KillSwitch({ state = "ARMED", onToggle, label = true, style, ...rest }) {
  const armed = state === "ARMED";
  const c = armed ? "var(--live)" : "var(--danger)";
  const bg = armed ? "var(--live-bg)" : "var(--danger-bg)";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={armed}
      onClick={onToggle}
      className="nt-kill"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        height: 30,
        padding: "0 10px",
        borderRadius: "var(--radius-sm)",
        background: bg,
        border: `1px solid color-mix(in srgb, ${c} 32%, transparent)`,
        color: c,
        cursor: "pointer",
        transition: "filter var(--dur)",
        ...style,
      }}
      {...rest}
    >
      <span
        aria-hidden
        style={{
          position: "relative",
          width: 30,
          height: 16,
          borderRadius: "var(--radius-pill)",
          background: `color-mix(in srgb, ${c} 26%, transparent)`,
          transition: "background var(--dur)",
          flex: "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: armed ? 16 : 2,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: c,
            transition: "left var(--dur) var(--ease-out)",
          }}
        />
      </span>
      {label && (
        <span style={{ font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)", letterSpacing: "var(--ls-caps)" }}>
          {armed ? "ACTIVE" : "DEACTIVATED"}
        </span>
      )}
      <style>{`.nt-kill:hover{ filter: brightness(1.1); } .nt-kill:focus-visible{ outline:none; box-shadow: var(--ring-focus); }`}</style>
    </button>
  );
}

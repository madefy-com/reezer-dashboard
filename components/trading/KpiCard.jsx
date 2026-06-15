import React from "react";

/**
 * KpiCard — a single headline metric (the "630" hero look, scaled down).
 * Lowercase micro-label, large light-weight mono value, signed delta,
 * optional sub note. `tone` colors the value for P&L (profit/loss).
 */
export function KpiCard({
  label,
  value,
  delta = null,
  deltaDir = null,     // "up" | "down" | null (auto from delta sign if numeric string)
  sub = null,
  tone = "neutral",    // "neutral" | "profit" | "loss"
  icon = null,
  style,
  ...rest
}) {
  const toneColor = tone === "profit" ? "var(--profit)" : tone === "loss" ? "var(--loss)" : "var(--text-primary)";

  let dir = deltaDir;
  if (!dir && typeof delta === "string") {
    if (delta.trim().startsWith("+")) dir = "up";
    else if (delta.trim().startsWith("-") || delta.trim().startsWith("\u2212")) dir = "down";
  }
  const deltaColor = dir === "up" ? "var(--profit)" : dir === "down" ? "var(--loss)" : "var(--text-secondary)";
  const deltaBg = dir === "up" ? "var(--profit-bg)" : dir === "down" ? "var(--loss-bg)" : "var(--surface-inset)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "18px 18px 16px",
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        minWidth: 0,
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{
          font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
          letterSpacing: "var(--ls-wide)",
          textTransform: "lowercase",
          color: "var(--text-tertiary)",
        }}>
          {label}
        </span>
        {icon && <span style={{ display: "inline-flex", width: 15, height: 15, color: "var(--text-tertiary)" }} aria-hidden>{icon}</span>}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <span style={{
          font: "var(--w-light) var(--t-kpi)/1 var(--font-mono)",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "var(--ls-tight)",
          color: toneColor,
        }}>
          {value}
        </span>
        {delta != null && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 3, height: 18, padding: "0 6px",
            borderRadius: "var(--radius-xs)", background: deltaBg, color: deltaColor,
            font: "var(--w-semibold) var(--t-2xs)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums",
          }}>
            {dir === "up" ? "\u2191" : dir === "down" ? "\u2193" : ""}{delta}
          </span>
        )}
      </div>

      {sub && (
        <span style={{ font: "var(--w-regular) var(--t-xs)/1.3 var(--font-sans)", color: "var(--text-tertiary)" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

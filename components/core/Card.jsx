import React from "react";

/**
 * Card — the signature Reezer surface.
 * Flat ink-2 fill, 1px hairline border, 16px radius. Optional header
 * (title + right-aligned action slot) and padded body.
 */
export function Card({
  title = null,
  action = null,
  padding = 20,
  inset = false,
  interactive = false,
  as = "div",
  style,
  bodyStyle,
  children,
  ...rest
}) {
  const Tag = as;
  return (
    <Tag
      className="nt-card"
      data-interactive={interactive ? "" : undefined}
      style={{
        background: inset ? "var(--surface-inset)" : "var(--surface-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        transition: "border-color var(--dur) var(--ease-out), background var(--dur)",
        ...style,
      }}
      {...rest}
    >
      {title && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: `${padding - 4}px ${padding}px`,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span style={{ font: "var(--w-semibold) var(--t-h3)/1.2 var(--font-sans)", letterSpacing: "var(--ls-snug)", color: "var(--text-primary)" }}>
            {title}
          </span>
          {action && <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{action}</span>}
        </div>
      )}
      <div style={{ padding, ...bodyStyle }}>{children}</div>
      <style>{`
        .nt-card[data-interactive]{ cursor: pointer; }
        .nt-card[data-interactive]:hover{ border-color: var(--border-strong); background: var(--surface-hover); }
      `}</style>
    </Tag>
  );
}

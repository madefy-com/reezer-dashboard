import React from "react";

/**
 * Button — Reezer's primary action control.
 * Flat, hairline-bordered, no gradients. Violet = primary brand action.
 * Danger variant is reserved for irreversible / money-moving actions
 * (arm kill switch, switch to LIVE).
 */
export function Button({
  variant = "secondary",
  size = "md",
  icon = null,
  iconRight = null,
  disabled = false,
  full = false,
  type = "button",
  onClick,
  style,
  children,
  ...rest
}) {
  const sizes = {
    sm: { h: 30, px: 10, fs: 13, gap: 6, icon: 15 },
    md: { h: 36, px: 14, fs: 14, gap: 7, icon: 16 },
    lg: { h: 44, px: 18, fs: 15, gap: 8, icon: 18 },
  };
  const s = sizes[size] || sizes.md;

  const variants = {
    primary: {
      background: "var(--accent)",
      color: "var(--accent-fg)",
      border: "1px solid transparent",
    },
    secondary: {
      background: "var(--surface-inset)",
      color: "var(--text-primary)",
      border: "1px solid var(--border-strong)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
      border: "1px solid transparent",
    },
    danger: {
      background: "var(--danger-bg)",
      color: "var(--danger)",
      border: "1px solid color-mix(in srgb, var(--danger) 32%, transparent)",
    },
  };
  const v = variants[variant] || variants.secondary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="nt-btn"
      data-variant={variant}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        height: s.h,
        padding: `0 ${s.px}px`,
        width: full ? "100%" : undefined,
        font: `var(--w-medium) ${s.fs}px/1 var(--font-sans)`,
        letterSpacing: "var(--ls-snug)",
        borderRadius: "var(--radius-sm)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        whiteSpace: "nowrap",
        transition: "background var(--dur) var(--ease-out), border-color var(--dur), transform var(--dur-fast)",
        ...v,
        ...style,
      }}
      {...rest}
    >
      {icon && <span style={{ display: "inline-flex", width: s.icon, height: s.icon }} aria-hidden>{icon}</span>}
      {children}
      {iconRight && <span style={{ display: "inline-flex", width: s.icon, height: s.icon }} aria-hidden>{iconRight}</span>}
      <style>{`
        .nt-btn[data-variant="primary"]:hover:not(:disabled){ background: var(--violet-600); }
        .nt-btn[data-variant="secondary"]:hover:not(:disabled){ background: var(--surface-hover); border-color: var(--line-3); }
        .nt-btn[data-variant="ghost"]:hover:not(:disabled){ background: var(--surface-inset); color: var(--text-primary); }
        .nt-btn[data-variant="danger"]:hover:not(:disabled){ background: color-mix(in srgb, var(--danger) 22%, transparent); }
        .nt-btn:active:not(:disabled){ transform: scale(0.98); }
        .nt-btn:focus-visible{ outline: none; box-shadow: var(--ring-focus); }
      `}</style>
    </button>
  );
}

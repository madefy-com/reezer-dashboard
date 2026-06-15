/* @ds-bundle: {"format":3,"namespace":"NitroTraderDesignSystem_95e598","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"KillSwitch","sourcePath":"components/core/KillSwitch.jsx"},{"name":"ModePill","sourcePath":"components/core/ModePill.jsx"},{"name":"FiredBadge","sourcePath":"components/trading/FiredBadge.jsx"},{"name":"KpiCard","sourcePath":"components/trading/KpiCard.jsx"},{"name":"ResultBadge","sourcePath":"components/trading/ResultBadge.jsx"},{"name":"StatusDot","sourcePath":"components/trading/StatusDot.jsx"},{"name":"TypeChip","sourcePath":"components/trading/TypeChip.jsx"}],"sourceHashes":{"components/core/Button.jsx":"5b19591d917e","components/core/Card.jsx":"e51e46b827eb","components/core/KillSwitch.jsx":"432d93e9667a","components/core/ModePill.jsx":"710f8c78f983","components/trading/FiredBadge.jsx":"9fcb7688d774","components/trading/KpiCard.jsx":"9aaafc77a9ba","components/trading/ResultBadge.jsx":"fd839f9b0669","components/trading/StatusDot.jsx":"8b9cbf46910f","components/trading/TypeChip.jsx":"d55823e35915","ui_kits/dashboard/App.jsx":"c2361fba515d","ui_kits/dashboard/BacktestingPage.jsx":"402facbf112b","ui_kits/dashboard/DashboardPage.jsx":"5d4a077e4cf6","ui_kits/dashboard/DiscordLog.jsx":"251b21e415d6","ui_kits/dashboard/KpiRow.jsx":"25dbf39182cc","ui_kits/dashboard/LogPage.jsx":"5fe3520aac5d","ui_kits/dashboard/PnlChart.jsx":"55d713602f26","ui_kits/dashboard/Shared.jsx":"5cfa084dd8a8","ui_kits/dashboard/Sidebar.jsx":"8c4adc8dbed9","ui_kits/dashboard/StatusBar.jsx":"974cddc810e1","ui_kits/dashboard/StrategiesPage.jsx":"b7cf4dcc90f5","ui_kits/dashboard/TradeDetail.jsx":"a15c57aa3661","ui_kits/dashboard/TradesLog.jsx":"3efd0ac2d4ac","ui_kits/dashboard/TradesPage.jsx":"5d5f3103519b","ui_kits/dashboard/data.js":"b025eb012005"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.NitroTraderDesignSystem_95e598 = window.NitroTraderDesignSystem_95e598 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — Reezer's primary action control.
 * Flat, hairline-bordered, no gradients. Violet = primary brand action.
 * Danger variant is reserved for irreversible / money-moving actions
 * (arm kill switch, switch to LIVE).
 */
function Button({
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
    sm: {
      h: 30,
      px: 10,
      fs: 13,
      gap: 6,
      icon: 15
    },
    md: {
      h: 36,
      px: 14,
      fs: 14,
      gap: 7,
      icon: 16
    },
    lg: {
      h: 44,
      px: 18,
      fs: 15,
      gap: 8,
      icon: 18
    }
  };
  const s = sizes[size] || sizes.md;
  const variants = {
    primary: {
      background: "var(--accent)",
      color: "var(--accent-fg)",
      border: "1px solid transparent"
    },
    secondary: {
      background: "var(--surface-inset)",
      color: "var(--text-primary)",
      border: "1px solid var(--border-strong)"
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
      border: "1px solid transparent"
    },
    danger: {
      background: "var(--danger-bg)",
      color: "var(--danger)",
      border: "1px solid color-mix(in srgb, var(--danger) 32%, transparent)"
    }
  };
  const v = variants[variant] || variants.secondary;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    className: "nt-btn",
    "data-variant": variant,
    style: {
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
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: s.icon,
      height: s.icon
    },
    "aria-hidden": true
  }, icon), children, iconRight && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: s.icon,
      height: s.icon
    },
    "aria-hidden": true
  }, iconRight), /*#__PURE__*/React.createElement("style", null, `
        .nt-btn[data-variant="primary"]:hover:not(:disabled){ background: var(--violet-600); }
        .nt-btn[data-variant="secondary"]:hover:not(:disabled){ background: var(--surface-hover); border-color: var(--line-3); }
        .nt-btn[data-variant="ghost"]:hover:not(:disabled){ background: var(--surface-inset); color: var(--text-primary); }
        .nt-btn[data-variant="danger"]:hover:not(:disabled){ background: color-mix(in srgb, var(--danger) 22%, transparent); }
        .nt-btn:active:not(:disabled){ transform: scale(0.98); }
        .nt-btn:focus-visible{ outline: none; box-shadow: var(--ring-focus); }
      `));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — the signature Reezer surface.
 * Flat ink-2 fill, 1px hairline border, 16px radius. Optional header
 * (title + right-aligned action slot) and padded body.
 */
function Card({
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
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: "nt-card",
    "data-interactive": interactive ? "" : undefined,
    style: {
      background: inset ? "var(--surface-inset)" : "var(--surface-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      transition: "border-color var(--dur) var(--ease-out), background var(--dur)",
      ...style
    }
  }, rest), title && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: `${padding - 4}px ${padding}px`,
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-semibold) var(--t-h3)/1.2 var(--font-sans)",
      letterSpacing: "var(--ls-snug)",
      color: "var(--text-primary)"
    }
  }, title), action && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8
    }
  }, action)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding,
      ...bodyStyle
    }
  }, children), /*#__PURE__*/React.createElement("style", null, `
        .nt-card[data-interactive]{ cursor: pointer; }
        .nt-card[data-interactive]:hover{ border-color: var(--border-strong); background: var(--surface-hover); }
      `));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/KillSwitch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * KillSwitch — the bot's hardware-style safety toggle.
 * ACTIVE (green) = bot may place orders. DEACTIVATED (red) = all trading halted.
 * Deliberately heavier than a normal switch; this stops real money.
 */
function KillSwitch({
  state = "ARMED",
  onToggle,
  label = true,
  style,
  ...rest
}) {
  const armed = state === "ARMED";
  const c = armed ? "var(--live)" : "var(--danger)";
  const bg = armed ? "var(--live-bg)" : "var(--danger-bg)";
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    role: "switch",
    "aria-checked": armed,
    onClick: onToggle,
    className: "nt-kill",
    style: {
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
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      position: "relative",
      width: 30,
      height: 16,
      borderRadius: "var(--radius-pill)",
      background: `color-mix(in srgb, ${c} 26%, transparent)`,
      transition: "background var(--dur)",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      left: armed ? 16 : 2,
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: c,
      transition: "left var(--dur) var(--ease-out)"
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-caps)"
    }
  }, armed ? "ACTIVE" : "DEACTIVATED"), /*#__PURE__*/React.createElement("style", null, `.nt-kill:hover{ filter: brightness(1.1); } .nt-kill:focus-visible{ outline:none; box-shadow: var(--ring-focus); }`));
}
Object.assign(__ds_scope, { KillSwitch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/KillSwitch.jsx", error: String((e && e.message) || e) }); }

// components/core/ModePill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ModePill — the run-mode indicator in the top status bar.
 * LIVE = real money (green, pulsing dot). DRY-RUN = simulation (amber).
 * Clickable when onToggle is provided.
 */
function ModePill({
  mode = "DRY-RUN",
  onToggle,
  style,
  ...rest
}) {
  const live = mode === "LIVE";
  const c = live ? "var(--live)" : "var(--dryrun)";
  const bg = live ? "var(--live-bg)" : "var(--dryrun-bg)";
  const label = live ? "LIVE" : "DRY-RUN";
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onToggle,
    className: "nt-modepill",
    style: {
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
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      width: 8,
      height: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      background: c,
      animation: live ? "nt-pulse var(--blink) var(--ease-in-out) infinite" : "none"
    }
  })), label, /*#__PURE__*/React.createElement("style", null, `.nt-modepill:hover{ filter: brightness(1.12); }`));
}
Object.assign(__ds_scope, { ModePill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ModePill.jsx", error: String((e && e.message) || e) }); }

// components/trading/FiredBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * FiredBadge — did a Discord message trigger a real order?
 * FIRED = green, executed. FILTERED = muted/greyed, with an optional
 * reason (e.g. "hype", "+23% brag", "dupe").
 */
function FiredBadge({
  fired = false,
  reason = null,
  style,
  ...rest
}) {
  if (fired) {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 20,
        padding: "0 8px 0 7px",
        borderRadius: "var(--radius-xs)",
        background: "var(--fired-bg)",
        color: "var(--fired)",
        font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)",
        letterSpacing: "var(--ls-caps)",
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement("span", {
      "aria-hidden": true,
      style: {
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "var(--fired)"
      }
    }), "FIRED");
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      height: 20,
      padding: "0 8px",
      borderRadius: "var(--radius-xs)",
      background: "var(--filtered-bg)",
      color: "var(--filtered)",
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-wide)",
      border: "1px solid var(--border)",
      ...style
    }
  }, rest), "FILTERED", reason ? ` · ${reason}` : "");
}
Object.assign(__ds_scope, { FiredBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trading/FiredBadge.jsx", error: String((e && e.message) || e) }); }

// components/trading/KpiCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * KpiCard — a single headline metric (the "630" hero look, scaled down).
 * Lowercase micro-label, large light-weight mono value, signed delta,
 * optional sub note. `tone` colors the value for P&L (profit/loss).
 */
function KpiCard({
  label,
  value,
  delta = null,
  deltaDir = null,
  // "up" | "down" | null (auto from delta sign if numeric string)
  sub = null,
  tone = "neutral",
  // "neutral" | "profit" | "loss"
  icon = null,
  style,
  ...rest
}) {
  const toneColor = tone === "profit" ? "var(--profit)" : tone === "loss" ? "var(--loss)" : "var(--text-primary)";
  let dir = deltaDir;
  if (!dir && typeof delta === "string") {
    if (delta.trim().startsWith("+")) dir = "up";else if (delta.trim().startsWith("-") || delta.trim().startsWith("\u2212")) dir = "down";
  }
  const deltaColor = dir === "up" ? "var(--profit)" : dir === "down" ? "var(--loss)" : "var(--text-secondary)";
  const deltaBg = dir === "up" ? "var(--profit-bg)" : dir === "down" ? "var(--loss-bg)" : "var(--surface-inset)";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      padding: "18px 18px 16px",
      background: "var(--surface-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      minWidth: 0,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-wide)",
      textTransform: "lowercase",
      color: "var(--text-tertiary)"
    }
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 15,
      height: 15,
      color: "var(--text-tertiary)"
    },
    "aria-hidden": true
  }, icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-light) var(--t-kpi)/1 var(--font-mono)",
      fontVariantNumeric: "tabular-nums",
      letterSpacing: "var(--ls-tight)",
      color: toneColor
    }
  }, value), delta != null && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      height: 18,
      padding: "0 6px",
      borderRadius: "var(--radius-xs)",
      background: deltaBg,
      color: deltaColor,
      font: "var(--w-semibold) var(--t-2xs)/1 var(--font-mono)",
      fontVariantNumeric: "tabular-nums"
    }
  }, dir === "up" ? "\u2191" : dir === "down" ? "\u2193" : "", delta)), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-regular) var(--t-xs)/1.3 var(--font-sans)",
      color: "var(--text-tertiary)"
    }
  }, sub));
}
Object.assign(__ds_scope, { KpiCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trading/KpiCard.jsx", error: String((e && e.message) || e) }); }

// components/trading/ResultBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ResultBadge — outcome of a trade. The core P&L semantic token.
 * WIN=green, LOSS=red, OPEN=blue (live/unrealized), BE/breakeven=gray.
 */
function ResultBadge({
  result = "OPEN",
  size = "md",
  style,
  ...rest
}) {
  const r = String(result).toUpperCase();
  const map = {
    WIN: {
      c: "var(--profit)",
      bg: "var(--profit-bg)",
      label: "WIN"
    },
    LOSS: {
      c: "var(--loss)",
      bg: "var(--loss-bg)",
      label: "LOSS"
    },
    OPEN: {
      c: "var(--open)",
      bg: "var(--open-bg)",
      label: "OPEN"
    },
    BE: {
      c: "var(--breakeven)",
      bg: "var(--breakeven-bg)",
      label: "BE"
    },
    BREAKEVEN: {
      c: "var(--breakeven)",
      bg: "var(--breakeven-bg)",
      label: "BE"
    }
  };
  const v = map[r] || map.OPEN;
  const h = size === "sm" ? 18 : 22;
  const fs = size === "sm" ? "var(--t-2xs)" : "var(--t-xs)";
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
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
      ...style
    }
  }, rest), v.label);
}
Object.assign(__ds_scope, { ResultBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trading/ResultBadge.jsx", error: String((e && e.message) || e) }); }

// components/trading/StatusDot.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatusDot — a small blinking status indicator for live processes.
 * live = pulsing green ring (streaming/firing), done = solid gray,
 * cancelled = hollow red, plus profit/loss/open passthroughs.
 * Optional text label.
 */
function StatusDot({
  status = "live",
  label = null,
  size = 8,
  style,
  ...rest
}) {
  const map = {
    live: {
      c: "var(--profit)",
      pulse: true,
      text: "live"
    },
    firing: {
      c: "var(--accent)",
      pulse: true,
      text: "firing"
    },
    done: {
      c: "var(--breakeven)",
      pulse: false,
      text: "done"
    },
    cancelled: {
      c: "var(--loss)",
      pulse: false,
      text: "cancelled",
      hollow: true
    },
    open: {
      c: "var(--open)",
      pulse: true,
      text: "open"
    },
    profit: {
      c: "var(--profit)",
      pulse: false,
      text: ""
    },
    loss: {
      c: "var(--loss)",
      pulse: false,
      text: ""
    }
  };
  const v = map[status] || map.live;
  const text = label === true ? v.text : label;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      width: size,
      height: size,
      flex: "none",
      color: v.c
    }
  }, v.pulse && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      background: v.c,
      opacity: 0.5,
      animation: "nt-pulse var(--blink) var(--ease-in-out) infinite"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      background: v.hollow ? "transparent" : v.c,
      border: v.hollow ? `2px solid ${"var(--loss)"}` : "none",
      boxSizing: "border-box"
    }
  })), text && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)",
      color: "var(--text-secondary)",
      letterSpacing: "var(--ls-snug)"
    }
  }, text));
}
Object.assign(__ds_scope, { StatusDot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trading/StatusDot.jsx", error: String((e && e.message) || e) }); }

// components/trading/TypeChip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * TypeChip — classifies a Discord message in the firing log.
 * WATCH=blue, ENTRY=purple, PARTIAL=amber, CLOSE=teal.
 * Soft-tinted pill with solid-color text.
 */
function TypeChip({
  type = "WATCH",
  style,
  ...rest
}) {
  const t = String(type).toUpperCase();
  const map = {
    WATCH: {
      c: "var(--chip-watch)",
      bg: "var(--chip-watch-bg)"
    },
    ENTRY: {
      c: "var(--chip-entry)",
      bg: "var(--chip-entry-bg)"
    },
    PARTIAL: {
      c: "var(--chip-partial)",
      bg: "var(--chip-partial-bg)"
    },
    CLOSE: {
      c: "var(--chip-close)",
      bg: "var(--chip-close-bg)"
    }
  };
  const v = map[t] || map.WATCH;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
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
      ...style
    }
  }, rest), t);
}
Object.assign(__ds_scope, { TypeChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trading/TypeChip.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/App.jsx
try { (() => {
/* App — Reezer operator dashboard shell with page routing. */
function App() {
  const [page, setPage] = React.useState("dashboard");
  const [mode, setMode] = React.useState(window.NT_DATA.session.mode);
  const [kill, setKill] = React.useState("ARMED");
  const [clock, setClock] = React.useState("");
  React.useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  });
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons({
      attrs: {
        "stroke-width": 1.75
      }
    });
  });
  const renderPage = () => {
    if (page === "trades") return /*#__PURE__*/React.createElement(TradesPage, null);
    if (page === "log") return /*#__PURE__*/React.createElement(LogPage, null);
    if (page === "backtesting") return /*#__PURE__*/React.createElement(BacktestingPage, null);
    if (page === "strategies") return /*#__PURE__*/React.createElement(StrategiesPage, null);
    return /*#__PURE__*/React.createElement(DashboardPage, {
      mode: mode,
      kill: kill
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: "var(--bg-app)"
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    page: page,
    onNav: setPage
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(StatusBar, {
    mode: mode,
    setMode: setMode,
    kill: kill,
    setKill: setKill,
    clock: clock,
    onNav: setPage
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minHeight: 0,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--content-max)",
      width: "100%",
      margin: "0 auto",
      padding: "22px 26px 24px",
      flex: 1,
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      overflowY: page === "dashboard" ? "hidden" : "auto"
    }
  }, renderPage()))));
}
Object.assign(window, {
  App
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/BacktestingPage.jsx
try { (() => {
/* BacktestingPage — strategy equity curve + result stats. */
function BacktestingPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const bt = window.NT_DATA.backtest;
  const strategies = window.NT_DATA.strategies;
  const [strat, setStrat] = React.useState(bt.strategy);
  const [range, setRange] = React.useState("month");

  // equity curve geometry
  const eq = bt.equity;
  const W = 920,
    H = 300,
    mL = 46,
    mR = 16,
    mT = 18,
    mB = 28;
  const max = 40,
    min = 0;
  const ix = i => mL + i * (W - mL - mR) / (eq.length - 1);
  const iy = v => mT + (1 - (v - min) / (max - min)) * (H - mT - mB);
  const line = eq.map((v, i) => (i ? "L" : "M") + ix(i).toFixed(1) + " " + iy(v).toFixed(1)).join(" ");
  const area = line + ` L ${ix(eq.length - 1).toFixed(1)} ${iy(0).toFixed(1)} L ${mL} ${iy(0).toFixed(1)} Z`;
  const yTicks = [0, 10, 20, 30, 40];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--gap-grid)"
    }
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: "Backtesting",
    subtitle: "Replay a strategy over historical sessions",
    right: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        display: "inline-flex"
      }
    }, /*#__PURE__*/React.createElement("select", {
      value: strat,
      onChange: e => setStrat(e.target.value),
      style: {
        appearance: "none",
        height: 32,
        padding: "0 30px 0 12px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-strong)",
        background: "var(--surface-card)",
        color: "var(--text-primary)",
        font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)",
        cursor: "pointer"
      }
    }, strategies.map(s => /*#__PURE__*/React.createElement("option", {
      key: s.name,
      value: s.name
    }, s.name))), /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        right: 10,
        top: 9,
        pointerEvents: "none",
        color: "var(--text-tertiary)"
      }
    }, /*#__PURE__*/React.createElement(Ico, {
      name: "chevron-down",
      size: 14
    }))), /*#__PURE__*/React.createElement(DateFilter, {
      value: range,
      onChange: setRange
    }), /*#__PURE__*/React.createElement(NT.Button, {
      variant: "primary",
      size: "md",
      icon: /*#__PURE__*/React.createElement(Ico, {
        name: "play",
        size: 15
      })
    }, "Run"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1.7fr) minmax(0,1fr)",
      gap: "var(--gap-grid)",
      alignItems: "start"
    },
    className: "nt-body"
  }, /*#__PURE__*/React.createElement(NT.Card, {
    title: "Equity curve · " + strat,
    action: /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)",
        color: "var(--text-tertiary)"
      }
    }, bt.range)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 12,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "num",
    style: {
      font: "var(--w-light) 34px/1 var(--font-mono)",
      letterSpacing: "var(--ls-tight)",
      color: "var(--profit)"
    }
  }, "+38.4%"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)",
      color: "var(--text-tertiary)"
    }
  }, "cumulative return \xB7 30 sessions")), /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    width: "100%",
    style: {
      display: "block"
    }
  }, yTicks.map(v => /*#__PURE__*/React.createElement("g", {
    key: v
  }, /*#__PURE__*/React.createElement("line", {
    x1: mL,
    y1: iy(v),
    x2: W - mR,
    y2: iy(v),
    stroke: "var(--border)",
    strokeDasharray: v === 0 ? "none" : "3 4"
  }), /*#__PURE__*/React.createElement("text", {
    x: mL - 10,
    y: iy(v) + 4,
    textAnchor: "end",
    fill: "var(--text-tertiary)",
    style: {
      font: "var(--w-regular) 11px/1 var(--font-mono)"
    }
  }, v, "%"))), /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: "var(--violet-soft)"
  }), /*#__PURE__*/React.createElement("path", {
    d: line,
    fill: "none",
    stroke: "var(--accent)",
    strokeWidth: "2.25",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: ix(eq.length - 1),
    cy: iy(eq[eq.length - 1]),
    r: "4.5",
    fill: "var(--accent)",
    stroke: "var(--ink-2)",
    strokeWidth: "2.5"
  }), ["S-30", "S-20", "S-10", "now"].map((lbl, k) => /*#__PURE__*/React.createElement("text", {
    key: lbl,
    x: ix(Math.round(k / 3 * (eq.length - 1))),
    y: H - 8,
    textAnchor: "middle",
    fill: "var(--text-tertiary)",
    style: {
      font: "var(--w-regular) 10px/1 var(--font-mono)"
    }
  }, lbl)))), /*#__PURE__*/React.createElement(NT.Card, {
    title: "Results"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 1,
      background: "var(--border)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      overflow: "hidden"
    }
  }, bt.stats.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: "var(--surface-card)",
      padding: "14px 15px",
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-wide)",
      color: "var(--text-tertiary)"
    }
  }, s.label), /*#__PURE__*/React.createElement("span", {
    className: "num",
    style: {
      font: "var(--w-light) 21px/1 var(--font-mono)",
      letterSpacing: "var(--ls-tight)",
      color: s.tone === "profit" ? "var(--profit)" : s.tone === "loss" ? "var(--loss)" : "var(--text-primary)"
    }
  }, s.value)))))), /*#__PURE__*/React.createElement("style", null, `@media (max-width: 1080px){ .nt-body{ grid-template-columns: 1fr !important; } }`));
}
Object.assign(window, {
  BacktestingPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/BacktestingPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/DashboardPage.jsx
try { (() => {
/* DashboardPage — the operator's live overview. KPIs + live trades + P&L + Discord firing log.
   Left: trades (fill) + P&L chart below. Right: Discord firing log (full height).
   Opening a trade slides a detail panel over the right column; click outside it to dismiss. */
function DashboardPage({
  mode,
  kill
}) {
  const [range, setRange] = React.useState("today");
  const [sel, setSel] = React.useState(null);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      gap: "var(--gap-grid)"
    }
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: greeting(window.NT_DATA.session.user),
    right: /*#__PURE__*/React.createElement(DateFilter, {
      value: range,
      onChange: setRange
    })
  }), /*#__PURE__*/React.createElement(KpiRow, null), /*#__PURE__*/React.createElement("div", {
    className: "nt-body",
    style: {
      flex: 1,
      minHeight: 0,
      display: "grid",
      gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
      gridTemplateRows: "minmax(0,1fr)",
      gap: "var(--gap-grid)",
      alignItems: "stretch"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--gap-grid)",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(TradesLog, {
    fill: true,
    onSelect: setSel
  }), /*#__PURE__*/React.createElement(PnlChart, {
    onSelect: setSel
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(DiscordLog, {
    fill: true
  }), sel && /*#__PURE__*/React.createElement(TradeDetail, {
    trade: sel,
    onClose: () => setSel(null)
  }))), /*#__PURE__*/React.createElement("style", null, `@media (max-width: 1080px){ .nt-body{ grid-template-columns: 1fr !important; grid-template-rows: auto !important; } }`));
}
Object.assign(window, {
  DashboardPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/DashboardPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/DiscordLog.jsx
try { (() => {
/* DiscordLog — enriched firing feed (compact, for the Trades page). */
function DiscordLog({
  maxHeight = 320,
  fill = false
}) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const feed = window.NT_DATA.discord;
  const sum = window.NT_DATA.summary14d;
  const Summary = /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-mono)",
      color: "var(--fired)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "var(--fired)"
    }
  }), sum.fired, " fired"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-tertiary)"
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-mono)",
      color: "var(--text-tertiary)"
    }
  }, sum.filtered, " filtered"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)",
      color: "var(--text-tertiary)",
      letterSpacing: "var(--ls-wide)"
    }
  }, "\xB7 14d"));

  // legend mirrors the Live trades column header so the two cards' row lines align
  const legendBase = {
    font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
    letterSpacing: "var(--ls-wide)",
    textTransform: "uppercase",
    color: "var(--text-tertiary)",
    whiteSpace: "nowrap"
  };
  const legendCell = w => ({
    ...legendBase,
    width: w,
    flex: "none"
  });
  return /*#__PURE__*/React.createElement(NT.Card, {
    title: "Alerts",
    padding: 20,
    action: Summary,
    style: fill ? {
      flex: 1,
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    } : undefined,
    bodyStyle: {
      padding: 0,
      ...(fill ? {
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column"
      } : {})
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: fill ? 1 : undefined,
      maxHeight: fill ? undefined : maxHeight,
      overflowY: "auto",
      overflowX: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 1,
      background: "var(--surface-card)",
      display: "flex",
      alignItems: "center",
      gap: 11,
      padding: "0 18px",
      height: 32
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: legendCell(42)
  }, "time"), /*#__PURE__*/React.createElement("span", {
    style: legendCell(78)
  }, "type"), /*#__PURE__*/React.createElement("span", {
    style: legendCell(74)
  }, "symbol"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...legendBase,
      flex: 1,
      minWidth: 0
    }
  }, "message"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...legendBase,
      flex: "none"
    }
  }, "status")), feed.map((m, i) => {
    const muted = !m.fired;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "0 18px",
        height: 41,
        boxSizing: "border-box",
        borderTop: i ? "1px solid var(--border)" : "none",
        opacity: muted ? 0.6 : 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "num",
      style: {
        font: "var(--w-regular) var(--t-2xs)/1 var(--font-mono)",
        color: "var(--text-tertiary)",
        width: 42,
        flex: "none"
      }
    }, m.t.slice(0, 5)), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 78,
        flex: "none",
        display: "inline-flex"
      }
    }, /*#__PURE__*/React.createElement(NT.TypeChip, {
      type: m.type
    })), /*#__PURE__*/React.createElement("span", {
      className: "num",
      style: {
        width: 74,
        flex: "none",
        font: "var(--w-medium) var(--t-2xs)/1 var(--font-mono)",
        color: m.symbol === "—" ? "var(--text-tertiary)" : "var(--text-secondary)"
      }
    }, m.symbol), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        font: "var(--w-regular) var(--t-sm)/1.3 var(--font-sans)",
        color: muted ? "var(--text-tertiary)" : "var(--text-primary)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, m.msg), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: "none"
      }
    }, /*#__PURE__*/React.createElement(NT.FiredBadge, {
      fired: m.fired,
      reason: m.reason
    })));
  })));
}
Object.assign(window, {
  DiscordLog
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/DiscordLog.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/KpiRow.jsx
try { (() => {
/* KpiRow — six headline metrics. Order: net, best, worst, avg return, win rate, open. */
function KpiRow() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const k = window.NT_DATA.kpis;
  const cards = [{
    label: "net p&l",
    ...k.netPnl
  }, {
    label: "best trade",
    ...k.bestTrade
  }, {
    label: "worst trade",
    ...k.worstTrade
  }, {
    label: "avg return / trade",
    ...k.avgReturn
  }, {
    label: "win rate",
    ...k.winRate
  }, {
    label: "open positions",
    ...k.openPos
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "nt-kpi-row"
  }, cards.map((c, i) => /*#__PURE__*/React.createElement(NT.KpiCard, {
    key: i,
    label: c.label,
    value: c.value,
    delta: c.delta,
    sub: c.sub,
    tone: c.tone
  })), /*#__PURE__*/React.createElement("style", null, `
        .nt-kpi-row{ display:grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: var(--gap-grid); }
        @media (max-width: 1240px){ .nt-kpi-row{ grid-template-columns: repeat(3, minmax(0,1fr)); } }
        @media (max-width: 720px){ .nt-kpi-row{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
      `));
}
Object.assign(window, {
  KpiRow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/KpiRow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/LogPage.jsx
try { (() => {
/* LogPage — full Discord firing log: all columns + filter tabs. */
function LogPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const all = window.NT_DATA.discord;
  const sum = window.NT_DATA.summary14d;
  const [range, setRange] = React.useState("today");
  const [filter, setFilter] = React.useState("all");
  const rows = all.filter(m => filter === "all" ? true : filter === "fired" ? m.fired : !m.fired);
  const Tab = ({
    id,
    label,
    count
  }) => {
    const on = filter === id;
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => setFilter(id),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        height: 22,
        padding: "0 10px",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        border: "1px solid " + (on ? "var(--border-strong)" : "transparent"),
        background: on ? "var(--surface-hover)" : "transparent",
        color: on ? "var(--text-primary)" : "var(--text-tertiary)",
        font: `${on ? "var(--w-semibold)" : "var(--w-medium)"} var(--t-xs)/1 var(--font-sans)`
      }
    }, label, /*#__PURE__*/React.createElement("span", {
      className: "num",
      style: {
        font: "var(--w-medium) var(--t-2xs)/1 var(--font-mono)",
        color: on ? "var(--text-secondary)" : "var(--text-tertiary)"
      }
    }, count));
  };
  const th = {
    font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
    letterSpacing: "var(--ls-wide)",
    textTransform: "uppercase",
    color: "var(--text-tertiary)",
    padding: "12px 14px 12px 0",
    textAlign: "left",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    background: "var(--surface-card)",
    zIndex: 1
  };
  const td = {
    font: "var(--w-regular) var(--t-sm)/1.3 var(--font-sans)",
    padding: "12px 14px 12px 0",
    borderTop: "1px solid var(--border)",
    verticalAlign: "middle"
  };
  const mono = {
    fontFamily: "var(--font-mono)",
    fontVariantNumeric: "tabular-nums"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--gap-grid)"
    }
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: "Firing log",
    subtitle: "Every Discord message the bot evaluated this session",
    right: /*#__PURE__*/React.createElement(DateFilter, {
      value: range,
      onChange: setRange
    })
  }), /*#__PURE__*/React.createElement(NT.Card, {
    padding: 20,
    title: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(Tab, {
      id: "all",
      label: "All",
      count: all.length
    }), /*#__PURE__*/React.createElement(Tab, {
      id: "fired",
      label: "Fired",
      count: all.filter(m => m.fired).length
    }), /*#__PURE__*/React.createElement(Tab, {
      id: "filtered",
      label: "Filtered",
      count: all.filter(m => !m.fired).length
    })),
    action: /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--w-medium) var(--t-2xs)/1 var(--font-mono)",
        color: "var(--text-tertiary)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--fired)"
      }
    }, sum.fired, " fired"), " \xB7 ", sum.filtered, " filtered \xB7 14d"),
    bodyStyle: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto",
      padding: "0 20px 16px"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: 860
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: th
  }, "time"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "type"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "channel"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "symbol"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      width: "40%"
    }
  }, "message"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "latency"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "action"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      paddingRight: 0
    }
  }, "result"))), /*#__PURE__*/React.createElement("tbody", null, rows.map((m, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      opacity: m.fired ? 1 : 0.62
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      ...mono,
      color: "var(--text-tertiary)"
    }
  }, m.t.slice(0, 5)), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(NT.TypeChip, {
    type: m.type
  })), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      height: 20,
      padding: "0 8px",
      borderRadius: "var(--radius-xs)",
      background: "var(--surface-inset)",
      border: "1px solid var(--border)",
      color: "var(--text-tertiary)",
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-mono)"
    }
  }, "#", m.ch)), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      ...mono,
      color: m.symbol === "—" ? "var(--text-tertiary)" : "var(--text-secondary)",
      fontWeight: "var(--w-medium)"
    }
  }, m.symbol), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      color: m.fired ? "var(--text-primary)" : "var(--text-tertiary)"
    }
  }, m.msg), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      ...mono,
      color: "var(--text-tertiary)"
    }
  }, m.fired ? m.latency : "—"), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      ...mono,
      color: m.fired ? "var(--text-secondary)" : "var(--text-tertiary)"
    }
  }, m.fired ? m.action : "—"), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      paddingRight: 0
    }
  }, /*#__PURE__*/React.createElement(NT.FiredBadge, {
    fired: m.fired,
    reason: m.reason
  })))))))));
}
Object.assign(window, {
  LogPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/LogPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/PnlChart.jsx
try { (() => {
/* PnlChart — session P&L. Two modes:
   - "combo": per-item diverging bars (win/loss) + a cumulative equity line.
   - "wfall": waterfall — each item steps the running total from $0 to net.
   Range 1D = today's closed trades; 1W/1M = daily roll-up. Unit $ or %. */
function PnlChart({
  onSelect
}) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const D = window.NT_DATA;
  const [hover, setHover] = React.useState(-1);
  const [range, setRange] = React.useState("1D");
  const [mode, setMode] = React.useState("combo"); // combo | wfall
  const [unit, setUnit] = React.useState("$"); // $ | %

  /* ---- build the series for the active range ---- */
  const tradingDates = n => {
    const out = [];
    const d = new Date(2026, 5, 13);
    while (out.length < n) {
      const w = d.getDay();
      if (w !== 0 && w !== 6) out.unshift(new Date(d));
      d.setDate(d.getDate() - 1);
    }
    return out;
  };
  const series = React.useMemo(() => {
    if (range === "1D") {
      return D.trades.filter(t => t.status !== "live").slice().reverse().map(tr => ({
        label: tr.tk,
        $: tr.pnl,
        pct: tr.pct,
        tr
      }));
    }
    const n = range === "1W" ? 5 : 22;
    const slice = D.daily.slice(-n);
    const dates = tradingDates(n);
    return slice.map((d, i) => ({
      label: dates[i].toLocaleDateString([], {
        month: "short",
        day: "numeric"
      }),
      shortLabel: dates[i].toLocaleDateString([], {
        weekday: "short"
      }),
      $: d.pnl,
      pct: d.pct
    }));
  }, [range]);
  const val = it => unit === "$" ? it.$ : it.pct;
  const cum = [];
  series.reduce((a, it, i) => cum[i] = a + val(it), 0);
  const net = cum.length ? cum[cum.length - 1] : 0;

  /* ---- geometry & shared value scale (bars + line + waterfall) ---- */
  const W = 920,
    H = 264,
    mL = 54,
    mR = 16,
    mT = 18,
    mB = 30;
  const plotH = H - mT - mB,
    plotW = W - mL - mR;
  let lo = 0,
    hi = 0;
  series.forEach((it, i) => {
    const v = val(it);
    lo = Math.min(lo, v, cum[i]);
    hi = Math.max(hi, v, cum[i]);
  });
  const pad = (hi - lo) * 0.12 || 1;
  lo -= pad;
  hi += pad;
  const y = v => mT + plotH * (1 - (v - lo) / (hi - lo));
  const zeroY = y(0);
  const slot = plotW / Math.max(series.length, 1);
  const bw = Math.min(unit === "$" && range !== "1D" ? 30 : 38, slot * 0.56);
  const cx = i => mL + slot * i + slot / 2;
  const fmt = v => unit === "$" ? v > 0 ? "+$" + Math.round(v) : v < 0 ? "\u2212$" + Math.abs(Math.round(v)) : "$0" : (v > 0 ? "+" : v < 0 ? "\u2212" : "") + Math.abs(v).toFixed(1) + "%";

  /* nice round y ticks, always including the zero baseline */
  const niceStep = r => {
    const raw = r / 4 || 1;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
  };
  const step = niceStep(hi - lo);
  const ticks = (() => {
    const out = [];
    for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-6; t += step) out.push(Math.round(t * 100) / 100);
    if (!out.some(v => Math.abs(v) < 1e-6)) out.push(0);
    return out.sort((a, b) => a - b);
  })();
  const Seg = ({
    value,
    set,
    opts
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      padding: 2,
      gap: 2,
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--border-strong)",
      background: "var(--surface-card)"
    }
  }, opts.map(o => {
    const on = value === o.id;
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      onClick: () => set(o.id),
      style: {
        height: 22,
        padding: "0 9px",
        borderRadius: "var(--radius-xs)",
        cursor: "pointer",
        border: "1px solid " + (on ? "var(--border-strong)" : "transparent"),
        background: on ? "var(--surface-hover)" : "transparent",
        color: on ? "var(--text-primary)" : "var(--text-tertiary)",
        font: `${on ? "var(--w-semibold)" : "var(--w-medium)"} var(--t-2xs)/1 var(--font-sans)`,
        letterSpacing: "var(--ls-wide)",
        whiteSpace: "nowrap"
      }
    }, o.label);
  }));
  const cumColor = net >= 0 ? "var(--profit)" : "var(--loss)";
  const linePath = series.map((it, i) => (i ? "L" : "M") + cx(i).toFixed(1) + " " + y(cum[i]).toFixed(1)).join(" ");
  const areaPath = series.length ? linePath + " L" + cx(series.length - 1).toFixed(1) + " " + zeroY.toFixed(1) + " L" + cx(0).toFixed(1) + " " + zeroY.toFixed(1) + " Z" : "";
  const rangeLabel = range === "1D" ? series.length + " closed trades" : series.length + " sessions";
  return /*#__PURE__*/React.createElement(NT.Card, {
    title: "P&L",
    padding: 20,
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Seg, {
      value: mode,
      set: setMode,
      opts: [{
        id: "combo",
        label: "Trades"
      }, {
        id: "wfall",
        label: "Waterfall"
      }]
    }), /*#__PURE__*/React.createElement(Seg, {
      value: unit,
      set: setUnit,
      opts: [{
        id: "$",
        label: "$"
      }, {
        id: "%",
        label: "%"
      }]
    }), /*#__PURE__*/React.createElement(Seg, {
      value: range,
      set: setRange,
      opts: [{
        id: "1D",
        label: "1D"
      }, {
        id: "1W",
        label: "1W"
      }, {
        id: "1M",
        label: "1M"
      }]
    }))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 12,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "num",
    style: {
      font: "var(--w-light) 34px/1 var(--font-mono)",
      letterSpacing: "var(--ls-tight)",
      color: cumColor
    }
  }, fmt(net), unit === "$" ? ".00" : ""), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      height: 20,
      padding: "0 7px",
      borderRadius: "var(--radius-xs)",
      background: net >= 0 ? "var(--profit-bg)" : "var(--loss-bg)",
      color: cumColor,
      font: "var(--w-semibold) var(--t-2xs)/1 var(--font-mono)"
    }
  }, net >= 0 ? "\u2191" : "\u2193", " ", unit === "$" ? D.kpis.netPnl.delta : fmt(net)), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)",
      color: "var(--text-tertiary)"
    }
  }, "net ", unit === "$" ? "realized" : "return", " \xB7 ", rangeLabel)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    width: "100%",
    style: {
      display: "block"
    }
  }, ticks.map((v, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    x1: mL,
    y1: y(v),
    x2: W - mR,
    y2: y(v),
    stroke: "var(--border)",
    strokeWidth: Math.abs(v) < 1e-6 ? 1.2 : 1,
    strokeDasharray: Math.abs(v) < 1e-6 ? "none" : "3 4"
  }), /*#__PURE__*/React.createElement("text", {
    x: mL - 10,
    y: y(v) + 4,
    textAnchor: "end",
    fill: "var(--text-tertiary)",
    style: {
      font: "var(--w-regular) 11px/1 var(--font-mono)"
    }
  }, fmt(v)))), mode === "combo" && areaPath && /*#__PURE__*/React.createElement("path", {
    d: areaPath,
    fill: cumColor,
    opacity: "0.08"
  }), series.map((it, i) => {
    const v = val(it),
      up = v > 0,
      flat = v === 0;
    const c = up ? "var(--profit)" : flat ? "var(--breakeven)" : "var(--loss)";
    let top,
      h,
      bc = c;
    if (mode === "wfall") {
      const a = y(cum[i] - v),
        b = y(cum[i]);
      top = Math.min(a, b);
      h = Math.max(2, Math.abs(a - b));
    } else {
      top = flat ? zeroY - 1 : up ? y(v) : zeroY;
      h = flat ? 2 : Math.max(2, Math.abs(y(v) - zeroY));
    }
    const on = hover === i;
    return /*#__PURE__*/React.createElement("g", {
      key: i,
      onMouseEnter: () => setHover(i),
      onMouseLeave: () => setHover(-1),
      onClick: () => it.tr && onSelect && onSelect(it.tr),
      style: {
        cursor: it.tr && onSelect ? "pointer" : "default"
      }
    }, /*#__PURE__*/React.createElement("rect", {
      x: cx(i) - slot / 2,
      y: mT,
      width: slot,
      height: plotH,
      fill: "transparent"
    }), /*#__PURE__*/React.createElement("rect", {
      x: cx(i) - bw / 2,
      y: top,
      width: bw,
      height: h,
      rx: 3,
      fill: bc,
      opacity: on ? 1 : 0.82,
      style: {
        transition: "opacity var(--dur)"
      }
    }), (range !== "1M" || i % 4 === 0) && /*#__PURE__*/React.createElement("text", {
      x: cx(i),
      y: H - 9,
      textAnchor: "middle",
      fill: on ? "var(--text-secondary)" : "var(--text-tertiary)",
      style: {
        font: "var(--w-medium) 10px/1 var(--font-sans)"
      }
    }, range === "1W" ? it.shortLabel : it.label));
  }), mode === "combo" && series.length > 1 && /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: linePath,
    fill: "none",
    stroke: cumColor,
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), series.map((it, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: cx(i),
    cy: y(cum[i]),
    r: hover === i ? 3.6 : 2.4,
    fill: cumColor
  })))), hover >= 0 && series[hover] && (() => {
    const it = series[hover],
      v = val(it),
      up = v > 0,
      flat = v === 0;
    const c = up ? "var(--profit)" : flat ? "var(--breakeven)" : "var(--loss)";
    const leftPct = cx(hover) / W * 100;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        left: leftPct + "%",
        top: 0,
        transform: "translate(-50%,-6px)",
        pointerEvents: "none",
        background: "var(--surface-inset)",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-sm)",
        boxShadow: "var(--shadow-pop)",
        padding: "8px 10px",
        whiteSpace: "nowrap",
        zIndex: 2
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--w-semibold) var(--t-xs)/1 var(--font-sans)",
        color: "var(--text-primary)"
      }
    }, it.tr ? it.tr.tk + " " + it.tr.strike + " ×" + it.tr.qty : it.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        marginTop: 6,
        alignItems: "baseline"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "num",
      style: {
        font: "var(--w-medium) var(--t-sm)/1 var(--font-mono)",
        color: c
      }
    }, fmt(v), unit === "$" ? ".00" : ""), /*#__PURE__*/React.createElement("span", {
      className: "num",
      style: {
        font: "var(--w-regular) var(--t-2xs)/1 var(--font-mono)",
        color: "var(--text-tertiary)"
      }
    }, "cum ", fmt(cum[hover]))));
  })()));
}
Object.assign(window, {
  PnlChart
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/PnlChart.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/Shared.jsx
try { (() => {
/* Shared — greeting helper + DateFilter control. */
function greeting(name) {
  const h = new Date().getHours();
  const g = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${g}, ${name}`;
}
const NT_FMT = d => d.toLocaleDateString([], {
  month: "short",
  day: "numeric"
});
function ntRangeLabel(value, custom) {
  const now = new Date();
  if (value === "custom" && custom) return NT_FMT(custom.from) + " – " + NT_FMT(custom.to);
  if (value === "week") {
    const s = new Date(now);
    s.setDate(now.getDate() - 6);
    return NT_FMT(s) + " – " + NT_FMT(now);
  }
  if (value === "month") {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    return NT_FMT(s) + " – " + NT_FMT(now);
  }
  return now.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
const NT_ISO = d => d.toISOString().slice(0, 10);
function DateFilter({
  value,
  onChange
}) {
  const [open, setOpen] = React.useState(false);
  const [custom, setCustom] = React.useState(null);
  const now = new Date();
  const [from, setFrom] = React.useState(NT_ISO(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = React.useState(NT_ISO(now));
  const opts = [["today", "Today"], ["week", "This week"], ["month", "This month"]];
  const label = ntRangeLabel(value, custom);
  const pick = id => {
    setCustom(null);
    setOpen(false);
    onChange(id);
  };
  const apply = () => {
    const f = new Date(from + "T00:00:00"),
      t = new Date(to + "T00:00:00");
    setCustom({
      from: f <= t ? f : t,
      to: f <= t ? t : f
    });
    setOpen(false);
    onChange("custom");
  };
  const inputStyle = {
    height: 32,
    padding: "0 10px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-strong)",
    background: "var(--surface-inset)",
    color: "var(--text-primary)",
    colorScheme: "dark",
    font: "var(--w-medium) var(--t-xs)/1 var(--font-mono)"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      height: 32,
      padding: "0 12px",
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      border: "1px solid " + (value === "custom" || open ? "var(--violet-line)" : "var(--border-strong)"),
      background: value === "custom" || open ? "var(--violet-soft)" : "var(--surface-card)",
      color: value === "custom" ? "var(--accent)" : "var(--text-secondary)",
      font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement(Ico, {
    name: "calendar",
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: value === "custom" ? "var(--accent)" : "var(--text-primary)"
    }
  }, label), /*#__PURE__*/React.createElement(Ico, {
    name: "chevron-down",
    size: 13
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      padding: 3,
      gap: 2,
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--border-strong)",
      background: "var(--surface-card)"
    }
  }, opts.map(([id, lbl]) => {
    const on = value === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => pick(id),
      style: {
        height: 24,
        padding: "0 11px",
        borderRadius: "var(--radius-xs)",
        cursor: "pointer",
        border: "1px solid " + (on ? "var(--border-strong)" : "transparent"),
        background: on ? "var(--surface-hover)" : "transparent",
        color: on ? "var(--text-primary)" : "var(--text-tertiary)",
        font: `${on ? "var(--w-semibold)" : "var(--w-medium)"} var(--t-2xs)/1 var(--font-sans)`,
        letterSpacing: "var(--ls-wide)",
        whiteSpace: "nowrap"
      }
    }, lbl);
  })), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setOpen(false),
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 40,
      left: 0,
      zIndex: 41,
      width: 280,
      padding: 16,
      background: "var(--surface-card)",
      border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-pop)",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-semibold) var(--t-xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-wide)",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, "Custom range"), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
      color: "var(--text-secondary)"
    }
  }, "From"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: from,
    max: to,
    onChange: e => setFrom(e.target.value),
    style: inputStyle
  })), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
      color: "var(--text-secondary)"
    }
  }, "To"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: to,
    min: from,
    onChange: e => setTo(e.target.value),
    style: inputStyle
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(NT_Btn, {
    onClick: () => setOpen(false),
    ghost: true
  }, "Cancel"), /*#__PURE__*/React.createElement(NT_Btn, {
    onClick: apply
  }, "Apply")))));
}
function NT_Btn({
  onClick,
  ghost,
  children
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      height: 30,
      padding: "0 14px",
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      border: "1px solid " + (ghost ? "var(--border-strong)" : "transparent"),
      background: ghost ? "transparent" : "var(--accent)",
      color: ghost ? "var(--text-secondary)" : "#fff",
      font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)"
    }
  }, children);
}
function PageHead({
  title,
  subtitle,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: "var(--w-semibold) var(--t-h1)/1.1 var(--font-sans)",
      letterSpacing: "var(--ls-tight)",
      color: "var(--text-primary)"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "6px 0 0",
      font: "var(--w-regular) var(--t-sm)/1 var(--font-sans)",
      color: "var(--text-tertiary)"
    }
  }, subtitle)), right);
}

/* ============================================================
   LIVE MARKET SESSION HELPERS
   Market state is computed in the exchange's timezone (NY, auto DST);
   every time is DISPLAYED in marketHours.display_tz (your zone, auto DST).
   ============================================================ */
function ntTzOffset(date, tz) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const p = {};
  f.formatToParts(date).forEach(x => {
    if (x.type !== "literal") p[x.type] = x.value;
  });
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUTC - date.getTime();
}
function ntTzYMD(now, tz) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const p = {};
  f.formatToParts(now).forEach(x => {
    if (x.type !== "literal") p[x.type] = x.value;
  });
  return {
    y: +p.year,
    m: +p.month,
    d: +p.day
  };
}
/* UTC epoch (ms) for a wall-clock hh:mm on the tz's current calendar day. */
function ntTzInstant(now, tz, hh, mm) {
  const {
    y,
    m,
    d
  } = ntTzYMD(now, tz);
  const guess = Date.UTC(y, m - 1, d, hh, mm, 0);
  return guess - ntTzOffset(new Date(guess), tz);
}
function ntTzDow(now, tz) {
  const s = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short"
  }).format(now);
  return {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  }[s];
}
function ntHM(s) {
  const a = String(s).split(":");
  return [Number(a[0]), Number(a[1])];
}
/* Format an epoch (ms) in the display timezone as HH:MM. */
function ntFmtTz(ms, tz) {
  return new Intl.DateTimeFormat([], {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(ms));
}
/* Current market session: { state: open|premarket|closed, streaming, instants... } */
function ntSession(now) {
  const MH = window.NT_DATA.marketHours;
  const SP = window.NT_DATA.strategyParams;
  const tz = MH.market_tz;
  const dow = ntTzDow(now, tz);
  const weekend = dow === 0 || dow === 6;
  const pmHM = ntHM(MH.premarket_open_et),
    roHM = ntHM(MH.regular_open_et),
    rcHM = ntHM(MH.regular_close_et);
  const pre = ntTzInstant(now, tz, pmHM[0], pmHM[1]);
  const open = ntTzInstant(now, tz, roHM[0], roHM[1]);
  const close = ntTzInstant(now, tz, rcHM[0], rcHM[1]);
  const streamEnd = open + SP.streaming.window_hours * 3600 * 1000;
  const t = now.getTime();
  let state = "closed";
  if (!weekend && t >= pre && t < open) state = "premarket";else if (!weekend && t >= open && t < close) state = "open";
  const streaming = !weekend && t >= open && t < streamEnd;
  return {
    state,
    streaming,
    pre,
    open,
    close,
    streamEnd,
    weekend,
    now: t
  };
}
/* Next future regular-open epoch (skips weekends), for the "closed" label. */
function ntNextOpen(now) {
  const MH = window.NT_DATA.marketHours;
  const hm = ntHM(MH.regular_open_et);
  for (let i = 0; i < 9; i++) {
    const probe = new Date(now.getTime() + i * 86400000);
    const dow = ntTzDow(probe, MH.market_tz);
    const inst = ntTzInstant(probe, MH.market_tz, hm[0], hm[1]);
    if (dow !== 0 && dow !== 6 && inst > now.getTime()) return inst;
  }
  return null;
}
function ntNextOpenLabel(now) {
  const ms = ntNextOpen(now);
  if (ms == null) return "\u2014";
  const tz = window.NT_DATA.marketHours.display_tz;
  const dayOf = x => new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(x));
  const sameDay = dayOf(ms) === dayOf(now.getTime());
  const wd = sameDay ? "" : new Intl.DateTimeFormat([], {
    timeZone: tz,
    weekday: "short"
  }).format(new Date(ms)) + " ";
  return wd + ntFmtTz(ms, tz);
}
Object.assign(window, {
  greeting,
  DateFilter,
  PageHead,
  ntSession,
  ntFmtTz,
  ntNextOpen,
  ntNextOpenLabel,
  ntTzInstant,
  ntTzDow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/Shared.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/Sidebar.jsx
try { (() => {
/* Sidebar — labeled nav rail with brand + subpages. */
function Ico({
  name,
  size = 20,
  color = "currentColor",
  sw = 1.75
}) {
  return /*#__PURE__*/React.createElement("i", {
    "data-lucide": name,
    style: {
      width: size,
      height: size,
      display: "inline-flex",
      color
    },
    "data-sw": sw
  });
}
function Sidebar({
  page,
  onNav
}) {
  const D = window.NT_DATA;
  const nav = [{
    id: "dashboard",
    label: "Dashboard",
    icon: "layout-dashboard"
  }, {
    id: "trades",
    label: "Trades",
    icon: "candlestick-chart"
  }, {
    id: "log",
    label: "Log",
    icon: "scroll-text"
  }, {
    id: "backtesting",
    label: "Backtesting",
    icon: "flask-conical"
  }, {
    id: "strategies",
    label: "Strategies",
    icon: "target"
  }];
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 218,
      flex: "none",
      background: "var(--ink-0)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "16px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "2px 6px 18px"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mark.png",
    width: "30",
    height: "30",
    alt: "Reezer",
    style: {
      borderRadius: 9
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-semibold) 17px/1 var(--font-sans)",
      letterSpacing: "var(--ls-tight)"
    }
  }, "Reezer")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 3,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-wide)",
      textTransform: "uppercase",
      color: "var(--text-tertiary)",
      padding: "6px 8px 8px"
    }
  }, "Workspace"), nav.map(n => {
    const on = page === n.id;
    return /*#__PURE__*/React.createElement("button", {
      key: n.id,
      onClick: () => onNav(n.id),
      className: "nt-nav",
      "data-on": on ? "" : undefined,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11,
        height: 38,
        padding: "0 10px",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--t-sm)",
        transition: "background var(--dur), color var(--dur)"
      }
    }, /*#__PURE__*/React.createElement(Ico, {
      name: n.icon,
      size: 18
    }), n.label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 3,
      borderTop: "1px solid var(--border)",
      paddingTop: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "nt-nav",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      height: 38,
      padding: "0 10px",
      borderRadius: "var(--radius-md)",
      background: "transparent",
      border: "1px solid transparent",
      color: "var(--text-secondary)",
      cursor: "pointer",
      font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement(Ico, {
    name: "settings",
    size: 18
  }), " Settings"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 8px 2px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      flex: "none",
      borderRadius: "50%",
      background: "var(--violet-soft)",
      border: "1px solid var(--violet-line)",
      display: "grid",
      placeItems: "center",
      font: "var(--w-semibold) 13px/1 var(--font-sans)",
      color: "var(--accent)"
    }
  }, "G"), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--w-semibold) var(--t-sm)/1 var(--font-sans)",
      color: "var(--text-primary)"
    }
  }, D.session.user), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--w-regular) var(--t-2xs)/1 var(--font-sans)",
      color: "var(--text-tertiary)",
      marginTop: 3
    }
  }, "Operator")))), /*#__PURE__*/React.createElement("style", null, `
        .nt-nav{ background: transparent; border: 1px solid transparent; color: var(--text-secondary); font-weight: var(--w-medium); }
        .nt-nav[data-on]{ background: var(--violet-soft); border-color: var(--violet-line); color: var(--accent); font-weight: var(--w-semibold); }
        .nt-nav:not([data-on]):hover{ background: var(--surface-inset); color: var(--text-primary); }
      `));
}
Object.assign(window, {
  Sidebar,
  Ico
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/StatusBar.jsx
try { (() => {
/* StatusBar — run-state cluster + live market session/clock. Brand lives in the sidebar. */
function StatusBar({
  mode,
  setMode,
  kill,
  setKill,
  clock,
  onNav
}) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const D = window.NT_DATA;
  const SP = D.strategyParams;
  const TZ = D.marketHours.display_tz;
  const deactivated = kill !== "ARMED";

  /* live clock driving the session state */
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const sess = ntSession(now);
  const [stratOpen, setStratOpen] = React.useState(false);
  const [stratSel, setStratSel] = React.useState(false);
  const [activeStrat, setActiveStrat] = React.useState(SP.name);
  const [sessOpen, setSessOpen] = React.useState(false);
  const stratStatus = {
    live: "var(--live)",
    paused: "var(--dryrun)",
    off: "var(--breakeven)"
  };
  const closeStrat = () => {
    setStratOpen(false);
    setStratSel(false);
  };
  const pill = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    height: 30,
    padding: "0 12px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-strong)",
    background: "var(--surface-inset)",
    color: "var(--text-secondary)",
    font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
    letterSpacing: "var(--ls-wide)",
    whiteSpace: "nowrap"
  };
  const dot = (c, pulse) => ({
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: c,
    flex: "none",
    animation: pulse ? "nt-pulse var(--blink) var(--ease-in-out) infinite" : "none"
  });

  /* ---- live session visual ---- */
  const sv = {
    open: {
      c: "var(--profit)",
      pulse: true,
      label: "MARKET OPEN",
      range: ntFmtTz(sess.open, TZ) + " \u2013 " + ntFmtTz(sess.close, TZ)
    },
    premarket: {
      c: "var(--dryrun)",
      pulse: true,
      label: "PRE-MARKET",
      range: ntFmtTz(sess.pre, TZ) + " \u2013 " + ntFmtTz(sess.open, TZ)
    },
    closed: {
      c: "var(--loss)",
      pulse: false,
      label: "MARKET CLOSED",
      range: "opens " + ntNextOpenLabel(now)
    }
  }[sess.state];

  /* ---- strategy parameter popover ---- */
  const ParamRow = ({
    k,
    v,
    note
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 3,
      padding: "8px 0",
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-sm)/1 var(--font-sans)",
      color: "var(--text-secondary)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    className: "num",
    style: {
      font: "var(--w-semibold) var(--t-sm)/1 var(--font-mono)",
      color: "var(--text-primary)",
      letterSpacing: 0
    }
  }, v)), note && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)",
      color: "var(--text-tertiary)"
    }
  }, note));
  const SectionLabel = ({
    children
  }) => /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-caps)",
      textTransform: "uppercase",
      color: "var(--text-primary)"
    }
  }, children);
  const sessionRow = (c, pulse, label, range) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "9px 0",
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: dot(c, pulse)
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)",
      color: "var(--text-primary)"
    }
  }, label)), /*#__PURE__*/React.createElement("span", {
    className: "num",
    style: {
      font: "var(--w-medium) var(--t-xs)/1 var(--font-mono)",
      color: "var(--text-secondary)",
      whiteSpace: "nowrap"
    }
  }, range));
  return /*#__PURE__*/React.createElement("header", {
    style: {
      height: "var(--topbar-h)",
      flex: "none",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "0 22px",
      borderBottom: "1px solid var(--border)",
      background: "var(--ink-1)"
    }
  }, /*#__PURE__*/React.createElement(NT.ModePill, {
    mode: mode,
    onToggle: () => setMode(mode === "LIVE" ? "DRY-RUN" : "LIVE")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setStratOpen(o => !o),
    className: "nt-strat-pill",
    style: {
      ...pill,
      cursor: "pointer",
      border: "1px solid " + (stratOpen ? "var(--violet-line)" : "var(--border-strong)"),
      background: stratOpen ? "var(--violet-soft)" : "var(--surface-inset)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: dot(deactivated ? "var(--loss)" : "var(--profit)", !deactivated)
  }), "STRATEGY\xA0", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-primary)",
      letterSpacing: "var(--ls-snug)",
      fontWeight: "var(--w-semibold)"
    }
  }, activeStrat), /*#__PURE__*/React.createElement(Ico, {
    name: "chevron-down",
    size: 13
  })), stratOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: closeStrat,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 40,
      left: 0,
      zIndex: 41,
      width: 360,
      padding: 16,
      background: "var(--surface-card)",
      border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-pop)",
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: dot(deactivated ? "var(--loss)" : "var(--profit)", !deactivated)
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-semibold) var(--t-body)/1 var(--font-sans)",
      letterSpacing: "var(--ls-snug)",
      whiteSpace: "nowrap"
    }
  }, activeStrat)), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-caps)",
      color: deactivated ? "var(--loss)" : "var(--profit)",
      flex: "none"
    }
  }, deactivated ? "DEACTIVATED" : "ACTIVE")), !stratSel ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Sizing")), /*#__PURE__*/React.createElement(ParamRow, {
    k: "Trade budget",
    v: "$" + SP.sizing.trade_budget_usd,
    note: "max $ per entry"
  }), /*#__PURE__*/React.createElement(ParamRow, {
    k: "Max contracts",
    v: SP.sizing.max_contracts_per_trade,
    note: "hard cap per trade"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Exits / risk")), /*#__PURE__*/React.createElement(ParamRow, {
    k: "Stop loss",
    v: Math.round(SP.exits.stop_loss_pct * 100) + "%",
    note: "\u2212" + Math.round(SP.exits.stop_loss_pct * 100) + "% resting stop at Schwab"
  }), /*#__PURE__*/React.createElement(ParamRow, {
    k: "Breakeven at",
    v: "+" + Math.round(SP.exits.breakeven_at_pct * 100) + "%",
    note: "at +" + Math.round(SP.exits.breakeven_at_pct * 100) + "%, move stop to breakeven"
  }), /*#__PURE__*/React.createElement(ParamRow, {
    k: "Take half at",
    v: "+" + Math.round(SP.exits.take_half_at_pct * 100) + "%",
    note: "at +" + Math.round(SP.exits.take_half_at_pct * 100) + "%, sell half"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setStratSel(true),
    style: {
      marginTop: 14,
      height: 36,
      width: "100%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: "var(--radius-sm)",
      border: "1px solid transparent",
      background: "var(--accent)",
      color: "#fff",
      cursor: "pointer",
      font: "var(--w-semibold) var(--t-xs)/1 var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement(Ico, {
    name: "repeat",
    size: 14
  }), " Change strategy")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      marginTop: 14,
      marginBottom: 2
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setStratSel(false),
    "aria-label": "Back",
    style: {
      width: 26,
      height: 26,
      flex: "none",
      display: "grid",
      placeItems: "center",
      borderRadius: "var(--radius-sm)",
      background: "transparent",
      border: "1px solid var(--border)",
      color: "var(--text-secondary)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Ico, {
    name: "arrow-left",
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-caps)",
      textTransform: "uppercase",
      color: "var(--text-primary)"
    }
  }, "Select strategy")), D.strategies.map((s, i) => {
    const on = s.name === activeStrat;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => {
        setActiveStrat(s.name);
        setStratSel(false);
      },
      className: "nt-strat-opt",
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 12px",
        textAlign: "left",
        cursor: "pointer",
        width: "100%",
        borderRadius: "var(--radius-sm)",
        border: "1px solid " + (on ? "var(--violet-line)" : "var(--border)"),
        background: on ? "var(--violet-soft)" : "var(--surface-inset)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...dot(stratStatus[s.status], false),
        marginTop: 5
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--w-semibold) var(--t-sm)/1 var(--font-sans)",
        color: "var(--text-primary)"
      }
    }, s.name), on && /*#__PURE__*/React.createElement(Ico, {
      name: "check",
      size: 14,
      color: "var(--accent)"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        font: "var(--w-regular) var(--t-2xs)/1.4 var(--font-sans)",
        color: "var(--text-tertiary)",
        marginTop: 4
      }
    }, s.desc)));
  }))))), /*#__PURE__*/React.createElement(NT.KillSwitch, {
    state: kill,
    onToggle: () => setKill(kill === "ARMED" ? "TRIPPED" : "ARMED")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSessOpen(o => !o),
    className: "nt-sess-pill",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: 30,
      padding: "0 6px 0 4px",
      background: "transparent",
      border: "1px solid transparent",
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      color: "var(--text-tertiary)",
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-wide)",
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: dot(sv.c, sv.pulse)
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: sv.c
    }
  }, sv.label), /*#__PURE__*/React.createElement("span", {
    className: "num",
    style: {
      color: "var(--text-secondary)",
      letterSpacing: 0,
      fontFamily: "var(--font-mono)"
    }
  }, sv.range), /*#__PURE__*/React.createElement(Ico, {
    name: "chevron-down",
    size: 12
  })), sessOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setSessOpen(false),
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 40,
      right: 0,
      zIndex: 41,
      width: 326,
      padding: 16,
      background: "var(--surface-card)",
      border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-pop)",
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-semibold) var(--t-xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-wide)",
      textTransform: "uppercase",
      color: "var(--text-tertiary)",
      marginBottom: 4
    }
  }, "Trading sessions \xB7 your time"), sessionRow("var(--dryrun)", sess.state === "premarket", "Pre-market", ntFmtTz(sess.pre, TZ) + " \u2013 " + ntFmtTz(sess.open, TZ)), sessionRow("var(--profit)", sess.state === "open", "Regular / open", ntFmtTz(sess.open, TZ) + " \u2013 " + ntFmtTz(sess.close, TZ)), sessionRow("var(--loss)", false, "Closed", "after " + ntFmtTz(sess.close, TZ)), sessionRow("var(--profit)", sess.streaming, "Streaming", ntFmtTz(sess.open, TZ) + " \u2013 " + ntFmtTz(sess.streamEnd, TZ)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      font: "var(--w-regular) var(--t-2xs)/1.5 var(--font-sans)",
      color: "var(--text-tertiary)"
    }
  }, "Shown in ", TZ.split("/")[1].replace("_", " "), " \xB7 market hours US Eastern. Both auto-correct for summer/winter.")))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 22,
      background: "var(--border)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "num",
    style: {
      font: "var(--w-medium) var(--t-sm)/1 var(--font-mono)",
      color: "var(--text-primary)"
    }
  }, ntFmtTz(now.getTime(), TZ)), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)",
      color: "var(--text-tertiary)"
    }
  }, new Intl.DateTimeFormat([], {
    timeZone: TZ,
    month: "short",
    day: "numeric"
  }).format(now)), /*#__PURE__*/React.createElement("button", {
    style: {
      width: 32,
      height: 32,
      display: "grid",
      placeItems: "center",
      borderRadius: "var(--radius-sm)",
      background: "transparent",
      border: "1px solid var(--border)",
      color: "var(--text-secondary)",
      cursor: "pointer",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(Ico, {
    name: "bell",
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 7,
      right: 7,
      width: 5,
      height: 5,
      borderRadius: "50%",
      background: "var(--accent)"
    }
  })), /*#__PURE__*/React.createElement("style", null, `.nt-strat-pill:hover, .nt-sess-pill:hover{ filter: brightness(1.08); } .nt-sess-pill:hover{ background: var(--surface-inset) !important; } .nt-strat-opt{ transition: border-color var(--dur), background var(--dur); } .nt-strat-opt:hover{ border-color: var(--border-strong); background: var(--surface-hover); }`));
}
Object.assign(window, {
  StatusBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/StatusBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/StrategiesPage.jsx
try { (() => {
/* StrategiesPage — strategy cards with status + performance. */
function StrategiesPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const strategies = window.NT_DATA.strategies;
  const statusMap = {
    live: {
      c: "var(--live)",
      bg: "var(--live-bg)",
      label: "LIVE",
      pulse: true
    },
    paused: {
      c: "var(--dryrun)",
      bg: "var(--dryrun-bg)",
      label: "PAUSED",
      pulse: false
    },
    off: {
      c: "var(--breakeven)",
      bg: "var(--breakeven-bg)",
      label: "OFF",
      pulse: false
    }
  };
  const money = n => n > 0 ? "+$" + n : n < 0 ? "\u2212$" + Math.abs(n) : "$0";
  const tone = n => n > 0 ? "var(--profit)" : n < 0 ? "var(--loss)" : "var(--text-primary)";
  const Metric = ({
    label,
    value,
    color
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-wide)",
      color: "var(--text-tertiary)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "num",
    style: {
      font: "var(--w-medium) var(--t-body)/1 var(--font-mono)",
      color: color || "var(--text-primary)"
    }
  }, value));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--gap-grid)"
    }
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: "Strategies",
    subtitle: "Signal sources the bot trades from",
    right: /*#__PURE__*/React.createElement(NT.Button, {
      variant: "primary",
      size: "md",
      icon: /*#__PURE__*/React.createElement(Ico, {
        name: "plus",
        size: 15
      })
    }, "New strategy")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0,1fr))",
      gap: "var(--gap-grid)"
    },
    className: "nt-strat"
  }, strategies.map((s, i) => {
    const st = statusMap[s.status];
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: "var(--surface-card)",
        border: "1px solid " + (s.status === "live" ? "var(--violet-line)" : "var(--border)"),
        borderRadius: "var(--radius-lg)",
        padding: 20,
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--w-semibold) var(--t-h3)/1.2 var(--font-sans)",
        letterSpacing: "var(--ls-snug)"
      }
    }, s.name), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--w-regular) var(--t-xs)/1.45 var(--font-sans)",
        color: "var(--text-tertiary)",
        marginTop: 6,
        maxWidth: 320
      }
    }, s.desc)), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 24,
        padding: "0 10px",
        borderRadius: "var(--radius-sm)",
        background: st.bg,
        color: st.c,
        font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)",
        letterSpacing: "var(--ls-caps)",
        flex: "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: st.c,
        animation: st.pulse ? "nt-pulse var(--blink) var(--ease-in-out) infinite" : "none"
      }
    }), st.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14,
        paddingTop: 14,
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Metric, {
      label: "trades",
      value: s.trades
    }), /*#__PURE__*/React.createElement(Metric, {
      label: "win rate",
      value: s.winRate + "%"
    }), /*#__PURE__*/React.createElement(Metric, {
      label: "p&l",
      value: money(s.pnl),
      color: tone(s.pnl)
    }), /*#__PURE__*/React.createElement(Metric, {
      label: "avg ret",
      value: (s.avgReturn > 0 ? "+" : s.avgReturn < 0 ? "\u2212" : "") + Math.abs(s.avgReturn).toFixed(1) + "%",
      color: tone(s.avgReturn)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--w-regular) var(--t-xs)/1 var(--font-sans)",
        color: "var(--text-tertiary)"
      }
    }, "budget ", /*#__PURE__*/React.createElement("span", {
      className: "num",
      style: {
        color: "var(--text-secondary)"
      }
    }, s.alloc)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(NT.Button, {
      variant: "ghost",
      size: "sm"
    }, "Edit"), /*#__PURE__*/React.createElement(NT.Button, {
      variant: s.status === "live" ? "secondary" : "primary",
      size: "sm"
    }, s.status === "live" ? "Pause" : "Activate"))));
  })), /*#__PURE__*/React.createElement("style", null, `@media (max-width: 980px){ .nt-strat{ grid-template-columns: 1fr !important; } }`));
}
Object.assign(window, {
  StrategiesPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/StrategiesPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/TradeDetail.jsx
try { (() => {
/* TradeDetail — slides over the right column (chart + firing log), perfectly aligned. */
function TradeDetail({
  trade,
  onClose
}) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const [shown, setShown] = React.useState(false);
  const panelRef = React.useRef(null);
  React.useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(r);
  }, []);
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons({
      attrs: {
        "stroke-width": 1.75
      }
    });
  });
  if (!trade) return null;
  const tr = trade;
  const up = tr.pnl > 0,
    flat = tr.pnl === 0;
  const c = up ? "var(--profit)" : flat ? "var(--breakeven)" : "var(--loss)";
  const money = n => n > 0 ? "+$" + n.toFixed(2) : n < 0 ? "\u2212$" + Math.abs(n).toFixed(2) : "$0.00";
  const pct = n => (n > 0 ? "+" : n < 0 ? "\u2212" : "") + Math.abs(n).toFixed(1) + "%";
  const capital = (tr.entry * tr.qty * 100).toFixed(0);
  const exitNum = tr.exit === null ? null : parseFloat(String(tr.exit));
  const close = () => {
    setShown(false);
    setTimeout(onClose, 200);
  };

  // close when clicking anywhere outside the panel (but let a click on another
  // trade row switch the open trade instead of closing).
  React.useEffect(() => {
    const onDown = e => {
      const t = e.target;
      if (panelRef.current && panelRef.current.contains(t)) return;
      if (t && t.closest && t.closest(".nt-trow")) return;
      close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  const Field = ({
    label,
    value,
    color
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 5,
      padding: "11px 0",
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-wide)",
      textTransform: "lowercase",
      color: "var(--text-tertiary)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "num",
    style: {
      font: "var(--w-regular) var(--t-body)/1 var(--font-mono)",
      color: color || "var(--text-primary)"
    }
  }, value));
  const pathPts = exitNum === null ? [[0, 0.5], [0.5, 0.42], [1, 0.4]] : (() => {
    const lo = Math.min(tr.entry, exitNum),
      hi = Math.max(tr.entry, exitNum);
    const norm = v => hi === lo ? 0.5 : 1 - (v - lo) / (hi - lo);
    const mid = up ? norm(tr.entry) - 0.12 : norm(tr.entry) + 0.12;
    return [[0, norm(tr.entry)], [0.45, Math.max(0.05, Math.min(0.95, mid))], [1, norm(exitNum)]];
  })();
  const pw = 392,
    ph = 60;
  const linePath = pathPts.map((p, i) => (i ? "L" : "M") + (10 + p[0] * (pw - 20)).toFixed(1) + " " + (6 + p[1] * (ph - 12)).toFixed(1)).join(" ");
  return /*#__PURE__*/React.createElement("div", {
    ref: panelRef,
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 20,
      display: "flex",
      flexDirection: "column",
      background: "var(--surface-card)",
      border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-pop)",
      overflow: "hidden",
      transform: shown ? "translateX(0)" : "translateX(14px)",
      opacity: shown ? 1 : 0,
      transition: "transform var(--dur-slow) var(--ease-out), opacity var(--dur) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "16px 20px",
      borderBottom: "1px solid var(--border)",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(NT.StatusDot, {
    status: tr.status
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-semibold) var(--t-h3)/1 var(--font-sans)",
      letterSpacing: "var(--ls-snug)",
      whiteSpace: "nowrap"
    }
  }, tr.tk, " ", tr.strike, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-tertiary)",
      fontWeight: "var(--w-regular)"
    }
  }, "\xD7", tr.qty)), /*#__PURE__*/React.createElement(NT.ResultBadge, {
    result: tr.result,
    size: "sm"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: close,
    "aria-label": "Close",
    style: {
      width: 30,
      height: 30,
      flex: "none",
      display: "grid",
      placeItems: "center",
      borderRadius: "var(--radius-sm)",
      background: "transparent",
      border: "1px solid var(--border)",
      color: "var(--text-secondary)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x",
    style: {
      width: 16,
      height: 16
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-wide)",
      textTransform: "lowercase",
      color: "var(--text-tertiary)"
    }
  }, tr.status === "live" ? "unrealized p&l" : "realized p&l"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 12,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "num",
    style: {
      font: "var(--w-light) 36px/1 var(--font-mono)",
      letterSpacing: "var(--ls-tight)",
      color: c
    }
  }, money(tr.pnl)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      height: 22,
      padding: "0 8px",
      borderRadius: "var(--radius-xs)",
      background: up ? "var(--profit-bg)" : flat ? "var(--breakeven-bg)" : "var(--loss-bg)",
      color: c,
      font: "var(--w-semibold) var(--t-xs)/1 var(--font-mono)"
    }
  }, pct(tr.pct)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-inset)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-wide)",
      color: "var(--text-tertiary)"
    }
  }, "CONTRACT PRICE"), /*#__PURE__*/React.createElement("span", {
    className: "num",
    style: {
      font: "var(--w-regular) var(--t-2xs)/1 var(--font-mono)",
      color: "var(--text-tertiary)"
    }
  }, tr.t.slice(0, 5), " \u2192 ", tr.close.slice(0, 5))), /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${pw} ${ph}`,
    width: "100%",
    style: {
      display: "block"
    },
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: linePath,
    fill: "none",
    stroke: c,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: 10,
    cy: 6 + pathPts[0][1] * (ph - 12),
    r: "3",
    fill: "var(--text-tertiary)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: pw - 10,
    cy: 6 + pathPts[pathPts.length - 1][1] * (ph - 12),
    r: "3.5",
    fill: c
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      columnGap: 20
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "side",
    value: tr.side === "C" ? "Call" : "Put"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "quantity",
    value: "×" + tr.qty
  }), /*#__PURE__*/React.createElement(Field, {
    label: "entry",
    value: tr.entry.toFixed(2)
  }), /*#__PURE__*/React.createElement(Field, {
    label: "exit",
    value: tr.exit === null ? "—" : tr.exit,
    color: tr.exit === null ? "var(--text-tertiary)" : undefined
  }), /*#__PURE__*/React.createElement(Field, {
    label: "capital",
    value: "$" + capital
  }), /*#__PURE__*/React.createElement(Field, {
    label: "result",
    value: flat ? "Breakeven" : up ? "Win" : "Loss",
    color: c
  }), /*#__PURE__*/React.createElement(Field, {
    label: "opened",
    value: tr.t.slice(0, 5)
  }), /*#__PURE__*/React.createElement(Field, {
    label: "closed",
    value: tr.close.slice(0, 5)
  }), /*#__PURE__*/React.createElement(Field, {
    label: "hold time",
    value: tr.hold
  }), /*#__PURE__*/React.createElement(Field, {
    label: "strategy",
    value: tr.strat
  })), tr.stopped && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignSelf: "flex-start",
      alignItems: "center",
      gap: 6,
      height: 24,
      padding: "0 10px",
      borderRadius: "var(--radius-sm)",
      background: "var(--loss-bg)",
      color: "var(--loss)",
      font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-wide)"
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "octagon-x",
    style: {
      width: 13,
      height: 13
    }
  }), " STOPPED OUT"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
      letterSpacing: "var(--ls-wide)",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, "Triggered by"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      display: "flex",
      alignItems: "flex-start",
      gap: 11,
      padding: "13px 14px",
      background: "var(--surface-inset)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement(NT.TypeChip, {
    type: tr.trigger.type
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--w-regular) var(--t-sm)/1.4 var(--font-sans)",
      color: "var(--text-primary)"
    }
  }, tr.trigger.msg), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(NT.FiredBadge, {
    fired: true
  })))))));
}
Object.assign(window, {
  TradeDetail
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/TradeDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/TradesLog.jsx
try { (() => {
/* TradesLog — live trades table / log. Fillable with internal scroll + sticky header. */
function TradesLog({
  onSelect,
  fill = false
}) {
  const NT = window.NitroTraderDesignSystem_95e598;
  const rows = window.NT_DATA.trades;
  // streaming dot: green+blinking inside the streaming window, red outside (live)
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const streaming = ntSession(new Date()).streaming;
  const money = n => n > 0 ? "+$" + n.toFixed(2) : n < 0 ? "\u2212$" + Math.abs(n).toFixed(2) : "$0.00";
  const pct = n => (n > 0 ? "+" : n < 0 ? "\u2212" : "") + Math.abs(n).toFixed(1) + "%";
  const tone = n => n > 0 ? "var(--profit)" : n < 0 ? "var(--loss)" : "var(--breakeven)";
  const th = {
    font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
    letterSpacing: "var(--ls-wide)",
    textTransform: "uppercase",
    color: "var(--text-tertiary)",
    padding: "10px 0",
    textAlign: "right",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    background: "var(--surface-card)",
    zIndex: 1
  };
  const thL = {
    ...th,
    textAlign: "left"
  };
  const td = {
    font: "var(--w-regular) var(--t-sm)/1 var(--font-mono)",
    fontVariantNumeric: "tabular-nums",
    padding: "11px 0",
    borderTop: "1px solid var(--border)",
    textAlign: "right",
    color: "var(--text-primary)",
    whiteSpace: "nowrap"
  };
  const tdL = {
    ...td,
    textAlign: "left"
  };
  return /*#__PURE__*/React.createElement(NT.Card, {
    title: "Trades",
    padding: 20,
    action: /*#__PURE__*/React.createElement(NT.StatusDot, {
      status: streaming ? "live" : "loss",
      label: streaming ? "streaming" : "streaming off"
    }),
    style: fill ? {
      flex: 1,
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    } : undefined,
    bodyStyle: {
      padding: 0,
      ...(fill ? {
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column"
      } : {})
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: fill ? 1 : undefined,
      minHeight: 0,
      overflowY: "auto",
      overflowX: "hidden",
      padding: "0 20px 10px"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      ...thL,
      width: 28
    }
  }), /*#__PURE__*/React.createElement("th", {
    style: thL
  }, "time"), /*#__PURE__*/React.createElement("th", {
    style: thL
  }, "contract"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "qty"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "entry"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "exit"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "p&l $"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "p&l %"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      paddingRight: 2
    }
  }, "result"))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    onClick: () => onSelect && onSelect(r),
    className: "nt-trow",
    style: {
      cursor: onSelect ? "pointer" : "default"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      ...tdL,
      width: 28
    }
  }, /*#__PURE__*/React.createElement(NT.StatusDot, {
    status: r.status
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      ...tdL,
      color: "var(--text-secondary)"
    }
  }, r.t.slice(0, 5)), /*#__PURE__*/React.createElement("td", {
    style: tdL
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-primary)",
      fontWeight: "var(--w-medium)"
    }
  }, r.tk), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)"
    }
  }, " ", r.strike)), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      color: "var(--text-secondary)"
    }
  }, "\xD7", r.qty), /*#__PURE__*/React.createElement("td", {
    style: td
  }, r.entry.toFixed(2)), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      color: r.exit === null ? "var(--text-tertiary)" : "var(--text-primary)"
    }
  }, r.exit === null ? "—" : r.exit), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      color: tone(r.pnl),
      fontWeight: "var(--w-medium)"
    }
  }, money(r.pnl)), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      color: tone(r.pnl)
    }
  }, pct(r.pct)), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      paddingRight: 2
    }
  }, /*#__PURE__*/React.createElement(NT.ResultBadge, {
    result: r.result,
    size: "sm"
  }))))))), /*#__PURE__*/React.createElement("style", null, `.nt-trow:hover td{ background: var(--surface-inset); } .nt-trow td{ transition: background var(--dur); } .nt-trow td:first-child{ border-top-left-radius: var(--radius-xs); border-bottom-left-radius: var(--radius-xs); } .nt-trow td:last-child{ border-top-right-radius: var(--radius-xs); border-bottom-right-radius: var(--radius-xs); }`));
}
Object.assign(window, {
  TradesLog
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/TradesLog.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/TradesPage.jsx
try { (() => {
/* TradesPage — every trade the bot placed, in full detail.
   Detailed table (more columns than the dashboard log). Click a row to open the
   full breakdown in a right-side drawer; click the dimmed backdrop to dismiss. */
function TradesPage() {
  const NT = window.NitroTraderDesignSystem_95e598;
  const rows = window.NT_DATA.trades;
  const [range, setRange] = React.useState("today");
  const [sel, setSel] = React.useState(null);
  const money = n => n > 0 ? "+$" + n.toFixed(2) : n < 0 ? "\u2212$" + Math.abs(n).toFixed(2) : "$0.00";
  const pct = n => (n > 0 ? "+" : n < 0 ? "\u2212" : "") + Math.abs(n).toFixed(1) + "%";
  const tone = n => n > 0 ? "var(--profit)" : n < 0 ? "var(--loss)" : "var(--breakeven)";

  // ---- summary roll-up ----
  const open = rows.filter(r => r.status === "live").length;
  const closed = rows.length - open;
  const k = window.NT_DATA.kpis;
  // top frames mirror the dashboard headline metrics (same KpiCard look)
  const kpis = [{
    label: "total trades",
    value: String(rows.length),
    sub: closed + " closed \u00b7 " + open + " open"
  }, {
    label: "net p&l",
    value: k.netPnl.value,
    delta: k.netPnl.delta,
    tone: "profit",
    sub: "realized"
  }, {
    label: "win rate",
    value: k.winRate.value,
    sub: k.winRate.sub
  }, {
    label: "best ticker",
    value: k.bestTrade.value,
    sub: k.bestTrade.sub,
    tone: "profit"
  }, {
    label: "worst ticker",
    value: k.worstTrade.value,
    sub: k.worstTrade.sub,
    tone: "loss"
  }, {
    label: "avg return",
    value: k.avgReturn.value,
    sub: k.avgReturn.sub
  }];
  const th = {
    font: "var(--w-medium) var(--t-2xs)/1 var(--font-sans)",
    letterSpacing: "var(--ls-wide)",
    textTransform: "uppercase",
    color: "var(--text-tertiary)",
    padding: "12px 14px",
    textAlign: "right",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    background: "var(--surface-card)",
    zIndex: 1
  };
  const thL = {
    ...th,
    textAlign: "left"
  };
  const td = {
    font: "var(--w-regular) var(--t-sm)/1 var(--font-mono)",
    fontVariantNumeric: "tabular-nums",
    padding: "13px 14px",
    borderTop: "1px solid var(--border)",
    textAlign: "right",
    color: "var(--text-primary)",
    whiteSpace: "nowrap"
  };
  const tdL = {
    ...td,
    textAlign: "left"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--gap-grid)"
    }
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: "Trades",
    subtitle: "Every order the bot has placed \u2014 click a row for the full breakdown",
    right: /*#__PURE__*/React.createElement(DateFilter, {
      value: range,
      onChange: setRange
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "nt-tkpi"
  }, kpis.map((c, i) => /*#__PURE__*/React.createElement(NT.KpiCard, {
    key: i,
    label: c.label,
    value: c.value,
    delta: c.delta,
    sub: c.sub,
    tone: c.tone
  }))), /*#__PURE__*/React.createElement(NT.Card, {
    title: "All trades",
    padding: 20,
    action: /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--w-medium) var(--t-xs)/1 var(--font-sans)",
        color: "var(--text-tertiary)"
      }
    }, rows.length, " orders \xB7 ", window.NT_DATA.session.date),
    bodyStyle: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto",
      padding: "0 6px 12px"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: 1080
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      ...thL,
      width: 26,
      paddingRight: 0
    }
  }), /*#__PURE__*/React.createElement("th", {
    style: thL
  }, "opened"), /*#__PURE__*/React.createElement("th", {
    style: thL
  }, "closed"), /*#__PURE__*/React.createElement("th", {
    style: thL
  }, "contract"), /*#__PURE__*/React.createElement("th", {
    style: thL
  }, "side"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "qty"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "entry"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "exit"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "capital"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "p&l $"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "p&l %"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "hold"), /*#__PURE__*/React.createElement("th", {
    style: thL
  }, "strategy"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th
    }
  }, "result"))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => {
    const capital = (r.entry * r.qty * 100).toFixed(0);
    return /*#__PURE__*/React.createElement("tr", {
      key: i,
      onClick: () => setSel(r),
      className: "nt-trow",
      style: {
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        ...tdL,
        width: 26,
        paddingRight: 0
      }
    }, /*#__PURE__*/React.createElement(NT.StatusDot, {
      status: r.status
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        ...tdL,
        color: "var(--text-secondary)"
      }
    }, r.t), /*#__PURE__*/React.createElement("td", {
      style: {
        ...tdL,
        color: r.close === "\u2014" ? "var(--text-tertiary)" : "var(--text-secondary)"
      }
    }, r.close), /*#__PURE__*/React.createElement("td", {
      style: tdL
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-primary)",
        fontWeight: "var(--w-medium)"
      }
    }, r.tk), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-secondary)"
      }
    }, " ", r.strike)), /*#__PURE__*/React.createElement("td", {
      style: {
        ...tdL
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        padding: "0 8px",
        borderRadius: "var(--radius-xs)",
        font: "var(--w-semibold) var(--t-2xs)/1 var(--font-sans)",
        letterSpacing: "var(--ls-wide)",
        background: r.side === "C" ? "var(--profit-bg)" : "var(--loss-bg)",
        color: r.side === "C" ? "var(--profit)" : "var(--loss)"
      }
    }, r.side === "C" ? "CALL" : "PUT")), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        color: "var(--text-secondary)"
      }
    }, "\xD7", r.qty), /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.entry.toFixed(2)), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        color: r.exit === null ? "var(--text-tertiary)" : "var(--text-primary)"
      }
    }, r.exit === null ? "\u2014" : r.exit), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        color: "var(--text-secondary)"
      }
    }, "$", capital), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        color: tone(r.pnl),
        fontWeight: "var(--w-medium)"
      }
    }, money(r.pnl)), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        color: tone(r.pnl)
      }
    }, pct(r.pct)), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        color: "var(--text-secondary)"
      }
    }, r.hold === "open" ? "\u2014" : r.hold), /*#__PURE__*/React.createElement("td", {
      style: {
        ...tdL,
        color: "var(--text-secondary)",
        fontFamily: "var(--font-sans)"
      }
    }, r.strat), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6
      }
    }, r.stopped && /*#__PURE__*/React.createElement("i", {
      "data-lucide": "octagon-x",
      style: {
        width: 13,
        height: 13,
        color: "var(--loss)"
      }
    }), /*#__PURE__*/React.createElement(NT.ResultBadge, {
      result: r.result,
      size: "sm"
    }))));
  }))))), sel && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 60,
      background: "rgba(8,8,10,0.55)",
      display: "flex",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: "min(686px, 92vw)",
      height: "100%"
    }
  }, /*#__PURE__*/React.createElement(TradeDetail, {
    trade: sel,
    onClose: () => setSel(null)
  }))), /*#__PURE__*/React.createElement("style", null, `
        .nt-trow:hover td{ background: var(--surface-inset); }
        .nt-trow td{ transition: background var(--dur); }
        .nt-trow td:first-child{ border-top-left-radius: var(--radius-xs); border-bottom-left-radius: var(--radius-xs); }
        .nt-trow td:last-child{ border-top-right-radius: var(--radius-xs); border-bottom-right-radius: var(--radius-xs); }
        .nt-tkpi{ display:grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: var(--gap-grid); }
        @media (max-width: 1240px){ .nt-tkpi{ grid-template-columns: repeat(3, minmax(0,1fr)); } }
        @media (max-width: 720px){ .nt-tkpi{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
      `));
}
Object.assign(window, {
  TradesPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/TradesPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/data.js
try { (() => {
/* Reezer · dashboard mock data
   A single morning session (Jun 14, 09:30–~12:00 ET). All numbers are
   internally consistent: the trades roll up into the KPIs, stats and
   per-trade P&L columns. Attached to window.NT_DATA. */
(function () {
  // ---- Live trades (newest first) ----
  const trades = [{
    t: "11:42:08",
    close: "—",
    tk: "SPY",
    strike: "589C",
    side: "C",
    qty: 4,
    entry: 1.38,
    exit: null,
    pnl: +96,
    pct: +17.4,
    result: "OPEN",
    status: "live",
    strat: "0DTE Momentum",
    hold: "open",
    trigger: {
      type: "ENTRY",
      user: "alerts",
      msg: "in SPY 589c @ 1.38, 0dte runner"
    }
  }, {
    t: "11:18:55",
    close: "11:21:33",
    tk: "QQQ",
    strike: "503C",
    side: "C",
    qty: 3,
    entry: 2.05,
    exit: "2.46/be",
    pnl: +123,
    pct: +20.0,
    result: "WIN",
    status: "done",
    strat: "0DTE Momentum",
    hold: "2m 38s",
    trigger: {
      type: "ENTRY",
      user: "alerts",
      msg: "QQQ 503c reclaim, runner on"
    }
  }, {
    t: "10:54:31",
    close: "10:55:18",
    tk: "IWM",
    strike: "214P",
    side: "P",
    qty: 6,
    entry: 0.92,
    exit: 0.71,
    pnl: -126,
    pct: -22.8,
    result: "LOSS",
    status: "done",
    strat: "Fade Open",
    hold: "0m 47s",
    stopped: true,
    trigger: {
      type: "ENTRY",
      user: "alerts",
      msg: "IWM 214p, fade the pop"
    }
  }, {
    t: "10:37:12",
    close: "10:38:01",
    tk: "SPY",
    strike: "588C",
    side: "C",
    qty: 4,
    entry: 1.42,
    exit: "1.80/be",
    pnl: +152,
    pct: +26.7,
    result: "WIN",
    status: "done",
    strat: "0DTE Momentum",
    hold: "0m 49s",
    trigger: {
      type: "ENTRY",
      user: "alerts",
      msg: "SPY 588c here, size on"
    }
  }, {
    t: "10:11:46",
    close: "10:14:02",
    tk: "NVDA",
    strike: "131C",
    side: "C",
    qty: 2,
    entry: 1.74,
    exit: 1.74,
    pnl: 0,
    pct: 0.0,
    result: "BE",
    status: "done",
    strat: "Lotto",
    hold: "2m 16s",
    trigger: {
      type: "ENTRY",
      user: "alerts",
      msg: "lotto NVDA 131c small"
    }
  }, {
    t: "09:58:03",
    close: "10:01:40",
    tk: "QQQ",
    strike: "502P",
    side: "P",
    qty: 2,
    entry: 2.10,
    exit: 1.62,
    pnl: -96,
    pct: -22.9,
    result: "LOSS",
    status: "done",
    strat: "Fade Open",
    hold: "3m 37s",
    trigger: {
      type: "ENTRY",
      user: "alerts",
      msg: "QQQ 502p, fade the open"
    }
  }, {
    t: "09:47:20",
    close: "09:49:55",
    tk: "TSLA",
    strike: "248C",
    side: "C",
    qty: 3,
    entry: 1.20,
    exit: "1.58/be",
    pnl: +114,
    pct: +31.7,
    result: "WIN",
    status: "done",
    strat: "0DTE Momentum",
    hold: "2m 35s",
    trigger: {
      type: "ENTRY",
      user: "alerts",
      msg: "TSLA 248c momo"
    }
  }, {
    t: "09:41:03",
    close: "09:43:18",
    tk: "SPY",
    strike: "587C",
    side: "C",
    qty: 5,
    entry: 1.05,
    exit: 1.39,
    pnl: +170,
    pct: +32.4,
    result: "WIN",
    status: "done",
    strat: "0DTE Momentum",
    hold: "2m 15s",
    trigger: {
      type: "ENTRY",
      user: "alerts",
      msg: "SPY 587c, momo long"
    }
  }, {
    t: "09:36:18",
    close: "09:37:02",
    tk: "AMD",
    strike: "168P",
    side: "P",
    qty: 4,
    entry: 0.84,
    exit: 0.62,
    pnl: -88,
    pct: -26.2,
    result: "LOSS",
    status: "done",
    strat: "Fade Open",
    hold: "0m 44s",
    stopped: true,
    trigger: {
      type: "ENTRY",
      user: "alerts",
      msg: "AMD 168p stab"
    }
  }, {
    t: "09:33:09",
    close: "09:35:44",
    tk: "QQQ",
    strike: "501C",
    side: "C",
    qty: 3,
    entry: 1.66,
    exit: "2.01/be",
    pnl: +105,
    pct: +21.1,
    result: "WIN",
    status: "done",
    strat: "0DTE Momentum",
    hold: "2m 35s",
    trigger: {
      type: "ENTRY",
      user: "alerts",
      msg: "QQQ 501c off the open"
    }
  }];

  // ---- KPI headline metrics (order: net, best, worst, avg return, win rate, open) ----
  const kpis = {
    netPnl: {
      value: "+$354.00",
      delta: "+4.2%",
      tone: "profit"
    },
    bestTrade: {
      value: "+32.4%",
      sub: "SPY 587C ×5",
      tone: "profit"
    },
    worstTrade: {
      value: "\u221226.2%",
      sub: "AMD 168P ×4",
      tone: "loss"
    },
    avgReturn: {
      value: "+9.7%",
      sub: "per closed trade"
    },
    winRate: {
      value: "56%",
      sub: "5W / 3L · 1 BE"
    },
    openPos: {
      value: "1",
      sub: "+$96 unrealized",
      tone: "profit"
    }
  };

  // ---- Discord firing log (enriched) ----
  // type: WATCH | ENTRY | PARTIAL | CLOSE ; fired ; reason ; symbol ; latency ; action
  const discord = [{
    t: "11:42:08",
    type: "ENTRY",
    user: "alerts",
    ch: "0dte-alerts",
    symbol: "SPY 589C",
    msg: "in SPY 589c @ 1.38, 0dte runner",
    fired: true,
    latency: "0.9s",
    action: "BUY ×4 @ 1.38"
  }, {
    t: "11:40:51",
    type: "WATCH",
    user: "alerts",
    ch: "0dte-alerts",
    symbol: "SPY",
    msg: "SPY reclaiming VWAP, watching 589c",
    fired: true,
    latency: "1.2s",
    action: "armed watch"
  }, {
    t: "11:39:10",
    type: "WATCH",
    user: "hypeguy",
    ch: "general",
    symbol: "—",
    msg: "WE ARE SO BACK \ud83d\ude80\ud83d\ude80",
    fired: false,
    reason: "hype"
  }, {
    t: "11:21:33",
    type: "CLOSE",
    user: "alerts",
    ch: "0dte-alerts",
    symbol: "QQQ 503C",
    msg: "out QQQ 503c, took the 20%",
    fired: true,
    latency: "0.7s",
    action: "SELL ×3 @ 2.46"
  }, {
    t: "11:19:02",
    type: "PARTIAL",
    user: "alerts",
    ch: "0dte-alerts",
    symbol: "QQQ 503C",
    msg: "trim QQQ 503c half here, stop to be",
    fired: true,
    latency: "1.1s",
    action: "SELL ×1 @ 2.46"
  }, {
    t: "11:05:44",
    type: "WATCH",
    user: "moonboy",
    ch: "general",
    symbol: "—",
    msg: "+23% already, LOCKED IN MAJORITY \ud83d\udcb0",
    fired: false,
    reason: "P&L brag"
  }, {
    t: "10:55:18",
    type: "CLOSE",
    user: "alerts",
    ch: "0dte-alerts",
    symbol: "IWM 214P",
    msg: "stopped IWM 214p, -22%",
    fired: true,
    latency: "0.6s",
    action: "SELL ×6 @ 0.71"
  }, {
    t: "10:38:01",
    type: "CLOSE",
    user: "alerts",
    ch: "0dte-alerts",
    symbol: "SPY 588C",
    msg: "closing SPY 588c, runner stopped at be",
    fired: true,
    latency: "0.8s",
    action: "SELL ×4 @ 1.80"
  }, {
    t: "10:37:12",
    type: "ENTRY",
    user: "alerts",
    ch: "0dte-alerts",
    symbol: "SPY 588C",
    msg: "SPY 588c here, size on",
    fired: true,
    latency: "1.0s",
    action: "BUY ×4 @ 1.42"
  }, {
    t: "10:30:27",
    type: "WATCH",
    user: "hypeguy",
    ch: "general",
    symbol: "—",
    msg: "EZ money day boys \ud83e\udd11",
    fired: false,
    reason: "hype"
  }, {
    t: "10:12:40",
    type: "ENTRY",
    user: "alerts",
    ch: "0dte-alerts",
    symbol: "NVDA 131C",
    msg: "lotto NVDA 131c small",
    fired: true,
    latency: "1.4s",
    action: "BUY ×2 @ 1.74"
  }, {
    t: "09:58:33",
    type: "ENTRY",
    user: "alerts",
    ch: "0dte-alerts",
    symbol: "QQQ 502P",
    msg: "QQQ 502p, fade the open",
    fired: true,
    latency: "0.9s",
    action: "BUY ×2 @ 2.10"
  }, {
    t: "09:50:02",
    type: "WATCH",
    user: "moonboy",
    ch: "general",
    symbol: "—",
    msg: "account up 4x this week \ud83d\udcc8\ud83d\udcc8",
    fired: false,
    reason: "P&L brag"
  }, {
    t: "09:41:03",
    type: "ENTRY",
    user: "alerts",
    ch: "0dte-alerts",
    symbol: "SPY 587C",
    msg: "SPY 587c, momo long",
    fired: true,
    latency: "0.8s",
    action: "BUY ×5 @ 1.05"
  }, {
    t: "09:36:18",
    type: "ENTRY",
    user: "alerts",
    ch: "0dte-alerts",
    symbol: "AMD 168P",
    msg: "AMD 168p stab",
    fired: true,
    latency: "1.3s",
    action: "BUY ×4 @ 0.84"
  }, {
    t: "09:33:09",
    type: "ENTRY",
    user: "alerts",
    ch: "0dte-alerts",
    symbol: "QQQ 501C",
    msg: "QQQ 501c off the open",
    fired: true,
    latency: "1.0s",
    action: "BUY ×3 @ 1.66"
  }];
  const summary14d = {
    fired: 41,
    filtered: 112
  };

  // ---- Strategies ----
  const strategies = [{
    name: "0DTE Momentum",
    status: "live",
    desc: "Buys 0DTE calls/puts on VWAP reclaims from the alerts channel.",
    trades: 6,
    winRate: 83,
    pnl: +570,
    avgReturn: +24.9,
    alloc: "$300/trade"
  }, {
    name: "Fade Open",
    status: "paused",
    desc: "Fades the opening drive; tight stop. Disabled after 3 reds.",
    trades: 3,
    winRate: 0,
    pnl: -310,
    avgReturn: -23.9,
    alloc: "$300/trade"
  }, {
    name: "Lotto",
    status: "live",
    desc: "Small size on far-OTM end-of-day lottos. Capped exposure.",
    trades: 1,
    winRate: 0,
    pnl: 0,
    avgReturn: 0.0,
    alloc: "$100/trade"
  }, {
    name: "Earnings IV",
    status: "off",
    desc: "Pre-earnings IV expansion plays. Off during 0DTE hours.",
    trades: 0,
    winRate: 0,
    pnl: 0,
    avgReturn: 0.0,
    alloc: "$500/trade"
  }];

  // ---- Backtest (0DTE Momentum, 30 sessions) ----
  const backtest = {
    strategy: "0DTE Momentum",
    range: "Last 30 sessions",
    stats: [{
      label: "total return",
      value: "+38.4%",
      tone: "profit"
    }, {
      label: "net p&l",
      value: "+$11,520",
      tone: "profit"
    }, {
      label: "win rate",
      value: "61%"
    }, {
      label: "profit factor",
      value: "1.94"
    }, {
      label: "max drawdown",
      value: "\u22128.7%",
      tone: "loss"
    }, {
      label: "sharpe",
      value: "2.31"
    }, {
      label: "trades",
      value: "248"
    }, {
      label: "avg hold",
      value: "5m 48s"
    }],
    // cumulative % equity over 30 sessions (with drawdowns)
    equity: [0, 3.2, 1.8, 5.4, 8.1, 6.2, 9.8, 13.1, 11.0, 14.6, 18.2, 16.1, 12.9, 15.8, 19.4, 22.1, 20.0, 24.3, 27.8, 25.1, 28.9, 31.2, 29.0, 26.5, 30.1, 33.4, 31.8, 35.0, 37.2, 38.4]
  };

  // ---- Daily roll-up for the P&L chart's 1W / 1M ranges.
  //      Derived from the 30-session equity curve: per-session % change,
  //      with $ scaled at ~$90 per percentage-point on this account. ----
  const daily = (() => {
    const eq = backtest.equity,
      out = [];
    for (let i = 1; i < eq.length; i++) {
      const dPct = Math.round((eq[i] - eq[i - 1]) * 10) / 10;
      out.push({
        pct: dPct,
        pnl: Math.round(dPct * 90)
      });
    }
    return out; // 29 sessions, oldest -> newest
  })();

  // ============================================================
  // STRATEGY SETTINGS — single source of truth for the bot's sizing,
  // exit/risk and streaming rules. This is the canonical config the
  // operator edits to retune the active strategy.
  //   >> CLAUDE CODE: edit these values to change bot behaviour. <<
  // ============================================================
  const strategyParams = {
    name: "0DTE Momentum",
    sizing: {
      trade_budget_usd: 300,
      // max $ per entry
      max_contracts_per_trade: 10,
      // hard cap
      // Quantity = floor(budget / (live_ask * 100)); market order; 0DTE / nearest-listed expiry
      order_type: "market",
      expiry: "0DTE / nearest-listed",
      quantity_formula: "floor(budget \u00f7 (live_ask \u00d7 100))"
    },
    exits: {
      stop_loss_pct: 0.20,
      // -20% resting stop at Schwab
      breakeven_at_pct: 0.20,
      // at +20%, move stop to breakeven
      take_half_at_pct: 0.50,
      // at +50%, sell half
      // Partial/scale = sell half (round up); position-aware:
      // 2nd scale closes the runner; 1 contract -> close fully
      scale_note: "Sell half (round up); position-aware: 2nd scale closes the runner; 1 contract \u2192 close fully"
    },
    streaming: {
      // STREAMING WINDOW — the live-trades feed and the header "streaming"
      // dot are green/blinking ONLY inside the first N hours after the
      // regular open (09:30 ET); red outside it.
      //   >> CLAUDE CODE: change window_hours to widen/narrow streaming. <<
      window_hours: 2.5
    }
  };

  // ---- Market hours. State is computed in market_tz (auto DST); ALL times
  //      are DISPLAYED in display_tz (the operator's own zone, auto DST). ----
  const marketHours = {
    market_tz: "America/New_York",
    // NYSE — where the exchange lives
    display_tz: "Europe/Amsterdam",
    // YOUR timezone — every time on screen is shown here
    premarket_open_et: "04:00",
    // pre-market opens (ET)
    regular_open_et: "09:30",
    // regular session opens (ET)
    regular_close_et: "16:00" // regular session closes (ET)
  };
  window.NT_DATA = {
    trades,
    kpis,
    discord,
    summary14d,
    strategies,
    backtest,
    daily,
    strategyParams,
    marketHours,
    session: {
      date: "Jun 14",
      window: "09:30 \u2013 12:00 ET",
      budget: "$300",
      mode: "DRY-RUN",
      strategy: "0DTE Momentum",
      user: "Gianni"
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.KillSwitch = __ds_scope.KillSwitch;

__ds_ns.ModePill = __ds_scope.ModePill;

__ds_ns.FiredBadge = __ds_scope.FiredBadge;

__ds_ns.KpiCard = __ds_scope.KpiCard;

__ds_ns.ResultBadge = __ds_scope.ResultBadge;

__ds_ns.StatusDot = __ds_scope.StatusDot;

__ds_ns.TypeChip = __ds_scope.TypeChip;

})();

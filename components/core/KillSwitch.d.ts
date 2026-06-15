import * as React from "react";

export interface KillSwitchProps {
  /** ARMED = bot may trade (shows "ACTIVE"); TRIPPED = all trading halted (shows "DEACTIVATED"). @default "ARMED" */
  state?: "ARMED" | "TRIPPED";
  /** Toggle handler. */
  onToggle?: () => void;
  /** Show the ACTIVE/DEACTIVATED text label. @default true */
  label?: boolean;
  style?: React.CSSProperties;
}

/**
 * Hardware-style safety toggle that halts all trading. Green=active, red=deactivated.
 */
export function KillSwitch(props: KillSwitchProps): JSX.Element;

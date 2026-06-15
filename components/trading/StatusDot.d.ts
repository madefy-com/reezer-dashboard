import * as React from "react";

export interface StatusDotProps {
  /** Process state. @default "live" */
  status?: "live" | "firing" | "done" | "cancelled" | "open" | "profit" | "loss";
  /** Pass `true` for the default label text, a string for custom, or omit for dot-only. */
  label?: boolean | string | null;
  /** Dot diameter in px. @default 8 */
  size?: number;
  style?: React.CSSProperties;
}

/**
 * Blinking status indicator for live processes (live / firing / done / cancelled).
 */
export function StatusDot(props: StatusDotProps): JSX.Element;

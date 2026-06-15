import * as React from "react";

/**
 * Headline metric card — light-weight mono value, signed delta, sub note.
 */
export interface KpiCardProps {
  /** Lowercase micro-label, e.g. "net p&l". */
  label: React.ReactNode;
  /** The headline value, e.g. "+$2,840.50" or "63%". */
  value: React.ReactNode;
  /** Optional signed delta pill, e.g. "+12.4%". Sign auto-colors up/down when a string. */
  delta?: React.ReactNode;
  /** Force delta direction (overrides sign detection). */
  deltaDir?: "up" | "down" | null;
  /** Secondary note under the value, e.g. "18W / 11L". */
  sub?: React.ReactNode;
  /** Colors the value for P&L. @default "neutral" */
  tone?: "neutral" | "profit" | "loss";
  /** Optional top-right icon (Lucide <svg>). */
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Headline metric card — light-weight mono value, signed delta, sub note.
 */
export function KpiCard(props: KpiCardProps): JSX.Element;

import * as React from "react";

/**
 * Trade-outcome badge: WIN green / LOSS red / OPEN blue / BE gray.
 */
export interface ResultBadgeProps {
  /** Trade outcome. @default "OPEN" */
  result?: "WIN" | "LOSS" | "OPEN" | "BE" | "BREAKEVEN";
  /** @default "md" */
  size?: "sm" | "md";
  style?: React.CSSProperties;
}

/**
 * Trade-outcome badge: WIN green / LOSS red / OPEN blue / BE gray.
 */
export function ResultBadge(props: ResultBadgeProps): JSX.Element;

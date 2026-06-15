import * as React from "react";

export interface ModePillProps {
  /** Run mode. @default "DRY-RUN" */
  mode?: "LIVE" | "DRY-RUN";
  /** When provided, the pill is clickable (toggle mode). */
  onToggle?: () => void;
  style?: React.CSSProperties;
}

/**
 * Run-mode indicator: LIVE (green, pulsing) vs DRY-RUN (amber).
 */
export function ModePill(props: ModePillProps): JSX.Element;

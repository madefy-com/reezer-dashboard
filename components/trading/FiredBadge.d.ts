import * as React from "react";

export interface FiredBadgeProps {
  /** True = a real order was placed (green FIRED). False = ignored (muted FILTERED). @default false */
  fired?: boolean;
  /** Why it was filtered, shown after "FILTERED ·" (e.g. "hype", "dupe"). Ignored when fired. */
  reason?: string | null;
  style?: React.CSSProperties;
}

/**
 * Firing-log outcome: green FIRED vs muted FILTERED·reason.
 */
export function FiredBadge(props: FiredBadgeProps): JSX.Element;

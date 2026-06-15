import * as React from "react";

/**
 * Primary action control. Flat, hairline-bordered, no gradients.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. `primary` = violet brand action; `danger` = irreversible / money-moving. @default "secondary" */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Leading icon node (e.g. a Lucide <svg>). */
  icon?: React.ReactNode;
  /** Trailing icon node. */
  iconRight?: React.ReactNode;
  /** Stretch to container width. @default false */
  full?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Primary action control. Flat, hairline-bordered, no gradients.
 */
export function Button(props: ButtonProps): JSX.Element;

import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Optional header title. When set, a hairline-divided header row renders. */
  title?: React.ReactNode;
  /** Right-aligned header slot (buttons, filters, a status pill). */
  action?: React.ReactNode;
  /** Body padding in px (also drives header padding). @default 20 */
  padding?: number;
  /** Use the inset (ink-3) surface instead of the card (ink-2) surface. @default false */
  inset?: boolean;
  /** Adds hover affordance (border + surface step). @default false */
  interactive?: boolean;
  /** Element/tag to render as. @default "div" */
  as?: keyof JSX.IntrinsicElements;
  bodyStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * The signature surface: flat ink-2 fill, hairline border, 16px radius.
 * @startingPoint section="Core" subtitle="Card surface with optional header" viewport="700x200"
 */
export function Card(props: CardProps): JSX.Element;

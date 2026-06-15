import * as React from "react";

/**
 * Discord message-type chip: WATCH blue / ENTRY purple / PARTIAL amber / CLOSE teal.
 */
export interface TypeChipProps {
  /** Discord message class. @default "WATCH" */
  type?: "WATCH" | "ENTRY" | "PARTIAL" | "CLOSE";
  style?: React.CSSProperties;
}

/**
 * Discord message-type chip: WATCH blue / ENTRY purple / PARTIAL amber / CLOSE teal.
 */
export function TypeChip(props: TypeChipProps): JSX.Element;

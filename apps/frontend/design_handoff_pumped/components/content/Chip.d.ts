import * as React from 'react';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** CSS color for a leading status dot (e.g. var(--clay-sage) for "fresh"). Omit for no dot. */
  dot?: string;
  /** Selected/filter-on state — tints with the accent. Default false. */
  active?: boolean;
  children?: React.ReactNode;
}

/**
 * Rounded status / filter pill with an optional colored status dot.
 */
export function Chip(props: ChipProps): JSX.Element;

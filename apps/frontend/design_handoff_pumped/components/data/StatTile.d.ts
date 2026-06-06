import * as React from 'react';

export interface StatTileProps {
  /** Small caption above the value. */
  label: React.ReactNode;
  /** The metric. Numbers render with tabular figures. */
  value: React.ReactNode;
  /** Optional trailing unit (kg, days, %). */
  unit?: React.ReactNode;
  /** Optional leading <Icon/> beside the label. */
  icon?: React.ReactNode;
  /** card (default, cream) or raised (moss). */
  variant?: 'card' | 'raised';
  style?: React.CSSProperties;
}

/**
 * A labelled metric tile. Lay several in a grid for a stat strip; make one
 * `raised` (moss) to highlight the headline number.
 */
export function StatTile(props: StatTileProps): JSX.Element;

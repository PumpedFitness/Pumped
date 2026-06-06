import * as React from 'react';

export interface RingGaugeProps {
  /** Progress 0–100. */
  value?: number;
  /** Outer diameter in px. Default 84. */
  size?: number;
  /** Ring thickness in px. Default 11. */
  thickness?: number;
  /** Unfilled track color. Default a faint cream (for use on moss). */
  track?: string;
  /** Filled-arc color. Default cream; pass var(--accent) on a moss surface for the rest timer. */
  fill?: string;
  /** Center disc color — match the surface the ring sits on. Default moss. */
  center?: string;
  /** Center content, e.g. the number + a tiny label. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Conic progress ring with a value in the center. Recovery, readiness, rest.
 * Set `center` to the background it sits on so the donut hole blends in.
 */
export function RingGauge(props: RingGaugeProps): JSX.Element;

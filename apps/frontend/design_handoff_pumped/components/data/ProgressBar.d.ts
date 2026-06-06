import * as React from 'react';

export interface ProgressBarProps {
  /** Fill 0–100. */
  value?: number;
  /** Track height in px. Default 6. */
  height?: number;
  /** Fill color. Default accent. */
  color?: string;
  style?: React.CSSProperties;
}

/**
 * A soft pill-shaped progress track with an animated fill. Workout / goal progress.
 */
export function ProgressBar(props: ProgressBarProps): JSX.Element;

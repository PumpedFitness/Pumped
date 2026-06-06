import * as React from 'react';

export type IconName =
  | 'dumbbell' | 'flame' | 'clock' | 'chevron' | 'chevronDown' | 'back'
  | 'plus' | 'minus' | 'check' | 'x' | 'arrowUp' | 'bolt' | 'calendar'
  | 'pulse' | 'play' | 'target' | 'trend' | 'settings' | 'home' | 'award'
  | 'skip' | 'rest' | 'swap' | 'edit' | 'more';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Which icon to render. */
  name: IconName;
  /** Pixel size (width = height). Default 24. */
  size?: number;
  /** Stroke width on the 24px grid. Default 1.75. Use 2–2.6 for tiny sizes. */
  stroke?: number;
  /** Stroke color. Default currentColor — set text color on the parent instead. */
  color?: string;
}

/**
 * Pumped's custom line-icon set. 24px grid, round caps, currentColor.
 */
export function Icon(props: IconProps): JSX.Element | null;

export const ICON_NAMES: IconName[];

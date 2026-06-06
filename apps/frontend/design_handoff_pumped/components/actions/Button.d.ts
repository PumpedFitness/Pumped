import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. primary = accent CTA, secondary = moss, ghost = quiet outline. Default 'primary'. */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Leading element, typically <Icon …/>. */
  icon?: React.ReactNode;
  /** Trailing element, typically <Icon …/>. */
  iconRight?: React.ReactNode;
  /** Fully-rounded pill. Default true. Set false for an 18px radius. */
  pill?: boolean;
  /** Stretch to container width. Default false. */
  block?: boolean;
  disabled?: boolean;
}

/**
 * Pumped's primary action control. Pill-shaped, display-font label, gentle
 * press-shrink. Use exactly one `primary` button per view.
 */
export function Button(props: ButtonProps): JSX.Element;

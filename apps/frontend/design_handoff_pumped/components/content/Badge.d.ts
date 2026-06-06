import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** accent (default), moss, success, or soft (accent-tinted). */
  tone?: 'accent' | 'moss' | 'success' | 'soft';
  children?: React.ReactNode;
}

/**
 * Tiny uppercase label for emphasis — TODAY markers, PR counts, "NEW".
 */
export function Badge(props: BadgeProps): JSX.Element;

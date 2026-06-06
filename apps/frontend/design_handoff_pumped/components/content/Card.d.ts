import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** card = cream surface (default), raised = moss hero, sunk = inset well, float = card with soft drop shadow. */
  variant?: 'card' | 'raised' | 'sunk' | 'float';
  /** Corner radius token. Default 'lg' (22px). Use '2xl' for hero cards. */
  radius?: 'md' | 'lg' | 'xl' | '2xl' | string;
  /** Padding in px (or any CSS value). Default 18. */
  pad?: number | string;
  children?: React.ReactNode;
}

/**
 * Rounded surface container — the structural unit of every screen.
 * `raised` is the signature moss treatment for the most important card.
 */
export function Card(props: CardProps): JSX.Element;

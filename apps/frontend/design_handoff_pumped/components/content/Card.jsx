import React from 'react';

const SURFACES = {
  card:   { background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1px solid var(--border-hairline)', boxShadow: 'none' },
  raised: { background: 'var(--surface-raised)', color: 'var(--text-on-raised)', border: 'none', boxShadow: 'var(--shadow-raised)' },
  sunk:   { background: 'var(--surface-sunk)', color: 'var(--text-primary)', border: '1px solid var(--border-soft)', boxShadow: 'none' },
  float:  { background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1px solid var(--border-hairline)', boxShadow: 'var(--shadow-card)' },
};

const RADII = { md: 'var(--radius-md)', lg: 'var(--radius-lg)', xl: 'var(--radius-xl)', '2xl': 'var(--radius-2xl)' };

/**
 * Card — a rounded surface. The visual backbone of every Pumped screen.
 */
export function Card({ children, variant = 'card', radius = 'lg', pad = 18, style = {}, ...rest }) {
  const s = SURFACES[variant] || SURFACES.card;
  return (
    <div style={{ borderRadius: RADII[radius] || radius, padding: pad, ...s, ...style }} {...rest}>
      {children}
    </div>
  );
}

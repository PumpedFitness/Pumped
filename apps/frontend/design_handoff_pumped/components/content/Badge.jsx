import React from 'react';

const TONES = {
  accent:  { background: 'var(--accent)', color: 'var(--accent-ink)' },
  moss:    { background: 'var(--surface-raised)', color: 'var(--text-on-raised)' },
  success: { background: 'var(--success)', color: 'var(--clay-cream)' },
  soft:    { background: 'var(--accent-soft)', color: 'var(--accent)' },
};

/**
 * Badge — a tiny emphatic label, e.g. TODAY or a PR count.
 */
export function Badge({ children, tone = 'accent', style = {}, ...rest }) {
  const t = TONES[tone] || TONES.accent;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
        ...t, ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}

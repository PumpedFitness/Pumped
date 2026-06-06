import React from 'react';

/**
 * Chip — a rounded pill for status / filters, with an optional leading dot.
 */
export function Chip({ children, dot, active = false, style = {}, ...rest }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '9px 14px', borderRadius: 'var(--radius-pill)',
        background: active ? 'var(--accent-soft)' : 'var(--surface-card)',
        border: '1px solid ' + (active ? 'transparent' : 'var(--border-hairline)'),
        color: active ? 'var(--accent)' : 'var(--text-primary)',
        fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {dot && <span style={{ width: 8, height: 8, borderRadius: 999, background: dot, flexShrink: 0 }} />}
      {children}
    </span>
  );
}

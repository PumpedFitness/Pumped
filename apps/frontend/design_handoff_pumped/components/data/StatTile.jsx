import React from 'react';

/**
 * StatTile — a labelled metric. Big display-font value with tabular figures.
 */
export function StatTile({ label, value, unit, icon, variant = 'card', style = {} }) {
  const raised = variant === 'raised';
  return (
    <div style={{
      background: raised ? 'var(--surface-raised)' : 'var(--surface-card)',
      color: raised ? 'var(--text-on-raised)' : 'var(--text-primary)',
      border: raised ? 'none' : '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)', padding: '15px 18px', ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: raised ? 'var(--text-on-raised-dim)' : 'var(--accent)' }}>
        {icon}
        <span style={{ fontSize: 12.5, fontWeight: 600, color: raised ? 'var(--text-on-raised-dim)' : 'var(--text-muted)' }}>{label}</span>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginTop: 6,
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
      }}>
        {value}{unit && <span style={{ fontSize: 13, fontWeight: 500, color: raised ? 'var(--text-on-raised-dim)' : 'var(--text-muted)' }}> {unit}</span>}
      </div>
    </div>
  );
}

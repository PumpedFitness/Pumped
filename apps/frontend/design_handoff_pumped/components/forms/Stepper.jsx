import React from 'react';

/**
 * Stepper — minus / value / plus for adjusting a number (weight, reps).
 * Designed to sit on a moss well; pass onMoss={false} for cream surfaces.
 */
export function Stepper({ label, value, unit, step = 1, onChange, onMoss = true }) {
  const btn = (delta, icon) => (
    <button type="button" onClick={() => onChange && onChange(Math.max(0, Math.round((value + delta) * 10) / 10))}
      style={{
        width: 40, height: 40, borderRadius: 'var(--radius-sm)', cursor: 'pointer', flexShrink: 0,
        border: '1px solid var(--border-hairline)', background: 'var(--surface-app)', color: 'var(--text-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</button>
  );
  return (
    <div style={{
      flex: 1, background: onMoss ? 'var(--surface-well)' : 'var(--surface-sunk)',
      borderRadius: 'var(--radius-md)', padding: '10px 10px 12px',
    }}>
      {label && (
        <div style={{
          fontSize: 11, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em',
          fontWeight: 600, marginBottom: 8, color: onMoss ? 'var(--text-on-raised-dim)' : 'var(--text-muted)',
        }}>{label}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {btn(-step, <Glyph kind="minus" />)}
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
          color: onMoss ? 'var(--clay-cream)' : 'var(--text-primary)',
        }}>{value}{unit && <span style={{ fontSize: 12, fontWeight: 500, color: onMoss ? 'var(--text-on-raised-dim)' : 'var(--text-muted)' }}> {unit}</span>}</span>
        {btn(step, <Glyph kind="plus" />)}
      </div>
    </div>
  );
}

// inline glyphs so the component has no cross-dependency on the Icon bundle
function Glyph({ kind }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 12h14" />{kind === 'plus' && <path d="M12 5v14" />}
    </svg>
  );
}

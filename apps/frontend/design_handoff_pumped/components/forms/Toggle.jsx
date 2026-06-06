import React from 'react';

/**
 * Toggle — an on/off switch. Accent when on.
 */
export function Toggle({ checked = false, onChange, style = {} }) {
  return (
    <button type="button" role="switch" aria-checked={checked}
      onClick={() => onChange && onChange(!checked)}
      style={{
        width: 46, height: 28, borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
        background: checked ? 'var(--accent)' : 'rgba(52,54,44,0.16)', position: 'relative',
        transition: 'background var(--dur-base)', flexShrink: 0, padding: 0, ...style,
      }}>
      <span style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3, width: 22, height: 22,
        borderRadius: '50%', background: '#fff', transition: 'left var(--dur-base) var(--ease-soft)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

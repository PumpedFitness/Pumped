import React from 'react';

/**
 * SegmentedControl — pick one of 2–4 short options. Sliding accent thumb.
 */
export function SegmentedControl({ options = [], value, onChange, style = {} }) {
  const n = options.length || 1;
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  return (
    <div style={{
      position: 'relative', display: 'flex', padding: 3, gap: 0,
      background: 'var(--surface-sunk)', borderRadius: 'var(--radius-pill)',
      border: '1px solid var(--border-soft)', ...style,
    }}>
      <div style={{
        position: 'absolute', top: 3, bottom: 3, left: `calc(3px + ${idx} * (100% - 6px) / ${n})`,
        width: `calc((100% - 6px) / ${n})`, background: 'var(--accent)',
        borderRadius: 'var(--radius-pill)', transition: 'left var(--dur-base) var(--ease-soft)',
      }} />
      {opts.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" onClick={() => onChange && onChange(o.value)}
            style={{
              position: 'relative', flex: 1, height: 38, border: 'none', background: 'transparent',
              cursor: 'pointer', borderRadius: 'var(--radius-pill)',
              fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
              color: on ? 'var(--accent-ink)' : 'var(--text-secondary)',
              transition: 'color var(--dur-base)', textTransform: 'capitalize',
            }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

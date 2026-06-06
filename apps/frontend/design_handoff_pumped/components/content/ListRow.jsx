import React from 'react';

/**
 * ListRow — a settings / detail row with a soft accent icon tile.
 * Compose inside a <Card pad={0}> to form a grouped list.
 */
export function ListRow({ icon, label, detail, trailing, divider = false, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px',
        borderTop: divider ? '1px solid var(--border-hairline)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {icon && (
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--radius-sm)', flexShrink: 0,
          background: 'var(--accent-soft)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</div>
      )}
      <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500 }}>{label}</span>
      {detail && <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{detail}</span>}
      {trailing}
    </div>
  );
}

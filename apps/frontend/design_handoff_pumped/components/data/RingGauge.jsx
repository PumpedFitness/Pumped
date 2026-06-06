import React from 'react';

/**
 * RingGauge — a conic progress ring with a value in the middle. Used for
 * recovery / readiness / rest. Renders correctly on moss or cream.
 */
export function RingGauge({
  value = 0, size = 84, thickness = 11,
  track = 'rgba(243,238,226,0.2)', fill = 'var(--clay-cream)',
  center = 'var(--surface-raised)', children, style = {},
}) {
  const deg = Math.max(0, Math.min(100, value)) * 3.6;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `conic-gradient(${fill} 0deg ${deg}deg, ${track} ${deg}deg 360deg)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', ...style,
    }}>
      <div style={{
        width: size - thickness * 2, height: size - thickness * 2, borderRadius: '50%',
        background: center, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}

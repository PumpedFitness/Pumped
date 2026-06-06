import React from 'react';

/**
 * ProgressBar — a soft track with an accent fill. Workout / goal progress.
 */
export function ProgressBar({ value = 0, height = 6, color = 'var(--accent)', style = {} }) {
  return (
    <div style={{
      height, borderRadius: 'var(--radius-pill)', background: 'rgba(52,54,44,0.08)',
      overflow: 'hidden', ...style,
    }}>
      <div style={{
        height: '100%', width: `${Math.max(0, Math.min(100, value))}%`,
        background: color, borderRadius: 'var(--radius-pill)',
        transition: 'width var(--dur-slow) var(--ease-soft)',
      }} />
    </div>
  );
}

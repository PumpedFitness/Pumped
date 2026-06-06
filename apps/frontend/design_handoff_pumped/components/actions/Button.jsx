import React from 'react';

const SIZES = {
  sm: { height: 40, padding: '0 16px', font: 14 },
  md: { height: 52, padding: '0 22px', font: 16 },
  lg: { height: 56, padding: '0 24px', font: 16.5 },
};

const VARIANTS = {
  // accent CTA — the single loudest action on a screen
  primary:   { background: 'var(--accent)', color: 'var(--accent-ink)', shadow: 'var(--shadow-accent)' },
  // moss — confident secondary action / "next"
  secondary: { background: 'var(--surface-raised)', color: 'var(--text-on-raised)', shadow: 'none' },
  // quiet outline on the ground
  ghost:     { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-hairline)', shadow: 'none' },
};

/**
 * Button — the brand's primary action. Pill by default, display-font label.
 */
export function Button({
  children, variant = 'primary', size = 'md', icon, iconRight,
  pill = true, block = false, disabled = false, style = {}, ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <button
      disabled={disabled}
      style={{
        height: s.height, padding: s.padding,
        width: block ? '100%' : undefined,
        borderRadius: pill ? 'var(--radius-pill)' : 'var(--radius-md)',
        border: v.border || 'none', background: v.background, color: v.color,
        boxShadow: v.shadow, cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        fontFamily: 'var(--font-display)', fontSize: s.font, fontWeight: 600,
        whiteSpace: 'nowrap', transition: 'transform var(--dur-fast) var(--ease-soft), filter var(--dur-fast)',
        ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.96)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      {...rest}
    >
      {icon}{children}{iconRight}
    </button>
  );
}

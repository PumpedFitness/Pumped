// kit-theme.jsx — maps the Pumped design tokens (CSS variables) into the
// shape the screen components expect: { C, d, sp }. Because every color is a
// var() reference, the kit is themed entirely by styles.css — set
// data-accent="sage" on a wrapper to recolor, or change --density.

function buildKitTheme(density = 'regular') {
  const d = ({ compact: 0.82, regular: 1, cozy: 1.18 })[density] ?? 1;
  const C = {
    bg: 'var(--clay-bg)',
    bgWarm: 'var(--clay-bg-warm)',
    moss: 'var(--clay-moss)',
    mossDeep: 'var(--clay-moss-deep)',
    cream: 'var(--clay-cream)',
    creamDim: 'var(--text-on-raised-dim)',
    card: 'var(--clay-card)',
    cardSunk: 'var(--clay-card-sunk)',
    ink: 'var(--clay-ink)',
    ink2: 'var(--clay-ink-2)',
    muted: 'var(--clay-muted)',
    line: 'var(--border-hairline)',
    lineSoft: 'var(--border-soft)',
    accent: 'var(--accent)',
    accentInk: 'var(--accent-ink)',
    accentSoft: 'var(--accent-soft)',
    sageDot: 'var(--clay-sage)',
    good: 'var(--clay-sage)',
  };
  return { C, d, sp: (n) => Math.round(n * d), density };
}

window.buildKitTheme = buildKitTheme;

// ─────────────────────────────────────────────────────────────────────────────
// Pumped — Color Theme — SINGLE SOURCE OF TRUTH  (PUMPED v2 design system)
// ─────────────────────────────────────────────────────────────────────────────
// Edit colors HERE and only here.
//
//   • app `global.css` is GENERATED from this file (see
//     apps/frontend/scripts/generate-theme-css.ts, which runs automatically via
//     the `dev:prepare` script before every ios / android / start). Do not edit
//     its theme block.
//   • `tokens.ts` derives its runtime `colors` (for StyleSheet / SVG) from here.
//
// Regenerate global.css manually: `bun run scripts/generate-theme-css.ts`
//
// v2 language: warm-grey grounds + near-black ink + a single terracotta accent.
// No greens, no gradients — depth comes only from layered shadows.
// ─────────────────────────────────────────────────────────────────────────────

/** Convert a hex color to an `rgba(...)` string. */
export const alpha = (hex: string, a: number): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

// ── Core hues — the raw paints everything else is mixed from ──────────────────
const ink = '#1B1A18'; // primary text, inverted surfaces, primary (dark) button
const ink2 = '#57544F'; // secondary text, stepper glyphs
const onInk = '#F4F2EF'; // text/icons on ink (dark) surfaces
const terracotta = '#E2542C'; // accent (start, rest, ƒx, PR marker)
const accentHover = '#F05F35';
const accentPress = '#C2431F'; // accent text on white / pressed accent
const honey = '#C2974C'; // warning / alt accent
const rose = '#BC4A3A'; // danger / alt accent
const sage = '#6E8358'; // success / alt accent

/** Theme-independent brand anchors (same in light & dark). */
export const brand = {
  ink,
  ink2,
  cream: onInk, // light text on dark surfaces (v2 "on-ink")
  sage,
  // Repurposed from the old moss green → v2 charcoals (no greens in v2)
  moss: '#26241F', // ink-nav (floating tab bar)
  mossDeep: ink,
  surfaceWell: '#DFDCD8', // sunken well
  accentInk: accentPress, // accent text/ink on light
  // Accent states
  accentHover,
  accentPress,
  // Alternate accents (functional status)
  accentHoney: honey,
  accentRose: rose,
  accentSage: sage,
  // Extra ground + chart tones
  bgWarm: '#DCDAD6', // ground-desk
  track: '#EBE8E4', // progress / bar-chart track
  barIdle: '#E7E4E0', // unfilled bars, empty tick circle
  sunken: '#DFDCD8', // segmented-control track
} as const;

// ── Semantic tokens, keyed by their CSS custom-property name ───────────────────
// These become both the `--name` CSS variables and the runtime `colors` object.

export const light = {
  background: '#E8E6E2', // ground
  foreground: ink,

  surface: '#FCFBFA',
  'surface-foreground': ink,

  overlay: ink, // inverted (charcoal) cards — bodyweight card, dark panels
  'overlay-foreground': onInk,
  backdrop: alpha(ink, 0.38), // bottom-sheet scrim

  muted: '#8C8880',
  default: '#DFDCD8', // sunken / segmented track
  'default-foreground': ink2,

  accent: terracotta,
  'accent-foreground': onInk,
  'accent-soft': alpha(terracotta, 0.1), // accent-tint
  'accent-soft-foreground': accentPress,

  'field-background': '#FCFBFA',
  'field-foreground': ink,
  'field-placeholder': '#A9A6A1', // muted-2
  'field-border': alpha(ink, 0.08), // hairline

  success: sage,
  'success-foreground': onInk,
  warning: honey,
  'warning-foreground': onInk,
  danger: rose,
  'danger-foreground': onInk,

  segment: '#DFDCD8',
  'segment-foreground': ink,

  border: alpha(ink, 0.08), // hairline
  separator: alpha(ink, 0.06),
} as const;

export const dark = {
  background: '#1B1A18',
  foreground: onInk,

  surface: '#26241F',
  'surface-foreground': onInk,

  overlay: '#0F0E0D',
  'overlay-foreground': onInk,
  backdrop: 'rgba(0, 0, 0, 0.55)',

  muted: '#8C8880',
  default: '#2E2C28',
  'default-foreground': '#C9C6C1',

  accent: terracotta,
  'accent-foreground': onInk,
  'accent-soft': alpha(terracotta, 0.2),
  'accent-soft-foreground': accentHover,

  'field-background': '#232220',
  'field-foreground': onInk,
  'field-placeholder': '#8C8880',
  'field-border': alpha(onInk, 0.12),

  success: sage,
  'success-foreground': onInk,
  warning: honey,
  'warning-foreground': ink,
  danger: rose,
  'danger-foreground': onInk,

  segment: '#2E2C28',
  'segment-foreground': onInk,

  border: alpha(onInk, 0.1),
  separator: alpha(onInk, 0.06),
} as const;

/** Per-theme shadow CSS strings (multi-value, kept verbatim). */
export const shadowVars = {
  light: {
    surface: '0 12px 28px rgba(27, 26, 24, 0.06), 0 2px 5px rgba(27, 26, 24, 0.03)',
    overlay: '0 12px 28px rgba(27, 26, 24, 0.14)',
    field: 'inset 0 2px 5px rgba(27, 26, 24, 0.08)',
  },
  dark: {
    surface: 'none',
    overlay: '0 20px 44px -22px rgba(0, 0, 0, 0.70)',
    field: 'inset 0 2px 5px rgba(0, 0, 0, 0.30)',
  },
} as const;

export type ThemeColors = typeof light;

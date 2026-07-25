// ─────────────────────────────────────────────────────────────────────────────
// Pumped — Color Theme — SINGLE SOURCE OF TRUTH
// ─────────────────────────────────────────────────────────────────────────────
// Edit colors HERE and only here.
//
//   • `global.css`   is GENERATED from this file (see scripts/generate-theme-css.ts,
//                    which runs automatically via the `dev:prepare` script before
//                    every ios / android / start). Do not edit its theme block.
//   • `tokens.ts`    derives its runtime `colors` (for StyleSheet / SVG) from here.
//
// To regenerate global.css manually: `bun run scripts/generate-theme-css.ts`
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
const ink = '#34362C'; // primary text — rgb(52, 54, 44)
const ink2 = '#54564A'; // secondary text
const cream = '#F3EEE2';
const terracotta = '#C67B52'; // accent
const honey = '#C2974C'; // warning / alt accent
const rose = '#B26B62'; // danger / alt accent
const sage = '#7E9061'; // success / alt accent

/** Theme-independent brand anchors (same in light & dark). */
export const brand = {
  ink,
  ink2,
  cream,
  sage,
  moss: '#46583C',
  mossDeep: '#3A4A32',
  surfaceWell: '#3A4A32',
  accentInk: '#3A2A1C',
  // Alternate accents (swap `accent` below to re-theme)
  accentHoney: honey,
  accentRose: rose,
  accentSage: sage,
  // Extra ground tone not exposed as a CSS var
  bgWarm: '#E4DCCB',
} as const;

// ── Semantic tokens, keyed by their CSS custom-property name ───────────────────
// These become both the `--name` CSS variables and the runtime `colors` object.

export const light = {
  background: '#EAE3D5',
  foreground: ink,

  surface: '#F7F2E8',
  'surface-foreground': ink,

  overlay: '#46583C',
  'overlay-foreground': cream,
  backdrop: alpha(ink, 0.32),

  muted: '#928E7E',
  default: '#EFE8DA',
  'default-foreground': ink2,

  accent: terracotta,
  'accent-foreground': '#3A2A1C',
  'accent-soft': alpha(terracotta, 0.14),
  'accent-soft-foreground': terracotta,

  'field-background': '#F7F2E8',
  'field-foreground': ink,
  'field-placeholder': '#928E7E',
  'field-border': alpha(ink, 0.09),

  success: sage,
  'success-foreground': cream,
  warning: honey,
  'warning-foreground': '#3A2A1C',
  danger: rose,
  'danger-foreground': cream,

  segment: '#EFE8DA',
  'segment-foreground': ink,

  border: alpha(ink, 0.09),
  separator: alpha(ink, 0.06),
} as const;

export const dark = {
  background: '#2A2C24',
  foreground: cream,

  surface: '#34362C',
  'surface-foreground': cream,

  overlay: '#46583C',
  'overlay-foreground': cream,
  backdrop: 'rgba(0, 0, 0, 0.50)',

  muted: '#928E7E',
  default: '#3A3C32',
  'default-foreground': '#C8C4B8',

  accent: terracotta,
  'accent-foreground': '#3A2A1C',
  'accent-soft': alpha(terracotta, 0.18),
  'accent-soft-foreground': terracotta,

  'field-background': '#2E302A',
  'field-foreground': cream,
  'field-placeholder': '#928E7E',
  'field-border': alpha(cream, 0.12),

  success: sage,
  'success-foreground': cream,
  warning: honey,
  'warning-foreground': '#3A2A1C',
  danger: rose,
  'danger-foreground': cream,

  segment: '#3A3C32',
  'segment-foreground': cream,

  border: alpha(cream, 0.1),
  separator: alpha(cream, 0.06),
} as const;

/** Per-theme shadow CSS strings (multi-value, kept verbatim). */
export const shadowVars = {
  light: {
    surface: '0 1px 2px rgba(52, 54, 44, 0.04), 0 18px 40px -22px rgba(52, 54, 44, 0.10)',
    overlay: '0 20px 44px -22px rgba(70, 88, 60, 0.70)',
    field: 'none',
  },
  dark: {
    surface: 'none',
    overlay: '0 20px 44px -22px rgba(0, 0, 0, 0.70)',
    field: 'none',
  },
} as const;

export type ThemeColors = typeof light;

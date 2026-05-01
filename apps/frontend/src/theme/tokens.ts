// Pumped design tokens — use these for StyleSheet-based styling
// where Tailwind classes aren't available (e.g. SVG, animations)

export const colors = {
  // Dark theme (default)
  bg: '#0A0B0C',
  surface: '#0F1113',
  surfaceRaised: '#16191C',
  surfaceInput: '#0B0D0F',
  surfaceHover: '#1B1F23',
  surfacePress: '#22272C',

  textPrimary: '#F4F5F6',
  textSecondary: '#B4B9BF',
  textMuted: '#6F767D',
  textDisabled: '#3D4147',

  border: '#1F2327',
  borderSoft: '#15181B',
  borderStrong: '#2A2F34',

  // Accent — clay (default)
  accent: '#D4A574',
  accentForeground: '#1A1209',
  accentSoft: 'rgba(212, 165, 116, 0.14)',
  accentGlow: 'rgba(212, 165, 116, 0.30)',

  success: '#6EF0C8',
  warning: '#F4C24A',
  danger: '#FF5D5D',
  offline: '#8A6A2E',
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 64,
} as const;

export const radii = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  pill: 9999,
} as const;

export const typography = {
  display: 56,
  h1: 32,
  h2: 24,
  h3: 20,
  body: 16,
  label: 14,
  caption: 12,
  micro: 11,
} as const;

export const motion = {
  fast: 80,
  base: 140,
  slow: 200,
} as const;

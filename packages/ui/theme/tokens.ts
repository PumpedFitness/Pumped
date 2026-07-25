// Clay design system tokens — use these for StyleSheet-based styling
// where Tailwind classes aren't available (e.g. SVG, animations).
//
// Colors are DERIVED from the single source of truth in ./palette.ts.
// To change the theme, edit palette.ts — never hardcode colors here.

import { alpha, brand, light } from './palette';

export const colors = {
  // Ground & Surfaces
  bg: light.background,
  bgWarm: brand.bgWarm,
  card: light.surface,
  cardSunk: light.default,

  // Moss (brand anchor)
  moss: brand.moss,
  mossDeep: brand.mossDeep,
  cream: brand.cream,
  creamDim: alpha(brand.cream, 0.6),

  // Text / Ink
  ink: light.foreground,
  ink2: brand.ink2,
  muted: light.muted,
  sage: brand.sage,

  // Accent — terracotta (default)
  accent: light.accent,
  accentInk: brand.accentInk,
  accentSoft: light['accent-soft'],

  // Borders
  line: light.border,
  lineSoft: light.separator,
  lineOnMoss: alpha(brand.cream, 0.16),

  // Status
  success: light.success,
  warning: light.warning,
  danger: light.danger,

  // Alternate accents (swap via theme)
  accentHoney: brand.accentHoney,
  accentRose: brand.accentRose,
  accentSage: brand.accentSage,
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
} as const;

export const radii = {
  sm: 12,
  md: 18,
  lg: 22,
  xl: 28,
  '2xl': 34,
  pill: 999,
} as const;

export const typography = {
  display: 30,
  title: 21,
  heading: 17,
  stat: 28,
  body: 15,
  label: 13.5,
  caption: 12.5,
  micro: 11,
} as const;

export const shadows = {
  card: {
    shadowColor: brand.ink,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 2,
  },
  raised: {
    shadowColor: brand.moss,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.7,
    shadowRadius: 44,
    elevation: 8,
  },
  nav: {
    shadowColor: brand.moss,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 34,
    elevation: 10,
  },
  accent: {
    shadowColor: light.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.9,
    shadowRadius: 22,
    elevation: 6,
  },
} as const;

export const motion = {
  fast: 120,
  base: 200,
  slow: 400,
} as const;

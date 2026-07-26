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
  sunken: brand.sunken,

  // Charcoal / inverted brand anchors (v2 has no greens)
  moss: brand.moss,
  mossDeep: brand.mossDeep,
  cream: brand.cream,
  creamDim: alpha(brand.cream, 0.6),
  onInk: brand.cream,

  // Chart / meter tones
  track: brand.track,
  barIdle: brand.barIdle,

  // Text / Ink
  ink: light.foreground,
  ink2: brand.ink2,
  muted: light.muted,
  muted2: light['field-placeholder'],
  sage: brand.sage,

  // Accent — terracotta
  accent: light.accent,
  accentHover: brand.accentHover,
  accentPress: brand.accentPress,
  accentInk: brand.accentInk,
  accentSoft: light['accent-soft'],

  // Borders
  line: light.border,
  lineSoft: light.separator,
  lineOnInk: alpha(brand.cream, 0.16),
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

// v2 radii: inputs 18 · rows/set-rows 20–22 · modules 26 · hero/chart 28 ·
// sheets (top) 34 · pills 999
export const radii = {
  sm: 18,
  md: 22,
  lg: 26,
  xl: 28,
  '2xl': 34,
  pill: 999,
} as const;

export const typography = {
  display: 34,
  title: 20,
  heading: 19,
  stat: 46,
  body: 15,
  label: 13,
  caption: 12.5,
  micro: 11,
} as const;

// v2 elevation — single-layer RN approximations of the design's layered shadows.
export const shadows = {
  card: {
    shadowColor: brand.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 2,
  },
  hero: {
    shadowColor: brand.ink,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.09,
    shadowRadius: 34,
    elevation: 4,
  },
  row: {
    shadowColor: brand.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 1,
  },
  circle: {
    shadowColor: brand.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  // charcoal / inverted card
  raised: {
    shadowColor: brand.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 8,
  },
  invertedCard: {
    shadowColor: brand.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 8,
  },
  // active segmented-control pill — crisp so the sliding white pill clearly
  // reads against the track (iOS-segmented style).
  chip: {
    shadowColor: brand.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 3,
  },
  // floating tab bar
  nav: {
    shadowColor: brand.ink,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 34,
    elevation: 12,
  },
  // primary dark button
  buttonInk: {
    shadowColor: brand.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 26,
    elevation: 6,
  },
  // accent start button
  accent: {
    shadowColor: light.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 6,
  },
  // rest timer card
  restCard: {
    shadowColor: light.accent,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.26,
    shadowRadius: 30,
    elevation: 8,
  },
} as const;

export const motion = {
  fast: 120,
  base: 200,
  slow: 400,
} as const;

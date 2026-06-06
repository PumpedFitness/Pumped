// Clay design system tokens — use these for StyleSheet-based styling
// where Tailwind classes aren't available (e.g. SVG, animations)

export const colors = {
  // Ground & Surfaces
  bg: '#EAE3D5',
  bgWarm: '#E4DCCB',
  card: '#F7F2E8',
  cardSunk: '#EFE8DA',

  // Moss (brand anchor)
  moss: '#46583C',
  mossDeep: '#3A4A32',
  cream: '#F3EEE2',
  creamDim: 'rgba(243, 238, 226, 0.6)',

  // Text / Ink
  ink: '#34362C',
  ink2: '#54564A',
  muted: '#928E7E',
  sage: '#7E9061',

  // Accent — terracotta (default)
  accent: '#C67B52',
  accentInk: '#3A2A1C',
  accentSoft: 'rgba(198, 123, 82, 0.14)',

  // Borders
  line: 'rgba(52, 54, 44, 0.09)',
  lineSoft: 'rgba(52, 54, 44, 0.06)',
  lineOnMoss: 'rgba(243, 238, 226, 0.16)',

  // Status
  success: '#7E9061',
  warning: '#C2974C',
  danger: '#B26B62',

  // Alternate accents (swap via theme)
  accentHoney: '#C2974C',
  accentRose: '#B26B62',
  accentSage: '#7E9061',
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
    shadowColor: 'rgba(52, 54, 44, 1)',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 2,
  },
  raised: {
    shadowColor: 'rgba(70, 88, 60, 1)',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.7,
    shadowRadius: 44,
    elevation: 8,
  },
  nav: {
    shadowColor: 'rgba(70, 88, 60, 1)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 34,
    elevation: 10,
  },
  accent: {
    shadowColor: '#C67B52',
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

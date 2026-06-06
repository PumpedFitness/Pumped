import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { colors, radii, shadows } from '../../theme/tokens';

const SURFACES = {
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  raised: {
    backgroundColor: colors.moss,
    ...shadows.raised,
  },
  sunk: {
    backgroundColor: colors.cardSunk,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  float: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.card,
  },
} as const;

const RADII: Record<string, number> = {
  md: radii.md,
  lg: radii.lg,
  xl: radii.xl,
  '2xl': radii['2xl'],
};

type CardProps = {
  children: ReactNode;
  variant?: 'card' | 'raised' | 'sunk' | 'float';
  radius?: 'md' | 'lg' | 'xl' | '2xl';
  pad?: number;
  style?: ViewStyle;
};

export function Card({
  children,
  variant = 'card',
  radius = 'lg',
  pad = 18,
  style,
}: CardProps) {
  const surface = SURFACES[variant];

  return (
    <View
      style={[
        surface,
        {
          borderRadius: RADII[radius] ?? radii.lg,
          padding: pad,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

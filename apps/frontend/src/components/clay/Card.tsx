import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { shadows } from '@/theme/tokens';

const SURFACES = {
  card: 'bg-surface-card border border-border-hairline',
  raised: 'bg-moss',
  sunk: 'bg-surface-sunk border border-border-soft',
  float: 'bg-surface-card border border-border-hairline',
} as const;

const SURFACE_SHADOWS = {
  card: undefined,
  raised: shadows.raised,
  sunk: undefined,
  float: shadows.card,
} as const;

const RADII = {
  md: 'rounded-[18px]',
  lg: 'rounded-[22px]',
  xl: 'rounded-[28px]',
  '2xl': 'rounded-[34px]',
} as const;

type CardProps = {
  children: ReactNode;
  variant?: 'card' | 'raised' | 'sunk' | 'float';
  radius?: 'md' | 'lg' | 'xl' | '2xl';
  pad?: number;
  style?: ViewStyle;
  className?: string;
};

export function Card({
  children,
  variant = 'card',
  radius = 'lg',
  pad = 18,
  style,
  className = '',
}: CardProps) {
  return (
    <View
      className={`overflow-hidden ${SURFACES[variant]} ${RADII[radius]} ${className}`}
      style={[SURFACE_SHADOWS[variant], { padding: pad }, style]}
    >
      {children}
    </View>
  );
}

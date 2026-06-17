import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { shadows } from '@/theme/tokens';

const SIZES = {
  sm: 'h-10 px-4',
  md: 'h-[52px] px-[22px]',
  lg: 'h-14 px-6',
} as const;

const TEXT_SIZES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-[16.5px]',
} as const;

const VARIANTS = {
  primary: 'bg-accent',
  secondary: 'bg-moss',
  ghost: 'bg-transparent border border-border-hairline',
} as const;

const TEXT_COLORS = {
  primary: 'text-accent-foreground',
  secondary: 'text-cream',
  ghost: 'text-foreground',
} as const;

const VARIANT_SHADOWS = {
  primary: shadows.accent,
  secondary: undefined,
  ghost: undefined,
} as const;

type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconRight?: ReactNode;
  pill?: boolean;
  block?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
  testID?: string;
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  pill = true,
  block = false,
  disabled = false,
  onPress,
  className = '',
  testID,
}: ButtonProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center gap-[9px] active:scale-[0.96] ${
        SIZES[size]
      } ${VARIANTS[variant]} ${pill ? 'rounded-full' : 'rounded-[18px]'} ${
        block ? 'self-stretch' : 'self-auto'
      } ${disabled ? 'opacity-50' : ''} ${className}`}
      style={VARIANT_SHADOWS[variant]}
    >
      {icon && <View>{icon}</View>}
      <Text
        className={`font-semibold ${TEXT_SIZES[size]} ${TEXT_COLORS[variant]}`}
      >
        {children}
      </Text>
      {iconRight && <View>{iconRight}</View>}
    </Pressable>
  );
}

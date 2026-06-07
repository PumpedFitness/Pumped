import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, radii, shadows } from '../../theme/tokens';

const SIZES = {
  sm: { height: 40, paddingHorizontal: 16, fontSize: 14 },
  md: { height: 52, paddingHorizontal: 22, fontSize: 16 },
  lg: { height: 56, paddingHorizontal: 24, fontSize: 16.5 },
} as const;

const VARIANTS = {
  primary: {
    bg: colors.accent,
    color: colors.accentInk,
    shadow: shadows.accent,
  },
  secondary: {
    bg: colors.moss,
    color: colors.cream,
    shadow: undefined,
  },
  ghost: {
    bg: 'transparent',
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
    shadow: undefined,
  },
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
}: ButtonProps) {
  const s = SIZES[size];
  const v = VARIANTS[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: pill ? radii.pill : radii.md,
          backgroundColor: v.bg,
          opacity: disabled ? 0.5 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          alignSelf: block ? 'stretch' : 'auto',
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
        'borderWidth' in v && {
          borderWidth: v.borderWidth,
          borderColor: v.borderColor,
        },
        v.shadow,
      ]}
    >
      {icon && <View>{icon}</View>}
      <Text
        style={{
          fontSize: s.fontSize,
          fontWeight: '600',
          color: v.color,
        }}
      >
        {children}
      </Text>
      {iconRight && <View>{iconRight}</View>}
    </Pressable>
  );
}

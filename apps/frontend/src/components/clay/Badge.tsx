import type { ReactNode } from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { colors, radii } from '../../theme/tokens';

const TONES = {
  accent: { bg: colors.accent, color: colors.accentInk },
  moss: { bg: colors.moss, color: colors.cream },
  success: { bg: colors.success, color: colors.cream },
  soft: { bg: colors.accentSoft, color: colors.accent },
} as const;

type BadgeProps = {
  children: ReactNode;
  tone?: 'accent' | 'moss' | 'success' | 'soft';
  style?: ViewStyle;
};

export function Badge({ children, tone = 'accent', style }: BadgeProps) {
  const t = TONES[tone];

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingVertical: 5,
          paddingHorizontal: 10,
          borderRadius: radii.pill,
          backgroundColor: t.bg,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.44,
          textTransform: 'uppercase',
          color: t.color,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

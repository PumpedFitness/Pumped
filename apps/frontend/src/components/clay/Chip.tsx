import type { ReactNode } from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { colors, radii } from '../../theme/tokens';

type ChipProps = {
  children: ReactNode;
  dot?: string;
  active?: boolean;
  style?: ViewStyle;
};

export function Chip({ children, dot, active = false, style }: ChipProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          paddingVertical: 9,
          paddingHorizontal: 14,
          borderRadius: radii.pill,
          backgroundColor: active ? colors.accentSoft : colors.card,
          borderWidth: 1,
          borderColor: active ? 'transparent' : colors.line,
        },
        style,
      ]}
    >
      {dot && (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: dot,
          }}
        />
      )}
      <Text
        style={{
          fontSize: 13.5,
          fontWeight: '500',
          color: active ? colors.accent : colors.ink,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

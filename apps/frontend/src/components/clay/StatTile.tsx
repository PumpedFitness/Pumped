import type { ReactNode } from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { colors, radii } from '../../theme/tokens';

type StatTileProps = {
  label: ReactNode;
  value: ReactNode;
  unit?: string;
  icon?: ReactNode;
  variant?: 'card' | 'raised';
  style?: ViewStyle;
};

export function StatTile({
  label,
  value,
  unit,
  icon,
  variant = 'card',
  style,
}: StatTileProps) {
  const raised = variant === 'raised';

  return (
    <View
      style={[
        {
          backgroundColor: raised ? colors.moss : colors.card,
          borderRadius: radii.lg,
          padding: 15,
          paddingHorizontal: 18,
          borderWidth: raised ? 0 : 1,
          borderColor: colors.line,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {icon}
        <Text
          style={{
            fontSize: 12.5,
            fontWeight: '600',
            color: raised ? colors.creamDim : colors.muted,
          }}
        >
          {label}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: '700',
            color: raised ? colors.cream : colors.ink,
            fontVariant: ['tabular-nums'],
            letterSpacing: -0.26,
          }}
        >
          {value}
        </Text>
        {unit && (
          <Text
            style={{
              fontSize: 13,
              fontWeight: '500',
              color: raised ? colors.creamDim : colors.muted,
              marginLeft: 4,
            }}
          >
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
}

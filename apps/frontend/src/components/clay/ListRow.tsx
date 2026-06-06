import type { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors, radii } from '../../theme/tokens';

type ListRowProps = {
  icon?: ReactNode;
  label: ReactNode;
  detail?: ReactNode;
  trailing?: ReactNode;
  divider?: boolean;
  onPress?: () => void;
};

export function ListRow({
  icon,
  label,
  detail,
  trailing,
  divider = false,
  onPress,
}: ListRowProps) {
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderTopWidth: divider ? 1 : 0,
        borderTopColor: colors.line,
      }}
    >
      {icon && (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: radii.sm,
            backgroundColor: colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
      )}
      <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: colors.ink }}>
        {label}
      </Text>
      {detail && (
        <Text style={{ fontSize: 14, color: colors.muted }}>{detail}</Text>
      )}
      {trailing}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

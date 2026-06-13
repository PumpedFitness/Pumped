import type { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';

type ListRowProps = {
  icon?: ReactNode;
  label: ReactNode;
  detail?: ReactNode;
  trailing?: ReactNode;
  divider?: boolean;
  paddingVertical?: number;
  onPress?: () => void;
  className?: string;
};

export function ListRow({
  icon,
  label,
  detail,
  trailing,
  divider = false,
  paddingVertical = 14,
  onPress,
  className = '',
}: ListRowProps) {
  const content = (
    <View
      className={`flex-row items-center gap-[13px] px-4 ${
        divider ? 'border-t border-border-hairline' : ''
      } ${className}`}
      style={{ paddingVertical }}
    >
      {icon && (
        <View className="w-8 h-8 rounded-xl bg-accent-soft items-center justify-center">
          {icon}
        </View>
      )}
      <Text className="flex-1 text-[15px] font-medium text-foreground">
        {label}
      </Text>
      {detail && <Text className="text-sm text-muted">{detail}</Text>}
      {trailing}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

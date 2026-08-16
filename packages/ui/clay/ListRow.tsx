import type { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';

type ListRowProps = {
  icon?: ReactNode;
  label: ReactNode;
  /**
   * A descriptive second line under the label. Use this rather than `detail`
   * for anything longer than a value — `detail` sits beside the label and
   * takes the width it needs, which starves a long one.
   */
  subtitle?: string;
  detail?: ReactNode;
  trailing?: ReactNode;
  divider?: boolean;
  paddingVertical?: number;
  onPress?: () => void;
  className?: string;
  testID?: string;
};

export function ListRow({
  icon,
  label,
  subtitle,
  detail,
  trailing,
  divider = false,
  paddingVertical = 14,
  onPress,
  className = '',
  testID,
}: ListRowProps) {
  const content = (
    <View
      // When there's no Pressable wrapper, the View is the root and carries the
      // testID; otherwise the Pressable below owns it.
      testID={onPress ? undefined : testID}
      className={`min-h-[54px] flex-row items-center gap-[13px] px-[18px] ${
        divider ? 'border-t border-border-hairline' : ''
      } ${className}`}
      style={{ paddingVertical }}
    >
      {icon && (
        <View className="w-8 h-8 rounded-xl bg-accent-soft items-center justify-center">
          {icon}
        </View>
      )}
      <View className="flex-1">
        <Text className="text-[15px] font-medium text-foreground">{label}</Text>
        {subtitle ? (
          <Text className="mt-[2px] text-[12.5px] leading-[17px] text-muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {detail && (
        <Text className="shrink text-sm text-muted" numberOfLines={1}>
          {detail}
        </Text>
      )}
      {trailing}
    </View>
  );

  if (onPress) {
    return (
      <Pressable testID={testID} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}

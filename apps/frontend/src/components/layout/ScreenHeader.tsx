import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';

type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
  backAccessibilityLabel?: string;
  right?: ReactNode;
};

export function ScreenHeader({
  title,
  onBack,
  backAccessibilityLabel,
  right,
}: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center border-b border-border-soft px-4 py-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backAccessibilityLabel}
        className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-card"
        onPress={onBack}
      >
        <ClayIcon name="back" size={20} color={colors.ink} />
      </Pressable>
      <Text className="t-heading ml-2 flex-1" numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}

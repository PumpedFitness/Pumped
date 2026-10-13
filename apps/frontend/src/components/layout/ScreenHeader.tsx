import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { ScreenHeader as PageHeading } from '@pumped/ui/clay/ScreenHeader';
import { colors } from '@pumped/ui/theme/tokens';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backAccessibilityLabel?: string;
  right?: ReactNode;
};

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backAccessibilityLabel,
  right,
}: ScreenHeaderProps) {
  return (
    <View className="bg-background">
      <View className="h-[52px] flex-row items-center justify-between px-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backAccessibilityLabel}
          className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-card"
          onPress={onBack}
        >
          <ClayIcon name="back" size={20} color={colors.ink} />
        </Pressable>
        {right}
      </View>
      <View className="px-5 pb-4 pt-4">
        <PageHeading title={title} subtitle={subtitle} />
      </View>
    </View>
  );
}

import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '@pumped/ui/clay/ScreenHeader';

type ModalHeaderProps = {
  title: string;
  leftLabel?: string;
  rightLabel: string;
  onLeftPress: () => void;
  onRightPress: () => void;
};

export function ModalHeader({
  title,
  leftLabel,
  rightLabel,
  onLeftPress,
  onRightPress,
}: ModalHeaderProps) {
  const { t } = useTranslation();
  const resolvedLeftLabel = leftLabel ?? t('common.cancel');

  return (
    <View className="bg-background">
      <View className="h-[52px] flex-row items-center justify-between px-5">
        <Pressable
          accessibilityRole="button"
          className="h-11 min-w-16 items-start justify-center"
          onPress={onLeftPress}
        >
          <Text className="t-label text-foreground-secondary">
            {resolvedLeftLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          className="h-11 min-w-16 items-end justify-center"
          onPress={onRightPress}
        >
          <Text className="t-label text-accent">{rightLabel}</Text>
        </Pressable>
      </View>
      <View className="px-5 pb-4 pt-4">
        <ScreenHeader title={title} />
      </View>
    </View>
  );
}

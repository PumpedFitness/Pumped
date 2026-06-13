import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
    <View className="flex-row items-center justify-between border-b border-border-soft px-5 py-3">
      <Pressable
        accessibilityRole="button"
        className="h-11 min-w-16 items-start justify-center"
        onPress={onLeftPress}
      >
        <Text className="t-label text-foreground-secondary">
          {resolvedLeftLabel}
        </Text>
      </Pressable>
      <Text className="t-heading">{title}</Text>
      <Pressable
        accessibilityRole="button"
        className="h-11 min-w-16 items-end justify-center"
        onPress={onRightPress}
      >
        <Text className="t-label text-accent">{rightLabel}</Text>
      </Pressable>
    </View>
  );
}

import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';

type CompletedWorkoutHeaderProps = {
  onBack: () => void;
  onOptions: () => void;
  showOptions: boolean;
};

export function CompletedWorkoutHeader({
  onBack,
  onOptions,
  showOptions,
}: CompletedWorkoutHeaderProps) {
  const { t } = useTranslation();
  return (
    <View
      testID="completed-workout-header"
      className="h-14 flex-row items-center gap-2 bg-background px-4"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('completedWorkout.backA11y')}
        className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-card"
        onPress={onBack}
      >
        <ClayIcon name="back" size={20} color={colors.ink} />
      </Pressable>
      <Text className="t-title min-w-0 flex-1" numberOfLines={1}>
        {t('completedWorkout.title')}
      </Text>
      {showOptions ? (
        <Button
          testID="completed-workout-options"
          accessibilityLabel={t('completedWorkout.optionsA11y')}
          variant="ghost"
          className="h-9 w-9 min-w-9 rounded-full p-0"
          hitSlop={4}
          feedbackVariant="scale"
          onPress={onOptions}
        >
          <ClayIcon name="more" size={18} color={colors.ink} />
        </Button>
      ) : null}
    </View>
  );
}

import { ScreenHeader } from '@/components/layout/ScreenHeader';
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
    <ScreenHeader
      testID="completed-workout-header"
      title={t('completedWorkout.title')}
      onBack={onBack}
      backAccessibilityLabel={t('completedWorkout.backA11y')}
      right={
        showOptions ? (
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
        ) : null
      }
    />
  );
}

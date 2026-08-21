import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from 'heroui-native';

type ExerciseSelectionFooterProps = {
  isSuperset: boolean;
  selectedCount: number;
  canConfirm: boolean;
  onConfirm: () => void;
  onCancelSuperset: () => void;
};

export function ExerciseSelectionFooter({
  isSuperset,
  selectedCount,
  canConfirm,
  onConfirm,
  onCancelSuperset,
}: ExerciseSelectionFooterProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 gap-2 border-t border-border-soft bg-background px-5 pt-3"
      // Keep the CTA clear of the system navigation bar — the screen draws
      // edge-to-edge, and a button under the (translucent) bar looks
      // tappable but the bar consumes the touches.
      style={{ paddingBottom: Math.max(insets.bottom + 8, 20) }}
    >
      {isSuperset && !canConfirm ? (
        <Text className="t-caption text-center">
          {t('exerciseSelection.superset.minimum')}
        </Text>
      ) : null}

      <Button
        className={`h-14 rounded-full ${
          canConfirm ? 'bg-accent' : 'bg-surface-sunk'
        }`}
        testID={isSuperset ? 'add_superset' : 'use_exercises'}
        isDisabled={!canConfirm}
        feedbackVariant="scale"
        onPress={onConfirm}
      >
        <Button.Label
          className={`font-bold ${
            canConfirm ? 'text-accent-foreground' : 'text-muted'
          }`}
        >
          {t(
            isSuperset
              ? 'exerciseSelection.superset.confirm'
              : 'exerciseSelection.useExercises',
            { count: selectedCount },
          )}
        </Button.Label>
      </Button>

      {isSuperset ? (
        <Pressable
          accessibilityRole="button"
          className="min-h-11 items-center justify-center"
          onPress={onCancelSuperset}
        >
          <Text className="t-label text-foreground-secondary">
            {t('exerciseSelection.superset.cancel')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

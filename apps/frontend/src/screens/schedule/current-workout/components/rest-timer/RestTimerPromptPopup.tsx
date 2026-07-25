import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { OptionPopupFrame } from '@pumped/ui/clay/option-popup';

type RestTimerPromptPopupProps = {
  visible: boolean;
  // Records the user's choice. `true` enables auto-start (and starts the rest
  // that triggered the prompt); `false` disables it.
  onDecide: (enabled: boolean) => void;
  // Dismiss without choosing — the question is asked again on the next set.
  onClose: () => void;
};

// One-time ask, shown the first time a set with a rest is logged: should
// logging a set start its rest timer automatically? The answer persists and is
// editable later in Settings.
export function RestTimerPromptPopup({
  visible,
  onDecide,
  onClose,
}: RestTimerPromptPopupProps) {
  const { t } = useTranslation();

  return (
    <OptionPopupFrame
      visible={visible}
      title={t('currentWorkout.restPrompt.title')}
      text={t('currentWorkout.restPrompt.text')}
      footer={
        <View className="mt-5 flex-row gap-3">
          <Pressable
            accessibilityRole="button"
            className="min-h-12 flex-1 items-center justify-center rounded-full border border-border-hairline bg-surface-card"
            onPress={() => onDecide(false)}
          >
            <Text className="t-label">{t('currentWorkout.restPrompt.no')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className="min-h-12 flex-1 items-center justify-center rounded-full bg-accent"
            onPress={() => onDecide(true)}
          >
            <Text className="t-label text-accent-foreground">
              {t('currentWorkout.restPrompt.yes')}
            </Text>
          </Pressable>
        </View>
      }
      onClose={onClose}
    >
      {null}
    </OptionPopupFrame>
  );
}

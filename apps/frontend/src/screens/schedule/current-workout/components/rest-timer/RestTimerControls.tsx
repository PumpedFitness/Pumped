import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { REST_STEP_SECONDS } from './restTimerModel';

type RestTimerControlsProps = {
  isRunning: boolean;
  onToggle: () => void;
  onAddSeconds: (deltaSeconds: number) => void;
};

type AdjustButtonProps = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
};

function AdjustButton({ label, accessibilityLabel, onPress }: AdjustButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="h-14 w-14 items-center justify-center rounded-full border border-[rgba(243,238,226,0.18)] bg-[rgba(243,238,226,0.08)] active:bg-[rgba(243,238,226,0.16)]"
    >
      <Text className="text-[14px] font-bold text-cream tabular-nums">{label}</Text>
    </Pressable>
  );
}

export function RestTimerControls({
  isRunning,
  onToggle,
  onAddSeconds,
}: RestTimerControlsProps) {
  const { t } = useTranslation();
  const toggleLabel = isRunning
    ? t('currentWorkout.rest.pause')
    : t('currentWorkout.rest.resume');

  return (
    <View className="flex-row items-center justify-center gap-4">
      <AdjustButton
        label={`-${REST_STEP_SECONDS}s`}
        accessibilityLabel={t('currentWorkout.rest.subtractA11y', {
          seconds: REST_STEP_SECONDS,
        })}
        onPress={() => onAddSeconds(-REST_STEP_SECONDS)}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={toggleLabel}
        onPress={onToggle}
        className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-accent active:opacity-90"
      >
        <ClayIcon
          name={isRunning ? 'pause' : 'play'}
          size={18}
          color={colors.accentInk}
        />
        <Text className="t-label text-accent-foreground">{toggleLabel}</Text>
      </Pressable>

      <AdjustButton
        label={`+${REST_STEP_SECONDS}s`}
        accessibilityLabel={t('currentWorkout.rest.addA11y', {
          seconds: REST_STEP_SECONDS,
        })}
        onPress={() => onAddSeconds(REST_STEP_SECONDS)}
      />
    </View>
  );
}

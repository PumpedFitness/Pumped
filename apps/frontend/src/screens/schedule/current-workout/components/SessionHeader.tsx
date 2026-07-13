import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { getWorkoutOverlayProgress } from '@/components/workout/current-workout-overlay/currentWorkoutOverlayModel';
import { SessionTimer } from './SessionTimer';

type SessionHeaderProps = {
  workoutName: string;
  startedAt: number;
  pausedAt: number | null;
  pausedMs: number;
  completedSets: number;
  totalSets: number;
  onTogglePause: () => void;
  onBack: () => void;
};

export function SessionHeader({
  workoutName,
  startedAt,
  pausedAt,
  pausedMs,
  completedSets,
  totalSets,
  onTogglePause,
  onBack,
}: SessionHeaderProps) {
  const { t } = useTranslation();
  const progress = getWorkoutOverlayProgress(completedSets, totalSets);
  const isPaused = pausedAt != null;

  return (
    <View className="border-b border-border-soft bg-background px-4 pt-1 pb-2">
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('currentWorkout.backToPlanA11y')}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-card"
          onPress={onBack}
        >
          <ClayIcon name="back" size={20} color={colors.ink} />
        </Pressable>

        <Text className="t-heading flex-1" numberOfLines={1}>
          {workoutName}
        </Text>

        <SessionTimer
          startedAt={startedAt}
          pausedAt={pausedAt}
          pausedMs={pausedMs}
        />
        <Text className="text-[17px] font-bold text-sage tabular-nums tracking-[-0.3px]">
          {progress.percentage}%
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isPaused
              ? t('currentWorkout.resumeWorkoutA11y')
              : t('currentWorkout.pauseWorkoutA11y')
          }
          className="h-10 w-10 items-center justify-center rounded-full border border-border-hairline bg-surface-card active:bg-surface-sunk"
          onPress={onTogglePause}
        >
          <ClayIcon
            name={isPaused ? 'play' : 'pause'}
            size={17}
            color={colors.ink}
          />
        </Pressable>
      </View>

      <View className="mt-2 h-1 overflow-hidden rounded-full bg-surface-sunk">
        <View
          className="h-full rounded-full bg-sage"
          style={{ width: `${progress.percentage}%` }}
        />
      </View>
    </View>
  );
}

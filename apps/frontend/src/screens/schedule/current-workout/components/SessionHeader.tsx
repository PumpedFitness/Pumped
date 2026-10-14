import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@pumped/ui/theme/tokens';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { getWorkoutOverlayProgress } from '@/components/workout/current-workout-overlay/currentWorkoutOverlayModel';
import { SessionTimer } from './SessionTimer';
import { SessionProgressBar } from './SessionProgressBar';

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
    <View className="bg-background pb-2">
      <ScreenHeader
        title={workoutName}
        onBack={onBack}
        backAccessibilityLabel={t('currentWorkout.backToPlanA11y')}
        right={
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
        }
      />
      <View className="flex-row items-center justify-between px-5 py-2">
        <SessionTimer
          startedAt={startedAt}
          pausedAt={pausedAt}
          pausedMs={pausedMs}
        />
        <Text className="text-[17px] font-bold text-accent tabular-nums tracking-[-0.3px]">
          {progress.percentage}%
        </Text>
      </View>
      <View className="px-5">
        <SessionProgressBar
          completedSets={progress.completedSets}
          totalSets={progress.totalSets}
          percentage={progress.percentage}
        />
      </View>
    </View>
  );
}

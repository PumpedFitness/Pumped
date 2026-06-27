import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type { TodayWorkout } from '@/hooks/useTodayWorkout';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { WorkoutHistoryItemCard } from '@/screens/history/components/workout-history-item/WorkoutHistoryItemCard';

type ScheduleTodayHeaderProps = {
  state: TodayWorkout;
  scheduleName: string | null;
  weightUnit: WeightUnit;
  onStart: () => void;
  onSkip: () => void;
  onStartAnyway: () => void;
  onViewWorkout: (workoutId: string) => void;
};

export function ScheduleTodayHeader({
  state,
  scheduleName,
  weightUnit,
  onStart,
  onSkip,
  onStartAnyway,
  onViewWorkout,
}: ScheduleTodayHeaderProps) {
  const { t } = useTranslation();

  if (state.kind === 'no-schedule') {
    return (
      <View className="gap-1 rounded-[24px] border border-dashed border-border-soft bg-surface-card p-5">
        <Text className="t-heading">{t('schedule.today.noneTitle')}</Text>
        <Text className="t-caption text-muted">
          {t('schedule.today.noneBody')}
        </Text>
      </View>
    );
  }

  if (state.kind === 'done') {
    return (
      <View className="gap-2">
        <Text className="t-eyebrow text-muted">
          {t('schedule.today.completedEyebrow')}
        </Text>
        <WorkoutHistoryItemCard
          workout={state.workout}
          weightUnit={weightUnit}
          onPress={() => onViewWorkout(state.workout.id)}
        />
      </View>
    );
  }

  if (state.kind === 'skipped') {
    return (
      <View className="gap-3 rounded-[24px] bg-surface-sunk p-5">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-card">
            <ClayIcon name="skip" size={18} color={colors.muted} />
          </View>
          <View className="flex-1">
            <Text className="t-eyebrow text-muted">{scheduleName}</Text>
            <Text className="t-heading">{t('schedule.today.skipped')}</Text>
          </View>
        </View>

        <Button
          className="h-10 self-start rounded-full bg-accent px-6"
          feedbackVariant="scale"
          onPress={onStartAnyway}
        >
          <Button.Label className="text-[13px] font-bold text-accent-foreground">
            {t('schedule.today.startAnyway')}
          </Button.Label>
        </Button>
      </View>
    );
  }

  return (
    <View className="gap-3 rounded-[24px] bg-moss p-5">
      <View>
        <Text className="t-eyebrow text-cream-dim">
          {t('schedule.today.eyebrow')}
        </Text>
        <Text className="t-heading mt-0.5 text-cream">{scheduleName}</Text>
      </View>

      <View className="flex-row items-center gap-2">
        <ClayIcon
          name={state.kind === 'rest' ? 'rest' : 'dumbbell'}
          size={18}
          color={colors.cream}
        />
        <Text className="t-body text-cream">
          {state.kind === 'rest'
            ? t('schedule.today.restToday')
            : t('schedule.today.todayIs', { name: state.workoutName })}
        </Text>
      </View>

      {state.kind === 'pending' && (
        <>
          <Button
            className="h-12 rounded-full bg-accent"
            feedbackVariant="scale"
            onPress={onStart}
          >
            <Button.Label className="text-[15px] font-bold text-accent-foreground">
              {t('schedule.today.start')}
            </Button.Label>
          </Button>
          <Pressable
            accessibilityRole="button"
            className="items-center py-1"
            onPress={onSkip}
          >
            <Text className="t-label text-cream-dim">
              {t('schedule.today.skip')}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

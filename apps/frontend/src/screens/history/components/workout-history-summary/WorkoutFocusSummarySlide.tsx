import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WorkoutHistoryItem } from '@/hooks/useWorkoutHistory';
import { SummarySlideHeader } from './SummarySlideHeader';
import {
  buildMuscleFocus,
  getMonthSummary,
} from './workoutHistorySummaryModel';

type WorkoutFocusSummarySlideProps = {
  workouts: WorkoutHistoryItem[];
};

export function WorkoutFocusSummarySlide({
  workouts,
}: WorkoutFocusSummarySlideProps) {
  const { t, i18n } = useTranslation();
  const summary = getMonthSummary(workouts, i18n.language);
  const focus = buildMuscleFocus(summary.workouts);
  const totalSets = summary.workouts.reduce(
    (total, workout) => total + workout.sets.length,
    0,
  );
  const uniqueExercises = new Set(
    summary.workouts.flatMap(workout => workout.exerciseNames),
  ).size;
  const averageMinutes =
    summary.workouts.length > 0
      ? Math.round(summary.minutes / summary.workouts.length)
      : 0;

  return (
    <View className="flex-1 gap-5 p-5" collapsable={false}>
      <SummarySlideHeader
        eyebrow={t('history.summary.focus.eyebrow')}
        title={focus[0]?.name ?? t('history.summary.focus.emptyTitle')}
        description={
          focus.length > 0
            ? t('history.summary.focus.description', { month: summary.label })
            : t('history.summary.focus.emptyDescription')
        }
        icon="target"
      />

      <View className="flex-1 gap-4 rounded-[22px] border border-border-on-moss bg-white/[0.06] p-4">
        {focus.length > 0 ? (
          focus.map(item => (
            <View key={item.name} className="gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text className="t-label text-cream">{item.name}</Text>
                <Text className="t-caption tabular-nums text-cream-dim">
                  {Math.round(item.share * 100)}%
                </Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-white/10">
                <View
                  className="h-full rounded-full bg-sage"
                  style={{ width: `${Math.max(item.share * 100, 6)}%` }}
                />
              </View>
            </View>
          ))
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="t-caption max-w-[240px] text-center text-cream-dim">
              {t('history.summary.focus.emptyChart')}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1">
          <Text className="text-[19px] font-bold tabular-nums text-cream">
            {totalSets}
          </Text>
          <Text className="t-caption text-cream-dim">
            {t('history.summary.focus.statSets')}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-[19px] font-bold tabular-nums text-cream">
            {uniqueExercises}
          </Text>
          <Text className="t-caption text-cream-dim">
            {t('history.summary.focus.statExercises')}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-[19px] font-bold tabular-nums text-cream">
            {averageMinutes}
          </Text>
          <Text className="t-caption text-cream-dim">
            {t('history.summary.focus.statAvgMin')}
          </Text>
        </View>
      </View>
    </View>
  );
}

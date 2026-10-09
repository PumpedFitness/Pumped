import { ActivityIndicator, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@pumped/ui/theme/tokens';
import { useWorkoutHeartRate } from '@/hooks/useWorkoutHeartRate';
import type { WorkoutHistoryItem } from '@/hooks/useWorkoutHistory';
import type { ExerciseOption } from '@/types/exercise';
import type { ExerciseHeartRate } from '@/lib/health/algorithms/workoutHeartRate';
import { groupCompletedExercises } from './completedWorkoutModel';
import { WorkoutHeartRateChart } from './WorkoutHeartRateChart';

type CompletedWorkoutHeartRateProps = {
  workout: WorkoutHistoryItem;
  exerciseById: Map<string, ExerciseOption>;
};

type HeartRateStatProps = {
  label: string;
  value: number | null;
};

type ExerciseHeartRateRowProps = {
  name: string;
  color: string;
  stats: ExerciseHeartRate;
};

/**
 * Color key for exercises in the heart-rate card.
 *
 * Not the template palette: its terracotta, rose and honey sit too close to
 * each other and to the accent-colored heart-rate line. These are spread
 * around the hue wheel and kept clear of the accent's red-orange.
 */
const EXERCISE_KEY_COLORS = [
  '#3F6FB0',
  '#D29B22',
  '#2E9488',
  '#8A55A8',
  '#5E8F3F',
  '#5F6B7A',
] as const;

function bpm(value: number | null): string {
  return value === null ? '–' : `${Math.round(value)}`;
}

function HeartRateStat({ label, value }: HeartRateStatProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1">
      <Text className="t-eyebrow">{label}</Text>
      <Text className="t-label mt-1">
        {bpm(value)}
        <Text className="t-caption">
          {' '}
          {t('completedWorkout.heartRate.bpm')}
        </Text>
      </Text>
    </View>
  );
}

function ExerciseHeartRateRow({
  name,
  color,
  stats,
}: ExerciseHeartRateRowProps) {
  const { t } = useTranslation();
  const recovery =
    stats.recovery === null
      ? '–'
      : t('completedWorkout.heartRate.recoveryValue', {
          value: Math.round(stats.recovery),
        });

  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <View
        className="h-3 w-3 rounded-[3px]"
        style={{ backgroundColor: color }}
      />
      <Text className="t-body flex-1" numberOfLines={1}>
        {name}
      </Text>
      <Text className="t-caption w-10 text-right">{bpm(stats.average)}</Text>
      <Text className="t-caption w-10 text-right">{bpm(stats.peak)}</Text>
      <Text className="t-caption w-12 text-right">{recovery}</Text>
    </View>
  );
}

/**
 * Heart rate from the connected health source, matched to the workout's sets.
 * Hidden entirely when no source is connected.
 */
export function CompletedWorkoutHeartRate({
  workout,
  exerciseById,
}: CompletedWorkoutHeartRateProps) {
  const { t } = useTranslation();
  const { isAvailable, isFetching, heartRate } = useWorkoutHeartRate(workout);

  if (!isAvailable) return null;

  const exercises = groupCompletedExercises(workout);
  const colorByKey = new Map(
    exercises.map(
      (exercise, index) =>
        [
          exercise.key,
          EXERCISE_KEY_COLORS[index % EXERCISE_KEY_COLORS.length],
        ] as const,
    ),
  );
  const colorForExercise = (key: string) => colorByKey.get(key) ?? colors.muted;
  const statsByKey = new Map(
    heartRate.exercises.map(stats => [stats.exerciseKey, stats] as const),
  );

  return (
    <View className="rounded-[22px] border border-border-hairline bg-surface-card p-4">
      <View className="flex-row items-center justify-between">
        <Text className="t-eyebrow">
          {t('completedWorkout.heartRate.title')}
        </Text>
        {isFetching ? (
          <ActivityIndicator size="small" color={colors.muted} />
        ) : null}
      </View>

      {heartRate.resolution === 'none' ? (
        <Text className="t-caption mt-2">
          {t(
            isFetching
              ? 'completedWorkout.heartRate.loading'
              : 'completedWorkout.heartRate.empty',
          )}
        </Text>
      ) : (
        <>
          <View className="mt-3 flex-row gap-2">
            <HeartRateStat
              label={t('completedWorkout.heartRate.average')}
              value={heartRate.average}
            />
            <HeartRateStat
              label={t('completedWorkout.heartRate.peak')}
              value={heartRate.peak?.value ?? null}
            />
            <HeartRateStat
              label={t('completedWorkout.heartRate.low')}
              value={heartRate.low?.value ?? null}
            />
          </View>

          <View className="mt-4">
            <WorkoutHeartRateChart
              heartRate={heartRate}
              startedAt={workout.startedAt}
              colorForExercise={colorForExercise}
            />
          </View>

          {heartRate.resolution === 'sparse' ? (
            <Text className="t-caption mt-3">
              {t('completedWorkout.heartRate.sparse')}
            </Text>
          ) : null}

          {heartRate.exercises.length > 0 ? (
            <View className="mt-3 border-t border-border-hairline pt-2">
              <View className="flex-row items-center gap-3">
                <View className="w-3" />
                <View className="flex-1" />
                <Text className="t-eyebrow w-10 text-right">
                  {t('completedWorkout.heartRate.averageShort')}
                </Text>
                <Text className="t-eyebrow w-10 text-right">
                  {t('completedWorkout.heartRate.peakShort')}
                </Text>
                <Text className="t-eyebrow w-12 text-right">
                  {t('completedWorkout.heartRate.recoveryShort')}
                </Text>
              </View>
              <View className="divide-y divide-border-hairline">
                {exercises.map(exercise => {
                  const stats = statsByKey.get(exercise.key);
                  if (stats === undefined) return null;
                  return (
                    <ExerciseHeartRateRow
                      key={exercise.key}
                      name={
                        exerciseById.get(exercise.exerciseId)?.name ??
                        t('common.unknownExercise')
                      }
                      color={colorForExercise(exercise.key)}
                      stats={stats}
                    />
                  );
                })}
              </View>
              <Text className="t-caption mt-2">
                {t('completedWorkout.heartRate.recoveryHint')}
              </Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

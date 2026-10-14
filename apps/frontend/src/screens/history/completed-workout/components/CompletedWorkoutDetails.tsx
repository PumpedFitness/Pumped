import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import { useExerciseOptions } from '@/hooks/useExerciseOptions';
import type { WorkoutHistoryItem } from '@/hooks/useWorkoutHistory';
import { displayWeight } from '@/utils/units';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import { CompletedWorkoutExercises } from './CompletedWorkoutExercises';
import { CompletedWorkoutHeartRate } from './CompletedWorkoutHeartRate';
import { previousSetsForExercise } from './completedWorkoutModel';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';

type CompletedWorkoutDetailsProps = {
  workout: WorkoutHistoryItem | null;
  allWorkouts: WorkoutHistoryItem[];
  weightUnit: WeightUnit;
};

function formatDate(timestamp: number, language: string): string {
  return new Date(timestamp).toLocaleDateString(language, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timestamp: number, language: string): string {
  return new Date(timestamp).toLocaleTimeString(language, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatVolume(volumeKg: number, weightUnit: WeightUnit): string {
  const volume = displayWeight(volumeKg, weightUnit);
  return `${Math.round(volume).toLocaleString()} ${weightUnit}`;
}

type WorkoutStatProps = {
  label: string;
  value: string;
};

function WorkoutStat({ label, value }: WorkoutStatProps) {
  return (
    <View className="flex-1 gap-1">
      <Text className="text-[18px] font-semibold tabular-nums text-surface-card">
        {value}
      </Text>
      <Text className="t-caption text-surface-card/60">{label}</Text>
    </View>
  );
}

export function CompletedWorkoutDetails({
  workout,
  allWorkouts,
  weightUnit,
}: CompletedWorkoutDetailsProps) {
  const { t, i18n } = useTranslation();
  const exerciseOptions = useExerciseOptions();
  const { options: setTypeOptions, byId: setTypesById } = useSetTypeLibrary();

  if (!workout) {
    return (
      <View className="flex-1 items-center justify-center gap-3 px-8">
        <ClayIcon name="history" size={28} color={colors.muted} />
        <Text className="t-heading text-center">
          {t('completedWorkout.notFoundTitle')}
        </Text>
        <Text className="t-caption text-center">
          {t('completedWorkout.notFoundBody')}
        </Text>
      </View>
    );
  }

  const exerciseById = new Map(
    exerciseOptions.map(exercise => [exercise.id, exercise] as const),
  );
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-4 px-5 pb-8 pt-5"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-4 rounded-[24px] bg-moss px-5 py-5">
        <View>
          <Text className="t-caption text-surface-card/70">
            {formatDate(workout.startedAt, i18n.language)}
          </Text>
          <Text className="t-title mt-1 text-surface-card">{workout.name}</Text>
          <Text className="t-caption mt-2 text-surface-card/70">
            {t('completedWorkout.timeRange', {
              start: formatTime(workout.startedAt, i18n.language),
              end: formatTime(
                workout.endedAt ?? workout.startedAt,
                i18n.language,
              ),
            })}
          </Text>
        </View>

        <View className="flex-row gap-3 border-t border-surface-card/15 pt-4">
          <WorkoutStat
            label={t('completedWorkout.stats.duration')}
            value={t('common.minutesShort', { count: workout.durationMinutes })}
          />
          <WorkoutStat
            label={t('completedWorkout.stats.sets')}
            value={`${workout.sets.length}`}
          />
          <WorkoutStat
            label={t('completedWorkout.stats.volume')}
            value={formatVolume(workout.totalVolumeKg, weightUnit)}
          />
        </View>
        {workout.notes ? (
          <View className="gap-1 border-t border-surface-card/15 pt-3">
            <Text className="t-caption text-surface-card/60">
              {t('completedWorkout.notes')}
            </Text>
            <Text className="t-body text-surface-card">{workout.notes}</Text>
          </View>
        ) : null}
      </View>

      <CompletedWorkoutHeartRate
        workout={workout}
        exerciseById={exerciseById}
      />

      <CompletedWorkoutExercises
        workout={workout}
        exerciseById={exerciseById}
        setTypeOptions={setTypeOptions}
        setTypesById={setTypesById}
        weightUnit={weightUnit}
        previousSetsFor={exercise =>
          previousSetsForExercise(
            exercise.exerciseId,
            exercise.exercisePosition,
            workout.startedAt,
            allWorkouts,
          )
        }
      />
    </ScrollView>
  );
}

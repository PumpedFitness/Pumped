import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import { useExerciseOptions } from '@/hooks/useExerciseOptions';
import {
  useWorkoutSession,
  type WorkoutHistoryItem,
} from '@/hooks/useWorkoutHistory';
import type { PerformedSet } from '@/types/workout';
import { displayWeight } from '@/utils/units';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { ExerciseSetTable } from '@/components/exercise/set-table';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';

type CompletedWorkoutDetailsProps = {
  workoutId: string;
  weightUnit: WeightUnit;
};

type CompletedExercise = {
  key: string;
  exerciseId: string;
  sets: PerformedSet[];
};

function groupCompletedExercises(
  workout: WorkoutHistoryItem,
): CompletedExercise[] {
  const groups = new Map<string, CompletedExercise>();

  workout.sets.forEach(set => {
    const key = `${set.exercisePosition}:${set.exerciseId}`;
    const group = groups.get(key) ?? {
      key,
      exerciseId: set.exerciseId,
      sets: [],
    };
    group.sets.push(set);
    groups.set(key, group);
  });

  return [...groups.values()];
}

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

type StatTileProps = {
  label: string;
  value: string;
};

function StatTile({ label, value }: StatTileProps) {
  return (
    <View className="flex-1 rounded-[14px] bg-surface-card/10 px-3 py-2.5">
      <Text className="t-eyebrow text-surface-card/60">{label}</Text>
      <Text className="t-label mt-1 text-surface-card">{value}</Text>
    </View>
  );
}

export function CompletedWorkoutDetails({
  workoutId,
  weightUnit,
}: CompletedWorkoutDetailsProps) {
  const { t, i18n } = useTranslation();
  const workout = useWorkoutSession(workoutId);
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

  const exercises = groupCompletedExercises(workout);
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
          <Text className="t-eyebrow text-surface-card/70">
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

        <View className="flex-row gap-2">
          <StatTile
            label={t('completedWorkout.stats.duration')}
            value={t('common.minutesShort', { count: workout.durationMinutes })}
          />
          <StatTile
            label={t('completedWorkout.stats.sets')}
            value={`${workout.sets.length}`}
          />
          <StatTile
            label={t('completedWorkout.stats.volume')}
            value={formatVolume(workout.totalVolumeKg, weightUnit)}
          />
        </View>
      </View>

      {exercises.map(exercise => {
        const option = exerciseById.get(exercise.exerciseId);
        const description = [
          t('completedWorkout.completedSets', { count: exercise.sets.length }),
          option?.typeName,
        ]
          .filter(Boolean)
          .join(' · ');

        return (
          <ExerciseCard
            key={exercise.key}
            name={option?.name ?? t('common.unknownExercise')}
            description={description}
          >
            <ExerciseSetTable
              readOnly
              sets={exercise.sets}
              setTypeOptions={setTypeOptions}
              setTypesById={setTypesById}
              weightUnit={weightUnit}
            />
          </ExerciseCard>
        );
      })}

      {workout.notes ? (
        <View className="rounded-[22px] border border-border-hairline bg-surface-card p-4">
          <Text className="t-eyebrow">{t('completedWorkout.notes')}</Text>
          <Text className="t-body mt-2">{workout.notes}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

import { ScrollView, Text, View } from 'react-native';
import type { WeightUnit } from '../../../data/local/schema/userProfile';
import { useExerciseOptions } from '../../../hooks/useExerciseOptions';
import {
  useWorkoutHistory,
  type WorkoutHistoryItem,
} from '../../../hooks/useWorkoutHistory';
import type { PerformedSet } from '../../../types/workout';
import { displayWeight } from '../../../utils/units';
import { ExerciseCard } from '../../exercise/ExerciseCard';
import {
  EXERCISE_SET_TYPE_OPTIONS,
  ExerciseSetTable,
} from '../../exercise/set-table';
import { ClayIcon } from '../../icons/ClayIcon';
import { colors } from '../../../theme/tokens';

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

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatVolume(volumeKg: number, weightUnit: WeightUnit): string {
  const volume = displayWeight(volumeKg, weightUnit);
  return `${Math.round(volume).toLocaleString()} ${weightUnit}`;
}

export function CompletedWorkoutDetails({
  workoutId,
  weightUnit,
}: CompletedWorkoutDetailsProps) {
  const { workouts } = useWorkoutHistory();
  const exerciseOptions = useExerciseOptions();
  const workout = workouts.find(item => item.id === workoutId);

  if (!workout) {
    return (
      <View className="flex-1 items-center justify-center gap-3 px-8">
        <ClayIcon name="history" size={28} color={colors.muted} />
        <Text className="t-heading text-center">Workout not found</Text>
        <Text className="t-caption text-center">
          This workout is no longer available in your history.
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
            {formatDate(workout.startedAt)}
          </Text>
          <Text className="t-title mt-1 text-surface-card">{workout.name}</Text>
          <Text className="t-caption mt-2 text-surface-card/70">
            {formatTime(workout.startedAt)} -{' '}
            {formatTime(workout.endedAt ?? workout.startedAt)}
          </Text>
        </View>

        <View className="flex-row gap-2">
          <View className="flex-1 rounded-[14px] bg-surface-card/10 px-3 py-2.5">
            <Text className="t-eyebrow text-surface-card/60">Duration</Text>
            <Text className="t-label mt-1 text-surface-card">
              {workout.durationMinutes} min
            </Text>
          </View>
          <View className="flex-1 rounded-[14px] bg-surface-card/10 px-3 py-2.5">
            <Text className="t-eyebrow text-surface-card/60">Sets</Text>
            <Text className="t-label mt-1 text-surface-card">
              {workout.sets.length}
            </Text>
          </View>
          <View className="flex-1 rounded-[14px] bg-surface-card/10 px-3 py-2.5">
            <Text className="t-eyebrow text-surface-card/60">Volume</Text>
            <Text className="t-label mt-1 text-surface-card">
              {formatVolume(workout.totalVolumeKg, weightUnit)}
            </Text>
          </View>
        </View>
      </View>

      {exercises.map(exercise => {
        const option = exerciseById.get(exercise.exerciseId);
        const setLabel = exercise.sets.length === 1 ? 'set' : 'sets';
        const description = `${exercise.sets.length} completed ${setLabel}${
          option?.typeName ? ` · ${option.typeName}` : ''
        }`;

        return (
          <ExerciseCard
            key={exercise.key}
            name={option?.name ?? 'Unknown exercise'}
            description={description}
          >
            <ExerciseSetTable
              readOnly
              sets={exercise.sets}
              setTypeOptions={EXERCISE_SET_TYPE_OPTIONS}
              weightUnit={weightUnit}
            />
          </ExerciseCard>
        );
      })}

      {workout.notes ? (
        <View className="rounded-[22px] border border-border-hairline bg-surface-card p-4">
          <Text className="t-eyebrow">Notes</Text>
          <Text className="t-body mt-2">{workout.notes}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

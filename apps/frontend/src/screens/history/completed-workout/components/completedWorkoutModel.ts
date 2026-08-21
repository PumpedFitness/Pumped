import type { PerformedSet } from '@/types/workout';
import type { WorkoutHistoryItem } from '@/hooks/useWorkoutHistory';

export type CompletedExercise = {
  key: string;
  exerciseId: string;
  exercisePosition: number;
  /** The superset this placement was performed in; null if it stood alone. */
  supersetId: string | null;
  sets: WorkoutHistoryItem['sets'];
};

function sortSetsByPosition(sets: PerformedSet[]): PerformedSet[] {
  return [...sets].sort((a, b) => a.setPosition - b.setPosition);
}

export function groupCompletedExercises(
  workout: WorkoutHistoryItem,
): CompletedExercise[] {
  const groups = new Map<string, CompletedExercise>();

  workout.sets.forEach(set => {
    const key = `${set.exercisePosition}:${set.exerciseId}`;
    const group = groups.get(key) ?? {
      key,
      exerciseId: set.exerciseId,
      exercisePosition: set.exercisePosition,
      supersetId: set.supersetId,
      sets: [],
    };
    group.sets.push(set);
    groups.set(key, group);
  });

  return [...groups.values()];
}

/** Letters the supersets of one workout in performed order: A, B, C, … */
export function supersetLabels(
  exercises: CompletedExercise[],
): Map<string, string> {
  const labels = new Map<string, string>();
  exercises.forEach(exercise => {
    if (exercise.supersetId && !labels.has(exercise.supersetId)) {
      labels.set(
        exercise.supersetId,
        String.fromCharCode('A'.charCodeAt(0) + labels.size),
      );
    }
  });
  return labels;
}

export function setsForExercisePlacement(
  workout: WorkoutHistoryItem,
  exerciseId: string,
  exercisePosition: number,
): PerformedSet[] | undefined {
  const exactPlacement = workout.sets.filter(
    set =>
      set.exerciseId === exerciseId &&
      set.exercisePosition === exercisePosition,
  );

  if (exactPlacement.length > 0) {
    return sortSetsByPosition(exactPlacement);
  }

  const setsByPlacement = new Map<number, PerformedSet[]>();
  workout.sets.forEach(set => {
    if (set.exerciseId !== exerciseId) {
      return;
    }

    const bucket = setsByPlacement.get(set.exercisePosition) ?? [];
    bucket.push(set);
    setsByPlacement.set(set.exercisePosition, bucket);
  });

  if (setsByPlacement.size !== 1) {
    return undefined;
  }

  return sortSetsByPosition([...setsByPlacement.values()][0] ?? []);
}

export function previousSetsForExercise(
  exerciseId: string,
  exercisePosition: number,
  beforeTimestamp: number,
  allWorkouts: WorkoutHistoryItem[],
): PerformedSet[] | undefined {
  let bestStartedAt = -Infinity;
  let bestSets: PerformedSet[] | undefined;

  for (const workout of allWorkouts) {
    if (workout.startedAt >= beforeTimestamp) continue;
    const sets = setsForExercisePlacement(
      workout,
      exerciseId,
      exercisePosition,
    );

    if (!sets || workout.startedAt <= bestStartedAt) {
      continue;
    }

    bestStartedAt = workout.startedAt;
    bestSets = sets;
  }

  return bestSets;
}

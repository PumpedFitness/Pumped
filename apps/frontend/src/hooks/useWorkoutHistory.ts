import { useCallback } from 'react';
import {
  deleteWorkoutSession,
  getWorkoutSession,
  listWorkoutSessions,
} from '@/data/local/workouts/sessions';
import { useTableQuery } from '@/data/local/tableVersions';
import { performedSets, workoutSessions } from '@/data/local/schema';
import { resolveSetWeightReps } from '@/data/local/sets/setTypes';
import type { ExerciseOption } from '@/types/exercise';
import type { PerformedSet, WorkoutSessionDetails } from '@/types/workout';
import { useExerciseOptions } from './useExerciseOptions';

// Volume = weight × reps, resolved generically from the set type's fields.
function performedSetVolume(set: PerformedSet): number {
  const { weight, reps } = resolveSetWeightReps(set);
  return (weight ?? 0) * reps;
}

export type WorkoutHistoryItem = WorkoutSessionDetails & {
  durationMinutes: number;
  exerciseCount: number;
  exerciseNames: string[];
  muscleGroupNames: string[];
  totalVolumeKg: number;
};

function buildWorkoutHistoryItem(
  session: WorkoutSessionDetails,
  exerciseById: Map<string, ExerciseOption>,
): WorkoutHistoryItem {
  const exerciseIds = [
    ...new Set(
      [...session.sets]
        .sort((a, b) => a.exercisePosition - b.exercisePosition)
        .map(set => set.exerciseId),
    ),
  ];
  const exerciseNames = exerciseIds.map(
    id => exerciseById.get(id)?.name ?? 'Unknown exercise',
  );
  const muscleGroupNames = [
    ...new Set(
      exerciseIds.flatMap(id => exerciseById.get(id)?.muscleGroupNames ?? []),
    ),
  ];

  return {
    ...session,
    durationMinutes: Math.max(
      1,
      Math.round(
        ((session.endedAt ?? session.startedAt) - session.startedAt) / 60_000,
      ),
    ),
    exerciseCount: exerciseIds.length,
    exerciseNames,
    muscleGroupNames,
    totalVolumeKg: session.sets.reduce(
      (total, set) => total + performedSetVolume(set),
      0,
    ),
  };
}

function buildExerciseMap(
  exerciseOptions: ExerciseOption[],
): Map<string, ExerciseOption> {
  return new Map(
    exerciseOptions.map(exercise => [exercise.id, exercise] as const),
  );
}

type UseWorkoutHistoryResult = {
  workouts: WorkoutHistoryItem[];
  deleteWorkout: (workoutId: string) => void;
};

export function useWorkoutHistory(): UseWorkoutHistoryResult {
  const exerciseOptions = useExerciseOptions();

  const workouts = useTableQuery(
    [workoutSessions, performedSets],
    () => {
      const exerciseById = buildExerciseMap(exerciseOptions);
      return listWorkoutSessions()
        .filter(session => session.endedAt !== null)
        .map(session => getWorkoutSession(session.id))
        .filter((session): session is WorkoutSessionDetails => session !== null)
        .map(session => buildWorkoutHistoryItem(session, exerciseById));
    },
    [exerciseOptions],
  );

  const deleteWorkout = useCallback(
    (workoutId: string) => deleteWorkoutSession(workoutId),
    [],
  );

  return { workouts, deleteWorkout };
}

/** Loads a single completed workout without hydrating the whole history. */
export function useWorkoutSession(
  workoutId: string,
): WorkoutHistoryItem | null {
  const exerciseOptions = useExerciseOptions();

  return useTableQuery(
    [workoutSessions, performedSets],
    () => {
      const session = getWorkoutSession(workoutId);
      if (!session || session.endedAt === null) {
        return null;
      }
      return buildWorkoutHistoryItem(
        session,
        buildExerciseMap(exerciseOptions),
      );
    },
    [workoutId, exerciseOptions],
  );
}

import { useCallback, useMemo } from 'react';
import {
  deleteWorkoutSession,
  getWorkoutSession,
  listWorkoutSessions,
} from '@/data/local/workouts/sessions';
import { useTableQuery } from '@/data/local/tableVersions';
import {
  healthRawSample,
  performedSets,
  workoutSessions,
} from '@/data/local/schema';
import { resolveSetWeightReps } from '@/data/local/sets/setTypes';
import type { ExerciseOption } from '@/types/exercise';
import type { PerformedSet, WorkoutSessionDetails } from '@/types/workout';
import { useExerciseOptions } from './useExerciseOptions';
import { workoutRecordCounts } from '@/data/local/workouts/workoutRecordCounts';
import { loadWorkoutHeartRateAverages } from '@/data/local/workouts/workoutHeartRate';

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
  recordCount: number;
  averageHeartRate: number | null;
};

function buildWorkoutHistoryItem(
  session: WorkoutSessionDetails,
  exerciseById: Map<string, ExerciseOption>,
  recordCount: number,
  averageHeartRate: number | null,
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
    recordCount,
    averageHeartRate,
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

function loadCompletedHistory(
  exerciseOptions: ExerciseOption[],
): WorkoutHistoryItem[] {
  const exerciseById = buildExerciseMap(exerciseOptions);
  const sessions = listWorkoutSessions()
    .filter(session => session.endedAt !== null)
    .map(session => getWorkoutSession(session.id))
    .filter((session): session is WorkoutSessionDetails => session !== null);
  const recordCounts = workoutRecordCounts(
    sessions.map(session => ({
      ...session,
      sets: session.sets.map(set => {
        const { weight, reps } = resolveSetWeightReps(set);
        return { exerciseId: set.exerciseId, weightKg: weight, reps };
      }),
    })),
  );
  return sessions.map(session =>
    buildWorkoutHistoryItem(
      session,
      exerciseById,
      recordCounts.get(session.id) ?? 0,
      null,
    ),
  );
}

export function useWorkoutHistory(): UseWorkoutHistoryResult {
  const exerciseOptions = useExerciseOptions();
  const history = useTableQuery(
    [workoutSessions, performedSets],
    () => loadCompletedHistory(exerciseOptions),
    [exerciseOptions],
  );

  const heartRates = useTableQuery(
    [workoutSessions, healthRawSample],
    loadWorkoutHeartRateAverages,
  );
  const workouts = useMemo(
    () =>
      history.map(workout => ({
        ...workout,
        averageHeartRate: heartRates.get(workout.id) ?? null,
      })),
    [history, heartRates],
  );

  const deleteWorkout = useCallback(
    (workoutId: string) => deleteWorkoutSession(workoutId),
    [],
  );

  return { workouts, deleteWorkout };
}

/** Loads a completed workout with the same records and health summary as History. */
export function useWorkoutSession(
  workoutId: string,
): WorkoutHistoryItem | null {
  const { workouts } = useWorkoutHistory();
  return workouts.find(workout => workout.id === workoutId) ?? null;
}

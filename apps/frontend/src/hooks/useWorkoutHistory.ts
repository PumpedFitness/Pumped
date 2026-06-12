import { useCallback, useMemo, useState } from 'react';
import { workoutService } from '../data/local/services';
import type { WorkoutSessionDetails } from '../types/workout';
import { useExerciseOptions } from './useExerciseOptions';

export type WorkoutHistoryItem = WorkoutSessionDetails & {
  durationMinutes: number;
  exerciseCount: number;
  exerciseNames: string[];
  muscleGroupNames: string[];
  totalVolumeKg: number;
};

type UseWorkoutHistoryResult = {
  workouts: WorkoutHistoryItem[];
  refresh: () => void;
};

function loadCompletedWorkouts(): WorkoutSessionDetails[] {
  return workoutService
    .listWorkoutSessions()
    .filter(session => session.endedAt !== null)
    .map(session => workoutService.getWorkoutSession(session.id))
    .filter((session): session is WorkoutSessionDetails => session !== null);
}

export function useWorkoutHistory(): UseWorkoutHistoryResult {
  const [sessions, setSessions] = useState(loadCompletedWorkouts);
  const exerciseOptions = useExerciseOptions();

  const refresh = useCallback(() => {
    setSessions(loadCompletedWorkouts());
  }, []);

  const workouts = useMemo(() => {
    const exerciseById = new Map(
      exerciseOptions.map(exercise => [exercise.id, exercise] as const),
    );

    return sessions.map(session => {
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
          exerciseIds.flatMap(
            id => exerciseById.get(id)?.muscleGroupNames ?? [],
          ),
        ),
      ];

      return {
        ...session,
        durationMinutes: Math.max(
          1,
          Math.round(
            ((session.endedAt ?? session.startedAt) - session.startedAt) /
              60_000,
          ),
        ),
        exerciseCount: exerciseIds.length,
        exerciseNames,
        muscleGroupNames,
        totalVolumeKg: session.sets.reduce(
          (total, set) => total + (set.weight ?? 0) * set.reps,
          0,
        ),
      };
    });
  }, [exerciseOptions, sessions]);

  return { workouts, refresh };
}

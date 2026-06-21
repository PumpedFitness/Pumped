import {
  getWorkoutSession,
  listWorkoutSessions,
} from '@/data/local/workouts/sessions';
import { useTableQuery } from '@/data/local/tableVersions';
import { performedSets, workoutSessions } from '@/data/local/schema';
import { getSetTypeFieldDefs } from '@/data/local/sets/setTypes';
import { getNumberValue } from '@/data/local/sets/fieldValues';
import type { ExerciseOption } from '@/types/exercise';
import type { PerformedSet, WorkoutSessionDetails } from '@/types/workout';
import { useExerciseOptions } from './useExerciseOptions';

// Volume = weight × reps, resolved generically from the set type's fields: the
// first weight (`amount` unit) field times the first plain-count number field.
function performedSetVolume(set: PerformedSet): number {
  const fields = getSetTypeFieldDefs(set.setType);
  const weightField = fields.find(field => field.unit === 'amount');
  const repsField = fields.find(
    field => field.dataType === 'number' && field.unit === null,
  );
  if (!weightField || !repsField) {
    return 0;
  }
  const weight = getNumberValue(set.fieldValues, weightField.id) ?? 0;
  const reps = getNumberValue(set.fieldValues, repsField.id) ?? 0;
  return weight * reps;
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

export function useWorkoutHistory(): { workouts: WorkoutHistoryItem[] } {
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

  return { workouts };
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

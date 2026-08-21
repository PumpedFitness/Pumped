// Rebuilds the template exercise a live one came from, so progression
// suggestions can be computed for it. Shared by the standalone exercise body
// and the superset round list.

import type { CurrentWorkoutExercise } from '@/stores/currentWorkoutModel';
import type { WorkoutTemplateExercise } from '@/types/workout';

function fallbackTemplateExercise(
  exercise: CurrentWorkoutExercise,
): WorkoutTemplateExercise {
  return {
    id: exercise.sourceTemplateExerciseId ?? exercise.id,
    exerciseId: exercise.exerciseId,
    position: exercise.position,
    typeId: null,
    color: exercise.color,
    supersetId: exercise.supersetId,
    goal: exercise.goal,
    notes: exercise.notes,
    sets: exercise.sets.map(set => ({
      id: set.sourceTemplateSetId ?? set.id,
      position: set.position,
      setType: set.setType,
      restSeconds: set.restSeconds,
      progressionGoal: set.progressionGoal,
      fieldValues: [],
    })),
  };
}

export function effectiveTemplateExercise(
  exercise: CurrentWorkoutExercise,
): WorkoutTemplateExercise {
  const source = exercise.sourceTemplateExercise;
  if (!source) {
    return fallbackTemplateExercise(exercise);
  }
  const sourceSets = new Map(source.sets.map(set => [set.id, set] as const));
  return {
    ...source,
    sets: exercise.sets.map(set => {
      const sourceSet = set.sourceTemplateSetId
        ? sourceSets.get(set.sourceTemplateSetId)
        : null;
      return {
        id: sourceSet?.id ?? set.sourceTemplateSetId ?? set.id,
        position: set.position,
        setType: set.setType,
        restSeconds: sourceSet?.restSeconds ?? set.restSeconds,
        progressionGoal: set.progressionGoal ?? sourceSet?.progressionGoal,
        fieldValues: sourceSet?.fieldValues ?? [],
      };
    }),
  };
}

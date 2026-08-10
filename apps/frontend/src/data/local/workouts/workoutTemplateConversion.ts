import type { SaveWorkoutTemplateInput } from '@/data/local/workouts/templates';
import type { WorkoutSessionDetails } from '@/types/workout';

export function workoutSessionToTemplateInput(
  workout: WorkoutSessionDetails,
): SaveWorkoutTemplateInput {
  const exercisesByKey = new Map<
    string,
    SaveWorkoutTemplateInput['exercises'][number] & { position: number }
  >();

  workout.sets.forEach(set => {
    const key = `${set.exercisePosition}:${set.exerciseId}`;

    if (!exercisesByKey.has(key)) {
      exercisesByKey.set(key, {
        exerciseId: set.exerciseId,
        typeId: null,
        color: null,
        goal: null,
        notes: null,
        position: set.exercisePosition,
        sets: [],
      });
    }

    exercisesByKey.get(key)?.sets.push({
      setType: set.setType,
      restSeconds: set.restSeconds,
      progressionGoal: null,
      fieldValues: set.fieldValues,
    });
  });

  return {
    name: workout.name,
    description: workout.notes,
    exercises: Array.from(exercisesByKey.values())
      .sort((left, right) => left.position - right.position)
      .map(({ position: _position, ...exercise }) => exercise),
  };
}

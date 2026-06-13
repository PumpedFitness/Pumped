import type { ExerciseOption } from '@/types/exercise';

export function filterExercises(
  options: ExerciseOption[],
  query: string,
): ExerciseOption[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) {
    return options;
  }

  return options.filter(exercise =>
    [
      exercise.name,
      exercise.description ?? '',
      exercise.typeName ?? '',
      ...exercise.muscleGroupNames,
    ]
      .join(' ')
      .toLocaleLowerCase()
      .includes(normalized),
  );
}

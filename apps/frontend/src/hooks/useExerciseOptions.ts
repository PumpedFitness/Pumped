import { useMemo } from 'react';
import { asc } from 'drizzle-orm';
import { db } from '../data/local/database';
import { exercises } from '../data/local/schema';
import type { ExerciseOption } from '../types/exercise';

export function useExerciseOptions(): ExerciseOption[] {
  return useMemo(
    () =>
      db
        .select({
          id: exercises.id,
          name: exercises.name,
          description: exercises.description,
          exerciseCategory: exercises.exerciseCategory,
          muscleGroups: exercises.muscleGroups,
          equipment: exercises.equipment,
        })
        .from(exercises)
        .orderBy(asc(exercises.name))
        .all(),
    [],
  );
}

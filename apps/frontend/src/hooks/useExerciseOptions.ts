import { useMemo } from 'react';
import { asc } from 'drizzle-orm';
import { BODY_HIGHLIGHTER_MUSCLE_GROUPS } from '@/components/body';
import { exercises, exerciseTypes } from '@/data/local/schema';
import { useRepository } from '@/data/local/useRepository';
import type { ExerciseOption } from '@/types/exercise';

export function useExerciseOptions(): ExerciseOption[] {
  const exerciseRepo = useRepository(exercises);
  const typeRepo = useRepository(exerciseTypes);

  // Repos change identity when their table changes, so this recomputes
  // exactly when the underlying data does — stable identity otherwise.
  return useMemo(() => {
    const allExercises = exerciseRepo.query({ orderBy: asc(exercises.name) });
    const typeMap = new Map(typeRepo.query().map(t => [t.id, t.name]));
    const mgMap = new Map<string, string>(
      BODY_HIGHLIGHTER_MUSCLE_GROUPS.map(group => [group.id, group.name]),
    );

    return allExercises.map(e => ({
      id: e.id,
      name: e.name,
      description: e.description,
      typeId: e.typeId,
      typeName: e.typeId ? typeMap.get(e.typeId) ?? null : null,
      picture: e.picture,
      muscleGroupIds: e.muscleGroups,
      muscleGroupNames: e.muscleGroups
        .map(id => mgMap.get(id))
        .filter(name => name != null),
    }));
  }, [exerciseRepo, typeRepo]);
}

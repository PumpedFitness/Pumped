import { useMemo } from 'react';
import { asc } from 'drizzle-orm';
import { exercises, exerciseTypes, muscleGroups } from '@/data/local/schema';
import { useRepository } from '@/data/local/useRepository';
import type { ExerciseOption } from '@/types/exercise';

export function useExerciseOptions(): ExerciseOption[] {
  const exerciseRepo = useRepository(exercises);
  const typeRepo = useRepository(exerciseTypes);
  const mgRepo = useRepository(muscleGroups);

  // Repos change identity when their table changes, so this recomputes
  // exactly when the underlying data does — stable identity otherwise.
  return useMemo(() => {
    const allExercises = exerciseRepo.query({ orderBy: asc(exercises.name) });
    const typeMap = new Map(typeRepo.query().map(t => [t.id, t.name]));
    const mgMap = new Map(mgRepo.query().map(mg => [mg.id, mg.name]));

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
        .filter((name): name is string => name != null),
    }));
  }, [exerciseRepo, typeRepo, mgRepo]);
}

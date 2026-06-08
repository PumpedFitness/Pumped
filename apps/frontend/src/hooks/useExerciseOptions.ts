import { asc } from 'drizzle-orm';
import { exercises, exerciseTypes, muscleGroups } from '../data/local/schema';
import { useRepository } from '../data/local/useRepository';
import type { ExerciseOption } from '../types/exercise';

export function useExerciseOptions(): ExerciseOption[] {
  const exerciseRepo = useRepository(exercises);
  const typeRepo = useRepository(exerciseTypes);
  const mgRepo = useRepository(muscleGroups);

  const allExercises = exerciseRepo.query({ orderBy: asc(exercises.name) });
  const allTypes = typeRepo.query();
  const allMuscleGroups = mgRepo.query();

  const typeMap = new Map(allTypes.map(t => [t.id, t.name]));
  const mgMap = new Map(allMuscleGroups.map(mg => [mg.id, mg.name]));

  return allExercises.map(e => ({
    id: e.id,
    name: e.name,
    description: e.description,
    typeId: e.typeId,
    typeName: e.typeId ? (typeMap.get(e.typeId) ?? null) : null,
    picture: e.picture,
    muscleGroupIds: e.muscleGroups,
    muscleGroupNames: e.muscleGroups
      .map(id => mgMap.get(id))
      .filter((name): name is string => name != null),
  }));
}

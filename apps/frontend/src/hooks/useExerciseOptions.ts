import { asc } from 'drizzle-orm';
import { exercises } from '../data/local/schema';
import { useRepository } from '../data/local/useRepository';
import type { ExerciseOption } from '../types/exercise';

export function useExerciseOptions(): ExerciseOption[] {
  const repo = useRepository(exercises);
  return repo.query({ orderBy: asc(exercises.name) });
}

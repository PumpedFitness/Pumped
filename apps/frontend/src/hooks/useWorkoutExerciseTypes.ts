import { randomUUID } from 'expo-crypto';
import { asc } from 'drizzle-orm';
import { useRepository } from '@/data/local/useRepository';
import { workoutExerciseTypes } from '@/data/local/schema';

export type WorkoutExerciseTypeItem = {
  id: string;
  name: string;
};

export type WorkoutExerciseTypeLibrary = {
  items: WorkoutExerciseTypeItem[];
  createType: (name: string) => string;
};

// The per-exercise-in-workout "type" tag library (max effort / endurance / …),
// created on the fly — the same recipe as the exercise-creation type picker.
export function useWorkoutExerciseTypes(): WorkoutExerciseTypeLibrary {
  const repo = useRepository(workoutExerciseTypes);
  const items = repo.query({ orderBy: asc(workoutExerciseTypes.name) });

  const createType = (name: string): string => {
    const id = randomUUID();
    repo.create({ id, name, createdAt: Date.now() });
    return id;
  };

  return { items, createType };
}

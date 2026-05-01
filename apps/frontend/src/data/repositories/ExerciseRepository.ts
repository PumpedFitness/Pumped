import {eq, like, asc, count} from 'drizzle-orm';
import {db} from '../local/database';
import {exercises} from '../local/schema';
import type {Exercise} from '../../types/domain';

function rowToExercise(row: typeof exercises.$inferSelect): Exercise {
  return {
    ...row,
    description: row.description ?? null,
    exerciseCategory: row.exerciseCategory as Exercise['exerciseCategory'],
    muscleGroups: JSON.parse(row.muscleGroups),
    equipment: JSON.parse(row.equipment),
  };
}

export function getAllExercises(): Exercise[] {
  const rows = db.select().from(exercises).orderBy(asc(exercises.name)).all();
  return rows.map(rowToExercise);
}

export function getExerciseById(id: string): Exercise | null {
  const row = db.select().from(exercises).where(eq(exercises.id, id)).get();
  return row ? rowToExercise(row) : null;
}

export function searchExercises(query: string): Exercise[] {
  const rows = db
    .select()
    .from(exercises)
    .where(like(exercises.name, `%${query}%`))
    .orderBy(asc(exercises.name))
    .all();
  return rows.map(rowToExercise);
}

export function upsertExercise(exercise: Exercise): void {
  db.insert(exercises)
    .values({
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      exerciseCategory: exercise.exerciseCategory,
      muscleGroups: JSON.stringify(exercise.muscleGroups),
      equipment: JSON.stringify(exercise.equipment),
      createdAt: exercise.createdAt,
    })
    .onConflictDoUpdate({
      target: exercises.id,
      set: {
        name: exercise.name,
        description: exercise.description,
        exerciseCategory: exercise.exerciseCategory,
        muscleGroups: JSON.stringify(exercise.muscleGroups),
        equipment: JSON.stringify(exercise.equipment),
        createdAt: exercise.createdAt,
      },
    })
    .run();
}

export function upsertExercises(exerciseList: Exercise[]): void {
  db.transaction((tx) => {
    for (const exercise of exerciseList) {
      tx.insert(exercises)
        .values({
          id: exercise.id,
          name: exercise.name,
          description: exercise.description,
          exerciseCategory: exercise.exerciseCategory,
          muscleGroups: JSON.stringify(exercise.muscleGroups),
          equipment: JSON.stringify(exercise.equipment),
          createdAt: exercise.createdAt,
        })
        .onConflictDoUpdate({
          target: exercises.id,
          set: {
            name: exercise.name,
            description: exercise.description,
            exerciseCategory: exercise.exerciseCategory,
            muscleGroups: JSON.stringify(exercise.muscleGroups),
            equipment: JSON.stringify(exercise.equipment),
            createdAt: exercise.createdAt,
          },
        })
        .run();
    }
  });
}

export function getExerciseCount(): number {
  const result = db.select({count: count()}).from(exercises).get();
  return result?.count ?? 0;
}

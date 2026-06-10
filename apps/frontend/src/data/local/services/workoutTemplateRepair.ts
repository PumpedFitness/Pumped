import { eq } from 'drizzle-orm';
import type { db } from '../database';
import { workoutTemplateExercises } from '../schema';
import { uniqueBy } from '../../../utils/dedupe';

type LocalDatabase = typeof db;
type WorkoutTemplateExerciseRow = typeof workoutTemplateExercises.$inferSelect;

export function repairDuplicateTemplateExercises(
  database: LocalDatabase,
  exerciseRows: WorkoutTemplateExerciseRow[],
): WorkoutTemplateExerciseRow[] {
  const uniqueRows = uniqueBy(exerciseRows, exercise => exercise.exerciseId);
  const uniqueRowIds = new Set(uniqueRows.map(exercise => exercise.id));

  exerciseRows
    .filter(exercise => !uniqueRowIds.has(exercise.id))
    .forEach(exercise => {
      database
        .delete(workoutTemplateExercises)
        .where(eq(workoutTemplateExercises.id, exercise.id))
        .run();
    });

  uniqueRows.forEach((exercise, position) => {
    if (exercise.position !== position) {
      database
        .update(workoutTemplateExercises)
        .set({ position })
        .where(eq(workoutTemplateExercises.id, exercise.id))
        .run();
    }
  });

  return uniqueRows.map((exercise, position) => ({
    ...exercise,
    position,
  }));
}

import {eq, desc, asc} from 'drizzle-orm';
import {db} from '../local/database';
import {workoutTemplates, workoutTemplateExercises} from '../local/schema';
import {enqueue} from './SyncQueueRepository';
import type {WorkoutTemplate, WorkoutTemplateExercise} from '../../types/domain';

function rowToTemplate(
  row: typeof workoutTemplates.$inferSelect,
): WorkoutTemplate {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function rowToTemplateExercise(
  row: typeof workoutTemplateExercises.$inferSelect,
): WorkoutTemplateExercise {
  return {
    id: row.id,
    workoutTemplateId: row.workoutTemplateId,
    exerciseId: row.exerciseId,
    orderIndex: row.orderIndex,
    sets: row.sets,
    targetReps: row.targetReps,
    targetWeight: row.targetWeight ?? null,
    restSeconds: row.restSeconds ?? null,
    notes: row.notes ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function createTemplate(
  template: WorkoutTemplate,
  exerciseList: WorkoutTemplateExercise[],
): void {
  db.transaction((tx) => {
    tx.insert(workoutTemplates)
      .values({
        id: template.id,
        userId: template.userId,
        name: template.name,
        description: template.description,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      })
      .run();

    for (const ex of exerciseList) {
      tx.insert(workoutTemplateExercises)
        .values({
          id: ex.id,
          workoutTemplateId: ex.workoutTemplateId,
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex,
          sets: ex.sets,
          targetReps: ex.targetReps,
          targetWeight: ex.targetWeight,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
          createdAt: ex.createdAt,
          updatedAt: ex.updatedAt,
        })
        .run();
    }

    enqueue('workout_template', template.id, 'create', {
      template,
      exercises: exerciseList,
    });
  });
}

export function updateTemplate(
  template: WorkoutTemplate,
  exerciseList: WorkoutTemplateExercise[],
): void {
  db.transaction((tx) => {
    tx.update(workoutTemplates)
      .set({
        name: template.name,
        description: template.description,
        updatedAt: template.updatedAt,
      })
      .where(eq(workoutTemplates.id, template.id))
      .run();

    // Replace exercises: delete old, insert new
    tx.delete(workoutTemplateExercises)
      .where(eq(workoutTemplateExercises.workoutTemplateId, template.id))
      .run();

    for (const ex of exerciseList) {
      tx.insert(workoutTemplateExercises)
        .values({
          id: ex.id,
          workoutTemplateId: ex.workoutTemplateId,
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex,
          sets: ex.sets,
          targetReps: ex.targetReps,
          targetWeight: ex.targetWeight,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
          createdAt: ex.createdAt,
          updatedAt: ex.updatedAt,
        })
        .run();
    }

    enqueue('workout_template', template.id, 'update', {
      template,
      exercises: exerciseList,
    });
  });
}

export function deleteTemplate(id: string): void {
  db.transaction((tx) => {
    tx.delete(workoutTemplates).where(eq(workoutTemplates.id, id)).run();
    enqueue('workout_template', id, 'delete', {id});
  });
}

export function getTemplateById(id: string): {
  template: WorkoutTemplate;
  exercises: WorkoutTemplateExercise[];
} | null {
  const templateRow = db
    .select()
    .from(workoutTemplates)
    .where(eq(workoutTemplates.id, id))
    .get();

  if (!templateRow) {
    return null;
  }

  const exerciseRows = db
    .select()
    .from(workoutTemplateExercises)
    .where(eq(workoutTemplateExercises.workoutTemplateId, id))
    .orderBy(asc(workoutTemplateExercises.orderIndex))
    .all();

  return {
    template: rowToTemplate(templateRow),
    exercises: exerciseRows.map(rowToTemplateExercise),
  };
}

export function getTemplatesByUser(userId: string): WorkoutTemplate[] {
  const rows = db
    .select()
    .from(workoutTemplates)
    .where(eq(workoutTemplates.userId, userId))
    .orderBy(desc(workoutTemplates.updatedAt))
    .all();
  return rows.map(rowToTemplate);
}

export function upsertTemplateFromRemote(
  template: WorkoutTemplate,
  exerciseList: WorkoutTemplateExercise[],
): void {
  db.transaction((tx) => {
    tx.insert(workoutTemplates)
      .values({
        id: template.id,
        userId: template.userId,
        name: template.name,
        description: template.description,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      })
      .onConflictDoUpdate({
        target: workoutTemplates.id,
        set: {
          userId: template.userId,
          name: template.name,
          description: template.description,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
        },
      })
      .run();

    tx.delete(workoutTemplateExercises)
      .where(eq(workoutTemplateExercises.workoutTemplateId, template.id))
      .run();

    for (const ex of exerciseList) {
      tx.insert(workoutTemplateExercises)
        .values({
          id: ex.id,
          workoutTemplateId: ex.workoutTemplateId,
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex,
          sets: ex.sets,
          targetReps: ex.targetReps,
          targetWeight: ex.targetWeight,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
          createdAt: ex.createdAt,
          updatedAt: ex.updatedAt,
        })
        .run();
    }
  });
}

// Workout template reads/writes. Plain functions over the local database —
// always consumed through domain hooks (useWorkoutTemplates, useCurrentWorkout).
// Writes notify table subscribers so every mounted reader re-renders.

import { randomUUID } from 'expo-crypto';
import { asc, eq } from 'drizzle-orm';
import { i18n } from '@/i18n';
import type {
  WorkoutSetType,
  WorkoutTemplateColor,
  WorkoutTemplateStatus,
} from '@/data/local/enums';
import type {
  WorkoutTemplate,
  WorkoutTemplateExercise,
  WorkoutTemplateSet,
} from '@/types/workout';
import { db } from '@/data/local/database';
import { notifyTableChanged } from '@/data/local/tableVersions';
import {
  workoutTemplateExercises,
  workoutTemplateScheduleWeekdays,
  workoutTemplateSets,
  workoutTemplates,
} from '@/data/local/schema';
import {
  LOCAL_USER_ID,
  requireText,
  validateSchedule,
  type WorkoutTemplateScheduleInput,
} from './validation';

export type { WorkoutTemplateScheduleInput };

export type WorkoutTemplateSetInput = {
  setType: WorkoutSetType;
  targetReps?: number | null;
  targetPercentage1Rm?: number | null;
  targetRpe?: number | null;
};

export type WorkoutTemplateExerciseInput = {
  exerciseId: string;
  goal?: string | null;
  notes?: string | null;
  sets: WorkoutTemplateSetInput[];
};

export type SaveWorkoutTemplateInput = {
  id?: string;
  name: string;
  description?: string | null;
  status?: WorkoutTemplateStatus;
  color?: WorkoutTemplateColor;
  schedule?: WorkoutTemplateScheduleInput | null;
  exercises: WorkoutTemplateExerciseInput[];
};

function validateTemplateSet(
  set: WorkoutTemplateSetInput,
): WorkoutTemplateSetInput {
  if (
    set.targetReps !== null &&
    set.targetReps !== undefined &&
    (!Number.isInteger(set.targetReps) || set.targetReps < 1)
  ) {
    throw new Error(i18n.t('errors.targetRepsPositive'));
  }
  if (
    set.targetPercentage1Rm !== null &&
    set.targetPercentage1Rm !== undefined &&
    (!Number.isFinite(set.targetPercentage1Rm) ||
      set.targetPercentage1Rm <= 0 ||
      set.targetPercentage1Rm > 100)
  ) {
    throw new Error(i18n.t('errors.percentageRange'));
  }
  if (
    set.targetRpe !== null &&
    set.targetRpe !== undefined &&
    (!Number.isFinite(set.targetRpe) || set.targetRpe < 1 || set.targetRpe > 10)
  ) {
    throw new Error(i18n.t('errors.rpeRange'));
  }

  return set;
}

export function assertTemplateExists(templateId: string): void {
  const template = db
    .select({ id: workoutTemplates.id })
    .from(workoutTemplates)
    .where(eq(workoutTemplates.id, templateId))
    .get();

  if (!template) {
    throw new Error(i18n.t('errors.templateNotFound'));
  }
}

export function getWorkoutTemplate(templateId: string): WorkoutTemplate | null {
  const template = db
    .select()
    .from(workoutTemplates)
    .where(eq(workoutTemplates.id, templateId))
    .get();

  if (!template) {
    return null;
  }

  const exerciseRows = db
    .select()
    .from(workoutTemplateExercises)
    .where(eq(workoutTemplateExercises.workoutTemplateId, template.id))
    .orderBy(asc(workoutTemplateExercises.position))
    .all();

  const exercises: WorkoutTemplateExercise[] = exerciseRows.map(exercise => {
    const sets: WorkoutTemplateSet[] = db
      .select()
      .from(workoutTemplateSets)
      .where(eq(workoutTemplateSets.workoutTemplateExerciseId, exercise.id))
      .orderBy(asc(workoutTemplateSets.position))
      .all();

    return {
      id: exercise.id,
      exerciseId: exercise.exerciseId,
      position: exercise.position,
      goal: exercise.goal,
      notes: exercise.notes,
      sets,
    };
  });

  const weekdays = template.scheduleType
    ? db
        .select({ weekday: workoutTemplateScheduleWeekdays.weekday })
        .from(workoutTemplateScheduleWeekdays)
        .where(
          eq(workoutTemplateScheduleWeekdays.workoutTemplateId, template.id),
        )
        .orderBy(asc(workoutTemplateScheduleWeekdays.weekday))
        .all()
        .map(row => row.weekday)
    : [];

  return {
    id: template.id,
    userId: template.userId,
    name: template.name,
    description: template.description,
    status: template.status,
    color: template.color,
    schedule:
      template.scheduleType && template.scheduleInterval
        ? {
            type: template.scheduleType,
            interval: template.scheduleInterval,
            weekdays,
          }
        : null,
    exercises,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

export function listWorkoutTemplates(): WorkoutTemplate[] {
  return db
    .select({ id: workoutTemplates.id })
    .from(workoutTemplates)
    .orderBy(asc(workoutTemplates.name))
    .all()
    .map(row => getWorkoutTemplate(row.id))
    .filter((template): template is WorkoutTemplate => template !== null);
}

type Tx = Parameters<Parameters<(typeof db)['transaction']>[0]>[0];

function upsertTemplateRow(
  tx: Tx,
  templateId: string,
  input: SaveWorkoutTemplateInput,
  schedule: WorkoutTemplateScheduleInput | null,
  now: number,
): void {
  const shared = {
    name: requireText(input.name, i18n.t('errors.fields.templateName')),
    description: input.description ?? null,
    scheduleType: schedule?.type ?? null,
    scheduleInterval: schedule?.interval ?? null,
    updatedAt: now,
  };
  const existing = tx
    .select()
    .from(workoutTemplates)
    .where(eq(workoutTemplates.id, templateId))
    .get();

  if (existing) {
    tx.update(workoutTemplates)
      .set({
        ...shared,
        status: input.status ?? existing.status,
        color: input.color ?? existing.color,
      })
      .where(eq(workoutTemplates.id, templateId))
      .run();
  } else {
    tx.insert(workoutTemplates)
      .values({
        ...shared,
        id: templateId,
        userId: LOCAL_USER_ID,
        status: input.status ?? 'ACTIVE',
        color: input.color ?? 'TERRACOTTA',
        createdAt: now,
      })
      .run();
  }
}

function replaceTemplateChildren(
  tx: Tx,
  templateId: string,
  schedule: WorkoutTemplateScheduleInput | null,
  exercises: WorkoutTemplateExerciseInput[],
): void {
  tx.delete(workoutTemplateScheduleWeekdays)
    .where(eq(workoutTemplateScheduleWeekdays.workoutTemplateId, templateId))
    .run();
  tx.delete(workoutTemplateExercises)
    .where(eq(workoutTemplateExercises.workoutTemplateId, templateId))
    .run();

  if (schedule?.type === 'WEEKS') {
    tx.insert(workoutTemplateScheduleWeekdays)
      .values(
        (schedule.weekdays ?? []).map(weekday => ({
          workoutTemplateId: templateId,
          weekday,
        })),
      )
      .run();
  }

  exercises.forEach((exercise, exercisePosition) => {
    const exerciseRowId = randomUUID();
    tx.insert(workoutTemplateExercises)
      .values({
        id: exerciseRowId,
        workoutTemplateId: templateId,
        exerciseId: exercise.exerciseId,
        position: exercisePosition,
        goal: exercise.goal ?? null,
        notes: exercise.notes ?? null,
      })
      .run();

    if (exercise.sets.length > 0) {
      tx.insert(workoutTemplateSets)
        .values(
          exercise.sets.map((set, setPosition) => ({
            id: randomUUID(),
            workoutTemplateExerciseId: exerciseRowId,
            position: setPosition,
            setType: set.setType,
            targetReps: set.targetReps ?? null,
            targetPercentage1Rm: set.targetPercentage1Rm ?? null,
            targetRpe: set.targetRpe ?? null,
          })),
        )
        .run();
    }
  });
}

export function saveWorkoutTemplate(
  input: SaveWorkoutTemplateInput,
): WorkoutTemplate {
  const templateId = input.id ?? randomUUID();
  const now = Date.now();
  const schedule = validateSchedule(input.schedule);
  const validatedExercises = input.exercises.map(exercise => ({
    ...exercise,
    sets: exercise.sets.map(validateTemplateSet),
  }));

  db.transaction(tx => {
    upsertTemplateRow(tx, templateId, input, schedule, now);
    replaceTemplateChildren(tx, templateId, schedule, validatedExercises);
  });

  notifyTableChanged(
    workoutTemplates,
    workoutTemplateExercises,
    workoutTemplateSets,
    workoutTemplateScheduleWeekdays,
  );

  return getWorkoutTemplate(templateId)!;
}

export function updateWorkoutTemplateStatus(
  templateId: string,
  status: WorkoutTemplateStatus,
): WorkoutTemplate {
  assertTemplateExists(templateId);
  db.update(workoutTemplates)
    .set({ status, updatedAt: Date.now() })
    .where(eq(workoutTemplates.id, templateId))
    .run();

  notifyTableChanged(workoutTemplates);

  return getWorkoutTemplate(templateId)!;
}

export function deleteWorkoutTemplate(templateId: string): void {
  assertTemplateExists(templateId);
  db.delete(workoutTemplates).where(eq(workoutTemplates.id, templateId)).run();

  // Children cascade via FK.
  notifyTableChanged(
    workoutTemplates,
    workoutTemplateExercises,
    workoutTemplateSets,
    workoutTemplateScheduleWeekdays,
  );
}

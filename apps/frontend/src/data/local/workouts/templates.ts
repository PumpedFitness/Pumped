// Workout template reads/writes. Plain functions over the local database —
// always consumed through domain hooks (useWorkoutTemplates, useCurrentWorkout).
// Writes notify table subscribers so every mounted reader re-renders.

import { randomUUID } from 'expo-crypto';
import { asc, eq } from 'drizzle-orm';
import { i18n } from '@/i18n';
import type { SetTypeId, WorkoutTemplateColor } from '@/data/local/enums';
import type { IconName } from '@/components/icons/ClayIcon';
import type { ProgressionGoal } from '@/types/setType';
import type {
  SetFieldValue,
  WorkoutTemplate,
  WorkoutTemplateExercise,
  WorkoutTemplateSet,
} from '@/types/workout';
import { db } from '@/data/local/database';
import { notifyTableChanged } from '@/data/local/tableVersions';
import {
  schedules,
  scheduleSlots,
  workoutTemplateExercises,
  workoutTemplateSets,
  workoutTemplates,
} from '@/data/local/schema';
import { LOCAL_USER_ID, requireText } from './validation';

export type WorkoutTemplateSetInput = {
  setType: SetTypeId;
  restSeconds?: number | null;
  progressionGoal?: ProgressionGoal | null;
  fieldValues?: SetFieldValue[];
};

export type WorkoutTemplateExerciseInput = {
  exerciseId: string;
  typeId?: string | null;
  color?: WorkoutTemplateColor | null;
  goal?: string | null;
  notes?: string | null;
  sets: WorkoutTemplateSetInput[];
};

export type SaveWorkoutTemplateInput = {
  id?: string;
  name: string;
  description?: string | null;
  color?: WorkoutTemplateColor;
  icon?: IconName | null;
  picture?: string | null;
  exercises: WorkoutTemplateExerciseInput[];
};

function validateTemplateSet(
  set: WorkoutTemplateSetInput,
): WorkoutTemplateSetInput {
  if (
    set.restSeconds !== null &&
    set.restSeconds !== undefined &&
    (!Number.isInteger(set.restSeconds) || set.restSeconds < 0)
  ) {
    throw new Error(i18n.t('errors.restSecondsPositive'));
  }
  // Structural sanity only — per-field bounds/required are enforced at the UI
  // layer where the set type's field defs are in scope.
  (set.fieldValues ?? []).forEach(value => {
    if (value.number != null && !Number.isFinite(value.number)) {
      throw new Error(i18n.t('errors.fieldValueInvalid'));
    }
    if (value.range) {
      const { min, max } = value.range;
      if (
        (min != null && !Number.isFinite(min)) ||
        (max != null && !Number.isFinite(max)) ||
        (min != null && max != null && min > max)
      ) {
        throw new Error(i18n.t('errors.fieldValueInvalid'));
      }
    }
  });

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
      typeId: exercise.typeId,
      color: exercise.color,
      goal: exercise.goal,
      notes: exercise.notes,
      sets,
    };
  });

  return {
    id: template.id,
    userId: template.userId,
    name: template.name,
    description: template.description,
    color: template.color,
    icon: template.icon,
    picture: template.picture,
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
  now: number,
): void {
  const shared = {
    name: requireText(input.name, i18n.t('errors.fields.templateName')),
    description: input.description ?? null,
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
        color: input.color ?? existing.color,
        icon: input.icon ?? null,
        picture: input.picture ?? null,
      })
      .where(eq(workoutTemplates.id, templateId))
      .run();
  } else {
    tx.insert(workoutTemplates)
      .values({
        ...shared,
        id: templateId,
        userId: LOCAL_USER_ID,
        color: input.color ?? 'TERRACOTTA',
        icon: input.icon ?? null,
        picture: input.picture ?? null,
        createdAt: now,
      })
      .run();
  }
}

function replaceTemplateChildren(
  tx: Tx,
  templateId: string,
  exercises: WorkoutTemplateExerciseInput[],
): void {
  tx.delete(workoutTemplateExercises)
    .where(eq(workoutTemplateExercises.workoutTemplateId, templateId))
    .run();

  exercises.forEach((exercise, exercisePosition) => {
    const exerciseRowId = randomUUID();
    tx.insert(workoutTemplateExercises)
      .values({
        id: exerciseRowId,
        workoutTemplateId: templateId,
        exerciseId: exercise.exerciseId,
        position: exercisePosition,
        typeId: exercise.typeId ?? null,
        color: exercise.color ?? null,
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
            restSeconds: set.restSeconds ?? null,
            progressionGoal: set.progressionGoal ?? null,
            fieldValues: set.fieldValues ?? [],
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
  const validatedExercises = input.exercises.map(exercise => ({
    ...exercise,
    sets: exercise.sets.map(validateTemplateSet),
  }));

  db.transaction(tx => {
    upsertTemplateRow(tx, templateId, input, now);
    replaceTemplateChildren(tx, templateId, validatedExercises);
  });

  notifyTableChanged(
    workoutTemplates,
    workoutTemplateExercises,
    workoutTemplateSets,
  );

  return getWorkoutTemplate(templateId)!;
}

export function deleteWorkoutTemplate(templateId: string): void {
  assertTemplateExists(templateId);
  db.delete(workoutTemplates).where(eq(workoutTemplates.id, templateId)).run();

  // Children (exercises, sets, owned schedules + slots) cascade via FK.
  notifyTableChanged(
    workoutTemplates,
    workoutTemplateExercises,
    workoutTemplateSets,
    schedules,
    scheduleSlots,
  );
}

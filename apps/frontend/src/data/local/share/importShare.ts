// Imports a received share into the local library. See `@/lib/share/shareTypes`.
//
// The decisions — what matches, what gets created, how ids are rewritten — live
// in the pure planner (`sharePlan.ts`). This layer loads the library snapshot
// it plans against and writes the plan in one transaction.

import { randomUUID } from 'expo-crypto';
import { asc } from 'drizzle-orm';
import { db } from '@/data/local/database';
import {
  exercises,
  exerciseTypes,
  muscleGroups,
  setTypeFields,
  setTypes,
  workoutExerciseTypes,
  workoutTemplates,
} from '@/data/local/schema';
import { resolveSetTypeName } from '@/data/local/sets/setTypes';
import { notifyTableChanged } from '@/data/local/tableVersions';
import {
  WORKOUT_TEMPLATE_TABLES,
  writeWorkoutTemplate,
  type TemplateTx,
} from '@/data/local/workouts/templates';
import type { SharePayload } from '@/lib/share/shareTypes';
import { planShareImport, type ShareImportPlan } from './sharePlan';
import type { LocalLibrary } from './shareResolve';

export type ShareImportPreview = {
  /** Names of exercises the import would create (no local match). */
  newExercises: string[];
  /** Names of exercises that resolve to the receiver's library. */
  matchedExercises: string[];
  /** Names of custom set types the import would create. */
  newSetTypes: string[];
  /** Names of set types that resolve locally (built-ins included). */
  matchedSetTypes: string[];
};

export type ShareImportResult =
  | { kind: 'template'; templateId: string }
  | { kind: 'setType'; setTypeId: string }
  | { kind: 'exercise'; exerciseId: string };

function loadLocalLibrary(): LocalLibrary {
  const fieldRows = db
    .select()
    .from(setTypeFields)
    .orderBy(asc(setTypeFields.position))
    .all();

  return {
    exercises: db
      .select({ id: exercises.id, name: exercises.name })
      .from(exercises)
      .all(),
    exerciseTypes: db
      .select({ id: exerciseTypes.id, name: exerciseTypes.name })
      .from(exerciseTypes)
      .all(),
    muscleGroupIds: db
      .select({ id: muscleGroups.id })
      .from(muscleGroups)
      .all()
      .map(row => row.id),
    setTypes: db
      .select()
      .from(setTypes)
      .all()
      .map(row => ({
        id: row.id,
        name: row.name,
        displayName: resolveSetTypeName(row.id, row.name),
        isBuiltIn: row.isBuiltIn,
        fields: fieldRows
          .filter(field => field.setTypeId === row.id)
          .map(field => ({
            id: field.id,
            name: field.name,
            dataType: field.dataType,
            unit: field.unit,
          })),
      })),
    workoutExerciseTypeIds: db
      .select({ id: workoutExerciseTypes.id })
      .from(workoutExerciseTypes)
      .all()
      .map(row => row.id),
    templateNames: db
      .select({ name: workoutTemplates.name })
      .from(workoutTemplates)
      .all()
      .map(row => row.name),
  };
}

/** What `importShare` would create vs. reuse. Read-only. */
export function previewShareImport(payload: SharePayload): ShareImportPreview {
  if (payload.kind === 'achievement') {
    return {
      newExercises: [],
      matchedExercises: [],
      newSetTypes: [],
      matchedSetTypes: [],
    };
  }
  const plan = planShareImport(payload, loadLocalLibrary(), randomUUID);
  return {
    newExercises: plan.exercisesToCreate.map(exercise => exercise.name),
    matchedExercises: plan.matchedExercises,
    newSetTypes: plan.setTypesToCreate.map(type => type.name),
    matchedSetTypes: plan.matchedSetTypes,
  };
}

/** Writes the set types and exercises the plan creates. */
function applyLibraryAdditions(tx: TemplateTx, plan: ShareImportPlan): void {
  const now = Date.now();
  const typeCount = db.$count(setTypes) as unknown as number;

  plan.setTypesToCreate.forEach((type, index) => {
    tx.insert(setTypes)
      .values({
        id: type.id,
        name: type.name,
        icon: type.icon,
        isBuiltIn: false,
        position: typeCount + index,
        progressionGoal: type.progressionGoal,
        createdAt: now,
      })
      .run();
    if (type.fields.length > 0) {
      tx.insert(setTypeFields)
        .values(
          type.fields.map(field => ({
            id: field.id,
            setTypeId: type.id,
            name: field.name,
            dataType: field.dataType,
            unit: field.unit,
            position: field.position,
            config: field.config,
            createdAt: now,
          })),
        )
        .run();
    }
  });

  plan.exercisesToCreate.forEach(exercise => {
    tx.insert(exercises)
      .values({
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        howTo: exercise.howTo,
        typeId: exercise.typeId,
        picture: null,
        muscleGroups: exercise.muscleGroupIds,
        createdAt: now,
      })
      .run();
  });
}

/**
 * Imports the payload in one transaction: library additions and the template
 * land together or not at all. A `workout` is saved as a new template (never
 * into history); an `achievement` cannot be imported and throws.
 */
export function importShare(payload: SharePayload): ShareImportResult {
  if (payload.kind === 'achievement') {
    throw new Error('Achievements are view-only and cannot be imported');
  }
  const plan = planShareImport(payload, loadLocalLibrary(), randomUUID);

  const templateId = db.transaction(tx => {
    applyLibraryAdditions(tx, plan);
    if (payload.kind !== 'template' && payload.kind !== 'workout') return null;
    if (plan.template === null) throw new Error('Missing template plan');
    return writeWorkoutTemplate(tx, plan.template);
  });

  if (plan.setTypesToCreate.length > 0) {
    notifyTableChanged(setTypes, setTypeFields);
  }
  if (plan.exercisesToCreate.length > 0) notifyTableChanged(exercises);
  if (templateId !== null) notifyTableChanged(...WORKOUT_TEMPLATE_TABLES);

  switch (payload.kind) {
    case 'template':
    case 'workout':
      return { kind: 'template', templateId: templateId! };
    case 'setType':
      return { kind: 'setType', setTypeId: plan.targetId! };
    case 'exercise':
      return { kind: 'exercise', exerciseId: plan.targetId! };
  }
}

// Builds share envelopes from the local library. See `@/lib/share/shareTypes`.
//
// Everything an item references travels with it — a template carries its
// exercises and set types — because the receiver's library may lack them.
// Device-local pictures are dropped: their URIs point into this device's files.

import { asc, eq, inArray } from 'drizzle-orm';
import { db } from '@/data/local/database';
import {
  exercises,
  exerciseTypes,
  setTypeFields,
  setTypes,
} from '@/data/local/schema';
import { getWorkoutSession } from '@/data/local/workouts/sessions';
import { getWorkoutTemplate } from '@/data/local/workouts/templates';
import {
  createShareEnvelope,
  type SharedAchievement,
  type SharedExercise,
  type ShareEnvelope,
  type SharedSetType,
} from '@/lib/share/shareTypes';

function unique(ids: readonly string[]): string[] {
  return [...new Set(ids)];
}

function loadSharedExercises(ids: readonly string[]): SharedExercise[] {
  const wanted = unique(ids);
  if (wanted.length === 0) return [];

  const rows = db
    .select({
      id: exercises.id,
      name: exercises.name,
      description: exercises.description,
      howTo: exercises.howTo,
      typeId: exercises.typeId,
      typeName: exerciseTypes.name,
      muscleGroups: exercises.muscleGroups,
    })
    .from(exercises)
    .leftJoin(exerciseTypes, eq(exercises.typeId, exerciseTypes.id))
    .where(inArray(exercises.id, wanted))
    .all();
  const byId = new Map(rows.map(row => [row.id, row]));

  // Keep the item's own order; an exercise deleted since it was used can't be
  // shared and fails the import on the other side, so fail here instead.
  return wanted.map(id => {
    const row = byId.get(id);
    if (!row) throw new Error(`Exercise ${id} no longer exists`);
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      howTo: row.howTo,
      typeId: row.typeId,
      typeName: row.typeName ?? null,
      muscleGroupIds: row.muscleGroups,
    };
  });
}

/** Raw rows, so customs carry their stored names rather than i18n labels. */
function loadSharedSetTypes(ids: readonly string[]): SharedSetType[] {
  const wanted = unique(ids);
  if (wanted.length === 0) return [];

  const typeRows = db
    .select()
    .from(setTypes)
    .where(inArray(setTypes.id, wanted))
    .all();
  const fieldRows = db
    .select()
    .from(setTypeFields)
    .where(inArray(setTypeFields.setTypeId, wanted))
    .orderBy(asc(setTypeFields.position))
    .all();
  const byId = new Map(typeRows.map(row => [row.id, row]));

  return wanted.map(id => {
    const row = byId.get(id);
    if (!row) throw new Error(`Set type ${id} no longer exists`);
    return {
      id: row.id,
      name: row.name,
      icon: row.icon,
      isBuiltIn: row.isBuiltIn,
      progressionGoal: row.progressionGoal,
      fields: fieldRows
        .filter(field => field.setTypeId === row.id)
        .map(field => ({
          id: field.id,
          name: field.name,
          dataType: field.dataType,
          unit: field.unit,
          position: field.position,
          config: field.config,
        })),
    };
  });
}

export function buildTemplateShare(templateId: string): ShareEnvelope {
  const template = getWorkoutTemplate(templateId);
  if (!template) throw new Error(`Template ${templateId} not found`);

  return createShareEnvelope({
    kind: 'template',
    template: {
      name: template.name,
      description: template.description,
      color: template.color,
      icon: template.icon,
      exercises: template.exercises.map(exercise => ({
        exerciseId: exercise.exerciseId,
        typeId: exercise.typeId,
        color: exercise.color,
        supersetId: exercise.supersetId,
        goal: exercise.goal,
        notes: exercise.notes,
        sets: exercise.sets.map(set => ({
          setType: set.setType,
          restSeconds: set.restSeconds,
          progressionGoal: set.progressionGoal ?? null,
          fieldValues: set.fieldValues,
        })),
      })),
      supersets: template.supersets.map(superset => ({ ...superset })),
    },
    exercises: loadSharedExercises(
      template.exercises.map(exercise => exercise.exerciseId),
    ),
    setTypes: loadSharedSetTypes(
      template.exercises.flatMap(exercise =>
        exercise.sets.map(set => set.setType),
      ),
    ),
  });
}

export function buildWorkoutShare(sessionId: string): ShareEnvelope {
  const session = getWorkoutSession(sessionId);
  if (!session) throw new Error(`Workout ${sessionId} not found`);

  return createShareEnvelope({
    kind: 'workout',
    workout: {
      name: session.name,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      color: session.color,
      icon: session.icon,
      notes: session.notes,
      sets: session.sets.map(set => ({
        exerciseId: set.exerciseId,
        exercisePosition: set.exercisePosition,
        setPosition: set.setPosition,
        supersetId: set.supersetId,
        setType: set.setType,
        restSeconds: set.restSeconds,
        fieldValues: set.fieldValues,
        fieldDefinitions: set.fieldDefinitions,
        performedAt: set.performedAt,
      })),
    },
    exercises: loadSharedExercises(session.sets.map(set => set.exerciseId)),
    setTypes: loadSharedSetTypes(session.sets.map(set => set.setType)),
  });
}

/** Only custom set types can be shared — built-ins exist everywhere. */
export function buildSetTypeShare(setTypeId: string): ShareEnvelope {
  const [setType] = loadSharedSetTypes([setTypeId]);
  if (setType.isBuiltIn) {
    throw new Error('Built-in set types cannot be shared');
  }
  return createShareEnvelope({ kind: 'setType', setType });
}

export function buildExerciseShare(exerciseId: string): ShareEnvelope {
  const [exercise] = loadSharedExercises([exerciseId]);
  return createShareEnvelope({ kind: 'exercise', exercise });
}

export function buildAchievementShare(
  achievement: SharedAchievement,
): ShareEnvelope {
  return createShareEnvelope({ kind: 'achievement', achievement });
}

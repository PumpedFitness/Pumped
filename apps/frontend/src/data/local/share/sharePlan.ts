// Pure import planning for received shares. Given the payload and a snapshot of
// the local library, resolves every sender id (see `shareResolve.ts`) and
// rewrites the payload into local terms. Kept free of the database (and of
// native modules) so it can be unit-tested; the DB layer in `importShare.ts`
// loads the snapshot and applies the plan.

import type {
  SaveWorkoutTemplateInput,
  WorkoutTemplateExerciseInput,
} from '@/data/local/workouts/templates';
import { workoutSessionToTemplateInput } from '@/data/local/workouts/workoutTemplateConversion';
import type {
  SharedPerformedSet,
  SharePayload,
  SharedTemplate,
  SharedTemplateSet,
  SharedWorkout,
} from '@/lib/share/shareTypes';
import type { PerformedSet, WorkoutSessionDetails } from '@/types/workout';
import {
  remapFieldValues,
  remapProgressionGoal,
  resolveExercises,
  resolveSetTypes,
  type ExerciseResolution,
  type ExerciseToCreate,
  type LocalLibrary,
  type NewId,
  normalizeName,
  type SetTypeResolution,
  type SetTypeToCreate,
} from './shareResolve';

export type ShareImportPlan = {
  setTypesToCreate: SetTypeToCreate[];
  exercisesToCreate: ExerciseToCreate[];
  /** Names for the preview. */
  matchedSetTypes: string[];
  matchedExercises: string[];
  /** Set for `template` and `workout` payloads. */
  template: SaveWorkoutTemplateInput | null;
  /** The local id the payload's own item resolves to (set type / exercise). */
  targetId: string | null;
};

function requireMapped(
  ids: ReadonlyMap<string, string>,
  id: string,
  what: string,
): string {
  const mapped = ids.get(id);
  if (mapped === undefined) {
    throw new Error(`Shared ${what} ${id} is missing from the payload`);
  }
  return mapped;
}

type Resolved = {
  setTypes: SetTypeResolution;
  exercises: ExerciseResolution;
};

function remapTemplateSet(set: SharedTemplateSet, resolved: Resolved) {
  const { setTypeIds, fieldIds } = resolved.setTypes;
  return {
    setType: requireMapped(setTypeIds, set.setType, 'set type'),
    restSeconds: set.restSeconds,
    progressionGoal:
      set.progressionGoal === null
        ? null
        : remapProgressionGoal(set.progressionGoal, fieldIds),
    fieldValues: remapFieldValues(set.fieldValues, fieldIds),
  };
}

/** "Push" → "Push (2)" while the name is taken locally. */
export function uniqueTemplateName(
  name: string,
  takenNames: readonly string[],
): string {
  const taken = new Set(takenNames.map(normalizeName));
  const base = name.trim();
  if (!taken.has(normalizeName(base))) return base;
  for (let suffix = 2; ; suffix += 1) {
    const candidate = `${base} (${suffix})`;
    if (!taken.has(normalizeName(candidate))) return candidate;
  }
}

function templateInput(
  template: SharedTemplate,
  resolved: Resolved,
  library: LocalLibrary,
): SaveWorkoutTemplateInput {
  const localPlacementTypes = new Set(library.workoutExerciseTypeIds);
  const exercises: WorkoutTemplateExerciseInput[] = template.exercises.map(
    exercise => ({
      exerciseId: requireMapped(
        resolved.exercises.exerciseIds,
        exercise.exerciseId,
        'exercise',
      ),
      // The placement type only travels as an id; keep it when it exists here.
      typeId:
        exercise.typeId !== null && localPlacementTypes.has(exercise.typeId)
          ? exercise.typeId
          : null,
      color: exercise.color,
      // Superset ids are client-side keys — the save mints row ids from them.
      supersetId: exercise.supersetId,
      goal: exercise.goal,
      notes: exercise.notes,
      sets: exercise.sets.map(set => remapTemplateSet(set, resolved)),
    }),
  );

  return {
    name: uniqueTemplateName(template.name, library.templateNames),
    description: template.description,
    color: template.color,
    icon: template.icon,
    exercises,
    supersets: template.supersets.map(superset => ({ ...superset })),
  };
}

function remapPerformedSet(
  set: SharedPerformedSet,
  index: number,
  resolved: Resolved,
): PerformedSet {
  const { setTypeIds, fieldIds } = resolved.setTypes;
  return {
    id: `shared-set-${index}`,
    workoutSessionId: 'shared',
    exerciseId: requireMapped(
      resolved.exercises.exerciseIds,
      set.exerciseId,
      'exercise',
    ),
    exercisePosition: set.exercisePosition,
    setPosition: set.setPosition,
    supersetId: set.supersetId,
    setType: requireMapped(setTypeIds, set.setType, 'set type'),
    restSeconds: set.restSeconds,
    fieldValues: remapFieldValues(set.fieldValues, fieldIds),
    fieldDefinitions: set.fieldDefinitions.map(definition => ({
      ...definition,
      fieldId: fieldIds.get(definition.fieldId) ?? definition.fieldId,
    })),
    performedAt: set.performedAt,
    importId: null,
  };
}

/** A shared session becomes a template the same way a local one does. */
function workoutTemplateInput(
  workout: SharedWorkout,
  resolved: Resolved,
  library: LocalLibrary,
  newId: NewId,
): SaveWorkoutTemplateInput {
  const session: WorkoutSessionDetails = {
    id: 'shared',
    userId: 'shared',
    workoutTemplateId: null,
    name: workout.name,
    startedAt: workout.startedAt,
    endedAt: workout.endedAt,
    notes: workout.notes,
    color: workout.color,
    icon: workout.icon,
    picture: null,
    importId: null,
    sets: [...workout.sets]
      .sort(
        (a, b) =>
          a.exercisePosition - b.exercisePosition ||
          a.setPosition - b.setPosition,
      )
      .map((set, index) => remapPerformedSet(set, index, resolved)),
  };
  const input = workoutSessionToTemplateInput(session, newId);
  return {
    ...input,
    name: uniqueTemplateName(input.name, library.templateNames),
    color: workout.color ?? undefined,
    icon: workout.icon,
  };
}

const EMPTY_SET_TYPES: SetTypeResolution = {
  setTypeIds: new Map(),
  fieldIds: new Map(),
  toCreate: [],
  matchedNames: [],
};

const EMPTY_EXERCISES: ExerciseResolution = {
  exerciseIds: new Map(),
  toCreate: [],
  matchedNames: [],
};

/**
 * Plans the import of a payload against the local library. Throws for an
 * `achievement`, which is view-only, and for payloads that reference a set
 * type or exercise they don't carry.
 */
export function planShareImport(
  payload: SharePayload,
  library: LocalLibrary,
  newId: NewId,
): ShareImportPlan {
  switch (payload.kind) {
    case 'template':
    case 'workout': {
      const resolved: Resolved = {
        setTypes: resolveSetTypes(payload.setTypes, library, newId),
        exercises: resolveExercises(payload.exercises, library, newId),
      };
      return {
        setTypesToCreate: resolved.setTypes.toCreate,
        exercisesToCreate: resolved.exercises.toCreate,
        matchedSetTypes: resolved.setTypes.matchedNames,
        matchedExercises: resolved.exercises.matchedNames,
        template:
          payload.kind === 'template'
            ? templateInput(payload.template, resolved, library)
            : workoutTemplateInput(payload.workout, resolved, library, newId),
        targetId: null,
      };
    }
    case 'setType': {
      if (payload.setType.isBuiltIn) {
        throw new Error('Built-in set types cannot be imported');
      }
      const setTypes = resolveSetTypes([payload.setType], library, newId);
      return {
        ...planFrom(setTypes, EMPTY_EXERCISES),
        targetId: requireMapped(
          setTypes.setTypeIds,
          payload.setType.id,
          'set type',
        ),
      };
    }
    case 'exercise': {
      const exercises = resolveExercises([payload.exercise], library, newId);
      return {
        ...planFrom(EMPTY_SET_TYPES, exercises),
        targetId: requireMapped(
          exercises.exerciseIds,
          payload.exercise.id,
          'exercise',
        ),
      };
    }
    case 'achievement':
      throw new Error('Achievements are view-only and cannot be imported');
  }
}

function planFrom(
  setTypes: SetTypeResolution,
  exercises: ExerciseResolution,
): ShareImportPlan {
  return {
    setTypesToCreate: setTypes.toCreate,
    exercisesToCreate: exercises.toCreate,
    matchedSetTypes: setTypes.matchedNames,
    matchedExercises: exercises.matchedNames,
    template: null,
    targetId: null,
  };
}

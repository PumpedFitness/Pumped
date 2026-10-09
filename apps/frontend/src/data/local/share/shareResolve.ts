// Library resolution for received shares: decides what each sender id maps to
// locally — an existing row or one to create — and rewrites field references.
// Pure, like the planner in `sharePlan.ts` that builds on it.

import type { SetFieldDataType, SetFieldUnit } from '@/data/local/enums';
import type {
  SharedExercise,
  SharedSetType,
  SharedSetTypeField,
} from '@/lib/share/shareTypes';
import type { ProgressionGoal } from '@/types/setType';
import type { SetFieldValue } from '@/types/workout';

export type NewId = () => string;

export type LocalSetTypeField = {
  id: string;
  name: string;
  dataType: SetFieldDataType;
  unit: SetFieldUnit | null;
};

export type LocalSetType = {
  id: string;
  /** The stored name — not the i18n-resolved label. Matching uses this. */
  name: string;
  /** What the preview shows; built-ins resolve via i18n. Defaults to `name`. */
  displayName?: string;
  isBuiltIn: boolean;
  /** Ordered by position. */
  fields: LocalSetTypeField[];
};

/** The parts of the receiver's library an import resolves against. */
export type LocalLibrary = {
  exercises: { id: string; name: string }[];
  exerciseTypes: { id: string; name: string }[];
  muscleGroupIds: string[];
  setTypes: LocalSetType[];
  /** Per-placement types a template exercise can carry. */
  workoutExerciseTypeIds: string[];
  templateNames: string[];
};

export type SetTypeToCreate = {
  id: string;
  name: string;
  icon: string | null;
  progressionGoal: ProgressionGoal;
  fields: (Omit<SharedSetTypeField, 'id'> & { id: string })[];
};

export type ExerciseToCreate = {
  id: string;
  name: string;
  description: string | null;
  howTo: string | null;
  typeId: string | null;
  muscleGroupIds: string[];
};

export function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase();
}

function sameSignature(
  local: LocalSetTypeField[],
  shared: SharedSetTypeField[],
): boolean {
  const ordered = [...shared].sort((a, b) => a.position - b.position);
  return (
    local.length === ordered.length &&
    local.every(
      (field, index) =>
        normalizeName(field.name) === normalizeName(ordered[index].name) &&
        field.dataType === ordered[index].dataType &&
        (field.unit ?? null) === (ordered[index].unit ?? null),
    )
  );
}

export type SetTypeResolution = {
  /** Sender set-type id → local id. */
  setTypeIds: Map<string, string>;
  /** Sender field id → local field id. Ids absent here are kept as-is. */
  fieldIds: Map<string, string>;
  toCreate: SetTypeToCreate[];
  matchedNames: string[];
};

/**
 * Resolves each shared set type: built-in or same id locally → reuse; custom
 * with the same name and identical field signature → reuse (fields mapped by
 * position); otherwise create with fresh ids.
 */
export function resolveSetTypes(
  shared: readonly SharedSetType[],
  library: LocalLibrary,
  newId: NewId,
): SetTypeResolution {
  const setTypeIds = new Map<string, string>();
  const fieldIds = new Map<string, string>();
  const toCreate: SetTypeToCreate[] = [];
  const matchedNames: string[] = [];
  const localById = new Map(library.setTypes.map(type => [type.id, type]));

  shared.forEach(type => {
    if (setTypeIds.has(type.id)) return;

    const sameId = localById.get(type.id);
    if (sameId) {
      setTypeIds.set(type.id, sameId.id);
      matchedNames.push(sameId.displayName ?? sameId.name);
      return;
    }

    const bySignature = library.setTypes.find(
      local =>
        !local.isBuiltIn &&
        normalizeName(local.name) === normalizeName(type.name) &&
        sameSignature(local.fields, type.fields),
    );
    if (bySignature) {
      setTypeIds.set(type.id, bySignature.id);
      [...type.fields]
        .sort((a, b) => a.position - b.position)
        .forEach((field, index) =>
          fieldIds.set(field.id, bySignature.fields[index].id),
        );
      matchedNames.push(bySignature.displayName ?? bySignature.name);
      return;
    }

    const id = newId();
    setTypeIds.set(type.id, id);
    const fields = [...type.fields]
      .sort((a, b) => a.position - b.position)
      .map((field, position) => {
        const fieldId = newId();
        fieldIds.set(field.id, fieldId);
        return { ...field, id: fieldId, position };
      });
    toCreate.push({
      id,
      name: type.name.trim(),
      icon: type.icon,
      progressionGoal: type.progressionGoal,
      fields,
    });
  });

  // Goals reference field ids, so remap once every field id is known.
  toCreate.forEach(type => {
    type.progressionGoal = remapProgressionGoal(type.progressionGoal, fieldIds);
  });

  return { setTypeIds, fieldIds, toCreate, matchedNames };
}

export type ExerciseResolution = {
  exerciseIds: Map<string, string>;
  toCreate: ExerciseToCreate[];
  matchedNames: string[];
};

/** Same id locally → reuse; same (trimmed, case-insensitive) name → reuse;
 *  otherwise create. Types and muscle groups keep only what exists locally. */
export function resolveExercises(
  shared: readonly SharedExercise[],
  library: LocalLibrary,
  newId: NewId,
): ExerciseResolution {
  const exerciseIds = new Map<string, string>();
  const toCreate: ExerciseToCreate[] = [];
  const matchedNames: string[] = [];
  const localById = new Map(library.exercises.map(item => [item.id, item]));
  const localMuscleGroups = new Set(library.muscleGroupIds);

  shared.forEach(exercise => {
    if (exerciseIds.has(exercise.id)) return;

    const match =
      localById.get(exercise.id) ??
      library.exercises.find(
        local => normalizeName(local.name) === normalizeName(exercise.name),
      );
    if (match) {
      exerciseIds.set(exercise.id, match.id);
      matchedNames.push(match.name);
      return;
    }

    const id = newId();
    exerciseIds.set(exercise.id, id);
    toCreate.push({
      id,
      name: exercise.name.trim(),
      description: exercise.description,
      howTo: exercise.howTo,
      typeId: resolveExerciseType(exercise, library),
      muscleGroupIds: exercise.muscleGroupIds.filter(groupId =>
        localMuscleGroups.has(groupId),
      ),
    });
  });

  return { exerciseIds, toCreate, matchedNames };
}

function resolveExerciseType(
  exercise: SharedExercise,
  library: LocalLibrary,
): string | null {
  if (exercise.typeId === null) return null;
  const byId = library.exerciseTypes.find(type => type.id === exercise.typeId);
  if (byId) return byId.id;
  if (exercise.typeName === null) return null;
  const typeName = normalizeName(exercise.typeName);
  return (
    library.exerciseTypes.find(type => normalizeName(type.name) === typeName)
      ?.id ?? null
  );
}

// MARK: - Remapping

export function remapFieldValues(
  values: readonly SetFieldValue[],
  fieldIds: ReadonlyMap<string, string>,
): SetFieldValue[] {
  return values.map(value => ({
    ...value,
    fieldId: fieldIds.get(value.fieldId) ?? value.fieldId,
  }));
}

export function remapProgressionGoal(
  goal: ProgressionGoal,
  fieldIds: ReadonlyMap<string, string>,
): ProgressionGoal {
  const remap = (id: string | undefined) =>
    id === undefined ? undefined : fieldIds.get(id) ?? id;
  switch (goal.kind) {
    case 'linear':
      return { ...goal, fieldId: remap(goal.fieldId) };
    case 'rangeRollover':
      return {
        ...goal,
        rangeFieldId: remap(goal.rangeFieldId),
        targetFieldId: remap(goal.targetFieldId),
      };
    case 'none':
      return goal;
  }
}

import { randomUUID } from 'expo-crypto';
import { i18n } from '@/i18n';
import type { SetTypeId } from '@/data/local/enums';
import type { SaveWorkoutTemplateInput } from '@/data/local/workouts/templates';
import type { SetFieldValue, WorkoutTemplate } from '@/types/workout';
import type { SetTypeFieldDef } from '@/types/setType';
import {
  isSetComplete,
  snapshotActualsFromTargets,
} from '@/data/local/sets/fieldValues';
import { uniqueBy } from '@/utils/dedupe';

export type CurrentWorkoutSet = {
  id: string;
  sourceTemplateSetId: string | null;
  position: number;
  setType: SetTypeId;
  restSeconds: number | null;
  fieldValues: SetFieldValue[];
  isDone: boolean;
  performedAt: number | null;
};

export type CurrentWorkoutExercise = {
  id: string;
  sourceTemplateExerciseId: string | null;
  exerciseId: string;
  position: number;
  goal: string | null;
  notes: string | null;
  sets: CurrentWorkoutSet[];
};

export type CurrentWorkout = {
  id: string;
  workoutTemplateId: string;
  name: string;
  startedAt: number;
  exercises: CurrentWorkoutExercise[];
};

export type UpdateCurrentWorkoutSetInput = Partial<
  Pick<CurrentWorkoutSet, 'setType' | 'restSeconds' | 'fieldValues'>
>;

export function createCurrentWorkoutSet(position: number): CurrentWorkoutSet {
  return {
    id: randomUUID(),
    sourceTemplateSetId: null,
    position,
    setType: 'NORMAL',
    restSeconds: null,
    fieldValues: [],
    isDone: false,
    performedAt: null,
  };
}

export function createCurrentWorkoutExercise(
  exerciseId: string,
  position: number,
): CurrentWorkoutExercise {
  return {
    id: randomUUID(),
    sourceTemplateExerciseId: null,
    exerciseId,
    position,
    goal: null,
    notes: null,
    sets: [
      createCurrentWorkoutSet(0),
      createCurrentWorkoutSet(1),
      createCurrentWorkoutSet(2),
    ],
  };
}

export function createTemplateSnapshot(
  template: WorkoutTemplate,
): CurrentWorkoutExercise[] {
  return uniqueBy(template.exercises, exercise => exercise.exerciseId).map(
    exercise => ({
      id: randomUUID(),
      sourceTemplateExerciseId: exercise.id,
      exerciseId: exercise.exerciseId,
      position: exercise.position,
      goal: exercise.goal,
      notes: exercise.notes,
      sets: exercise.sets.map(set => ({
        id: randomUUID(),
        sourceTemplateSetId: set.id,
        position: set.position,
        setType: set.setType,
        restSeconds: set.restSeconds,
        fieldValues: snapshotActualsFromTargets(set.fieldValues),
        isDone: false,
        performedAt: null,
      })),
    }),
  );
}

export function normalizeCurrentWorkoutExercises(
  exercises: CurrentWorkoutExercise[],
): CurrentWorkoutExercise[] {
  return exercises.map((exercise, exercisePosition) => ({
    ...exercise,
    position: exercisePosition,
    sets: exercise.sets.map((set, setPosition) => ({
      ...set,
      position: setPosition,
    })),
  }));
}

export function requireCurrentWorkout(
  currentWorkout: CurrentWorkout | null,
): CurrentWorkout {
  if (!currentWorkout) {
    throw new Error(i18n.t('errors.noWorkoutInProgress'));
  }
  return currentWorkout;
}

export function updateCurrentWorkoutExercise(
  workout: CurrentWorkout,
  exerciseId: string,
  update: (exercise: CurrentWorkoutExercise) => CurrentWorkoutExercise,
): CurrentWorkout {
  return {
    ...workout,
    exercises: workout.exercises.map(exercise =>
      exercise.id === exerciseId ? update(exercise) : exercise,
    ),
  };
}

/**
 * Builds the template save input that mirrors the live workout's structure
 * back onto its source template. Pure — the caller loads and saves.
 */
export function buildTemplateSyncInput(
  workout: CurrentWorkout,
  template: WorkoutTemplate,
): SaveWorkoutTemplateInput {
  const sourceSets = new Map(
    template.exercises.flatMap(exercise =>
      exercise.sets.map(set => [set.id, set] as const),
    ),
  );
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    color: template.color,
    exercises: workout.exercises.map(exercise => {
      const sourceExercise = template.exercises.find(
        candidate => candidate.exerciseId === exercise.exerciseId,
      );
      return {
        exerciseId: exercise.exerciseId,
        typeId: sourceExercise?.typeId ?? null,
        goal: exercise.goal,
        notes: exercise.notes,
        sets: exercise.sets.map(set => {
          const source = set.sourceTemplateSetId
            ? sourceSets.get(set.sourceTemplateSetId)
            : null;
          return {
            setType: set.setType,
            restSeconds: source?.restSeconds ?? null,
            fieldValues: source?.fieldValues ?? [],
          };
        }),
      };
    }),
  };
}

export function hasWorkoutStructureChanged(
  workout: CurrentWorkout,
  template: WorkoutTemplate | null,
): boolean {
  if (!template || template.exercises.length !== workout.exercises.length) {
    return true;
  }
  return workout.exercises.some((exercise, exerciseIndex) => {
    const sourceExercise = template.exercises[exerciseIndex];
    return (
      !sourceExercise ||
      exercise.sourceTemplateExerciseId !== sourceExercise.id ||
      exercise.exerciseId !== sourceExercise.exerciseId ||
      exercise.sets.length !== sourceExercise.sets.length ||
      exercise.sets.some((set, setIndex) => {
        const sourceSet = sourceExercise.sets[setIndex];
        return (
          !sourceSet ||
          set.sourceTemplateSetId !== sourceSet.id ||
          set.setType !== sourceSet.setType
        );
      })
    );
  });
}

/** Whether a set's logged actuals satisfy its set type's fields. Pure — the
 *  caller resolves the field defs (built-in constants or the DB library). */
export function isCurrentWorkoutSetValid(
  set: CurrentWorkoutSet,
  fields: SetTypeFieldDef[],
): boolean {
  return isSetComplete(fields, set.fieldValues, 'actual');
}

export function isCurrentWorkoutComplete(
  workout: CurrentWorkout,
  resolveFields: (setTypeId: SetTypeId) => SetTypeFieldDef[],
): boolean {
  const sets = workout.exercises.flatMap(exercise => exercise.sets);
  return (
    sets.length > 0 &&
    sets.every(
      set => set.isDone && isCurrentWorkoutSetValid(set, resolveFields(set.setType)),
    )
  );
}

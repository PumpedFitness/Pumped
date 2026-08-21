import { randomUUID } from 'expo-crypto';
import { i18n } from '@/i18n';
import type { SetTypeId, WorkoutTemplateColor } from '@/data/local/enums';
import type { IconName } from '@pumped/ui/icons/ClayIcon';
import type { SaveWorkoutTemplateInput } from '@/data/local/workouts/templates';
import type {
  SetFieldValue,
  WorkoutTemplate,
  WorkoutTemplateExercise,
  WorkoutTemplateSuperset,
} from '@/types/workout';
import type { ProgressionGoal, SetTypeFieldDef } from '@/types/setType';
import {
  isSetComplete,
  snapshotActualsFromTargets,
} from '@/data/local/sets/fieldValues';
import { supersetRestBySetId } from '@/data/local/workouts/supersets';
import { resolveExerciseColor } from '@/components/workout/workoutTemplatePresentation';
import { uniqueBy } from '@/utils/dedupe';

export type CurrentWorkoutSet = {
  id: string;
  sourceTemplateSetId: string | null;
  position: number;
  setType: SetTypeId;
  restSeconds: number | null;
  progressionGoal?: ProgressionGoal | null;
  fieldValues: SetFieldValue[];
  isDone: boolean;
  performedAt: number | null;
};

export type CurrentWorkoutExercise = {
  id: string;
  sourceTemplateExerciseId: string | null;
  sourceTemplateExercise: WorkoutTemplateExercise | null;
  exerciseId: string;
  position: number;
  /** Resolved accent color (own, else the workout color). Never null here. */
  color: WorkoutTemplateColor;
  /** Superset membership; null means the exercise stands alone. */
  supersetId: string | null;
  goal: string | null;
  notes: string | null;
  sets: CurrentWorkoutSet[];
};

export type CurrentWorkout = {
  id: string;
  workoutTemplateId: string;
  name: string;
  startedAt: number;
  /** Timestamp the elapsed clock was paused at; null while running. */
  pausedAt: number | null;
  /** Accumulated paused time (ms) from prior pause spans. */
  pausedMs: number;
  /** The workout's color, used as the fallback for ad-hoc exercises. */
  color: WorkoutTemplateColor;
  /** Template visual identity, carried through so finish can snapshot it. */
  icon: IconName | null;
  picture: string | null;
  exercises: CurrentWorkoutExercise[];
  supersets: WorkoutTemplateSuperset[];
};

/** Elapsed clock time excluding paused spans; frozen while paused. */
export function currentWorkoutElapsedMs(
  workout: Pick<CurrentWorkout, 'startedAt' | 'pausedAt' | 'pausedMs'>,
  now: number,
): number {
  const end = workout.pausedAt ?? now;
  return Math.max(0, end - workout.startedAt - workout.pausedMs);
}

export type UpdateCurrentWorkoutSetInput = Partial<
  Pick<
    CurrentWorkoutSet,
    'setType' | 'restSeconds' | 'progressionGoal' | 'fieldValues'
  >
>;

export function createCurrentWorkoutSet(position: number): CurrentWorkoutSet {
  return {
    id: randomUUID(),
    sourceTemplateSetId: null,
    position,
    setType: 'NORMAL',
    restSeconds: null,
    progressionGoal: null,
    fieldValues: [],
    isDone: false,
    performedAt: null,
  };
}

export function createCurrentWorkoutExercise(
  exerciseId: string,
  position: number,
  color: WorkoutTemplateColor,
): CurrentWorkoutExercise {
  return {
    id: randomUUID(),
    sourceTemplateExerciseId: null,
    sourceTemplateExercise: null,
    exerciseId,
    position,
    color,
    supersetId: null,
    goal: null,
    notes: null,
    sets: [
      createCurrentWorkoutSet(0),
      createCurrentWorkoutSet(1),
      createCurrentWorkoutSet(2),
    ],
  };
}

function snapshotTemplateSet(
  set: WorkoutTemplateExercise['sets'][number],
  supersetRest: Map<string, number | null>,
): CurrentWorkoutSet {
  return {
    id: randomUUID(),
    sourceTemplateSetId: set.id,
    position: set.position,
    setType: set.setType,
    // A superset owns its members' rest, including "none" — so an entry in the
    // map wins even when it is null, and only a non-member falls back.
    restSeconds: supersetRest.has(set.id)
      ? supersetRest.get(set.id) ?? null
      : set.restSeconds,
    progressionGoal: set.progressionGoal,
    fieldValues: snapshotActualsFromTargets(set.fieldValues),
    isDone: false,
    performedAt: null,
  };
}

export function createTemplateSnapshot(
  template: WorkoutTemplate,
): CurrentWorkoutExercise[] {
  // One placement per exercise: the picker cannot select the same exercise
  // twice, and both the draft and this snapshot key on `exerciseId`. Supersets
  // do not change that — each member is a distinct exercise.
  const exercises = uniqueBy(
    template.exercises,
    exercise => exercise.exerciseId,
  );
  // Superset rest is resolved here, once, and written onto the live sets — see
  // supersetRestBySetId.
  const supersetRest = supersetRestBySetId(exercises, template.supersets);

  return exercises.map(exercise => ({
    id: randomUUID(),
    sourceTemplateExerciseId: exercise.id,
    sourceTemplateExercise: exercise,
    exerciseId: exercise.exerciseId,
    position: exercise.position,
    color: resolveExerciseColor(exercise.color, template.color),
    supersetId: exercise.supersetId,
    goal: exercise.goal,
    notes: exercise.notes,
    sets: exercise.sets.map(set => snapshotTemplateSet(set, supersetRest)),
  }));
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
    // Carried through untouched — appearance isn't edited mid-session, so a
    // structure "update template" save must not wipe the logo/photo.
    icon: template.icon,
    picture: template.picture,
    exercises: uniqueBy(workout.exercises, exercise => exercise.exerciseId).map(
      exercise => {
        const sourceExercise = template.exercises.find(
          candidate => candidate.exerciseId === exercise.exerciseId,
        );
        return {
          exerciseId: exercise.exerciseId,
          typeId: sourceExercise?.typeId ?? null,
          // The live exercise carries a resolved color — emit it directly so a
          // mid-session "update template" save preserves per-exercise colors.
          color: exercise.color,
          supersetId: exercise.supersetId,
          goal: exercise.goal,
          notes: exercise.notes,
          sets: exercise.sets.map(set => {
            const source = set.sourceTemplateSetId
              ? sourceSets.get(set.sourceTemplateSetId)
              : null;
            return {
              setType: set.setType,
              restSeconds: source?.restSeconds ?? null,
              progressionGoal: set.progressionGoal ?? source?.progressionGoal,
              fieldValues: source?.fieldValues ?? [],
            };
          }),
        };
      },
    ),
    // Carried through so a structure save keeps the groups (and their rest)
    // instead of silently flattening every superset into loose exercises.
    supersets: workout.supersets,
  };
}

function progressionFingerprint(goal: ProgressionGoal | null | undefined) {
  return JSON.stringify(goal ?? null);
}

// Groups compared by shape, not by id: saving re-mints every superset row id,
// so a freshly saved template would otherwise always look "changed".
function supersetFingerprint(
  exercises: { supersetId: string | null }[],
  groups: WorkoutTemplateSuperset[],
): string {
  const byId = new Map(groups.map(group => [group.id, group] as const));
  return JSON.stringify(
    exercises.map(exercise => {
      const group = exercise.supersetId
        ? byId.get(exercise.supersetId)
        : undefined;
      return group ? [group.restSeconds, group.transitionRestSeconds] : null;
    }),
  );
}

export function hasWorkoutStructureChanged(
  workout: CurrentWorkout,
  template: WorkoutTemplate | null,
): boolean {
  if (!template || template.exercises.length !== workout.exercises.length) {
    return true;
  }
  if (
    supersetFingerprint(workout.exercises, workout.supersets) !==
    supersetFingerprint(template.exercises, template.supersets)
  ) {
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
          set.setType !== sourceSet.setType ||
          progressionFingerprint(set.progressionGoal) !==
            progressionFingerprint(sourceSet.progressionGoal)
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
      set =>
        set.isDone && isCurrentWorkoutSetValid(set, resolveFields(set.setType)),
    )
  );
}

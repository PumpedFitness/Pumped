// Pure superset reducers over the template-editor draft.
//
// Kept out of useWorkoutTemplateEditorDraft so the rules that hold a superset
// together — contiguity, equal round counts, no one-member groups — live in one
// tested place instead of being re-derived inside a hook. Ids are injected
// rather than imported so this module stays free of native dependencies.

import type { EditableExercise, EditableExerciseSet } from '@/types/exercise';
import type { WorkoutTemplateSuperset } from '@/types/workout';
import {
  alignSetCount,
  blockExercises,
  groupIntoBlocks,
  moveInArray,
  normalizeSupersets,
  reflowSupersetMembers,
} from '@/data/local/workouts/supersets';

export type SupersetDraft = {
  exercises: EditableExercise[];
  supersets: WorkoutTemplateSuperset[];
};

export type NewId = () => string;

/** A fresh superset rests 90s between rounds and not at all between its
 *  exercises — going straight from one to the next is the point. */
const DEFAULT_ROUND_REST_SECONDS = 90;

export function duplicateDraftSet(
  set: EditableExerciseSet,
  id: string,
): EditableExerciseSet {
  return {
    ...set,
    id,
    progressionGoal: set.progressionGoal
      ? { ...set.progressionGoal }
      : undefined,
    fieldValues: set.fieldValues.map(value => ({ ...value })),
  };
}

/** Re-settles the draft: members pulled back together, dissolved groups cleaned
 *  up. Runs after every structural change so no caller can forget it. */
function settle(draft: SupersetDraft): SupersetDraft {
  const { exercises, groups } = normalizeSupersets(
    reflowSupersetMembers(draft.exercises),
    draft.supersets,
  );
  return { exercises, supersets: groups };
}

function withRounds(
  exercise: EditableExercise,
  rounds: number,
  newId: NewId,
): EditableExercise {
  const sets = alignSetCount(exercise.sets, rounds, last =>
    last
      ? duplicateDraftSet(last, newId())
      : { id: newId(), setType: 'NORMAL', restSeconds: null, fieldValues: [] },
  );
  return sets === exercise.sets ? exercise : { ...exercise, sets };
}

/**
 * Rebuilds the exercise list from a picker result, keeping each surviving
 * exercise (and so its superset membership) as-is.
 */
export function selectExercises(
  draft: SupersetDraft,
  exerciseIds: string[],
  createExercise: (exerciseId: string) => EditableExercise,
): SupersetDraft {
  const currentById = new Map(
    draft.exercises.map(exercise => [exercise.exerciseId, exercise] as const),
  );
  return settle({
    ...draft,
    exercises: exerciseIds.map(
      exerciseId => currentById.get(exerciseId) ?? createExercise(exerciseId),
    ),
  });
}

/** Groups exercises already in the draft into a new superset, levelling their
 *  set counts so every member has one set per round. */
export function addSuperset(
  draft: SupersetDraft,
  exerciseIds: string[],
  newId: NewId,
): SupersetDraft {
  const members = new Set(
    exerciseIds.filter(id =>
      draft.exercises.some(exercise => exercise.exerciseId === id),
    ),
  );
  if (members.size < 2) {
    return draft;
  }

  const supersetId = newId();
  // Level up, never down: joining a superset must not silently delete sets.
  const rounds = Math.max(
    ...draft.exercises
      .filter(exercise => members.has(exercise.exerciseId))
      .map(exercise => exercise.sets.length),
  );

  return settle({
    exercises: draft.exercises.map(exercise =>
      members.has(exercise.exerciseId)
        ? { ...withRounds(exercise, rounds, newId), supersetId }
        : exercise,
    ),
    supersets: [
      ...draft.supersets,
      {
        id: supersetId,
        restSeconds: DEFAULT_ROUND_REST_SECONDS,
        transitionRestSeconds: null,
      },
    ],
  });
}

export function ungroupSuperset(
  draft: SupersetDraft,
  supersetId: string,
): SupersetDraft {
  return settle({
    exercises: draft.exercises.map(exercise =>
      exercise.supersetId === supersetId
        ? { ...exercise, supersetId: null }
        : exercise,
    ),
    supersets: draft.supersets.filter(group => group.id !== supersetId),
  });
}

export function updateSuperset(
  draft: SupersetDraft,
  supersetId: string,
  patch: Partial<Omit<WorkoutTemplateSuperset, 'id'>>,
): SupersetDraft {
  return {
    ...draft,
    supersets: draft.supersets.map(group =>
      group.id === supersetId ? { ...group, ...patch } : group,
    ),
  };
}

export function setSupersetRounds(
  draft: SupersetDraft,
  supersetId: string,
  rounds: number,
  newId: NewId,
): SupersetDraft {
  return {
    ...draft,
    exercises: draft.exercises.map(exercise =>
      exercise.supersetId === supersetId
        ? withRounds(exercise, rounds, newId)
        : exercise,
    ),
  };
}

/** Reorders whole blocks, so a drag can never split a superset apart. */
export function reorderBlocks(
  draft: SupersetDraft,
  from: number,
  to: number,
): SupersetDraft {
  const blocks = groupIntoBlocks(draft.exercises, draft.supersets);
  return {
    ...draft,
    exercises: moveInArray(blocks, from, to).flatMap(blockExercises),
  };
}

/** Moves one member within its own superset; the clamp is what stops a member
 *  from walking out of the group. */
export function moveSupersetMember(
  draft: SupersetDraft,
  supersetId: string,
  from: number,
  to: number,
): SupersetDraft {
  const block = groupIntoBlocks(draft.exercises, draft.supersets).find(
    candidate =>
      candidate.kind === 'superset' && candidate.group.id === supersetId,
  );
  if (block?.kind !== 'superset' || to < 0 || to >= block.exercises.length) {
    return draft;
  }

  const reordered = moveInArray(block.exercises, from, to);
  return {
    ...draft,
    exercises: [
      ...draft.exercises.slice(0, block.position),
      ...reordered,
      ...draft.exercises.slice(block.position + block.exercises.length),
    ],
  };
}

export function removeDraftExercise(
  draft: SupersetDraft,
  exerciseId: string,
): SupersetDraft {
  return settle({
    ...draft,
    exercises: draft.exercises.filter(
      exercise => exercise.exerciseId !== exerciseId,
    ),
  });
}

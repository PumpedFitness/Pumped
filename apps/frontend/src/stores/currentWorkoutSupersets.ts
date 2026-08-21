// Superset-aware reducers for the live workout draft.
//
// A round is the unit inside a superset: adding one gives every member a set,
// removing one takes a set from every member. Keeping that here rather than in
// the store means the "all members stay level" rule has exactly one home.

import type { WorkoutTemplateSuperset } from '@/types/workout';
import {
  groupIntoBlocks,
  normalizeSupersets,
  supersetRestSeconds,
} from '@/data/local/workouts/supersets';
import {
  createCurrentWorkoutSet,
  normalizeCurrentWorkoutExercises,
  type CurrentWorkout,
  type CurrentWorkoutExercise,
} from './currentWorkoutModel';

function membersOf(
  workout: CurrentWorkout,
  supersetId: string,
): CurrentWorkoutExercise[] {
  const block = groupIntoBlocks(workout.exercises, workout.supersets).find(
    candidate =>
      candidate.kind === 'superset' && candidate.group.id === supersetId,
  );
  return block?.kind === 'superset' ? block.exercises : [];
}

/** Re-settles membership after exercises were removed or reselected, so a group
 *  left with one member stops pretending to be a superset. */
export function settleWorkoutSupersets(
  workout: CurrentWorkout,
  exercises: CurrentWorkoutExercise[],
): CurrentWorkout {
  const settled = normalizeSupersets(exercises, workout.supersets);
  return {
    ...workout,
    exercises: normalizeCurrentWorkoutExercises(settled.exercises),
    supersets: settled.groups,
  };
}

/** Adds a round: one new set on every member, carrying that member's rest. */
export function addSupersetRound(
  workout: CurrentWorkout,
  supersetId: string,
): CurrentWorkout {
  const members = membersOf(workout, supersetId);
  if (members.length === 0) {
    return workout;
  }
  const group: WorkoutTemplateSuperset = workout.supersets.find(
    candidate => candidate.id === supersetId,
  ) ?? { id: supersetId, restSeconds: null, transitionRestSeconds: null };
  const memberIndexById = new Map(
    members.map((member, index) => [member.id, index] as const),
  );

  return {
    ...workout,
    exercises: normalizeCurrentWorkoutExercises(
      workout.exercises.map(exercise => {
        const memberIndex = memberIndexById.get(exercise.id);
        if (memberIndex === undefined) {
          return exercise;
        }
        const set = createCurrentWorkoutSet(exercise.sets.length);
        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            {
              ...set,
              restSeconds: supersetRestSeconds(
                group,
                memberIndex,
                members.length,
              ),
            },
          ],
        };
      }),
    ),
  };
}

/** Removes a round from every member. The last round is kept — a superset with
 *  no rounds is not a thing, and dropping it would delete the exercises. */
export function removeSupersetRound(
  workout: CurrentWorkout,
  supersetId: string,
  roundIndex: number,
): CurrentWorkout {
  const members = membersOf(workout, supersetId);
  const rounds = Math.max(...members.map(member => member.sets.length), 0);
  if (members.length === 0 || rounds <= 1) {
    return workout;
  }
  const memberIds = new Set(members.map(member => member.id));

  return {
    ...workout,
    exercises: normalizeCurrentWorkoutExercises(
      workout.exercises.map(exercise =>
        memberIds.has(exercise.id)
          ? {
              ...exercise,
              sets: exercise.sets.filter((_, index) => index !== roundIndex),
            }
          : exercise,
      ),
    ),
  };
}

/** The round a member's set sits in, for the remove-round confirmation. */
export function roundIndexOfSet(
  exercise: CurrentWorkoutExercise,
  setId: string,
): number {
  return exercise.sets.findIndex(set => set.id === setId);
}

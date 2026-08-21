import type {
  SaveWorkoutTemplateInput,
  WorkoutTemplateExerciseInput,
} from '@/data/local/workouts/templates';
import type {
  WorkoutSessionDetails,
  WorkoutTemplateSuperset,
} from '@/types/workout';
import { groupIntoBlocks } from './supersets';

// `supersetId` is narrowed from the input type's optional field so grouping can
// rely on it being present.
type PlacedExercise = WorkoutTemplateExerciseInput & {
  position: number;
  supersetId: string | null;
};

/** Mints the client-side keys for reconstructed supersets. Passed in rather
 *  than imported so this module stays free of native dependencies. */
type NewId = () => string;

function groupSetsByPlacement(
  workout: WorkoutSessionDetails,
): PlacedExercise[] {
  const exercisesByKey = new Map<string, PlacedExercise>();

  workout.sets.forEach(set => {
    const key = `${set.exercisePosition}:${set.exerciseId}`;

    if (!exercisesByKey.has(key)) {
      exercisesByKey.set(key, {
        exerciseId: set.exerciseId,
        typeId: null,
        color: null,
        supersetId: set.supersetId,
        goal: null,
        notes: null,
        position: set.exercisePosition,
        sets: [],
      });
    }

    exercisesByKey.get(key)?.sets.push({
      setType: set.setType,
      restSeconds: set.restSeconds,
      progressionGoal: null,
      fieldValues: set.fieldValues,
    });
  });

  return [...exercisesByKey.values()].sort(
    (left, right) => left.position - right.position,
  );
}

/** The first rest an exercise's sets carry, if any. */
function restOf(exercise: PlacedExercise): number | null {
  return (
    exercise.sets.find(set => set.restSeconds != null)?.restSeconds ?? null
  );
}

/**
 * Rebuilds superset groups from the membership token on each performed set.
 * The stored ids belong to the source template's rows, so every group gets a
 * fresh key here. Rest is recovered structurally: sets were logged with their
 * effective rest, so the last member's rest is the round rest and any earlier
 * member's is the transition rest.
 */
function rebuildSupersets(
  exercises: PlacedExercise[],
  newId: NewId,
): {
  exercises: WorkoutTemplateExerciseInput[];
  supersets: WorkoutTemplateSuperset[];
} {
  const supersets: WorkoutTemplateSuperset[] = [];

  const rebuilt = groupIntoBlocks<PlacedExercise>(exercises, []).flatMap(
    (block): PlacedExercise[] => {
      if (block.kind === 'single') {
        return [{ ...block.exercise, supersetId: null }];
      }

      const key = newId();
      const members = block.exercises;
      supersets.push({
        id: key,
        restSeconds: restOf(members[members.length - 1]),
        transitionRestSeconds: restOf(members[0]),
      });

      return members.map(member => ({
        ...member,
        supersetId: key,
        // Rest now belongs to the group; leaving it on the sets too would show
        // it twice and let the two copies drift apart.
        sets: member.sets.map(set => ({ ...set, restSeconds: null })),
      }));
    },
  );

  return {
    exercises: rebuilt.map(({ position: _position, ...exercise }) => exercise),
    supersets,
  };
}

export function workoutSessionToTemplateInput(
  workout: WorkoutSessionDetails,
  newId: NewId,
): SaveWorkoutTemplateInput {
  const { exercises, supersets } = rebuildSupersets(
    groupSetsByPlacement(workout),
    newId,
  );

  return {
    name: workout.name,
    description: workout.notes,
    exercises,
    supersets,
  };
}

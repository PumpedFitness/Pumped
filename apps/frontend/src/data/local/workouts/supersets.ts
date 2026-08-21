// Superset grouping — the single source of truth shared by the template editor,
// the live session, and history. Pure and structurally typed, so it works on
// draft exercises, live-workout exercises, and hydrated template exercises alike.
//
// The model: a superset is a CONTIGUOUS run of exercises sharing a `supersetId`.
// Each member holds one set per round, so the round count is simply the largest
// member set count — never stored, never able to drift.

import type { WorkoutTemplateSuperset } from '@/types/workout';

/** The minimum an exercise must expose to take part in grouping. Parameterised
 *  on the set so callers that need to read sets keep their element type. */
export type SupersetMember<TSet = unknown> = {
  supersetId: string | null;
  sets: TSet[];
};

export type SupersetBlock<T> =
  | { kind: 'single'; exercise: T; position: number }
  | {
      kind: 'superset';
      group: WorkoutTemplateSuperset;
      exercises: T[];
      rounds: number;
      /** Position of the first member in the flat exercise list. */
      position: number;
    };

type Run = { supersetId: string | null; start: number; end: number };

function standaloneGroup(id: string): WorkoutTemplateSuperset {
  return { id, restSeconds: null, transitionRestSeconds: null };
}

/**
 * Splits the flat exercise list into maximal runs of the same `supersetId`.
 * A run of one is not a superset — the caller degrades it to a standalone
 * exercise, which is what keeps a half-emptied group from rendering as a
 * one-exercise "superset".
 */
function supersetRuns(exercises: SupersetMember[]): Run[] {
  const runs: Run[] = [];
  exercises.forEach((exercise, index) => {
    const previous = runs[runs.length - 1];
    if (
      previous &&
      exercise.supersetId !== null &&
      previous.supersetId === exercise.supersetId
    ) {
      previous.end = index;
      return;
    }
    runs.push({ supersetId: exercise.supersetId, start: index, end: index });
  });
  return runs;
}

export function groupIntoBlocks<T extends SupersetMember>(
  exercises: T[],
  groups: WorkoutTemplateSuperset[],
): SupersetBlock<T>[] {
  const groupById = new Map(groups.map(group => [group.id, group] as const));

  return supersetRuns(exercises).flatMap<SupersetBlock<T>>(run => {
    const members = exercises.slice(run.start, run.end + 1);
    if (run.supersetId === null || members.length < 2) {
      return members.map((exercise, offset) => ({
        kind: 'single' as const,
        exercise,
        position: run.start + offset,
      }));
    }
    return [
      {
        kind: 'superset',
        group: groupById.get(run.supersetId) ?? standaloneGroup(run.supersetId),
        exercises: members,
        rounds: Math.max(...members.map(member => member.sets.length)),
        position: run.start,
      },
    ];
  });
}

/** Every exercise of a block, flattened — blocks are heterogeneous, this is not. */
export function blockExercises<T>(block: SupersetBlock<T>): T[] {
  return block.kind === 'single' ? [block.exercise] : block.exercises;
}

/**
 * Execution order inside a superset: round by round, one set of every member.
 * Tolerates ragged member set counts (a member simply sits out that round), so
 * a corrupted group still renders instead of throwing.
 */
export function roundMajorSets<T extends SupersetMember>(block: {
  exercises: T[];
  rounds: number;
}): { exerciseIndex: number; setIndex: number }[] {
  const order: { exerciseIndex: number; setIndex: number }[] = [];
  for (let round = 0; round < block.rounds; round += 1) {
    block.exercises.forEach((exercise, exerciseIndex) => {
      if (round < exercise.sets.length) {
        order.push({ exerciseIndex, setIndex: round });
      }
    });
  }
  return order;
}

type LoggableSet = { id: string; isDone: boolean };

/** The set to log next across the whole superset, in round-major order. */
export function currentSupersetSetId<
  T extends SupersetMember<LoggableSet>,
>(block: { exercises: T[]; rounds: number }): string | null {
  const next = roundMajorSets(block).find(
    ({ exerciseIndex, setIndex }) =>
      !block.exercises[exerciseIndex].sets[setIndex].isDone,
  );
  return next
    ? block.exercises[next.exerciseIndex].sets[next.setIndex].id
    : null;
}

/** 1-based round the superset is on; the last round once everything is done. */
export function currentSupersetRound<
  T extends SupersetMember<LoggableSet>,
>(block: { exercises: T[]; rounds: number }): number {
  const next = roundMajorSets(block).find(
    ({ exerciseIndex, setIndex }) =>
      !block.exercises[exerciseIndex].sets[setIndex].isDone,
  );
  return next ? next.setIndex + 1 : Math.max(1, block.rounds);
}

/**
 * Rest that follows a member's set. Inside a round you only rest to change
 * equipment (often not at all); the real rest comes after the last member,
 * when the round is complete.
 */
export function supersetRestSeconds(
  group: WorkoutTemplateSuperset,
  exerciseIndex: number,
  memberCount: number,
): number | null {
  return exerciseIndex === memberCount - 1
    ? group.restSeconds
    : group.transitionRestSeconds;
}

/**
 * Brings one member's sets to `rounds` entries — padding by duplicating the
 * last set (so a new round inherits its targets) and trimming from the end.
 */
export function alignSetCount<S>(
  sets: S[],
  rounds: number,
  duplicate: (last: S | undefined) => S,
): S[] {
  const target = Math.max(1, rounds);
  if (sets.length === target) {
    return sets;
  }
  if (sets.length > target) {
    return sets.slice(0, target);
  }
  const padded = [...sets];
  while (padded.length < target) {
    padded.push(duplicate(padded[padded.length - 1]));
  }
  return padded;
}

/**
 * The rest that follows each set of a superset member, keyed by set id.
 *
 * Resolved once when a workout starts and written onto the live sets, so the
 * rest timer, the set cards, and the sets saved to history all read one value
 * from one place — and a workout logged last month keeps the rest it was
 * actually performed with even if the superset is retuned later.
 */
export function supersetRestBySetId<T extends SupersetMember<{ id: string }>>(
  exercises: T[],
  groups: WorkoutTemplateSuperset[],
): Map<string, number | null> {
  const restBySetId = new Map<string, number | null>();

  groupIntoBlocks(exercises, groups).forEach(block => {
    if (block.kind !== 'superset') {
      return;
    }
    block.exercises.forEach((exercise, exerciseIndex) => {
      const rest = supersetRestSeconds(
        block.group,
        exerciseIndex,
        block.exercises.length,
      );
      exercise.sets.forEach(set => restBySetId.set(set.id, rest));
    });
  });

  return restBySetId;
}

/** Moves one item, returning a new array. The primitive both block reordering
 *  and member ▲/▼ are built on, so contiguity is never hand-rolled twice. */
export function moveInArray<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= items.length) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, moved);
  return next;
}

/**
 * Pulls scattered members of a group back together, ordered by where the group
 * first appears. The picker returns its selection with newly toggled ids
 * appended at the end, so deselecting and reselecting a member would otherwise
 * strand it away from its group — and a stranded member silently loses its
 * superset. Reflowing keeps the group intact instead.
 */
export function reflowSupersetMembers<T extends SupersetMember>(
  exercises: T[],
): T[] {
  type Unit = { items: T[] };
  const units: Unit[] = [];
  const byGroup = new Map<string, Unit>();

  exercises.forEach(exercise => {
    const existing =
      exercise.supersetId === null ? null : byGroup.get(exercise.supersetId);
    if (existing) {
      existing.items.push(exercise);
      return;
    }
    const unit: Unit = { items: [exercise] };
    if (exercise.supersetId !== null) {
      byGroup.set(exercise.supersetId, unit);
    }
    units.push(unit);
  });

  // Units are collected in first-appearance order, so flattening preserves the
  // relative order of everything the user did not disturb.
  return units.flatMap(unit => unit.items);
}

/**
 * Restores the invariants after exercises were added, removed, or reordered:
 * a group that no longer has two contiguous members loses its membership, and
 * group rows nobody references are dropped.
 */
export function normalizeSupersets<T extends SupersetMember>(
  exercises: T[],
  groups: WorkoutTemplateSuperset[],
): { exercises: T[]; groups: WorkoutTemplateSuperset[] } {
  // Keyed on position, not on the id: were the same id to survive in two
  // separate runs, only the run that is actually a superset may keep it.
  const grouped = new Set<number>();
  const liveIds = new Set<string>();
  groupIntoBlocks(exercises, groups).forEach(block => {
    if (block.kind !== 'superset') {
      return;
    }
    liveIds.add(block.group.id);
    block.exercises.forEach((_, offset) =>
      grouped.add(block.position + offset),
    );
  });

  return {
    exercises: exercises.map((exercise, index) =>
      exercise.supersetId !== null && !grouped.has(index)
        ? { ...exercise, supersetId: null }
        : exercise,
    ),
    groups: groups.filter(group => liveIds.has(group.id)),
  };
}

import type { WorkoutTemplateSuperset } from '@/types/workout';
import {
  alignSetCount,
  currentSupersetRound,
  currentSupersetSetId,
  groupIntoBlocks,
  moveInArray,
  normalizeSupersets,
  reflowSupersetMembers,
  roundMajorSets,
  supersetRestSeconds,
} from '../supersets';

type TestSet = { id: string; isDone: boolean };
type TestExercise = {
  name: string;
  supersetId: string | null;
  sets: TestSet[];
};

function exercise(
  name: string,
  supersetId: string | null,
  sets: (boolean | undefined)[] = [false, false],
): TestExercise {
  return {
    name,
    supersetId,
    sets: sets.map((isDone, index) => ({
      id: `${name}-${index}`,
      isDone: isDone ?? false,
    })),
  };
}

const group = (
  id: string,
  restSeconds: number | null = 90,
  transitionRestSeconds: number | null = 15,
): WorkoutTemplateSuperset => ({ id, restSeconds, transitionRestSeconds });

describe('groupIntoBlocks', () => {
  it('groups a contiguous run into one superset block', () => {
    const blocks = groupIntoBlocks(
      [exercise('squat', null), exercise('pull', 'a'), exercise('dip', 'a')],
      [group('a')],
    );

    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ kind: 'single', position: 0 });
    expect(blocks[1]).toMatchObject({
      kind: 'superset',
      rounds: 2,
      position: 1,
    });
    expect(
      blocks[1].kind === 'superset'
        ? blocks[1].exercises.map(item => item.name)
        : [],
    ).toEqual(['pull', 'dip']);
  });

  it('degrades a lone member to a standalone exercise', () => {
    const blocks = groupIntoBlocks([exercise('pull', 'a')], [group('a')]);

    expect(blocks).toEqual([
      expect.objectContaining({ kind: 'single', position: 0 }),
    ]);
  });

  it('splits a non-contiguous group into separate runs', () => {
    const blocks = groupIntoBlocks(
      [
        exercise('pull', 'a'),
        exercise('dip', 'a'),
        exercise('squat', null),
        exercise('curl', 'a'),
      ],
      [group('a')],
    );

    expect(blocks.map(block => block.kind)).toEqual([
      'superset',
      'single',
      'single',
    ]);
  });

  it('renders a group whose row is missing rather than dropping it', () => {
    const blocks = groupIntoBlocks(
      [exercise('pull', 'a'), exercise('dip', 'a')],
      [],
    );

    expect(blocks[0]).toMatchObject({
      kind: 'superset',
      group: { id: 'a', restSeconds: null, transitionRestSeconds: null },
    });
  });

  it('derives rounds from the largest member set count', () => {
    const blocks = groupIntoBlocks(
      [
        exercise('pull', 'a', [false, false, false]),
        exercise('dip', 'a', [false]),
      ],
      [group('a')],
    );

    expect(blocks[0]).toMatchObject({ kind: 'superset', rounds: 3 });
  });
});

describe('roundMajorSets', () => {
  it('alternates members round by round', () => {
    const block = {
      exercises: [exercise('pull', 'a'), exercise('dip', 'a')],
      rounds: 2,
    };

    expect(roundMajorSets(block)).toEqual([
      { exerciseIndex: 0, setIndex: 0 },
      { exerciseIndex: 1, setIndex: 0 },
      { exerciseIndex: 0, setIndex: 1 },
      { exerciseIndex: 1, setIndex: 1 },
    ]);
  });

  it('skips a member that has no set for that round', () => {
    const block = {
      exercises: [
        exercise('pull', 'a', [false, false]),
        exercise('dip', 'a', [false]),
      ],
      rounds: 2,
    };

    expect(roundMajorSets(block)).toEqual([
      { exerciseIndex: 0, setIndex: 0 },
      { exerciseIndex: 1, setIndex: 0 },
      { exerciseIndex: 0, setIndex: 1 },
    ]);
  });
});

describe('currentSupersetSetId / currentSupersetRound', () => {
  it('advances to the partner exercise before the next round', () => {
    const block = {
      exercises: [
        exercise('pull', 'a', [true, false]),
        exercise('dip', 'a', [false, false]),
      ],
      rounds: 2,
    };

    expect(currentSupersetSetId(block)).toBe('dip-0');
    expect(currentSupersetRound(block)).toBe(1);
  });

  it('moves to round two once the first round is complete', () => {
    const block = {
      exercises: [
        exercise('pull', 'a', [true, false]),
        exercise('dip', 'a', [true, false]),
      ],
      rounds: 2,
    };

    expect(currentSupersetSetId(block)).toBe('pull-1');
    expect(currentSupersetRound(block)).toBe(2);
  });

  it('reports no current set and the last round when everything is done', () => {
    const block = {
      exercises: [
        exercise('pull', 'a', [true, true]),
        exercise('dip', 'a', [true, true]),
      ],
      rounds: 2,
    };

    expect(currentSupersetSetId(block)).toBeNull();
    expect(currentSupersetRound(block)).toBe(2);
  });
});

describe('supersetRestSeconds', () => {
  it('uses the transition rest between members and the round rest after the last', () => {
    expect(supersetRestSeconds(group('a', 90, 15), 0, 2)).toBe(15);
    expect(supersetRestSeconds(group('a', 90, 15), 1, 2)).toBe(90);
  });

  it('passes a null transition rest through as no rest', () => {
    expect(supersetRestSeconds(group('a', 90, null), 0, 2)).toBeNull();
  });
});

describe('alignSetCount', () => {
  const duplicate = (last: TestSet | undefined): TestSet => ({
    id: `${last?.id ?? 'seed'}-copy`,
    isDone: false,
  });

  it('pads by duplicating the last set', () => {
    const sets = alignSetCount([{ id: 'a', isDone: false }], 3, duplicate);

    expect(sets.map(set => set.id)).toEqual(['a', 'a-copy', 'a-copy-copy']);
  });

  it('trims from the end', () => {
    const sets = alignSetCount(
      [
        { id: 'a', isDone: false },
        { id: 'b', isDone: false },
        { id: 'c', isDone: false },
      ],
      2,
      duplicate,
    );

    expect(sets.map(set => set.id)).toEqual(['a', 'b']);
  });

  it('returns the same array when already aligned', () => {
    const sets = [{ id: 'a', isDone: false }];

    expect(alignSetCount(sets, 1, duplicate)).toBe(sets);
  });

  it('never goes below one set', () => {
    expect(
      alignSetCount([{ id: 'a', isDone: false }], 0, duplicate),
    ).toHaveLength(1);
  });
});

describe('moveInArray', () => {
  it('moves an item forward and backward', () => {
    expect(moveInArray(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moveInArray(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('returns the same array for a no-op or out-of-range move', () => {
    const items = ['a', 'b'];

    expect(moveInArray(items, 1, 1)).toBe(items);
    expect(moveInArray(items, 5, 0)).toBe(items);
  });
});

describe('reflowSupersetMembers', () => {
  it('pulls a member appended at the end back next to its group', () => {
    const reflowed = reflowSupersetMembers([
      exercise('pull', 'a'),
      exercise('squat', null),
      exercise('dip', 'a'),
    ]);

    expect(reflowed.map(item => item.name)).toEqual(['pull', 'dip', 'squat']);
  });

  it('keeps groups in first-appearance order and leaves singles put', () => {
    const reflowed = reflowSupersetMembers([
      exercise('squat', null),
      exercise('pull', 'a'),
      exercise('curl', 'b'),
      exercise('dip', 'a'),
      exercise('row', 'b'),
    ]);

    expect(reflowed.map(item => item.name)).toEqual([
      'squat',
      'pull',
      'dip',
      'curl',
      'row',
    ]);
  });

  it('leaves an already-contiguous list untouched', () => {
    const exercises = [
      exercise('pull', 'a'),
      exercise('dip', 'a'),
      exercise('squat', null),
    ];

    expect(reflowSupersetMembers(exercises).map(item => item.name)).toEqual([
      'pull',
      'dip',
      'squat',
    ]);
  });
});

describe('normalizeSupersets', () => {
  it('clears membership and drops the row when a group loses a member', () => {
    const result = normalizeSupersets([exercise('pull', 'a')], [group('a')]);

    expect(result.exercises[0].supersetId).toBeNull();
    expect(result.groups).toEqual([]);
  });

  it('keeps an intact group untouched', () => {
    const exercises = [exercise('pull', 'a'), exercise('dip', 'a')];
    const result = normalizeSupersets(exercises, [group('a')]);

    expect(result.exercises.map(item => item.supersetId)).toEqual(['a', 'a']);
    expect(result.groups).toHaveLength(1);
  });

  it('clears only the stray member when the group is split', () => {
    const result = normalizeSupersets(
      [
        exercise('pull', 'a'),
        exercise('dip', 'a'),
        exercise('squat', null),
        exercise('curl', 'a'),
      ],
      [group('a')],
    );

    expect(result.exercises.map(item => item.supersetId)).toEqual([
      'a',
      'a',
      null,
      null,
    ]);
    expect(result.groups).toHaveLength(1);
  });
});

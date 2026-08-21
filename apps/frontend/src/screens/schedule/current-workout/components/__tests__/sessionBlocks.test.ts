import type {
  CurrentWorkout,
  CurrentWorkoutExercise,
} from '@/stores/currentWorkoutModel';
import {
  blockIsComplete,
  blockSnapSections,
  blockState,
  buildSessionBlocks,
  type SessionSupersetBlock,
} from '../sessionBlocks';

function exercise(
  id: string,
  supersetId: string | null,
  done: boolean[],
): CurrentWorkoutExercise {
  return {
    id,
    sourceTemplateExerciseId: null,
    sourceTemplateExercise: null,
    exerciseId: `catalog-${id}`,
    position: 0,
    color: 'TERRACOTTA',
    supersetId,
    goal: null,
    notes: null,
    sets: done.map((isDone, index) => ({
      id: `${id}-set-${index}`,
      sourceTemplateSetId: null,
      position: index,
      setType: 'NORMAL',
      restSeconds: null,
      fieldValues: [],
      isDone,
      performedAt: null,
    })),
  };
}

function workout(exercises: CurrentWorkoutExercise[]): CurrentWorkout {
  return {
    id: 'workout',
    workoutTemplateId: 'template',
    name: 'Pull Day',
    startedAt: 0,
    pausedAt: null,
    pausedMs: 0,
    color: 'TERRACOTTA',
    icon: null,
    picture: null,
    exercises,
    supersets: [{ id: 'ss', restSeconds: 90, transitionRestSeconds: 15 }],
  };
}

const supersetBlock = (
  ...args: Parameters<typeof workout>
): SessionSupersetBlock => {
  const block = buildSessionBlocks(workout(...args)).find(
    candidate => candidate.kind === 'superset',
  );
  if (block?.kind !== 'superset') {
    throw new Error('expected a superset block');
  }
  return block;
};

describe('buildSessionBlocks', () => {
  it('renders a superset as one section and a loose exercise as another', () => {
    const blocks = buildSessionBlocks(
      workout([
        exercise('pull', 'ss', [false, false]),
        exercise('curl', 'ss', [false, false]),
        exercise('squat', null, [false]),
      ]),
    );

    expect(blocks.map(block => block.kind)).toEqual(['superset', 'single']);
    expect(blocks[0].id).toBe('ss');
  });
});

describe('the round-major cursor', () => {
  it('points at the partner exercise once the first member is logged', () => {
    const block = supersetBlock([
      exercise('pull', 'ss', [true, false]),
      exercise('curl', 'ss', [false, false]),
    ]);

    expect(block.currentSetId).toBe('curl-set-0');
    expect(block.currentRound).toBe(1);
  });

  it('advances to the next round once every member is logged', () => {
    const block = supersetBlock([
      exercise('pull', 'ss', [true, false]),
      exercise('curl', 'ss', [true, false]),
    ]);

    expect(block.currentSetId).toBe('pull-set-1');
    expect(block.currentRound).toBe(2);
  });

  it('names exactly one set across the whole group', () => {
    const block = supersetBlock([
      exercise('pull', 'ss', [true, false]),
      exercise('curl', 'ss', [false, false]),
    ]);
    const allSets = block.exercises.flatMap(item => item.sets);

    expect(allSets.filter(set => set.id === block.currentSetId)).toHaveLength(
      1,
    );
  });
});

describe('block completion and state', () => {
  it('is complete only when every member is finished', () => {
    const partial = supersetBlock([
      exercise('pull', 'ss', [true, true]),
      exercise('curl', 'ss', [true, false]),
    ]);
    const done = supersetBlock([
      exercise('pull', 'ss', [true]),
      exercise('curl', 'ss', [true]),
    ]);

    expect(blockIsComplete(partial)).toBe(false);
    expect(blockIsComplete(done)).toBe(true);
  });

  it('reports finished ahead of active', () => {
    const done = supersetBlock([
      exercise('pull', 'ss', [true]),
      exercise('curl', 'ss', [true]),
    ]);

    expect(blockState(done, 'ss')).toBe('finished');
  });

  it('gives the snap hook one section per block', () => {
    const blocks = buildSessionBlocks(
      workout([
        exercise('pull', 'ss', [true]),
        exercise('curl', 'ss', [true]),
        exercise('squat', null, [false]),
      ]),
    );

    expect(blockSnapSections(blocks)).toEqual([
      { id: 'ss', isComplete: true },
      { id: 'squat', isComplete: false },
    ]);
  });
});

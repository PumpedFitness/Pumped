import type { EditableExercise } from '@/types/exercise';
import {
  addSuperset,
  moveSupersetMember,
  removeDraftExercise,
  reorderBlocks,
  selectExercises,
  setSupersetRounds,
  ungroupSuperset,
  updateSuperset,
  type SupersetDraft,
} from '../templateDraftSupersets';

let idCounter = 0;
const newId = () => `id-${(idCounter += 1)}`;

beforeEach(() => {
  idCounter = 0;
});

function exercise(
  exerciseId: string,
  supersetId: string | null = null,
  setCount = 3,
): EditableExercise {
  return {
    exerciseId,
    typeId: null,
    color: null,
    supersetId,
    goal: '',
    notes: null,
    sets: Array.from({ length: setCount }, (_, index) => ({
      id: `${exerciseId}-set-${index}`,
      setType: 'NORMAL',
      restSeconds: null,
      fieldValues: [],
    })),
  };
}

const names = (draft: SupersetDraft) =>
  draft.exercises.map(item => item.exerciseId);
const groups = (draft: SupersetDraft) =>
  draft.exercises.map(item => item.supersetId);

describe('addSuperset', () => {
  it('groups the chosen exercises and pulls them together', () => {
    const draft = addSuperset(
      {
        exercises: [exercise('pull'), exercise('squat'), exercise('curl')],
        supersets: [],
      },
      ['pull', 'curl'],
      newId,
    );

    expect(names(draft)).toEqual(['pull', 'curl', 'squat']);
    expect(groups(draft)).toEqual(['id-1', 'id-1', null]);
  });

  it('defaults to resting between rounds but not between exercises', () => {
    const draft = addSuperset(
      { exercises: [exercise('pull'), exercise('curl')], supersets: [] },
      ['pull', 'curl'],
      newId,
    );

    expect(draft.supersets).toEqual([
      { id: 'id-1', restSeconds: 90, transitionRestSeconds: null },
    ]);
  });

  it('levels members up to the largest set count, never deleting sets', () => {
    const draft = addSuperset(
      {
        exercises: [exercise('pull', null, 4), exercise('curl', null, 2)],
        supersets: [],
      },
      ['pull', 'curl'],
      newId,
    );

    expect(draft.exercises.map(item => item.sets.length)).toEqual([4, 4]);
  });

  it('refuses a group of fewer than two exercises', () => {
    const before: SupersetDraft = {
      exercises: [exercise('pull')],
      supersets: [],
    };

    expect(addSuperset(before, ['pull'], newId)).toBe(before);
    expect(addSuperset(before, ['pull', 'missing'], newId)).toBe(before);
  });

  it('moves a member out of its previous superset, dissolving what is left', () => {
    const start = addSuperset(
      {
        exercises: [exercise('pull'), exercise('curl'), exercise('row')],
        supersets: [],
      },
      ['pull', 'curl'],
      newId,
    );
    const draft = addSuperset(start, ['curl', 'row'], newId);

    expect(groups(draft)).toEqual([null, 'id-2', 'id-2']);
    expect(draft.supersets.map(group => group.id)).toEqual(['id-2']);
  });
});

describe('setSupersetRounds', () => {
  const grouped = () =>
    addSuperset(
      {
        exercises: [exercise('pull', null, 2), exercise('curl', null, 2)],
        supersets: [],
      },
      ['pull', 'curl'],
      newId,
    );

  it('adds a round to every member at once', () => {
    const draft = setSupersetRounds(grouped(), 'id-1', 4, newId);

    expect(draft.exercises.map(item => item.sets.length)).toEqual([4, 4]);
  });

  it('removes rounds from every member at once', () => {
    const draft = setSupersetRounds(grouped(), 'id-1', 1, newId);

    expect(draft.exercises.map(item => item.sets.length)).toEqual([1, 1]);
  });

  it('gives padded sets fresh ids so React keys stay unique', () => {
    const draft = setSupersetRounds(grouped(), 'id-1', 3, newId);
    const ids = draft.exercises.flatMap(item => item.sets.map(set => set.id));

    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('ungroupSuperset', () => {
  it('frees the members and drops the group', () => {
    const grouped = addSuperset(
      { exercises: [exercise('pull'), exercise('curl')], supersets: [] },
      ['pull', 'curl'],
      newId,
    );
    const draft = ungroupSuperset(grouped, 'id-1');

    expect(groups(draft)).toEqual([null, null]);
    expect(draft.supersets).toEqual([]);
  });
});

describe('updateSuperset', () => {
  it('patches only the addressed group', () => {
    const draft = updateSuperset(
      {
        exercises: [],
        supersets: [
          { id: 'a', restSeconds: 90, transitionRestSeconds: null },
          { id: 'b', restSeconds: 60, transitionRestSeconds: null },
        ],
      },
      'a',
      { transitionRestSeconds: 15 },
    );

    expect(draft.supersets).toEqual([
      { id: 'a', restSeconds: 90, transitionRestSeconds: 15 },
      { id: 'b', restSeconds: 60, transitionRestSeconds: null },
    ]);
  });
});

describe('reorderBlocks', () => {
  it('moves a superset as one unit', () => {
    const grouped = addSuperset(
      {
        exercises: [exercise('pull'), exercise('curl'), exercise('squat')],
        supersets: [],
      },
      ['pull', 'curl'],
      newId,
    );
    const draft = reorderBlocks(grouped, 0, 1);

    expect(names(draft)).toEqual(['squat', 'pull', 'curl']);
    expect(groups(draft)).toEqual([null, 'id-1', 'id-1']);
  });
});

describe('moveSupersetMember', () => {
  const grouped = () =>
    addSuperset(
      {
        exercises: [exercise('squat'), exercise('pull'), exercise('curl')],
        supersets: [],
      },
      ['pull', 'curl'],
      newId,
    );

  it('swaps two members without touching the rest of the workout', () => {
    const draft = moveSupersetMember(grouped(), 'id-1', 0, 1);

    expect(names(draft)).toEqual(['squat', 'curl', 'pull']);
    expect(groups(draft)).toEqual([null, 'id-1', 'id-1']);
  });

  it('refuses to move a member out of its own group', () => {
    const before = grouped();

    expect(moveSupersetMember(before, 'id-1', 0, -1)).toBe(before);
    expect(moveSupersetMember(before, 'id-1', 0, 2)).toBe(before);
  });
});

describe('selectExercises', () => {
  const grouped = () =>
    addSuperset(
      {
        exercises: [exercise('pull'), exercise('curl'), exercise('squat')],
        supersets: [],
      },
      ['pull', 'curl'],
      newId,
    );

  it('keeps a superset intact when a member is reselected last', () => {
    // How the picker actually returns it: a re-toggled exercise lands at the
    // end of the selection, which used to strand it away from its group.
    const draft = selectExercises(
      grouped(),
      ['pull', 'squat', 'curl'],
      exercise,
    );

    expect(names(draft)).toEqual(['pull', 'curl', 'squat']);
    expect(groups(draft)).toEqual(['id-1', 'id-1', null]);
  });

  it('dissolves a group whose second member was deselected', () => {
    const draft = selectExercises(grouped(), ['pull', 'squat'], exercise);

    expect(groups(draft)).toEqual([null, null]);
    expect(draft.supersets).toEqual([]);
  });

  it('adds newly picked exercises as standalone', () => {
    const draft = selectExercises(
      grouped(),
      ['pull', 'curl', 'squat', 'bench'],
      exercise,
    );

    expect(names(draft)).toEqual(['pull', 'curl', 'squat', 'bench']);
    expect(groups(draft)).toEqual(['id-1', 'id-1', null, null]);
  });
});

describe('removeDraftExercise', () => {
  it('dissolves the group when only one member is left', () => {
    const grouped = addSuperset(
      { exercises: [exercise('pull'), exercise('curl')], supersets: [] },
      ['pull', 'curl'],
      newId,
    );
    const draft = removeDraftExercise(grouped, 'curl');

    expect(names(draft)).toEqual(['pull']);
    expect(groups(draft)).toEqual([null]);
    expect(draft.supersets).toEqual([]);
  });

  it('keeps a three-member group alive after one is removed', () => {
    const grouped = addSuperset(
      {
        exercises: [exercise('pull'), exercise('curl'), exercise('row')],
        supersets: [],
      },
      ['pull', 'curl', 'row'],
      newId,
    );
    const draft = removeDraftExercise(grouped, 'curl');

    expect(groups(draft)).toEqual(['id-1', 'id-1']);
    expect(draft.supersets).toHaveLength(1);
  });
});

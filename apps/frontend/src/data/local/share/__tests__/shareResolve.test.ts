import {
  builtInNormal,
  customTempo,
  library,
  sharedExercise,
} from '../__fixtures__/shareFixtures';
import {
  remapFieldValues,
  remapProgressionGoal,
  resolveExercises,
  resolveSetTypes,
} from '../shareResolve';

let idCounter = 0;
const newId = () => `new-${(idCounter += 1)}`;

beforeEach(() => {
  idCounter = 0;
});

describe('resolveSetTypes', () => {
  it('keeps built-ins and their field ids untouched', () => {
    const result = resolveSetTypes([builtInNormal], library(), newId);
    expect(result.setTypeIds.get('NORMAL')).toBe('NORMAL');
    expect(result.fieldIds.size).toBe(0);
    expect(result.toCreate).toEqual([]);
    expect(result.matchedNames).toEqual(['Arbeitssatz']);
  });

  it('reuses a local set type with the same id', () => {
    const result = resolveSetTypes(
      [customTempo({ id: 'local-tempo', name: 'Renamed' })],
      library(),
      newId,
    );
    expect(result.setTypeIds.get('local-tempo')).toBe('local-tempo');
    expect(result.toCreate).toEqual([]);
  });

  it('matches by name and field signature, mapping fields by position', () => {
    const result = resolveSetTypes([customTempo()], library(), newId);
    expect(result.setTypeIds.get('sender-tempo')).toBe('local-tempo');
    expect(result.fieldIds.get('sender-tempo-reps')).toBe('local-tempo-reps');
    expect(result.fieldIds.get('sender-tempo-secs')).toBe('local-tempo-secs');
    expect(result.toCreate).toEqual([]);
  });

  it('creates a new set type when the signature differs', () => {
    const shared = customTempo({
      fields: [
        {
          id: 'sender-tempo-reps',
          name: 'Reps',
          dataType: 'number',
          unit: null,
          position: 0,
          config: {},
        },
        {
          id: 'sender-tempo-rpe',
          name: 'RPE',
          dataType: 'number',
          unit: null,
          position: 1,
          config: {},
        },
      ],
    });
    const result = resolveSetTypes([shared], library(), newId);

    expect(result.toCreate).toHaveLength(1);
    const created = result.toCreate[0];
    expect(created.id).toBe(result.setTypeIds.get('sender-tempo'));
    expect(created.name).toBe('tempo');
    expect(created.fields.map(field => field.id)).toEqual([
      result.fieldIds.get('sender-tempo-reps'),
      result.fieldIds.get('sender-tempo-rpe'),
    ]);
    // The goal points at the created field, not the sender's.
    expect(created.progressionGoal).toEqual({
      kind: 'linear',
      fieldId: result.fieldIds.get('sender-tempo-reps'),
      increment: 1,
    });
  });

  it('never signature-matches onto a built-in', () => {
    const shared = customTempo({
      name: 'Working',
      fields: builtInNormal.fields,
      progressionGoal: { kind: 'none' },
    });
    const result = resolveSetTypes([shared], library(), newId);
    expect(result.toCreate).toHaveLength(1);
  });

  it('orders created fields by position', () => {
    const result = resolveSetTypes(
      [customTempo({ name: 'Brand new' })],
      library(),
      newId,
    );
    expect(
      result.toCreate[0].fields.map(field => [field.name, field.position]),
    ).toEqual([
      ['reps', 0],
      ['Seconds', 1],
    ]);
  });
});

describe('resolveExercises', () => {
  it('reuses by id, then by trimmed case-insensitive name', () => {
    const result = resolveExercises(
      [
        sharedExercise({ id: 'local-bench', name: 'Whatever' }),
        sharedExercise({ id: 'sender-bench', name: '  bench press ' }),
      ],
      library(),
      newId,
    );
    expect(result.exerciseIds.get('local-bench')).toBe('local-bench');
    expect(result.exerciseIds.get('sender-bench')).toBe('local-bench');
    expect(result.toCreate).toEqual([]);
  });

  it('creates unknown exercises, keeping only local types and muscle groups', () => {
    const result = resolveExercises(
      [
        sharedExercise({
          typeId: 'sender-type',
          typeName: 'machine',
          muscleGroupIds: ['default-mg-chest', 'sender-mg'],
        }),
        sharedExercise({
          id: 'sender-ex-2',
          name: 'Band Pull-Apart',
          typeId: 'sender-band',
          typeName: 'Band',
        }),
      ],
      library(),
      newId,
    );
    expect(result.toCreate).toEqual([
      {
        id: result.exerciseIds.get('sender-ex'),
        name: 'Cable Fly',
        description: 'Chest isolation',
        howTo: null,
        typeId: 'default-et-machine',
        muscleGroupIds: ['default-mg-chest'],
      },
      expect.objectContaining({ name: 'Band Pull-Apart', typeId: null }),
    ]);
  });
});

describe('remapping', () => {
  const fieldIds = new Map([
    ['a', 'A'],
    ['b', 'B'],
  ]);

  it('rewrites field values and leaves unknown ids alone', () => {
    expect(
      remapFieldValues(
        [
          { fieldId: 'a', number: 5 },
          { fieldId: 'NORMAL-reps', number: 8 },
        ],
        fieldIds,
      ),
    ).toEqual([
      { fieldId: 'A', number: 5 },
      { fieldId: 'NORMAL-reps', number: 8 },
    ]);
  });

  it('rewrites progression goal field references', () => {
    expect(
      remapProgressionGoal(
        {
          kind: 'rangeRollover',
          rangeFieldId: 'a',
          targetFieldId: 'b',
          rangeMin: 8,
          rangeMax: 12,
          rangeIncrement: 1,
          targetIncrement: 2.5,
        },
        fieldIds,
      ),
    ).toMatchObject({ rangeFieldId: 'A', targetFieldId: 'B' });
    expect(
      remapProgressionGoal({ kind: 'linear', increment: 1 }, fieldIds),
    ).toEqual({
      kind: 'linear',
      fieldId: undefined,
      increment: 1,
    });
  });
});

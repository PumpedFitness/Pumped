import type {
  SharePayload,
  SharedTemplate,
  SharedWorkout,
} from '@/lib/share/shareTypes';
import {
  builtInNormal,
  customTempo,
  library,
  sharedExercise,
} from '../__fixtures__/shareFixtures';
import { planShareImport, uniqueTemplateName } from '../sharePlan';

let idCounter = 0;
const newId = () => `new-${(idCounter += 1)}`;

beforeEach(() => {
  idCounter = 0;
});

describe('uniqueTemplateName', () => {
  it('suffixes taken names', () => {
    expect(uniqueTemplateName('Push', [])).toBe('Push');
    expect(uniqueTemplateName('Push', ['push', 'Push (2)'])).toBe('Push (3)');
  });
});

const template: SharedTemplate = {
  name: 'Push Day',
  description: null,
  color: 'HONEY',
  icon: null,
  supersets: [{ id: 'ss-1', restSeconds: 90, transitionRestSeconds: 10 }],
  exercises: [
    {
      exerciseId: 'sender-bench',
      typeId: 'sender-placement-type',
      color: null,
      supersetId: 'ss-1',
      goal: null,
      notes: 'Pause',
      sets: [
        {
          setType: 'NORMAL',
          restSeconds: null,
          progressionGoal: null,
          fieldValues: [{ fieldId: 'NORMAL-reps', number: 8 }],
        },
      ],
    },
    {
      exerciseId: 'sender-ex',
      typeId: null,
      color: 'SAGE',
      supersetId: 'ss-1',
      goal: null,
      notes: null,
      sets: [
        {
          setType: 'sender-tempo',
          restSeconds: 60,
          progressionGoal: {
            kind: 'linear',
            fieldId: 'sender-tempo-secs',
            increment: 5,
          },
          fieldValues: [{ fieldId: 'sender-tempo-secs', number: 30 }],
        },
      ],
    },
  ],
};

const templatePayload: SharePayload = {
  kind: 'template',
  template,
  exercises: [
    sharedExercise({ id: 'sender-bench', name: 'Bench Press' }),
    sharedExercise(),
  ],
  setTypes: [builtInNormal, customTempo({ name: 'Something else' })],
};

describe('planShareImport', () => {
  it('rewrites a template into local ids', () => {
    const plan = planShareImport(
      templatePayload,
      library({ templateNames: ['Push Day'] }),
      newId,
    );
    const created = plan.setTypesToCreate[0];
    const createdSecs = created.fields.find(field => field.name === 'Seconds')!;
    const createdExercise = plan.exercisesToCreate[0];

    expect(plan.matchedExercises).toEqual(['Bench Press']);
    expect(plan.template).toMatchObject({
      name: 'Push Day (2)',
      color: 'HONEY',
      supersets: [{ id: 'ss-1', restSeconds: 90, transitionRestSeconds: 10 }],
    });
    const [bench, fly] = plan.template!.exercises;
    expect(bench).toMatchObject({
      exerciseId: 'local-bench',
      // Unknown placement type is dropped.
      typeId: null,
      supersetId: 'ss-1',
      notes: 'Pause',
    });
    expect(bench.sets[0]).toEqual({
      setType: 'NORMAL',
      restSeconds: null,
      progressionGoal: null,
      fieldValues: [{ fieldId: 'NORMAL-reps', number: 8 }],
    });
    expect(fly.exerciseId).toBe(createdExercise.id);
    expect(fly.supersetId).toBe('ss-1');
    expect(fly.sets[0]).toEqual({
      setType: created.id,
      restSeconds: 60,
      progressionGoal: {
        kind: 'linear',
        fieldId: createdSecs.id,
        increment: 5,
      },
      fieldValues: [{ fieldId: createdSecs.id, number: 30 }],
    });
  });

  it('fails when a referenced exercise is missing from the payload', () => {
    expect(() =>
      planShareImport({ ...templatePayload, exercises: [] }, library(), newId),
    ).toThrow(/exercise sender-bench/);
  });
});

describe('planShareImport for other kinds', () => {
  it('turns a shared workout into a template with rebuilt supersets', () => {
    const workout: SharedWorkout = {
      name: 'Monday',
      startedAt: 1,
      endedAt: 2,
      color: 'MOSS',
      icon: null,
      notes: 'Felt good',
      sets: [
        {
          exerciseId: 'sender-ex',
          exercisePosition: 1,
          setPosition: 0,
          supersetId: 'tok',
          setType: 'sender-tempo',
          restSeconds: 90,
          fieldValues: [{ fieldId: 'sender-tempo-reps', number: 10 }],
          fieldDefinitions: [],
          performedAt: 5,
        },
        {
          exerciseId: 'sender-bench',
          exercisePosition: 0,
          setPosition: 0,
          supersetId: 'tok',
          setType: 'NORMAL',
          restSeconds: 15,
          fieldValues: [],
          fieldDefinitions: [],
          performedAt: 4,
        },
      ],
    };
    const plan = planShareImport(
      {
        kind: 'workout',
        workout,
        exercises: templatePayload.exercises,
        setTypes: [builtInNormal, customTempo()],
      },
      library(),
      newId,
    );

    expect(plan.setTypesToCreate).toEqual([]);
    expect(plan.template).toMatchObject({
      name: 'Monday',
      description: 'Felt good',
      color: 'MOSS',
    });
    const { exercises, supersets } = plan.template!;
    expect(exercises.map(exercise => exercise.exerciseId)).toEqual([
      'local-bench',
      plan.exercisesToCreate[0].id,
    ]);
    expect(supersets).toEqual([
      { id: expect.any(String), restSeconds: 90, transitionRestSeconds: 15 },
    ]);
    expect(exercises[1].sets[0]).toMatchObject({
      setType: 'local-tempo',
      fieldValues: [{ fieldId: 'local-tempo-reps', number: 10 }],
    });
  });

  it('returns the local id for a set type or exercise', () => {
    expect(
      planShareImport(
        { kind: 'setType', setType: customTempo() },
        library(),
        newId,
      ).targetId,
    ).toBe('local-tempo');
    const plan = planShareImport(
      { kind: 'exercise', exercise: sharedExercise() },
      library(),
      newId,
    );
    expect(plan.targetId).toBe(plan.exercisesToCreate[0].id);
  });

  it('refuses built-in set types and achievements', () => {
    expect(() =>
      planShareImport(
        { kind: 'setType', setType: builtInNormal },
        library(),
        newId,
      ),
    ).toThrow();
    expect(() =>
      planShareImport(
        {
          kind: 'achievement',
          achievement: {
            kind: 'topWeight',
            exerciseName: 'Bench',
            value: 100,
            weightKg: 100,
            reps: 1,
            achievedAt: 1,
            workoutName: 'Push',
          },
        },
        library(),
        newId,
      ),
    ).toThrow();
  });
});

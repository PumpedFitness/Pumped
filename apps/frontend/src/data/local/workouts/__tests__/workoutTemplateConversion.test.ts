import type { PerformedSet, WorkoutSessionDetails } from '@/types/workout';
import { workoutSessionToTemplateInput } from '../workoutTemplateConversion';

let idCounter = 0;
const newId = () => `key-${(idCounter += 1)}`;

beforeEach(() => {
  idCounter = 0;
});

function performedSet(
  overrides: Partial<PerformedSet> & Pick<PerformedSet, 'exerciseId'>,
): PerformedSet {
  return {
    id: `set-${Math.random()}`,
    workoutSessionId: 'session',
    exercisePosition: 0,
    setPosition: 0,
    supersetId: null,
    setType: 'NORMAL',
    restSeconds: null,
    fieldDefinitions: [],
    fieldValues: [],
    performedAt: 1,
    importId: null,
    ...overrides,
  };
}

function session(sets: PerformedSet[]): WorkoutSessionDetails {
  return {
    id: 'session',
    userId: 'local',
    workoutTemplateId: 'template',
    name: 'Pull Day',
    startedAt: 0,
    endedAt: 1,
    notes: null,
    color: 'TERRACOTTA',
    icon: null,
    picture: null,
    importId: null,
    sets,
  };
}

/**
 * The performed sets a superset produces: each member's sets carry the rest
 * that member was actually followed by — transition rest for every member but
 * the last, round rest for the last.
 */
function supersetSession() {
  return session([
    performedSet({
      exerciseId: 'pull-up',
      exercisePosition: 0,
      setPosition: 0,
      supersetId: 'source-a',
      restSeconds: 15,
    }),
    performedSet({
      exerciseId: 'pull-up',
      exercisePosition: 0,
      setPosition: 1,
      supersetId: 'source-a',
      restSeconds: 15,
    }),
    performedSet({
      exerciseId: 'curl',
      exercisePosition: 1,
      setPosition: 0,
      supersetId: 'source-a',
      restSeconds: 90,
    }),
    performedSet({
      exerciseId: 'curl',
      exercisePosition: 1,
      setPosition: 1,
      supersetId: 'source-a',
      restSeconds: 90,
    }),
    performedSet({
      exerciseId: 'squat',
      exercisePosition: 2,
      setPosition: 0,
      restSeconds: 120,
    }),
  ]);
}

describe('workoutSessionToTemplateInput', () => {
  it('keeps exercises in performed order', () => {
    const input = workoutSessionToTemplateInput(supersetSession(), newId);

    expect(input.exercises.map(exercise => exercise.exerciseId)).toEqual([
      'pull-up',
      'curl',
      'squat',
    ]);
  });

  it('rebuilds the superset under a fresh key, not the source template id', () => {
    const input = workoutSessionToTemplateInput(supersetSession(), newId);

    expect(input.supersets).toHaveLength(1);
    expect(input.supersets?.[0].id).toBe('key-1');
    expect(input.exercises.map(exercise => exercise.supersetId)).toEqual([
      'key-1',
      'key-1',
      null,
    ]);
  });

  it('recovers round rest from the last member and transition rest from the first', () => {
    const input = workoutSessionToTemplateInput(supersetSession(), newId);

    expect(input.supersets?.[0]).toMatchObject({
      restSeconds: 90,
      transitionRestSeconds: 15,
    });
  });

  it('clears per-set rest on members so the group owns the only copy', () => {
    const input = workoutSessionToTemplateInput(supersetSession(), newId);

    expect(
      input.exercises
        .filter(exercise => exercise.supersetId !== null)
        .flatMap(exercise => exercise.sets.map(set => set.restSeconds)),
    ).toEqual([null, null, null, null]);
  });

  it('leaves a standalone exercise its own per-set rest', () => {
    const input = workoutSessionToTemplateInput(supersetSession(), newId);

    expect(input.exercises[2].sets[0].restSeconds).toBe(120);
  });

  it('degrades a group that only has one member left', () => {
    const input = workoutSessionToTemplateInput(
      session([
        performedSet({
          exerciseId: 'pull-up',
          exercisePosition: 0,
          supersetId: 'source-a',
          restSeconds: 90,
        }),
      ]),
      newId,
    );

    expect(input.supersets).toEqual([]);
    expect(input.exercises[0].supersetId).toBeNull();
    expect(input.exercises[0].sets[0].restSeconds).toBe(90);
  });

  it('produces no supersets for a workout that had none', () => {
    const input = workoutSessionToTemplateInput(
      session([
        performedSet({ exerciseId: 'squat', exercisePosition: 0 }),
        performedSet({ exerciseId: 'bench', exercisePosition: 1 }),
      ]),
      newId,
    );

    expect(input.supersets).toEqual([]);
    expect(input.exercises.every(item => item.supersetId === null)).toBe(true);
  });
});

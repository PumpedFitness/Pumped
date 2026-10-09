import { parseShareEnvelope } from '../shareTypes';

const envelope = (payload: unknown, overrides: object = {}) =>
  JSON.stringify({ app: 'pumped', v: 1, sharedAt: 1, payload, ...overrides });

describe('parseShareEnvelope', () => {
  it('accepts each kind with its outer shape', () => {
    const payloads = [
      {
        kind: 'template',
        template: { name: 'A', exercises: [], supersets: [] },
        exercises: [],
        setTypes: [],
      },
      {
        kind: 'workout',
        workout: { name: 'A', sets: [] },
        exercises: [],
        setTypes: [],
      },
      { kind: 'setType', setType: { name: 'A', fields: [] } },
      { kind: 'exercise', exercise: { name: 'A' } },
      { kind: 'achievement', achievement: { exerciseName: 'A' } },
    ];
    payloads.forEach(payload =>
      expect(parseShareEnvelope(envelope(payload)).ok).toBe(true),
    );
  });

  it('rejects foreign, future and broken input', () => {
    expect(parseShareEnvelope('not json')).toEqual({
      ok: false,
      error: 'malformed',
    });
    expect(parseShareEnvelope(JSON.stringify({ app: 'other' }))).toEqual({
      ok: false,
      error: 'notPumped',
    });
    expect(parseShareEnvelope(envelope({}, { v: 2 }))).toEqual({
      ok: false,
      error: 'unsupportedVersion',
    });
    expect(
      parseShareEnvelope(
        envelope({ kind: 'template', template: { name: 'A' } }),
      ),
    ).toEqual({ ok: false, error: 'malformed' });
    expect(parseShareEnvelope(envelope({ kind: 'mystery' }))).toEqual({
      ok: false,
      error: 'malformed',
    });
  });
});

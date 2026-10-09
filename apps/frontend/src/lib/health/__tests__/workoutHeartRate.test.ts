import {
  analyseWorkoutHeartRate,
  typicalGapSeconds,
  type WorkoutHeartRateSet,
} from '../algorithms/workoutHeartRate';
import type { TimedValue } from '../algorithms/downsample';

describe('Herzfrequenz im Workout', () => {
  const startedAt = 1_700_000_000_000;
  const start = startedAt / 1000;

  /** Puls alle `step` Sekunden über das Fenster, aus einer Funktion der Zeit. */
  const curve = (
    from: number,
    to: number,
    step: number,
    bpm: (ts: number) => number,
  ): TimedValue[] => {
    const out: TimedValue[] = [];
    for (let ts = from; ts <= to; ts += step) out.push({ ts, value: bpm(ts) });
    return out;
  };

  const set = (
    id: string,
    exerciseKey: string,
    endSecond: number | null,
  ): WorkoutHeartRateSet => ({
    id,
    exerciseKey,
    performedAt: endSecond === null ? null : startedAt + endSecond * 1000,
  });

  // Zwei Sätze: Arbeit 60–100 s und 220–260 s. Puls 150 in der Arbeit,
  // 120 in den ersten Pausensekunden, 100 danach.
  const bpm = (ts: number) => {
    const t = ts - start;
    if ((t >= 60 && t <= 105) || (t >= 220 && t <= 265)) return 150;
    if ((t > 105 && t < 150) || (t > 265 && t < 310)) return 120;
    return 100;
  };

  it('ordnet Spitze und Erholung den Sätzen zu', () => {
    const result = analyseWorkoutHeartRate({
      startedAt,
      endedAt: startedAt + 400_000,
      sets: [set('a', 'bench', 100), set('b', 'squat', 260)],
      curve: curve(start - 60, start + 580, 5, bpm),
    });

    expect(result.resolution).toBe('detailed');
    expect(result.sets).toHaveLength(2);
    expect(result.sets[0]).toMatchObject({
      setId: 'a',
      startTs: start + 60,
      endTs: start + 100,
      peak: 150,
      // 160 s liegt nach dem Abfall auf 100.
      recovery: 50,
    });
    expect(result.peak?.value).toBe(150);
    expect(result.exercises.map(entry => entry.exerciseKey)).toEqual([
      'bench',
      'squat',
    ]);
  });

  it('misst keine Erholung, wenn der nächste Satz zu früh beginnt', () => {
    const result = analyseWorkoutHeartRate({
      startedAt,
      endedAt: startedAt + 400_000,
      sets: [set('a', 'bench', 100), set('b', 'bench', 130)],
      curve: curve(start - 60, start + 580, 5, bpm),
    });

    expect(result.sets[0].recovery).toBeNull();
    // Der zweite Satz beginnt nie vor dem Ende des ersten.
    expect(result.sets[1].startTs).toBe(start + 100);
  });

  it('überspringt Sätze ohne Zeitstempel', () => {
    const result = analyseWorkoutHeartRate({
      startedAt,
      endedAt: startedAt + 400_000,
      sets: [set('a', 'bench', null), set('b', 'squat', 260)],
      curve: curve(start - 60, start + 580, 5, bpm),
    });

    expect(result.sets.map(entry => entry.setId)).toEqual(['b']);
  });

  it('bleibt beim Ganzen, wenn die Uhr nur selten misst', () => {
    const result = analyseWorkoutHeartRate({
      startedAt,
      endedAt: startedAt + 3_600_000,
      sets: [set('a', 'bench', 100)],
      curve: curve(start, start + 3600, 600, () => 110),
    });

    expect(result.resolution).toBe('sparse');
    expect(result.average).toBe(110);
    expect(result.sets).toEqual([]);
    expect(result.exercises).toEqual([]);
  });

  it('meldet nichts ohne Messungen im Workout', () => {
    const result = analyseWorkoutHeartRate({
      startedAt,
      endedAt: startedAt + 400_000,
      sets: [set('a', 'bench', 100)],
      curve: [],
    });

    expect(result.resolution).toBe('none');
    expect(result.average).toBeNull();
  });

  it('nimmt den Median der Abstände', () => {
    expect(
      typicalGapSeconds([
        { ts: 0, value: 1 },
        { ts: 5, value: 1 },
        { ts: 10, value: 1 },
        { ts: 400, value: 1 },
        { ts: 405, value: 1 },
      ]),
    ).toBe(5);
  });
});

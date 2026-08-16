import {
  mainNightsByDate,
  toSleepNight,
  type SleepSessionInput,
  type SleepStageInterval,
} from '../algorithms/sleep';
import { SLEEP_NEED_HOURS } from '../algorithms/sleepDebt';
import { sleepScore } from '../algorithms/sleepScore';

describe('Schlafnote', () => {
  const hours = (value: number) => value * 3600;
  const morning = Date.parse('2026-06-15T05:00:00Z') / 1000;
  const DAY = hours(24);

  /** Phasen als eine Kette ab Mitternacht, in Minuten je Abschnitt. */
  const chain = (
    endTs: number,
    parts: readonly { kind: SleepStageInterval['kind']; minutes: number }[],
  ): SleepStageInterval[] => {
    let cursor = endTs - hours(8);
    return parts.map(part => {
      const startTs = cursor;
      cursor += part.minutes * 60;
      return { kind: part.kind, startTs, endTs: cursor };
    });
  };

  const night = (
    overrides: Partial<SleepSessionInput> & { endTs: number },
  ): SleepSessionInput => ({
    startTs: overrides.endTs - hours(8),
    tzOffsetSeconds: 0,
    minutesAsleep: 480,
    minutesInSleepPeriod: 500,
    minutesAwake: 20,
    minutesToFallAsleep: 0,
    isMain: true,
    stages: [],
    ...overrides,
  });

  /** Eine Handvoll gleichförmiger Vornächte als Phasenreferenz. */
  const withHistory = (
    last: SleepSessionInput,
    priorDeep = 60,
    priorRem = 90,
  ) => {
    const prior = [1, 2, 3, 4].map(back =>
      night({
        endTs: last.endTs - back * DAY,
        stages: chain(last.endTs - back * DAY, [
          { kind: 'deep', minutes: priorDeep },
          { kind: 'rem', minutes: priorRem },
          { kind: 'core', minutes: 330 },
        ]),
      }),
    );
    return mainNightsByDate([...prior, last].map(toSleepNight));
  };

  it('benotet die volle Bedarfsdauer bei gewohnten Phasen mit 100', () => {
    const last = night({
      endTs: morning,
      minutesAsleep: SLEEP_NEED_HOURS * 60,
      minutesInSleepPeriod: SLEEP_NEED_HOURS * 60,
      stages: chain(morning, [
        { kind: 'deep', minutes: 60 },
        { kind: 'rem', minutes: 90 },
        { kind: 'core', minutes: 306 },
      ]),
    });

    const result = sleepScore(withHistory(last), 20260615, []);
    expect(result.score).toBe(99); // Auf SCORE_MAX geklemmt, wie beim Readiness.
    expect(result.label).toBe('PRIMED');
  });

  it('gewichtet die Dauer doppelt gegenüber den übrigen Termen', () => {
    const last = night({
      endTs: morning,
      // Halber Bedarf, alles andere auf Soll → 0.4·50 + 0.6·100 = 80.
      minutesAsleep: (SLEEP_NEED_HOURS / 2) * 60,
      minutesInSleepPeriod: (SLEEP_NEED_HOURS / 2) * 60,
      stages: chain(morning, [
        { kind: 'deep', minutes: 60 },
        { kind: 'rem', minutes: 90 },
        { kind: 'core', minutes: 78 },
      ]),
    });

    expect(sleepScore(withHistory(last), 20260615, []).score).toBe(80);
  });

  it('kappt Überschreitungen, statt sie zu belohnen oder zu bestrafen', () => {
    const generous = night({
      endTs: morning,
      minutesAsleep: 11 * 60,
      minutesInSleepPeriod: 11 * 60,
      stages: chain(morning, [
        { kind: 'deep', minutes: 200 },
        { kind: 'rem', minutes: 260 },
        { kind: 'core', minutes: 200 },
      ]),
    });

    const result = sleepScore(withHistory(generous), 20260615, []);
    expect(result.rows.find(row => row.term === 'deep')?.score).toBe(100);
    expect(result.score).toBe(99);
  });

  it('nimmt Phasenterme aus einer Nacht ohne Phasendetail heraus', () => {
    // CLASSIC: nur „schlafend" und „wach", kein Tief- oder REM-Schlaf.
    const classic = night({
      endTs: morning,
      minutesAsleep: SLEEP_NEED_HOURS * 60,
      minutesInSleepPeriod: SLEEP_NEED_HOURS * 60,
      stages: chain(morning, [{ kind: 'awake', minutes: 12 }]),
    });

    const result = sleepScore(withHistory(classic), 20260615, []);
    const byTerm = new Map(result.rows.map(row => [row.term, row]));

    expect(byTerm.get('deep')?.score).toBeNull();
    expect(byTerm.get('deep')?.weight).toBe(0);
    // Dauer und Effizienz teilen sich die Note im Verhältnis 0.4 : 0.2.
    expect(byTerm.get('duration')?.weight).toBeCloseTo(2 / 3, 10);
    expect(result.score).toBe(99);
  });

  it('lässt die Phasenterme ohne genügend Vornächte aus', () => {
    const lonely = toSleepNight(
      night({
        endTs: morning,
        stages: chain(morning, [
          { kind: 'deep', minutes: 60 },
          { kind: 'rem', minutes: 90 },
        ]),
      }),
    );

    const result = sleepScore(mainNightsByDate([lonely]), 20260615, []);
    expect(result.rows.find(row => row.term === 'rem')?.score).toBeNull();
    expect(result.score).not.toBeNull();
  });

  it('benotet schlechtes Durchschlafen trotz ausreichender Dauer herunter', () => {
    const restless = night({
      endTs: morning,
      minutesAsleep: SLEEP_NEED_HOURS * 60,
      // 76 % Effizienz — knapp über dem Boden von 60 %.
      minutesInSleepPeriod: (SLEEP_NEED_HOURS * 60) / 0.76,
      stages: chain(morning, [
        { kind: 'deep', minutes: 60 },
        { kind: 'rem', minutes: 90 },
        { kind: 'core', minutes: 306 },
      ]),
    });

    const result = sleepScore(withHistory(restless), 20260615, []);
    const efficiency = result.rows.find(row => row.term === 'efficiency');
    expect(efficiency?.score).toBeCloseTo(53.33, 1);
    // 0.4·100 + 0.2·100 + 0.2·100 + 0.2·53.33
    expect(result.score).toBe(91);
  });

  it('gibt ohne Nacht am Stichtag gar keine Note', () => {
    expect(sleepScore(new Map(), 20260615, [])).toEqual({
      score: null,
      label: null,
      rows: [],
    });
  });
});

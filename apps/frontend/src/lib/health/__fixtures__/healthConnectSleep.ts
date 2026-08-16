import type { RecordResult } from 'react-native-health-connect';

/**
 * Eine Nacht, wie Health Connect sie liefert.
 *
 * Liegt außerhalb von `__tests__`, weil Jest dort jede Datei für eine Testsuite
 * hält und eine ohne `it` als Fehlschlag zählt.
 *
 * 2026-06-14 22:00 bis 2026-06-15 06:00 in UTC+2 — die Nacht endet also nach
 * lokaler Mitternacht und trägt das Zivildatum des Morgens, 20260615.
 */
export const NIGHT_START = Date.UTC(2026, 5, 14, 20, 0);
export const NIGHT_END = Date.UTC(2026, 5, 15, 4, 0);
export const OFFSET = 7200;

export const HOUR = 3_600_000;
export const MINUTE = 60_000;

/** `SleepStageType` der Plattform. */
export const Stage = {
  unknown: 0,
  awake: 1,
  sleeping: 2,
  outOfBed: 3,
  light: 4,
  deep: 5,
  rem: 6,
} as const;

export function iso(millis: number): string {
  return new Date(millis).toISOString();
}

export function sleepRecord(
  overrides: Partial<RecordResult<'SleepSession'>> = {},
): RecordResult<'SleepSession'> {
  return {
    startTime: iso(NIGHT_START),
    endTime: iso(NIGHT_END),
    stages: [
      {
        stage: Stage.light,
        startTime: iso(NIGHT_START),
        endTime: iso(NIGHT_START + 3 * HOUR),
      },
      {
        stage: Stage.deep,
        startTime: iso(NIGHT_START + 3 * HOUR),
        endTime: iso(NIGHT_START + 5 * HOUR),
      },
      {
        stage: Stage.rem,
        startTime: iso(NIGHT_START + 5 * HOUR),
        endTime: iso(NIGHT_START + 7 * HOUR),
      },
      {
        stage: Stage.awake,
        startTime: iso(NIGHT_START + 7 * HOUR),
        endTime: iso(NIGHT_END),
      },
    ],
    ...overrides,
  } as RecordResult<'SleepSession'>;
}

/** Ein Herzfrequenz-Datensatz mit `count` Messpunkten im Minutenabstand. */
export function heartRateRecord(
  from: number,
  count: number,
  values: (index: number) => number,
): RecordResult<'HeartRate'> {
  return {
    startTime: iso(from),
    endTime: iso(from + count * MINUTE),
    samples: Array.from({ length: count }, (_, index) => ({
      time: iso(from + index * MINUTE),
      beatsPerMinute: values(index),
    })),
  } as RecordResult<'HeartRate'>;
}

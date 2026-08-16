import { addDays, type CivilDate } from '../civilDate';
import type { Annotation } from '../algorithms/annotations';
import { detectIllness } from '../algorithms/illness';
import {
  mainNightsByDate,
  toSleepNight,
  type SleepSessionInput,
  type SleepStageInterval,
} from '../algorithms/sleep';
import { stageMedian } from '../algorithms/sleepAnalysis';
import type { Metric, MetricSeries } from '../metrics';

const START: CivilDate = 20260601;

/** 40 ruhige Tage — genug Historie für eine Baseline in jeder Größe. */
const CALM: Record<Metric, number[]> = {
  hrv: Array.from({ length: 40 }, (_, i) => 78 + (i % 5)),
  rhr: Array.from({ length: 40 }, (_, i) => 54 + (i % 4)),
  sleepScore: Array.from({ length: 40 }, (_, i) => 70 + (i % 5) * 3),
  sleep: Array.from({ length: 40 }, (_, i) => 7 + (i % 3) * 0.4),
  deep: Array.from({ length: 40 }, (_, i) => 60 + (i % 4) * 6),
  resp: Array.from({ length: 40 }, (_, i) => 15 + (i % 3) * 0.2),
  temp: Array.from({ length: 40 }, (_, i) => 33 + (i % 3) * 0.1),
};

/** Setzt einzelne Tage einer Reihe auf abweichende Werte. */
function seriesWith(
  patches: Partial<Record<Metric, Record<number, number>>>,
): MetricSeries {
  return new Map(
    (Object.keys(CALM) as Metric[]).map(metric => {
      const patch = patches[metric] ?? {};
      return [
        metric,
        new Map(
          CALM[metric].map((value, index) => [
            addDays(START, index),
            patch[index] ?? value,
          ]),
        ),
      ];
    }),
  ) as MetricSeries;
}

const LAST = 39;
const REFERENCE = addDays(START, LAST);

/** Ein Infekt an den letzten drei Tagen: HRV runter, Puls/Atmung/Temp rauf. */
const SICK_PATCH = {
  hrv: { 37: 48, 38: 45, 39: 47 },
  rhr: { 37: 66, 38: 68, 39: 67 },
  resp: { 37: 17.4, 38: 17.8, 39: 17.5 },
  temp: { 37: 34.2, 38: 34.4, 39: 34.3 },
};

function annotation(overrides: Partial<Annotation> = {}): Annotation {
  return {
    id: 'annotation-1',
    type: 'sick',
    startTs: Date.parse('2026-07-08T12:00:00Z') / 1000,
    endTs: Date.parse('2026-07-10T12:00:00Z') / 1000,
    tzOffsetSeconds: 0,
    note: null,
    ...overrides,
  };
}

describe('Krankheitserkennung', () => {
  it('meldet nichts, solange die Reihen ruhig sind', () => {
    expect(
      detectIllness({
        series: seriesWith({}),
        referenceDate: REFERENCE,
        annotations: [],
      }),
    ).toEqual([]);
  });

  it('fasst zusammenhängende auffällige Tage zu einem Zeitraum zusammen', () => {
    const found = detectIllness({
      series: seriesWith(SICK_PATCH),
      referenceDate: REFERENCE,
      annotations: [],
    });

    expect(found).toHaveLength(1);
    expect(found[0].from).toBe(addDays(START, 37));
    expect(found[0].to).toBe(REFERENCE);
    expect(found[0].dayCount).toBe(3);
  });

  it('begründet den Fund mit den ausschlagenden Größen, stärkste zuerst', () => {
    const [candidate] = detectIllness({
      series: seriesWith(SICK_PATCH),
      referenceDate: REFERENCE,
      annotations: [],
    });

    const metrics = candidate.markers.map(marker => marker.metric);
    expect(metrics).toContain('hrv');
    expect(metrics).toContain('rhr');
    // Gerichtet: negativ heißt „schlechter als sonst", auch beim Ruhepuls, der
    // dafür steigt.
    expect(candidate.markers.every(marker => marker.z <= -1)).toBe(true);
    expect(candidate.markers[0].z).toBeLessThanOrEqual(
      candidate.markers[candidate.markers.length - 1].z,
    );
  });

  it('lässt eine einzelne ausschlagende Größe unbeachtet', () => {
    // Nur der Ruhepuls, etwa nach einem späten Abend.
    const found = detectIllness({
      series: seriesWith({ rhr: { 38: 70, 39: 71 } }),
      referenceDate: REFERENCE,
      annotations: [],
    });

    expect(found).toEqual([]);
  });

  it('überbrückt einen einzelnen unauffälligen Tag', () => {
    const found = detectIllness({
      series: seriesWith({
        hrv: { 35: 48, 37: 45, 38: 46 },
        rhr: { 35: 67, 37: 68, 38: 67 },
        temp: { 35: 34.3, 37: 34.4, 38: 34.3 },
      }),
      referenceDate: REFERENCE,
      annotations: [],
    });

    expect(found).toHaveLength(1);
    expect(found[0].from).toBe(addDays(START, 35));
    expect(found[0].to).toBe(addDays(START, 38));
  });

  it('meldet nicht, was bereits markiert ist', () => {
    const covering = annotation({
      // 08.07.2026 ist START + 37.
      startTs: Date.parse('2026-07-08T12:00:00Z') / 1000,
      endTs: Date.parse('2026-07-10T12:00:00Z') / 1000,
    });

    expect(
      detectIllness({
        series: seriesWith(SICK_PATCH),
        referenceDate: REFERENCE,
        annotations: [covering],
      }),
    ).toEqual([]);
  });

  it('sieht nicht weiter zurück als das Fenster', () => {
    const found = detectIllness({
      series: seriesWith(SICK_PATCH),
      referenceDate: REFERENCE,
      annotations: [],
      window: 1,
    });

    expect(found).toHaveLength(1);
    expect(found[0].from).toBe(REFERENCE);
    expect(found[0].dayCount).toBe(1);
  });

  it('schweigt, solange keine Größe genug Historie hat', () => {
    const thin = new Map(
      (Object.keys(CALM) as Metric[]).map(metric => [
        metric,
        new Map(
          CALM[metric]
            .slice(0, 5)
            .map((value, index) => [addDays(START, index), value]),
        ),
      ]),
    ) as MetricSeries;

    expect(
      detectIllness({
        series: thin,
        referenceDate: addDays(START, 4),
        annotations: [],
      }),
    ).toEqual([]);
  });
});

describe('Schlaf-Baseline', () => {
  const hours = (value: number) => value * 3600;
  const morning = Date.parse('2026-06-15T05:00:00Z') / 1000;
  const DAY = hours(24);

  const stages = (endTs: number, deepMinutes: number): SleepStageInterval[] => {
    const start = endTs - hours(8);
    return [
      { kind: 'deep', startTs: start, endTs: start + deepMinutes * 60 },
      {
        kind: 'core',
        startTs: start + deepMinutes * 60,
        endTs: start + hours(7),
      },
    ];
  };

  const night = (endTs: number, deepMinutes: number): SleepSessionInput => ({
    startTs: endTs - hours(8),
    endTs,
    tzOffsetSeconds: 0,
    minutesAsleep: 450,
    minutesInSleepPeriod: 480,
    minutesAwake: 30,
    minutesToFallAsleep: 0,
    isMain: true,
    stages: stages(endTs, deepMinutes),
  });

  /**
   * Drei gewohnte Nächte mit 60 min Tiefschlaf, dann vier kranke mit 20.
   *
   * Die kranken müssen in der Überzahl sein, damit sich der Unterschied am
   * Median überhaupt zeigt — bei drei von neun bliebe er bei 60, und der Test
   * bestünde, ohne etwas zu prüfen.
   */
  const nights = mainNightsByDate(
    [
      ...[7, 6, 5].map(back => night(morning - back * DAY, 60)),
      ...[4, 3, 2, 1].map(back => night(morning - back * DAY, 20)),
    ].map(toSleepNight),
  );

  const sickWeek = annotation({
    // 11.–14.06.2026 — die vier Nächte vor dem Stichtag.
    startTs: Date.parse('2026-06-11T12:00:00Z') / 1000,
    endTs: Date.parse('2026-06-14T12:00:00Z') / 1000,
  });

  it('zieht markierte Nächte aus dem Phasenmedian', () => {
    const withSick = stageMedian(nights, 'deep', 20260615, []);
    const withoutSick = stageMedian(nights, 'deep', 20260615, [sickWeek]);

    // Ungefiltert erklären die kranken Nächte 20 min zum Normal.
    expect(withSick).toBe(20);
    // Gefiltert bleiben nur die gewohnten Nächte übrig.
    expect(withoutSick).toBe(60);
  });

  it('lässt eine Verletzung im Phasenmedian stehen', () => {
    const injury = annotation({ ...sickWeek, type: 'injury' });
    expect(stageMedian(nights, 'deep', 20260615, [injury])).toBe(
      stageMedian(nights, 'deep', 20260615, []),
    );
  });
});

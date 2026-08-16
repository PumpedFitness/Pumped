import type { Annotation } from '@/lib/health/algorithms/annotations';
import { summariseIllness } from '@/lib/health/algorithms/illness';
import { addDays, type CivilDate } from '@/lib/health/civilDate';
import {
  METRIC_ORDER,
  type Metric,
  type MetricSeries,
} from '@/lib/health/metrics';
import {
  illnessPeriods,
  illnessYear,
  illnessYears,
} from '../illnessHistoryModel';

/** Mittag UTC, damit `civilDateFromEpoch` bei Offset 0 den Tag selbst liefert. */
function at(date: string): number {
  return Date.parse(`${date}T12:00:00Z`) / 1000;
}

function annotation(overrides: Partial<Annotation> = {}): Annotation {
  return {
    id: 'a1',
    type: 'sick',
    startTs: at('2026-08-14'),
    endTs: at('2026-08-16'),
    tzOffsetSeconds: 0,
    note: null,
    ...overrides,
  };
}

const TODAY: CivilDate = 20260816;

describe('Krankheitsrückblick', () => {
  it('zählt beide Enden mit', () => {
    const [period] = illnessPeriods([annotation()], TODAY);
    expect(period.from).toBe(20260814);
    expect(period.to).toBe(20260816);
    expect(period.dayCount).toBe(3);
    expect(period.isOpen).toBe(false);
  });

  it('beschneidet einen offenen Zeitraum auf heute', () => {
    const open = annotation({ startTs: at('2026-08-14'), endTs: null });
    const [period] = illnessPeriods([open], TODAY);

    // Nicht bis zum 14-Tage-Deckel: Der 28.08. hat noch nicht stattgefunden.
    expect(period.to).toBe(TODAY);
    expect(period.dayCount).toBe(3);
    expect(period.isOpen).toBe(true);
  });

  it('beschneidet einen vergessenen offenen Zeitraum auf den Deckel', () => {
    const forgotten = annotation({ startTs: at('2026-06-01'), endTs: null });
    const [period] = illnessPeriods([forgotten], TODAY);

    // Der Deckel liegt vor heute — mehr Tage zu zeigen behauptete eine Wirkung
    // auf die Baseline, die die Auswertung nicht hat.
    expect(period.to).toBe(20260615);
    expect(period.dayCount).toBe(15);
  });

  it('reiht die Zeiträume mit dem jüngsten zuerst', () => {
    const older = annotation({
      id: 'older',
      startTs: at('2026-03-02'),
      endTs: at('2026-03-04'),
    });
    const periods = illnessPeriods([older, annotation()], TODAY);
    expect(periods.map(period => period.annotation.id)).toEqual([
      'a1',
      'older',
    ]);
  });

  it('summiert Tage je Monat und zählt die Zeiträume', () => {
    const march = annotation({
      id: 'march',
      startTs: at('2026-03-02'),
      endTs: at('2026-03-04'),
    });
    const periods = illnessPeriods([march, annotation()], TODAY);
    const year = illnessYear(periods, 2026);

    expect(year.count).toBe(2);
    expect(year.totalDays).toBe(6);
    expect(year.months[2].days).toBe(3); // März
    expect(year.months[7].days).toBe(3); // August
    expect(year.months[0].days).toBe(0);
  });

  it('teilt einen Zeitraum über den Jahreswechsel auf beide Jahre', () => {
    const turn = annotation({
      id: 'turn',
      startTs: at('2025-12-30'),
      endTs: at('2026-01-02'),
    });
    const periods = illnessPeriods([turn], TODAY);

    const y2025 = illnessYear(periods, 2025);
    const y2026 = illnessYear(periods, 2026);

    // Beide Jahre kennen den Zeitraum, jedes zählt nur seine eigenen Tage.
    expect(y2025.count).toBe(1);
    expect(y2025.totalDays).toBe(2);
    expect(y2026.count).toBe(1);
    expect(y2026.totalDays).toBe(2);
  });

  it('bietet das laufende Jahr auch ohne Einträge an', () => {
    expect(illnessYears([], TODAY)).toEqual([2026]);
  });

  it('listet die Jahre mit Einträgen, jüngstes zuerst', () => {
    const old = annotation({
      id: 'old',
      startTs: at('2024-02-01'),
      endTs: at('2024-02-03'),
    });
    const periods = illnessPeriods([old, annotation()], TODAY);
    expect(illnessYears(periods, TODAY)).toEqual([2026, 2024]);
  });
});

describe('Krankheitsbilanz', () => {
  const START: CivilDate = 20260601;

  const CALM: Record<Metric, number[]> = {
    hrv: Array.from({ length: 40 }, (_, i) => 78 + (i % 5)),
    rhr: Array.from({ length: 40 }, (_, i) => 54 + (i % 4)),
    sleepScore: Array.from({ length: 40 }, () => 70),
    sleep: Array.from({ length: 40 }, () => 7),
    deep: Array.from({ length: 40 }, () => 60),
    resp: Array.from({ length: 40 }, (_, i) => 15 + (i % 3) * 0.2),
    temp: Array.from({ length: 40 }, (_, i) => 33 + (i % 3) * 0.1),
  };

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

  it('mittelt Rohwert und Abweichung über die Tage mit Messung', () => {
    const rows = summariseIllness({
      series: seriesWith({ rhr: { 37: 66, 38: 68 } }),
      from: addDays(START, 37),
      to: addDays(START, 38),
      annotations: [],
      referenceDate: addDays(START, 39),
    });

    const rhr = rows.find(row => row.metric === 'rhr');
    expect(rhr?.days).toBe(2);
    expect(rhr?.average).toBe(67);
    // Ruhepuls hoch heißt gerichtet negativ — „schlechter als sonst".
    expect(rhr?.z).toBeLessThan(-1.5);
  });

  it('gibt Kreislauf und Schlaf zurück, auch die unauffälligen Größen', () => {
    const rows = summariseIllness({
      series: seriesWith({ rhr: { 37: 66, 38: 68 } }),
      from: addDays(START, 37),
      to: addDays(START, 38),
      annotations: [],
      referenceDate: addDays(START, 39),
    });

    // Alle geführten Größen, nicht nur die vier der Erkennung.
    expect(rows.map(row => row.metric)).toEqual(METRIC_ORDER);
    const resp = rows.find(row => row.metric === 'resp');
    expect(resp?.z).not.toBeNull();
    expect(Math.abs(resp?.z ?? 0)).toBeLessThan(1.5);
  });

  it('nennt die Mitte der Baseline in der Einheit der Größe', () => {
    const rows = summariseIllness({
      series: seriesWith({}),
      from: addDays(START, 37),
      to: addDays(START, 38),
      annotations: [],
      referenceDate: addDays(START, 39),
    });

    // Die HRV wird logarithmiert gerechnet; zurückgerechnet muss dort wieder
    // eine Millisekundenzahl stehen, nicht ln(80).
    const hrv = rows.find(row => row.metric === 'hrv');
    expect(hrv?.baseline).toBeGreaterThan(75);
    expect(hrv?.baseline).toBeLessThan(85);

    const rhr = rows.find(row => row.metric === 'rhr');
    expect(rhr?.baseline).toBeGreaterThan(53);
    expect(rhr?.baseline).toBeLessThan(58);
  });

  it('trennt fehlende Messung von fehlender Historie', () => {
    const thin = new Map(
      (Object.keys(CALM) as Metric[]).map(metric => [
        metric,
        new Map([[20260601, CALM[metric][0]]]),
      ]),
    ) as MetricSeries;

    const rows = summariseIllness({
      series: thin,
      from: 20260601,
      to: 20260601,
      annotations: [],
      referenceDate: 20260602,
    });

    // Gemessen wurde, verglichen werden kann nicht.
    expect(rows.every(row => row.average !== null)).toBe(true);
    expect(rows.every(row => row.z === null)).toBe(true);
    expect(rows.every(row => row.baseline === null)).toBe(true);
    // Und die Anzeige kann sagen, wie weit die Historie reicht.
    expect(rows.every(row => row.sampleCount === 1)).toBe(true);
  });

  it('meldet nicht aufgezeichnete Tage als solche', () => {
    // Der Zeitraum liegt hinter dem Ende der Reihen — nachgetragen, ohne dass
    // die Uhr getragen wurde.
    const rows = summariseIllness({
      series: seriesWith({}),
      from: addDays(START, 45),
      to: addDays(START, 47),
      annotations: [],
      referenceDate: addDays(START, 39),
    });

    expect(rows.every(row => row.average === null)).toBe(true);
    expect(rows.every(row => row.days === 0)).toBe(true);
    // Die Baseline steht trotzdem — nur eben ohne etwas zu vergleichen.
    expect(rows.find(row => row.metric === 'hrv')?.baseline).not.toBeNull();
  });
});

import { analyseSleep } from '../algorithms/sleepAnalysis';
import {
  hypnogram,
  mainNightsByDate,
  stageMinutes,
  toSleepNight,
  type SleepSessionInput,
} from '../algorithms/sleep';
import { debtNights, sleepDebtHours } from '../algorithms/sleepDebt';
import type { MetricSeries } from '../metrics';
import { buildMetricSeries, resolveReferenceDate } from '../stats/series';

describe('Schlaf', () => {
  const hours = (value: number) => value * 3600;
  const night = (
    overrides: Partial<SleepSessionInput> & { endTs: number },
  ): SleepSessionInput => ({
    startTs: overrides.endTs - hours(8),
    tzOffsetSeconds: 0,
    minutesAsleep: 480,
    minutesInSleepPeriod: 489,
    minutesAwake: 7,
    minutesToFallAsleep: 0,
    isMain: true,
    stages: [],
    ...overrides,
  });

  const morning = Date.parse('2026-06-15T05:00:00Z') / 1000;

  it('verwirft Nickerchen, auch wenn sie als Hauptschlaf markiert sind', () => {
    const nap = toSleepNight(
      night({ endTs: morning, minutesAsleep: 64, isMain: true }),
    );
    expect(mainNightsByDate([nap]).size).toBe(0);
  });

  it('wählt bei zwei Sessions am selben Tag die längere', () => {
    const short = toSleepNight(
      night({ endTs: morning - hours(6), minutesAsleep: 200, isMain: null }),
    );
    const long = toSleepNight(night({ endTs: morning, minutesAsleep: 312 }));

    const chosen = mainNightsByDate([short, long]).get(20260615);
    // Nicht der lexikografische Vergleich "200" > "312".
    expect(chosen?.minutesAsleep).toBe(312);
  });

  it('erfindet keine Effizienz von 100 Prozent', () => {
    const unknown = toSleepNight(
      night({ endTs: morning, minutesInSleepPeriod: null }),
    );
    expect(unknown.efficiency).toBeNull();

    const known = toSleepNight(night({ endTs: morning }));
    expect(known.efficiency).toBeCloseTo(480 / 489, 10);
  });

  it('zählt Phasen ohne positive Dauer nicht ab', () => {
    const broken = toSleepNight(
      night({
        endTs: morning,
        stages: [
          { kind: 'deep', startTs: morning - 3600, endTs: morning - 1800 },
          { kind: 'deep', startTs: morning, endTs: morning - 600 },
        ],
      }),
    );
    expect(stageMinutes(broken, 'deep')).toBe(30);
  });

  it('addiert im Hypnogramm getrennte Blöcke derselben Phase', () => {
    const start = morning - hours(1);
    const subject = toSleepNight(
      night({
        startTs: start,
        endTs: morning,
        stages: [
          { kind: 'deep', startTs: start, endTs: start + 900 },
          { kind: 'core', startTs: start + 900, endTs: start + 1900 },
          { kind: 'deep', startTs: start + 1900, endTs: start + 3600 },
        ],
      }),
    );
    // Eine Säule: Tiefschlaf 15 min + 28 min schlägt Kernschlaf mit 17 min.
    expect(hypnogram(subject, 1)).toEqual(['deep']);
  });

  it('übergeht Nächte ohne Phasendetail beim Median', () => {
    const nights = new Map(
      Array.from({ length: 7 }, (_, index) => {
        const endTs = morning - hours(24 * index);
        const withStages = index % 2 === 0;
        return [
          20260615 - index,
          toSleepNight(
            night({
              endTs,
              stages: withStages
                ? [{ kind: 'deep', startTs: endTs - 3600, endTs }]
                : [{ kind: 'awake', startTs: endTs - 600, endTs }],
            }),
          ),
        ] as const;
      }),
    );

    // Drei Nächte mit Detail, jede 60 Minuten Tiefschlaf — die beiden
    // CLASSIC-Nächte dürfen den Median nicht auf 0 ziehen.
    const analysis = analyseSleep(nights, 20260615, []);
    const deep = analysis.stageRows.find(row => row.stage === 'deep');
    expect(deep?.medianMinutes).toBe(60);
  });

  it('meldet keine Referenz statt einer leeren Leiste', () => {
    const only = new Map([[20260615, toSleepNight(night({ endTs: morning }))]]);
    const analysis = analyseSleep(only, 20260615, []);
    expect(analysis.stageRows.every(row => row.proportion === null)).toBe(true);
    expect(analysis.stageRows.every(row => row.range === null)).toBe(true);
  });

  it('gibt auch den unbenoteten Phasen eine Spanne', () => {
    // Kernschlaf und Wachzeit stehen in keinem Term der Nachtnote. Ohne Spanne
    // stünde dort eine nackte Minutenzahl ohne jede Referenz.
    const core = (endTs: number, minutes: number) =>
      toSleepNight(
        night({
          endTs,
          stages: [{ kind: 'core', startTs: endTs - minutes * 60, endTs }],
        }),
      );
    const nights = new Map([
      [20260612, core(morning - 3 * 86400, 300)],
      [20260613, core(morning - 2 * 86400, 320)],
      [20260614, core(morning - 86400, 340)],
      [20260615, core(morning, 500)],
    ]);

    const row = analyseSleep(nights, 20260615, []).stageRows.find(
      entry => entry.stage === 'core',
    );
    expect(row?.range).not.toBeNull();
    // 500 Minuten liegen weit über der Spanne der drei Vornächte.
    expect(row?.status).toBe('above');
    // Die Skala reicht bis über den Messwert, sonst klebte der Punkt am Rand.
    expect(row?.range?.scaleMax).toBeGreaterThan(500);
  });
});

describe('Schlafdefizit', () => {
  it('fenstert sieben Kalendertage, nicht sieben Einträge', () => {
    const sleep = new Map([
      [20260601, 5],
      [20260602, 5],
      [20260610, 6.6],
    ]);
    const nights = debtNights(sleep, 20260610);

    expect(nights).toHaveLength(7);
    expect(nights.filter(entry => entry.isRecorded)).toHaveLength(1);
    expect(sleepDebtHours(sleep, 20260610)).toBeCloseTo(1, 10);
  });

  it('lässt Tage ohne Aufzeichnung nichts beitragen', () => {
    const gap = debtNights(new Map(), 20260610);
    expect(gap.every(entry => entry.shortfallHours === 0)).toBe(true);
    expect(gap.every(entry => !entry.isRecorded)).toBe(true);
  });
});

describe('Reihen', () => {
  it('verwirft nicht-positive Werte und lässt Tiefschlaf gewinnen', () => {
    const { series } = buildMetricSeries(
      {
        hrvAverage: [
          { date: 20260601, value: 100 },
          { date: 20260602, value: 96 },
        ],
        // 0 bedeutet „nicht berechnet", nicht „null Millisekunden".
        hrvDeepSleep: [
          { date: 20260601, value: 0 },
          { date: 20260602, value: 80 },
        ],
        restingHeartRate: [],
        respiratoryRate: [],
        skinTemperature: [],
        sleepSessions: [],
      },
      [],
    );

    expect(series.get('hrv')?.get(20260601)).toBe(100);
    expect(series.get('hrv')?.get(20260602)).toBe(80);
  });

  it('setzt den Stichtag auf den jüngsten Anker, gedeckelt auf heute', () => {
    const series = new Map([
      ['hrv', new Map([[20260808, 80]])],
      ['temp', new Map([[20260810, 33.2]])],
    ]) as MetricSeries;

    const resolved = resolveReferenceDate(
      series,
      new Date('2026-08-10T09:00:00'),
    );
    // Der reine Temperaturtag wird nicht zum Stichtag.
    expect(resolved.date).toBe(20260808);
    expect(resolved.daysStale).toBe(2);
  });

  it('schiebt den Stichtag nicht in die Zukunft', () => {
    const series = new Map([
      ['hrv', new Map([[20270101, 80]])],
    ]) as MetricSeries;
    const resolved = resolveReferenceDate(
      series,
      new Date('2026-08-10T09:00:00'),
    );
    expect(resolved.date).toBe(20260810);
    expect(resolved.daysStale).toBe(0);
  });
});

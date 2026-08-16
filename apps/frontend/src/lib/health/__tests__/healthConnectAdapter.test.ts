import type { RecordResult } from 'react-native-health-connect';

import { toSleepNight } from '../algorithms/sleep';
import {
  HOUR,
  NIGHT_END,
  NIGHT_START,
  OFFSET,
  Stage,
  heartRateRecord,
  iso,
  sleepRecord,
} from '../__fixtures__/healthConnectSleep';
import { FieldId, MetricId } from '../ids';
import {
  ingestHeartRate,
  ingestHeartRateVariability,
  ingestRespiratoryRate,
  ingestSkinTemperature,
  ingestSleep,
} from '../sources/healthConnect/ingest';
import { normalizeHealthConnectSleep } from '../sources/healthConnect/normalizeSleep';

describe('normalizeHealthConnectSleep', () => {
  it('übersetzt die Phasenkennungen der Plattform', () => {
    const night = normalizeHealthConnectSleep(sleepRecord(), OFFSET);

    expect(night?.stages.map(stage => stage.kind)).toEqual([
      'core',
      'deep',
      'rem',
      'awake',
    ]);
  });

  /**
   * `SLEEPING` ist undifferenzierter Schlaf, genau wie Googles `ASLEEP`. Als
   * `core` durchgereicht wäre es Leichtschlaf, den niemand gemessen hat.
   */
  it('verwirft SLEEPING und lässt die Nacht ohne Phasendetail', () => {
    const night = normalizeHealthConnectSleep(
      sleepRecord({
        stages: [
          {
            stage: Stage.sleeping,
            startTime: iso(NIGHT_START),
            endTime: iso(NIGHT_END),
          },
        ],
      }),
      OFFSET,
    );

    expect(night?.stages).toEqual([]);
    expect(night && toSleepNight(night).hasStageDetail).toBe(false);
  });

  /**
   * `OUT_OF_BED` ist keine Schlafphase. Als Wachzeit gezählt verlängerte es die
   * Zeit im Bett um Zeit, in der der Nutzer gar nicht im Bett war.
   */
  it('zählt OUT_OF_BED nicht als Wachphase', () => {
    const night = normalizeHealthConnectSleep(
      sleepRecord({
        stages: [
          {
            stage: Stage.deep,
            startTime: iso(NIGHT_START),
            endTime: iso(NIGHT_START + 6 * HOUR),
          },
          {
            stage: Stage.outOfBed,
            startTime: iso(NIGHT_START + 6 * HOUR),
            endTime: iso(NIGHT_END),
          },
        ],
      }),
      OFFSET,
    );

    expect(night?.stages.map(stage => stage.kind)).toEqual(['deep']);
    expect(night?.minutesAwake).toBe(0);
  });

  it('rechnet die Schlafdauer aus den Nicht-Wach-Phasen', () => {
    const night = normalizeHealthConnectSleep(sleepRecord(), OFFSET);

    // Sieben Stunden ohne die Wachstunde.
    expect(night?.minutesAsleep).toBe(420);
    expect(night?.minutesInSleepPeriod).toBe(480);
    expect(night && toSleepNight(night).efficiency).toBeCloseTo(420 / 480, 10);
  });

  /**
   * Ohne Phasen sind Schlafdauer und Zeit im Bett dieselbe Zahl. Sie beide zu
   * melden ergäbe eine Effizienz von exakt 100 % — genau die erfundene Zahl, die
   * §8.3 in `DECISIONS.md` ausschließt.
   */
  it('erfindet ohne Phasen keine Effizienz von 100 %', () => {
    const night = normalizeHealthConnectSleep(
      sleepRecord({ stages: undefined }),
      OFFSET,
    );

    expect(night?.minutesAsleep).toBe(480);
    expect(night?.minutesInSleepPeriod).toBeNull();
    expect(night && toSleepNight(night).efficiency).toBeNull();
  });

  it('behauptet nichts, was Health Connect nicht liefert', () => {
    const night = normalizeHealthConnectSleep(sleepRecord(), OFFSET);

    expect(night?.minutesToFallAsleep).toBeNull();
    expect(night?.isMain).toBeNull();
  });

  it('verwirft eine Nacht ohne brauchbare Spanne', () => {
    expect(
      normalizeHealthConnectSleep(
        sleepRecord({ endTime: iso(NIGHT_START) }),
        OFFSET,
      ),
    ).toBeNull();
    expect(
      normalizeHealthConnectSleep(
        sleepRecord({ startTime: 'nonsense' }),
        OFFSET,
      ),
    ).toBeNull();
  });
});

describe('ingest', () => {
  it('datiert die Nacht über den mitgegebenen Offset', () => {
    const batch = ingestSleep([sleepRecord()], OFFSET);

    expect(batch.sessions).toHaveLength(1);
    expect(batch.sessions[0].metric).toBe(MetricId.sleep);
    expect(batch.sessions[0].tzOffsetSeconds).toBe(OFFSET);
    expect(batch.sessions[0].sleep?.minutesAsleep).toBe(420);
  });

  it('flacht die Messpunkte eines Herzfrequenz-Datensatzes auf', () => {
    // Der Messwert steckt in `samples`, nicht im Datensatz.
    const batch = ingestHeartRate(
      [heartRateRecord(NIGHT_START, 3, index => 60 + index)],
      OFFSET,
    );

    expect(batch.samples).toHaveLength(3);
    expect(batch.samples.map(sample => sample.value)).toEqual([60, 61, 62]);
    expect(batch.samples[0]).toMatchObject({
      metric: MetricId.heartRate,
      field: FieldId.value,
      tzOffsetSeconds: OFFSET,
    });
  });

  it('mittelt HRV-Messpunkte je Zivildatum', () => {
    const batch = ingestHeartRateVariability(
      [
        {
          time: iso(NIGHT_END - 2 * HOUR),
          zoneOffset: { id: '+02:00', totalSeconds: OFFSET },
          heartRateVariabilityMillis: 40,
        },
        {
          time: iso(NIGHT_END - HOUR),
          zoneOffset: { id: '+02:00', totalSeconds: OFFSET },
          heartRateVariabilityMillis: 50,
        },
      ] as RecordResult<'HeartRateVariabilityRmssd'>[],
      0,
    );

    expect(batch.daily).toEqual([
      {
        metric: MetricId.dailyHeartRateVariability,
        date: 20260615,
        // Nicht `hrvDeepSleep`: Health Connect sagt nicht, in welcher Phase
        // gemessen wurde.
        field: FieldId.hrvAverage,
        value: 45,
      },
    ]);
  });

  it('bevorzugt den Offset des Datensatzes vor dem des Geräts', () => {
    // 23:30 UTC ist in UTC+2 schon der Folgetag — wer den Gerätefallback nähme,
    // datierte die Messung einen Tag zu früh.
    const batch = ingestRespiratoryRate(
      [
        {
          time: '2026-06-14T23:30:00.000Z',
          zoneOffset: { id: '+02:00', totalSeconds: OFFSET },
          rate: 14,
        },
      ] as RecordResult<'RespiratoryRate'>[],
      0,
    );

    expect(batch.daily[0]).toMatchObject({
      metric: MetricId.dailyRespiratoryRate,
      date: 20260615,
      value: 14,
    });
  });

  it('verwirft nicht-positive Messwerte', () => {
    const batch = ingestRespiratoryRate(
      [
        { time: iso(NIGHT_END), rate: 0 },
        { time: iso(NIGHT_END), rate: -1 },
      ] as RecordResult<'RespiratoryRate'>[],
      OFFSET,
    );

    expect(batch.daily).toEqual([]);
  });
});

describe('Hauttemperatur', () => {
  function skinTemperature(
    baseline: number | undefined,
    deltas: readonly number[],
  ): RecordResult<'SkinTemperature'> {
    return {
      startTime: iso(NIGHT_START),
      endTime: iso(NIGHT_END),
      endZoneOffset: { id: '+02:00', totalSeconds: OFFSET },
      baseline:
        baseline === undefined
          ? undefined
          : { inCelsius: baseline, inFahrenheit: baseline * 1.8 + 32 },
      deltas: deltas.map(value => ({
        time: iso(NIGHT_START),
        delta: { inCelsius: value, inFahrenheit: value * 1.8 },
      })),
    } as RecordResult<'SkinTemperature'>;
  }

  /**
   * Der Kern: Health Connect legt Abweichungen ab, die Auswertung erwartet einen
   * Absolutwert in °C (§1 in `DECISIONS.md`). Deltas direkt geschrieben würde
   * der Positiv-Filter die kalte Hälfte aller Nächte verwerfen.
   */
  it('rechnet Abweichung plus Baseline zu einer absoluten Temperatur', () => {
    const batch = ingestSkinTemperature([skinTemperature(33, [0.4, 0.6])]);

    expect(batch.daily).toEqual([
      {
        metric: MetricId.dailySleepTemperatureDerivations,
        date: 20260615,
        field: FieldId.tempNightly,
        value: 33.5,
      },
    ]);
  });

  it('trägt auch eine negative Abweichung, statt sie zu verlieren', () => {
    const batch = ingestSkinTemperature([skinTemperature(33, [-0.5])]);

    expect(batch.daily[0].value).toBeCloseTo(32.5, 10);
  });

  it('überspringt eine Nacht ohne Baseline, statt sie zu erfinden', () => {
    const batch = ingestSkinTemperature([skinTemperature(undefined, [0.4])]);

    expect(batch.daily).toEqual([]);
  });
});

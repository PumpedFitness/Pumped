import { FieldId, MetricId } from '../ids';
import { buildFilter } from '../sources/google/client';
import { specFor } from '../sources/google/catalog';
import {
  googleHealthConfig,
  redirectUri,
  reversedClientIdScheme,
  validateRedirectScheme,
} from '../sources/google/config';
import { ingestPoints } from '../sources/google/ingest';
import { asNumber, civilDate, offsetSeconds } from '../sources/google/json';
import { normalizeSleepSession } from '../sources/google/normalizeSleep';
import { mainNightsByDate, toSleepNight } from '../algorithms/sleep';

/** Wie eine echte Nacht aus dem Konto aussieht: Zahlen als Strings. */
const REAL_SLEEP_PAYLOAD = {
  createTime: '2026-08-06T14:42:51.767967Z',
  interval: {
    startTime: '2026-06-14T21:06:02.907853Z',
    startUtcOffset: '7200s',
    endTime: '2026-06-15T05:15:13.952001Z',
    endUtcOffset: '7200s',
  },
  type: 'STAGES',
  metadata: { externalId: '987299336180578656', mainSleep: true },
  summary: {
    minutesAsleep: '482',
    minutesInSleepPeriod: '489',
    minutesAwake: '7',
    minutesToFallAsleep: '0',
  },
  stages: [
    {
      type: 'LIGHT',
      startTime: '2026-06-14T21:06:02Z',
      endTime: '2026-06-14T21:39:14Z',
    },
    {
      type: 'DEEP',
      startTime: '2026-06-14T21:39:14Z',
      endTime: '2026-06-14T22:09:14Z',
    },
  ],
};

/** Eine CLASSIC-Nacht kennt nur ASLEEP und AWAKE. */
const CLASSIC_SLEEP_PAYLOAD = {
  interval: {
    startTime: '2026-07-24T12:00:00Z',
    startUtcOffset: '7200s',
    endTime: '2026-07-24T16:00:00Z',
    endUtcOffset: '7200s',
  },
  type: 'CLASSIC',
  metadata: {},
  summary: { minutesAsleep: '240' },
  stages: [
    {
      type: 'ASLEEP',
      startTime: '2026-07-24T12:00:00Z',
      endTime: '2026-07-24T15:50:00Z',
    },
    {
      type: 'AWAKE',
      startTime: '2026-07-24T15:50:00Z',
      endTime: '2026-07-24T16:00:00Z',
    },
  ],
};

describe('JSON-Lesehilfen', () => {
  it('macht aus protobuf-Strings Zahlen', () => {
    expect(asNumber('482')).toBe(482);
    expect(asNumber(482)).toBe(482);
    expect(asNumber('33.27')).toBeCloseTo(33.27, 10);
  });

  it('verwirft "NaN" und alles andere Nicht-Endliche', () => {
    // Ohne diese Prüfung wanderte ein NaN in die Datenbank und vergiftete
    // jede Statistik, die es anfasst.
    expect(asNumber('NaN')).toBeNull();
    expect(asNumber(Number.NaN)).toBeNull();
    expect(asNumber(Number.POSITIVE_INFINITY)).toBeNull();
    expect(asNumber('')).toBeNull();
    expect(asNumber('  ')).toBeNull();
    expect(asNumber(null)).toBeNull();
    expect(asNumber(undefined)).toBeNull();
  });

  it('liest Offsets und Zivildaten', () => {
    expect(offsetSeconds('7200s')).toBe(7200);
    expect(offsetSeconds('-28800s')).toBe(-28800);
    expect(offsetSeconds('7200')).toBe(0);
    expect(civilDate({ year: 2026, month: 8, day: 9 })).toBe(20260809);
    expect(civilDate({ year: '2026', month: '8', day: '9' })).toBe(20260809);
  });
});

describe('Schlaf normalisieren', () => {
  it('übersetzt Strings in Zahlen, bevor irgendwer damit vergleicht', () => {
    const session = normalizeSleepSession(REAL_SLEEP_PAYLOAD);

    expect(session?.minutesAsleep).toBe(482);
    expect(session?.minutesInSleepPeriod).toBe(489);
    expect(typeof session?.minutesAsleep).toBe('number');
    expect(session?.isMain).toBe(true);
    expect(session?.tzOffsetSeconds).toBe(7200);
  });

  it('bildet LIGHT auf core ab und lässt ASLEEP weg', () => {
    const stages = normalizeSleepSession(REAL_SLEEP_PAYLOAD)?.stages ?? [];
    expect(stages.map(stage => stage.kind)).toEqual(['core', 'deep']);

    const classic = normalizeSleepSession(CLASSIC_SLEEP_PAYLOAD);
    // ASLEEP als core auszugeben behauptete Leichtschlaf, den niemand maß.
    expect(classic?.stages.map(stage => stage.kind)).toEqual(['awake']);
    expect(toSleepNight(classic!).hasStageDetail).toBe(false);
    expect(
      toSleepNight(normalizeSleepSession(REAL_SLEEP_PAYLOAD)!).hasStageDetail,
    ).toBe(true);
  });

  it('erfindet keine Zeit im Bett und kein mainSleep', () => {
    const classic = normalizeSleepSession(CLASSIC_SLEEP_PAYLOAD);
    expect(classic?.minutesInSleepPeriod).toBeNull();
    expect(classic?.isMain).toBeNull();
    expect(toSleepNight(classic!).efficiency).toBeNull();
  });

  it('datiert die Nacht auf den Morgen in der Zone der Messung', () => {
    const night = toSleepNight(normalizeSleepSession(REAL_SLEEP_PAYLOAD)!);
    // Ende 05:15 UTC bei +2 h ist der Morgen des 15.
    expect(night.date).toBe(20260615);
    expect(night.hoursAsleep).toBeCloseTo(482 / 60, 10);
  });

  it('verwirft eine Session ohne Schlafdauer, statt den Batch zu kippen', () => {
    expect(
      normalizeSleepSession({ ...REAL_SLEEP_PAYLOAD, summary: {} }),
    ).toBeNull();
    expect(normalizeSleepSession({ interval: {} })).toBeNull();
  });

  it('lässt den String-Vergleich nicht die kürzere Nacht gewinnen', () => {
    // "482" < "89" lexikografisch — nach der Koersion gewinnt die echte Nacht.
    const long = toSleepNight(normalizeSleepSession(REAL_SLEEP_PAYLOAD)!);
    const nap = toSleepNight(
      normalizeSleepSession({
        ...REAL_SLEEP_PAYLOAD,
        summary: { ...REAL_SLEEP_PAYLOAD.summary, minutesAsleep: '89' },
        metadata: { mainSleep: true },
      })!,
    );

    const chosen = mainNightsByDate([nap, long]).get(20260615);
    expect(chosen?.minutesAsleep).toBe(482);
  });
});

describe('Ingest', () => {
  it('verwirft NaN-Temperaturen und behält den Nachtwert', () => {
    const spec = specFor(MetricId.dailySleepTemperatureDerivations)!;
    const batch = ingestPoints(spec, [
      {
        dailySleepTemperatureDerivations: {
          date: { year: 2026, month: 8, day: 10 },
          nightlyTemperatureCelsius: 33.27,
          baselineTemperatureCelsius: 'NaN',
          relativeNightlyStddev30dCelsius: 'NaN',
        },
      },
    ]);

    expect(batch.daily).toEqual([
      {
        metric: MetricId.dailySleepTemperatureDerivations,
        date: 20260810,
        field: FieldId.tempNightly,
        value: 33.27,
      },
    ]);
  });

  it('trennt Tiefschlaf-RMSSD und Nachtmittel in eigene Felder', () => {
    const spec = specFor(MetricId.dailyHeartRateVariability)!;
    const batch = ingestPoints(spec, [
      {
        dailyHeartRateVariability: {
          date: { year: 2026, month: 8, day: 10 },
          averageHeartRateVariabilityMilliseconds: 96.8,
          // Für ältere Nächte trägt die API hier eine 0 ein.
          deepSleepRootMeanSquareOfSuccessiveDifferencesMilliseconds: 0,
        },
      },
    ]);

    // Die 0 kommt durch — sie zu verwerfen ist Sache der Auswertung, nicht des
    // Transports. Die Rohschicht bildet ab, was die Quelle gesagt hat.
    expect(batch.daily).toHaveLength(2);
    expect(batch.daily.map(row => row.field)).toEqual([
      FieldId.hrvAverage,
      FieldId.hrvDeepSleep,
    ]);
  });

  it('normalisiert Schlafsessions und hebt die Rohantwort auf', () => {
    const spec = specFor(MetricId.sleep)!;
    const batch = ingestPoints(spec, [{ sleep: REAL_SLEEP_PAYLOAD }]);

    expect(batch.sessions).toHaveLength(1);
    expect(batch.sessions[0].sleep?.minutesAsleep).toBe(482);
    expect(batch.sessions[0].sourcePayload).toContain('minutesAsleep');
    expect(batch.newest?.toISOString()).toBe('2026-06-15T05:15:13.000Z');
  });

  it('nimmt die Feldkennung für Zonenminuten aus dem Zonenwert', () => {
    const spec = specFor(MetricId.activeZoneMinutes)!;
    const batch = ingestPoints(spec, [
      {
        activeZoneMinutes: {
          interval: {
            startTime: '2026-08-10T10:00:00Z',
            startUtcOffset: '7200s',
          },
          activeZoneMinutes: 12,
          heartRateZone: 'CARDIO',
        },
      },
    ]);
    expect(batch.samples[0].field).toBe(FieldId.azmCardio);
  });

  it('überspringt Punkte ohne brauchbaren Zeitstempel', () => {
    const spec = specFor(MetricId.dailyRestingHeartRate)!;
    const batch = ingestPoints(spec, [
      { dailyRestingHeartRate: { beatsPerMinute: 57 } },
      {},
    ]);
    expect(batch.daily).toHaveLength(0);
  });
});

describe('Filter und Konfiguration', () => {
  it('nutzt Zivildaten für tägliche und RFC 3339 für Session-Typen', () => {
    const daily = buildFilter(specFor(MetricId.dailyRestingHeartRate)!, {
      from: new Date('2026-08-01T12:34:56Z'),
      to: null,
    });
    expect(daily).toBe('daily_resting_heart_rate.date >= "2026-08-01"');

    const sleep = buildFilter(specFor(MetricId.sleep)!, {
      from: new Date('2026-08-01T12:34:56Z'),
      to: new Date('2026-08-10T00:00:00Z'),
    });
    expect(sleep).toBe(
      'sleep.interval.end_time >= "2026-08-01T12:34:56Z" AND ' +
        'sleep.interval.end_time < "2026-08-10T00:00:00Z"',
    );

    expect(
      buildFilter(specFor(MetricId.sleep)!, { from: null, to: null }),
    ).toBeNull();
  });

  it('leitet das iOS-Schema aus der Client-ID ab', () => {
    const clientId = '822349081975-abc.apps.googleusercontent.com';
    expect(reversedClientIdScheme(clientId)).toBe(
      'com.googleusercontent.apps.822349081975-abc',
    );
  });

  it('meldet ein nicht registriertes Schema im Klartext', () => {
    const config = googleHealthConfig({
      clientId: '822349081975-abc.apps.googleusercontent.com',
      redirectScheme: 'com.googleusercontent.apps.822349081975-abc',
    });

    expect(redirectUri(config)).toBe(
      'com.googleusercontent.apps.822349081975-abc:/oauth2redirect',
    );
    expect(validateRedirectScheme(config, [config.redirectScheme])).toBeNull();
    // Android nutzt den Paketnamen — das iOS-Schema dort zu erwarten wäre der
    // Fehler, der sonst erst beim Rücksprung auffällt.
    expect(validateRedirectScheme(config, ['com.pumpedapp'])).toContain(
      'URL-Schema nicht registriert',
    );
  });
});

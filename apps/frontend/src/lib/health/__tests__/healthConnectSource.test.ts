import type {
  Permission,
  ReadRecordsResult,
  RecordResult,
  RecordType,
} from 'react-native-health-connect';

import {
  MINUTE,
  NIGHT_END,
  NIGHT_START,
  OFFSET,
  heartRateRecord,
  iso,
  sleepRecord,
} from '../__fixtures__/healthConnectSleep';
import { ESSENTIAL_METRIC_IDS, FieldId, MetricId } from '../ids';
import { AuthError } from '../sources/errors';
import { HEALTH_CONNECT_METRICS } from '../sources/healthConnect/catalog';
import { createHealthConnectSource } from '../sources/healthConnect/healthConnectSource';
import {
  RESTING_HR_MIN_SAMPLES,
  deriveRestingHeartRate,
  restingHeartRateFromRecords,
} from '../sources/healthConnect/restingHeartRate';
import { normalizeHealthConnectSleep } from '../sources/healthConnect/normalizeSleep';
import type { RawBatch } from '../sources/types';

const SDK_AVAILABLE = 3;

type Pages = Partial<Record<RecordType, unknown[][]>>;

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getString: (key: string) => values.get(key) ?? null,
    setString: (key: string, value: string) => void values.set(key, value),
  };
}

/**
 * Ein Client, der vorbereitete Seiten ausliefert und mitschreibt, was gelesen
 * wurde. `pages[recordType]` ist die Liste der Seiten für diesen Satztyp.
 */
function fakeClient(options: {
  pages?: Pages;
  granted?: RecordType[];
  sdkStatus?: number;
  requestResult?: RecordType[];
  reads?: RecordType[];
}) {
  const granted = options.granted ?? [
    'SleepSession',
    'HeartRate',
    'RestingHeartRate',
  ];
  const permissions = (types: RecordType[]): Permission[] =>
    types.map(recordType => ({ accessType: 'read', recordType } as Permission));

  return {
    getSdkStatus: () => Promise.resolve(options.sdkStatus ?? SDK_AVAILABLE),
    initialize: () => Promise.resolve(true),
    getGrantedPermissions: () => Promise.resolve(permissions(granted)),
    requestPermission: () =>
      Promise.resolve(permissions(options.requestResult ?? granted)),
    readRecords: <T extends RecordType>(
      recordType: T,
      readOptions: { pageToken?: string },
    ): Promise<ReadRecordsResult<T>> => {
      options.reads?.push(recordType);
      const pages = options.pages?.[recordType] ?? [];
      const index = readOptions.pageToken ? Number(readOptions.pageToken) : 0;
      const records = (pages[index] ?? []) as ReadRecordsResult<T>['records'];
      return Promise.resolve({
        records,
        pageToken: index + 1 < pages.length ? String(index + 1) : undefined,
      });
    },
  };
}

const WINDOW = { from: new Date(NIGHT_START), to: new Date(NIGHT_END) };

async function collect(
  source: ReturnType<typeof createHealthConnectSource>,
  metric: MetricId,
): Promise<RawBatch[]> {
  const batches: RawBatch[] = [];
  await source.load(metric, WINDOW, batch => {
    batches.push(batch);
    return Promise.resolve();
  });
  return batches;
}

describe('restingHeartRate', () => {
  it('übernimmt den gemessenen Wert und mittelt Mehrfachwerte des Tages', () => {
    const days = restingHeartRateFromRecords([
      { time: iso(NIGHT_END), beatsPerMinute: 52, zoneOffsetSeconds: OFFSET },
      { time: iso(NIGHT_END), beatsPerMinute: 54, zoneOffsetSeconds: OFFSET },
    ]);

    expect(days).toEqual([{ date: 20260615, value: 53 }]);
  });

  describe('abgeleitet', () => {
    const night = normalizeHealthConnectSleep(sleepRecord(), OFFSET);
    const nights = night === null ? [] : [night];
    const samples = (count: number, values: (index: number) => number) =>
      Array.from({ length: count }, (_, index) => ({
        ts: Math.floor((NIGHT_START + index * MINUTE) / 1000),
        value: values(index),
      }));

    it('nimmt das fünfte Perzentil, nicht das Minimum', () => {
      // 60 Punkte: einer mit einem Aussetzer auf 31, der Rest 55…113.
      // ceil(0.05 · 60) = 3, also der dritt-niedrigste Wert.
      const days = deriveRestingHeartRate(
        nights,
        samples(60, index => (index === 0 ? 31 : 54 + index)),
      );

      expect(days[0].value).not.toBe(31);
      expect(days[0].value).toBe(56);
    });

    it('überspringt eine Nacht mit zu wenigen Messpunkten', () => {
      const days = deriveRestingHeartRate(
        nights,
        samples(RESTING_HR_MIN_SAMPLES - 1, () => 55),
      );

      expect(days).toEqual([]);
    });

    it('lässt Werte außerhalb des Schlaffensters weg', () => {
      const afternoon = Array.from({ length: 30 }, (_, index) => ({
        ts: Math.floor((NIGHT_END + 6 * 3_600_000 + index * MINUTE) / 1000),
        value: 40,
      }));

      const days = deriveRestingHeartRate(nights, [
        ...samples(60, () => 55),
        ...afternoon,
      ]);

      expect(days[0].value).toBe(55);
    });
  });
});

describe('createHealthConnectSource', () => {
  it('meldet sich ohne Client als nicht verfügbar', async () => {
    const source = createHealthConnectSource({
      client: null,
      storage: memoryStorage(),
    });

    expect(await source.getState()).toEqual({
      kind: 'unavailable',
      reason: 'Health Connect is only available on Android.',
    });
  });

  it('unterscheidet „nicht installiert" von „muss aktualisiert werden"', async () => {
    const missing = createHealthConnectSource({
      client: fakeClient({ sdkStatus: 1 }),
      storage: memoryStorage(),
    });
    const outdated = createHealthConnectSource({
      client: fakeClient({ sdkStatus: 2 }),
      storage: memoryStorage(),
    });

    expect(await missing.getState()).toEqual({
      kind: 'unavailable',
      reason: 'Health Connect is not installed on this device.',
    });
    expect(await outdated.getState()).toEqual({
      kind: 'unavailable',
      reason: 'Health Connect needs to be updated before it can be used.',
    });
  });

  it('gilt schon bei teilweiser Zustimmung als verbunden', async () => {
    const source = createHealthConnectSource({
      client: fakeClient({ granted: ['SleepSession'] }),
      storage: memoryStorage(),
    });

    expect(await source.getState()).toEqual({ kind: 'connected' });
  });

  it('wertet eine verweigerte Zustimmung als Abbruch, nicht als Fehler', async () => {
    const source = createHealthConnectSource({
      client: fakeClient({ requestResult: [] }),
      storage: memoryStorage(),
    });

    await expect(source.connect()).rejects.toBeInstanceOf(AuthError);
    await expect(source.connect()).rejects.toMatchObject({ kind: 'cancelled' });
  });

  /**
   * `revokeAllPermissions` wirkt erst nach einem Neustart des Prozesses und
   * meldet bis dahin weiter „erteilt". Ohne eigenen Vermerk spränge die Zeile
   * nach dem Trennen sofort auf „verbunden" zurück.
   */
  it('bleibt nach dem Trennen getrennt, obwohl die Zustimmung fortbesteht', async () => {
    const source = createHealthConnectSource({
      client: fakeClient({}),
      storage: memoryStorage(),
    });

    expect(await source.getState()).toEqual({ kind: 'connected' });
    await source.disconnect();
    expect(await source.getState()).toEqual({ kind: 'disconnected' });

    await source.connect();
    expect(await source.getState()).toEqual({ kind: 'connected' });
  });

  it('nennt die fehlende Zustimmung beim Namen, statt leer zu liefern', async () => {
    const source = createHealthConnectSource({
      client: fakeClient({ granted: ['HeartRate'] }),
      storage: memoryStorage(),
    });

    await expect(collect(source, MetricId.sleep)).rejects.toThrow(
      /SleepSession/,
    );
  });

  it('blättert über den pageToken und hört am Ende auf', async () => {
    const source = createHealthConnectSource({
      client: fakeClient({
        pages: {
          SleepSession: [[sleepRecord()], [sleepRecord()]],
        },
      }),
      storage: memoryStorage(),
    });

    const batches = await collect(source, MetricId.sleep);

    expect(batches.flatMap(batch => batch.sessions)).toHaveLength(2);
  });

  /**
   * Der teuerste Satztyp überhaupt. Liegt der Ruhepuls schon gemessen vor, wäre
   * es reine Arbeit, ihn trotzdem zu holen.
   */
  it('liest die Herzfrequenz nicht, wenn ein gemessener Ruhepuls vorliegt', async () => {
    const reads: RecordType[] = [];
    const source = createHealthConnectSource({
      client: fakeClient({
        reads,
        pages: {
          RestingHeartRate: [
            [
              {
                time: iso(NIGHT_END),
                beatsPerMinute: 52,
                zoneOffset: { id: '+02:00', totalSeconds: OFFSET },
              } as RecordResult<'RestingHeartRate'>,
            ],
          ],
        },
      }),
      storage: memoryStorage(),
    });

    const batches = await collect(source, MetricId.dailyRestingHeartRate);

    expect(reads).toContain('RestingHeartRate');
    expect(reads).not.toContain('HeartRate');
    expect(batches.flatMap(batch => batch.daily)).toEqual([
      {
        metric: MetricId.dailyRestingHeartRate,
        date: 20260615,
        field: FieldId.value,
        value: 52,
      },
    ]);
  });

  /**
   * Samsung Health über Health Connect ist genau dieser Fall: Schlaf und
   * Herzfrequenz ja, ein eigener Ruhepuls nein.
   */
  it('leitet den Ruhepuls ab, wenn keiner gemessen vorliegt', async () => {
    const source = createHealthConnectSource({
      client: fakeClient({
        granted: ['SleepSession', 'HeartRate'],
        pages: {
          SleepSession: [[sleepRecord()]],
          HeartRate: [[heartRateRecord(NIGHT_START, 60, index => 54 + index)]],
        },
      }),
      storage: memoryStorage(),
    });

    const batches = await collect(source, MetricId.dailyRestingHeartRate);

    expect(batches.flatMap(batch => batch.daily)).toEqual([
      {
        metric: MetricId.dailyRestingHeartRate,
        date: 20260615,
        field: FieldId.value,
        value: 56,
      },
    ]);
  });
});

describe('Abdeckung', () => {
  /**
   * Health Connect führt für jede gewichtete Größe einen eigenen Satztyp. Ob
   * sie ankommt, hängt an der gekoppelten App — Samsung Health schreibt keine
   * HRV, Oura und Whoop schon.
   */
  it('deckt alle wesentlichen Metriken bis auf die Atemfrequenz je Schlafphase', () => {
    const missing = ESSENTIAL_METRIC_IDS.filter(
      metric => !HEALTH_CONNECT_METRICS.has(metric),
    );

    expect(missing).toEqual([MetricId.respiratoryRateSleepSummary]);
  });

  it('kennt Herzfrequenzvariabilität und Atemfrequenz', () => {
    expect(HEALTH_CONNECT_METRICS.has(MetricId.dailyHeartRateVariability)).toBe(
      true,
    );
    expect(HEALTH_CONNECT_METRICS.has(MetricId.dailyRespiratoryRate)).toBe(
      true,
    );
  });
});

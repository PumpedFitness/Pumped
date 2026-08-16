import type { RecordType } from 'react-native-health-connect';

import type { TimedValue } from '../../algorithms/downsample';
import type { SleepSessionInput } from '../../algorithms/sleep';
import { localOffsetSeconds } from '../../civilDate';
import { MetricId, type FieldId } from '../../ids';
import { AuthError } from '../errors';
import {
  SourceIds,
  type HealthSource,
  type LoadRange,
  type RawBatch,
  type SourceFact,
  type SourceState,
} from '../types';
import {
  HEALTH_CONNECT_METRICS,
  READ_PERMISSIONS,
  healthConnectFacts,
  isReadable,
  recordsFor,
} from './catalog';
import { forEachPage, type HealthConnectClient } from './client';
import {
  ingestHeartRate,
  ingestHeartRateVariability,
  ingestOxygenSaturation,
  ingestRespiratoryRate,
  ingestRestingHeartRate,
  ingestSkinTemperature,
  ingestSleep,
} from './ingest';
import { normalizeHealthConnectSleep } from './normalizeSleep';
import {
  deriveRestingHeartRate,
  restingHeartRateFromRecords,
} from './restingHeartRate';

/** `SdkAvailabilityStatus.SDK_AVAILABLE`, ohne dafür das Modul zu laden. */
const SDK_AVAILABLE = 3;
const SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED = 2;

/**
 * Wie weit ein erster Lauf zurückgreift.
 *
 * Die Baseline blickt 60 Tage zurück und die Auswertung zeigt Verläufe über ein
 * Jahr; darüber hinaus zu lesen kostet nur Zeit. Anders als bei einer REST-Quelle
 * ist das ein Zugriff auf einen Systemdienst, keine Paginierung über Netz.
 */
const FULL_HISTORY_DAYS = 400;

/**
 * Wie groß ein einzelnes Lesefenster ist.
 *
 * Zusätzlich zur Seitenpaginierung aus `client.ts`: Ein Fenster begrenzt, wie
 * viel Health Connect überhaupt zusammensuchen muss, bevor die erste Seite
 * zurückkommt.
 */
const WINDOW_DAYS = 30;

const MS_PER_DAY = 86_400_000;

export type HealthConnectSourceOptions = {
  /** `null` auf iOS und überall, wo es Health Connect nicht gibt. */
  readonly client: HealthConnectClient | null;
  /**
   * Wo das „getrennt" vermerkt wird.
   *
   * Nötig, weil Health Connect die Zustimmung besitzt: `revokeAllPermissions`
   * wirkt erst nach einem Neustart des Prozesses und liefert bis dahin weiter
   * „erteilt" — die Bibliothek rät ausdrücklich davon ab, einen
   * Trennen-Schalter darauf zu bauen.
   */
  readonly storage: {
    getString(key: string): string | null;
    setString(key: string, value: string): void;
  };
};

const DISCONNECTED_KEY = 'health.healthconnect.disconnected';

/**
 * Der Health-Connect-Adapter.
 *
 * Alles, was nur für Health Connect gilt, endet hier: Satztypen, ISO-Zeitstempel,
 * Einheitenobjekte, das Berechtigungsmodell, die Paginierung. Nach `load` gibt es
 * nur noch `RawBatch`.
 *
 * **Was wirklich ankommt, entscheidet die gekoppelte App, nicht dieser Code.**
 * Health Connect ist eine Ablage; Samsung Health schreibt Schlaf und
 * Herzfrequenz hinein, aber weder HRV noch Atemfrequenz noch Hauttemperatur,
 * während Oura, Whoop, Garmin und Fitbit alle drei schreiben. Deshalb meldet
 * `metrics`, was die **Plattform** kann — was leer bleibt, fällt pro Lauf aus
 * der Normalisierung, und der Score wird dünner statt falsch.
 */
export function createHealthConnectSource(
  options: HealthConnectSourceOptions,
): HealthSource {
  const { client, storage } = options;

  const isDisconnected = () => storage.getString(DISCONNECTED_KEY) === '1';

  const requireClient = (): HealthConnectClient => {
    if (client === null) {
      throw new Error('Health Connect is not available on this device.');
    }
    return client;
  };

  /** Welche Satztypen der Nutzer freigegeben hat. */
  const grantedRecords = async (): Promise<ReadonlySet<RecordType>> => {
    const granted = await requireClient().getGrantedPermissions();
    return new Set(
      granted
        .filter(permission => permission.accessType === 'read')
        .map(permission => permission.recordType),
    );
  };

  return {
    descriptor: {
      id: SourceIds.healthConnect,
      name: 'Health Connect',
      detail: 'Sleep, heart rate and vitals from Samsung Health, Fitbit, Oura…',
    },

    metrics: HEALTH_CONNECT_METRICS,

    async getState(): Promise<SourceState> {
      if (client === null) {
        return {
          kind: 'unavailable',
          reason: 'Health Connect is only available on Android.',
        };
      }

      const status = await client.getSdkStatus();
      if (status === SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
        return {
          kind: 'unavailable',
          reason: 'Health Connect needs to be updated before it can be used.',
        };
      }
      if (status !== SDK_AVAILABLE) {
        return {
          kind: 'unavailable',
          reason: 'Health Connect is not installed on this device.',
        };
      }

      if (isDisconnected()) return { kind: 'disconnected' };

      // Teilweise erteilt genügt: Wer nur den Schlaf freigibt, bekommt den
      // Schlafterm und sonst nichts — das ist eine Quelle mit weniger Metriken,
      // kein Fehlerfall.
      const granted = await grantedRecords();
      return granted.size > 0
        ? { kind: 'connected' }
        : { kind: 'disconnected' };
    },

    async connect(): Promise<void> {
      const bridge = requireClient();
      if (!(await bridge.initialize())) {
        throw new Error('Health Connect could not be initialised.');
      }

      const granted = await bridge.requestPermission(READ_PERMISSIONS);
      if (granted.length === 0) {
        // Der Nutzer hat die Zustimmung verweigert. Das ist eine Entscheidung,
        // keine Störung — die Oberfläche behandelt `cancelled` entsprechend.
        throw new AuthError('cancelled', 'Health Connect access was declined.');
      }
      storage.setString(DISCONNECTED_KEY, '0');
    },

    /**
     * Trennen ist hier nur eine Notiz.
     *
     * `revokeAllPermissions` wirkt erst nach einem Neustart des Prozesses und
     * meldet bis dahin weiter „erteilt" — die Bibliothek rät ausdrücklich davon
     * ab, einen Trennen-Schalter darauf zu bauen, und empfiehlt genau das hier:
     * den Zustand selbst führen und aufhören zu lesen. Widerrufen kann der
     * Nutzer in Health Connect. Gelesen wird nach dem Trennen nichts mehr; das
     * ist die Zusage, die die App halten kann.
     */
    disconnect(): Promise<void> {
      storage.setString(DISCONNECTED_KEY, '1');
      return Promise.resolve();
    },

    async load(
      metric: MetricId,
      range: LoadRange,
      sink: (batch: RawBatch) => Promise<void>,
    ): Promise<void> {
      if (!HEALTH_CONNECT_METRICS.has(metric)) return;
      const bridge = requireClient();

      const granted = await grantedRecords();
      if (!isReadable(metric, granted)) {
        const missing = recordsFor(metric).filter(
          record => !granted.has(record),
        );
        throw new Error(
          `Health Connect has not granted access to ${missing.join(', ')}.`,
        );
      }

      for (const window of windowsFor(range)) {
        await loadWindow(bridge, metric, window, granted, sink);
      }
    },

    facts(metric: MetricId, fields: readonly FieldId[]): SourceFact[] {
      return healthConnectFacts(metric, fields);
    },
  };
}

type Window = { readonly from: Date; readonly to: Date };

async function loadWindow(
  client: HealthConnectClient,
  metric: MetricId,
  window: Window,
  granted: ReadonlySet<RecordType>,
  sink: (batch: RawBatch) => Promise<void>,
): Promise<void> {
  // Der Zonenoffset des Geräts, für die Satztypen, die keinen mitbringen.
  const offset = localOffsetSeconds(window.to);

  if (metric === MetricId.sleep) {
    return forEachPage(client, 'SleepSession', window, records =>
      sink(ingestSleep(records, offset)),
    );
  }

  if (metric === MetricId.heartRate) {
    return forEachPage(client, 'HeartRate', window, records =>
      sink(ingestHeartRate(records, offset)),
    );
  }

  if (metric === MetricId.dailyHeartRateVariability) {
    return forEachPage(client, 'HeartRateVariabilityRmssd', window, records =>
      sink(ingestHeartRateVariability(records, offset)),
    );
  }

  if (metric === MetricId.dailyRespiratoryRate) {
    return forEachPage(client, 'RespiratoryRate', window, records =>
      sink(ingestRespiratoryRate(records, offset)),
    );
  }

  if (metric === MetricId.dailyOxygenSaturation) {
    return forEachPage(client, 'OxygenSaturation', window, records =>
      sink(ingestOxygenSaturation(records, offset)),
    );
  }

  if (metric === MetricId.dailySleepTemperatureDerivations) {
    return forEachPage(client, 'SkinTemperature', window, records =>
      sink(ingestSkinTemperature(records)),
    );
  }

  return loadRestingHeartRate(client, window, granted, offset, sink);
}

/**
 * Ruhepuls — gemessen, wenn die Quelle ihn führt, sonst abgeleitet.
 *
 * Der gemessene Wert hat Vorrang, und wenn er da ist, wird die Herzfrequenz
 * gar nicht erst gelesen: Das ist der teuerste Satztyp überhaupt, und für eine
 * Zahl, die schon vorliegt, wäre er reine Arbeit.
 */
async function loadRestingHeartRate(
  client: HealthConnectClient,
  window: Window,
  granted: ReadonlySet<RecordType>,
  offset: number,
  sink: (batch: RawBatch) => Promise<void>,
): Promise<void> {
  if (granted.has('RestingHeartRate')) {
    let measured = 0;
    await forEachPage(client, 'RestingHeartRate', window, async records => {
      const days = restingHeartRateFromRecords(
        records.map(record => ({
          time: record.time,
          beatsPerMinute: record.beatsPerMinute,
          zoneOffsetSeconds: record.zoneOffset?.totalSeconds ?? offset,
        })),
      );
      measured += days.length;
      await sink(ingestRestingHeartRate(days));
    });
    if (measured > 0) return;
  }

  // Keine gemessenen Werte im Fenster — Samsung Health ist der Regelfall
  // dafür. Also aus Schlaf und Herzfrequenz ableiten.
  if (!granted.has('HeartRate') || !granted.has('SleepSession')) return;

  const nights: SleepSessionInput[] = [];
  await forEachPage(client, 'SleepSession', window, records => {
    for (const record of records) {
      const night = normalizeHealthConnectSleep(record, offset);
      if (night !== null) nights.push(night);
    }
    return Promise.resolve();
  });
  if (nights.length === 0) return;

  const samples: TimedValue[] = [];
  await forEachPage(client, 'HeartRate', window, records => {
    for (const record of records) {
      for (const sample of record.samples) {
        const millis = Date.parse(sample.time);
        if (Number.isFinite(millis)) {
          samples.push({
            ts: Math.floor(millis / 1000),
            value: sample.beatsPerMinute,
          });
        }
      }
    }
    return Promise.resolve();
  });

  await sink(ingestRestingHeartRate(deriveRestingHeartRate(nights, samples)));
}

/**
 * Das angefragte Fenster in Portionen, älteste zuerst.
 *
 * Eine offene untere Grenze heißt „volle Historie" und wird auf
 * [FULL_HISTORY_DAYS] festgemacht; eine offene obere Grenze ist jetzt.
 */
function windowsFor(range: LoadRange, now: Date = new Date()): Window[] {
  const to = (range.to ?? now).getTime();
  const from = range.from?.getTime() ?? to - FULL_HISTORY_DAYS * MS_PER_DAY;
  if (from >= to) return [];

  const span = WINDOW_DAYS * MS_PER_DAY;
  const windows: Window[] = [];
  for (let start = from; start < to; start += span) {
    windows.push({
      from: new Date(start),
      to: new Date(Math.min(start + span, to)),
    });
  }
  return windows;
}

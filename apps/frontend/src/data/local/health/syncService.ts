import {
  ESSENTIAL_METRIC_IDS,
  FieldId,
  METRIC_ID_LABEL,
  MetricId,
} from '@/lib/health/ids';
import {
  downsampleToBuckets,
  type TimedValue,
} from '@/lib/health/algorithms/downsample';
import { AuthError } from '@/lib/health/sources/google/oauth';
import type { HealthSource } from '@/lib/health/sources/types';

import {
  newestSyncedAt,
  recentNights,
  recordSync,
  writeRawBatch,
} from './rawStore';

/**
 * Wie weit ein Delta-Lauf hinter den bekannten Stand zurückgreift.
 *
 * Die Health API kennt keinen Change-Cursor; inkrementell geht nur über
 * Zeitfenster. Quellen korrigieren aber rückwirkend — Google überarbeitet
 * Schlaf noch Tage später. Wer exakt ab dem letzten bekannten Zeitpunkt liest,
 * sieht diese Korrekturen nie. Die Überlappung kostet ein paar hundert Zeilen
 * pro Lauf und ist der Grund, warum die Rohschicht Upserts macht.
 *
 * Die Fensterlogik gehört bewusst hierher und nicht in den Adapter: Dass
 * überlappend nachgefasst wird, ist eine Eigenschaft des Speichers, nicht der
 * Quelle. Die Quelle bekommt nur ein `since` gereicht.
 */
export const DELTA_OVERLAP_DAYS = 7;

export type MetricSyncOutcome =
  | {
      readonly metric: MetricId;
      readonly status: 'synced';
      readonly detail?: string;
    }
  | { readonly metric: MetricId; readonly status: 'unsupported' }
  | {
      readonly metric: MetricId;
      readonly status: 'failed';
      readonly error: string;
    };

export type SyncResult = {
  readonly outcomes: readonly MetricSyncOutcome[];
  /** Gesetzt, wenn der Lauf abgebrochen wurde, statt Metriken zu überspringen. */
  readonly abortedBy: string | null;
  readonly needsReauth: boolean;
};

export type SyncOptions = {
  readonly source: HealthSource;
  readonly metrics?: readonly MetricId[];
  readonly now?: Date;
  readonly onProgress?: (progress: {
    readonly metric: MetricId;
    readonly label: string;
    readonly index: number;
    readonly total: number;
  }) => void;
};

/**
 * Holt alle Metriken einer Quelle in die Rohschicht.
 *
 * Ein Fehler an einer Metrik beendet den Lauf **nicht** — eine Quelle, der ein
 * einzelner Scope fehlt, soll die übrigen vier Größen trotzdem liefern. Nur
 * eine abgelaufene Anmeldung bricht ab: Danach schlägt ohnehin jeder weitere
 * Request fehl, und der Nutzer muss handeln.
 */
export async function syncHealthData(
  options: SyncOptions,
): Promise<SyncResult> {
  const now = options.now ?? new Date();
  const metrics = options.metrics ?? ESSENTIAL_METRIC_IDS;
  const outcomes: MetricSyncOutcome[] = [];

  for (const [index, metric] of metrics.entries()) {
    if (!options.source.metrics.has(metric)) {
      // Kein Fehlerfall: eine Quelle mit weniger Metriken ist eine Quelle mit
      // weniger Termen.
      outcomes.push({ metric, status: 'unsupported' });
      continue;
    }

    options.onProgress?.({
      metric,
      label: METRIC_ID_LABEL[metric],
      index,
      total: metrics.length,
    });

    let newest: Date | null = null;
    try {
      await options.source.load(
        metric,
        { from: sinceFor(metric), to: null },
        batch => {
          writeRawBatch(batch);
          if (
            batch.newest !== null &&
            (newest === null || batch.newest > newest)
          ) {
            newest = batch.newest;
          }
          return Promise.resolve();
        },
      );
      recordSync(metric, newest, now);
      outcomes.push({ metric, status: 'synced' });
    } catch (error) {
      if (error instanceof AuthError && error.kind === 'needs_reauth') {
        return { outcomes, abortedBy: error.message, needsReauth: true };
      }
      outcomes.push({
        metric,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Erst nach dem Schlaf: Die Nachtfenster stehen erst fest, wenn die Sessions
  // geschrieben sind.
  if (options.source.metrics.has(MetricId.heartRate)) {
    try {
      const nights = await syncNightHeartRate(options.source, now);
      outcomes.push({
        metric: MetricId.heartRate,
        status: 'synced',
        detail: nights,
      });
    } catch (error) {
      if (error instanceof AuthError && error.kind === 'needs_reauth') {
        return { outcomes, abortedBy: error.message, needsReauth: true };
      }
      outcomes.push({
        metric: MetricId.heartRate,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { outcomes, abortedBy: null, needsReauth: false };
}

/**
 * Wie viele der jüngsten Nächte eine Herzfrequenzkurve bekommen.
 *
 * Jede Nacht kostet einen eigenen Request — das Fenster ist die Session, nicht
 * der Tag. Für den Schlaf-Screen zählt die letzte Nacht; ein paar mehr geben
 * Spielraum für Nachträge, ohne dass ein erster Sync zwanzig Requests
 * abschickt.
 */
const HEART_RATE_NIGHTS = 5;

/**
 * Holt die Herzfrequenz **nur für die Schlaffenster** und verdichtet sie.
 *
 * Der Drei-Sekunden-Takt macht aus einer Nacht rund 10.800 Punkte. Roh
 * gespeichert wären sechzig Nächte über 600.000 Zeilen — für eine Kurve, die
 * mit 110 Werten identisch aussieht. Verdichtet wird **hier** und nicht im
 * Adapter: Welche Auflösung wir aufheben, ist eine Eigenschaft unserer Ablage,
 * nicht von Google.
 */
async function syncNightHeartRate(
  source: HealthSource,
  now: Date,
): Promise<string> {
  const nights = recentNights(HEART_RATE_NIGHTS);
  let written = 0;

  for (const night of nights) {
    const samples: TimedValue[] = [];
    await source.load(
      MetricId.heartRate,
      {
        from: new Date(night.startTs * 1000),
        to: new Date(night.endTs * 1000),
      },
      batch => {
        for (const row of batch.samples) {
          samples.push({ ts: row.ts, value: row.value });
        }
        return Promise.resolve();
      },
    );

    const buckets = downsampleToBuckets(samples);
    if (buckets.length === 0) continue;

    writeRawBatch({
      samples: buckets.map(bucket => ({
        metric: MetricId.heartRate,
        ts: bucket.ts,
        field: FieldId.value,
        tzOffsetSeconds: night.tzOffsetSeconds,
        value: bucket.value,
      })),
      daily: [],
      sessions: [],
      newest: null,
    });
    written += buckets.length;
  }

  recordSync(MetricId.heartRate, now, now);
  return `${nights.length} nights, ${written} points`;
}

/** `null` heißt volle Historie — beim ersten Lauf einer Metrik. */
function sinceFor(metric: MetricId): Date | null {
  const newest = newestSyncedAt(metric);
  if (newest === null || newest.getTime() === 0) return null;
  return new Date(newest.getTime() - DELTA_OVERLAP_DAYS * 24 * 60 * 60 * 1000);
}

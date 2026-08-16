import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';

import { db } from '../database';
import * as schema from '../schema';
import { notifyTableChanged } from '../tableVersions';
import { FieldId, MetricId } from '@/lib/health/ids';
import {
  ANNOTATION_TYPES,
  type Annotation,
  type AnnotationType,
} from '@/lib/health/algorithms/annotations';
import type {
  SleepSessionInput,
  SleepStage,
} from '@/lib/health/algorithms/sleep';
import type { MetricSeriesInput } from '@/lib/health/stats/series';
import type { RawBatch } from '@/lib/health/sources/types';

/**
 * SQLite bindet Parameter einzeln; ein Jahr Tageswerte in einem einzigen
 * INSERT sprengt das Limit. 200 Zeilen je Anweisung bleiben überall darunter.
 */
const CHUNK = 200;

function chunked<T>(rows: readonly T[]): T[][] {
  const out: T[][] = [];
  for (let index = 0; index < rows.length; index += CHUNK) {
    out.push(rows.slice(index, index + CHUNK));
  }
  return out;
}

/**
 * Schreibt einen Batch in die Rohschicht.
 *
 * Upsert, nicht Insert: Die Quelle korrigiert Tage rückwirkend — Google
 * überarbeitet Schlaf noch Tage später —, und ein Delta-Lauf fasst bewusst
 * überlappend nach. Ein Konflikt ist hier der Normalfall, kein Fehler.
 */
export function writeRawBatch(batch: RawBatch): void {
  if (batch.daily.length > 0) {
    for (const rows of chunked(batch.daily)) {
      db.insert(schema.healthRawDaily)
        .values(
          rows.map(row => ({
            metric: row.metric,
            date: row.date,
            field: row.field,
            value: row.value,
          })),
        )
        .onConflictDoUpdate({
          target: [
            schema.healthRawDaily.metric,
            schema.healthRawDaily.date,
            schema.healthRawDaily.field,
          ],
          set: { value: sql`excluded.value` },
        })
        .run();
    }
    notifyTableChanged(schema.healthRawDaily);
  }

  if (batch.samples.length > 0) {
    for (const rows of chunked(batch.samples)) {
      db.insert(schema.healthRawSample)
        .values(
          rows.map(row => ({
            metric: row.metric,
            ts: row.ts,
            field: row.field,
            tzOff: row.tzOffsetSeconds,
            value: row.value,
          })),
        )
        .onConflictDoUpdate({
          target: [
            schema.healthRawSample.metric,
            schema.healthRawSample.ts,
            schema.healthRawSample.field,
          ],
          set: { value: sql`excluded.value`, tzOff: sql`excluded.tz_off` },
        })
        .run();
    }
    notifyTableChanged(schema.healthRawSample);
  }

  if (batch.sessions.length > 0) {
    for (const rows of chunked(batch.sessions)) {
      db.insert(schema.healthRawSession)
        .values(
          rows.map(row => ({
            metric: row.metric,
            startTs: row.startTs,
            endTs: row.endTs,
            tzOff: row.tzOffsetSeconds,
            sleep: row.sleep === null ? null : JSON.stringify(row.sleep),
            sourcePayload: row.sourcePayload,
          })),
        )
        .onConflictDoUpdate({
          target: [
            schema.healthRawSession.metric,
            schema.healthRawSession.startTs,
          ],
          set: {
            endTs: sql`excluded.end_ts`,
            tzOff: sql`excluded.tz_off`,
            sleep: sql`excluded.sleep`,
            sourcePayload: sql`excluded.source_payload`,
          },
        })
        .run();
    }
    notifyTableChanged(schema.healthRawSession);
  }
}

// MARK: - Lesen

function dailyRows(metric: MetricId, field: FieldId) {
  return db
    .select({
      date: schema.healthRawDaily.date,
      value: schema.healthRawDaily.value,
    })
    .from(schema.healthRawDaily)
    .where(
      and(
        eq(schema.healthRawDaily.metric, metric),
        eq(schema.healthRawDaily.field, field),
      ),
    )
    .orderBy(schema.healthRawDaily.date)
    .all();
}

/**
 * Die Eingabe der Auswertung.
 *
 * Liest nur die neutralen Spalten — `source_payload` bleibt liegen. Eine
 * Session ohne lesbares `sleep` wird übersprungen: Sie stammt aus einer
 * Metrik, die keine Nacht ist, oder aus einem Batch vor der Normalisierung.
 */
export function loadMetricSeriesInput(): MetricSeriesInput {
  const sessions = db
    .select({ sleep: schema.healthRawSession.sleep })
    .from(schema.healthRawSession)
    .where(eq(schema.healthRawSession.metric, MetricId.sleep))
    .orderBy(schema.healthRawSession.startTs)
    .all();

  const sleepSessions: SleepSessionInput[] = [];
  for (const row of sessions) {
    if (row.sleep === null) continue;
    try {
      sleepSessions.push(JSON.parse(row.sleep) as SleepSessionInput);
    } catch {
      // Eine unlesbare Zeile darf nicht die ganze Historie mitreißen.
    }
  }

  return {
    hrvAverage: dailyRows(
      MetricId.dailyHeartRateVariability,
      FieldId.hrvAverage,
    ),
    hrvDeepSleep: dailyRows(
      MetricId.dailyHeartRateVariability,
      FieldId.hrvDeepSleep,
    ),
    restingHeartRate: dailyRows(MetricId.dailyRestingHeartRate, FieldId.value),
    respiratoryRate: dailyRows(MetricId.dailyRespiratoryRate, FieldId.value),
    skinTemperature: dailyRows(
      MetricId.dailySleepTemperatureDerivations,
      FieldId.tempNightly,
    ),
    sleepSessions,
  };
}

function isAnnotationType(value: string): value is AnnotationType {
  return (ANNOTATION_TYPES as readonly string[]).includes(value);
}

export function loadAnnotations(): Annotation[] {
  return db
    .select()
    .from(schema.healthAnnotations)
    .orderBy(schema.healthAnnotations.startTs)
    .all()
    .flatMap(row =>
      isAnnotationType(row.type)
        ? [
            {
              id: row.id,
              type: row.type,
              startTs: row.startTs,
              endTs: row.endTs,
              tzOffsetSeconds: row.tzOff,
              note: row.note,
            },
          ]
        : [],
    );
}

/**
 * Die jüngsten Nächte, absteigend — Fenster für die Herzfrequenz.
 *
 * Liest die Sessions direkt, nicht die ausgewertete Nachtauswahl: Hier geht es
 * um den Zeitraum, in dem gemessen wurde, nicht darum, welche Session als
 * Hauptnacht gilt.
 */
export function recentNights(limit: number): {
  startTs: number;
  endTs: number;
  tzOffsetSeconds: number;
}[] {
  return db
    .select({
      startTs: schema.healthRawSession.startTs,
      endTs: schema.healthRawSession.endTs,
      tzOff: schema.healthRawSession.tzOff,
    })
    .from(schema.healthRawSession)
    .where(eq(schema.healthRawSession.metric, MetricId.sleep))
    .orderBy(desc(schema.healthRawSession.startTs))
    .limit(limit)
    .all()
    .map(row => ({
      startTs: row.startTs,
      endTs: row.endTs,
      tzOffsetSeconds: row.tzOff,
    }));
}

/**
 * Die verdichtete Herzfrequenzkurve eines Zeitfensters.
 *
 * Leer, solange für diese Nacht nichts geholt wurde — das ist der Normalfall
 * für ältere Nächte, denn der Sync deckt nur die jüngsten ab.
 */
export function loadHeartRateCurve(
  startTs: number,
  endTs: number,
): { ts: number; value: number }[] {
  return db
    .select({
      ts: schema.healthRawSample.ts,
      value: schema.healthRawSample.value,
    })
    .from(schema.healthRawSample)
    .where(
      and(
        eq(schema.healthRawSample.metric, MetricId.heartRate),
        eq(schema.healthRawSample.field, FieldId.value),
        gte(schema.healthRawSample.ts, startTs),
        lte(schema.healthRawSample.ts, endTs),
      ),
    )
    .orderBy(schema.healthRawSample.ts)
    .all();
}

/**
 * Atemfrequenz je Schlafphase für ein Nachtfenster.
 *
 * Die Quelle legt eine Stichprobe je Nacht ab, mit einem Feld je Phase. `null`
 * heißt: für diese Phase liegt nichts vor — kein Grund, eine Null zu zeigen.
 */
export function loadNightBreathing(
  startTs: number,
  endTs: number,
): Partial<Record<SleepStage, number>> {
  const byField: Partial<Record<number, SleepStage>> = {
    [FieldId.respDeep]: 'deep',
    [FieldId.respLight]: 'core',
    [FieldId.respRem]: 'rem',
  };

  const rows = db
    .select({
      field: schema.healthRawSample.field,
      value: schema.healthRawSample.value,
    })
    .from(schema.healthRawSample)
    .where(
      and(
        eq(schema.healthRawSample.metric, MetricId.respiratoryRateSleepSummary),
        gte(schema.healthRawSample.ts, startTs),
        lte(schema.healthRawSample.ts, endTs),
      ),
    )
    .all();

  const out: Partial<Record<SleepStage, number>> = {};
  for (const row of rows) {
    const stage = byField[row.field];
    // Dieselbe Regel wie in der Auswertung: Eine 0 ist bei keiner geführten
    // Größe eine Messung, sondern die Art, wie die Quelle „nicht berechnet"
    // ausdrückt. Im Testkonto trifft das die REM-Atemfrequenz einzelner
    // Nächte — ungefiltert stünde dort „0.0 br/min".
    if (stage !== undefined && Number.isFinite(row.value) && row.value > 0) {
      out[stage] = row.value;
    }
  }
  return out;
}

// MARK: - Sync-Zustand

export function newestSyncedAt(metric: MetricId): Date | null {
  const row = db
    .select({ newestTs: schema.healthSyncState.newestTs })
    .from(schema.healthSyncState)
    .where(eq(schema.healthSyncState.metric, metric))
    .get();
  return row === undefined ? null : new Date(row.newestTs * 1000);
}

export function recordSync(
  metric: MetricId,
  newest: Date | null,
  at: Date,
): void {
  const newestTs = Math.floor((newest?.getTime() ?? 0) / 1000);
  db.insert(schema.healthSyncState)
    .values({ metric, newestTs, lastSuccess: at.getTime() })
    .onConflictDoUpdate({
      target: schema.healthSyncState.metric,
      // Nie rückwärts: Ein Lauf, der nichts Neues fand, darf den Stand nicht
      // zurücksetzen und beim nächsten Mal die ganze Historie nachladen.
      set: {
        newestTs: sql`max(${schema.healthSyncState.newestTs}, excluded.newest_ts)`,
        lastSuccess: sql`excluded.last_success`,
      },
    })
    .run();
  notifyTableChanged(schema.healthSyncState);
}

// MARK: - Besitz der Rohschicht

export function healthRawRowCount(): number {
  const count = (table: Parameters<typeof db.$count>[0]) =>
    db.$count(table) as unknown as number;
  return (
    count(schema.healthRawDaily) +
    count(schema.healthRawSample) +
    count(schema.healthRawSession)
  );
}

/**
 * Räumt die Rohschicht.
 *
 * Annotationen bleiben stehen — sie sind Eingaben des Nutzers, nicht Daten der
 * Quelle, und überstehen einen Quellenwechsel.
 */
export function clearHealthRawData(): void {
  db.delete(schema.healthRawDaily).run();
  db.delete(schema.healthRawSample).run();
  db.delete(schema.healthRawSession).run();
  db.delete(schema.healthSyncState).run();
  notifyTableChanged(schema.healthRawDaily);
  notifyTableChanged(schema.healthRawSample);
  notifyTableChanged(schema.healthRawSession);
  notifyTableChanged(schema.healthSyncState);
}

/** Der Port, den `SourceRegistry` erwartet. */
export const healthRawLayerStore = {
  countRows: () => Promise.resolve(healthRawRowCount()),
  clear: () => Promise.resolve(clearHealthRawData()),
};

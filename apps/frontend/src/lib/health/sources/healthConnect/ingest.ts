import type { RecordResult } from 'react-native-health-connect';

import { civilDateFromEpoch, type CivilDate } from '../../civilDate';
import { FieldId, MetricId } from '../../ids';
import {
  emptyBatch,
  newestOf,
  type RawBatch,
  type RawDailyRow,
  type RawSampleRow,
  type RawSessionRow,
} from '../types';
import { normalizeHealthConnectSleep } from './normalizeSleep';
import type { RestingHeartRateDay } from './restingHeartRate';

const MS_PER_SECOND = 1000;

/**
 * Health Connects Datensätze in Rohzeilen.
 *
 * Die quellenseitige Hälfte des Adapters: Hier enden ISO-Zeitstempel,
 * Einheitenobjekte (`{inCelsius, inFahrenheit}`) und Phasenkennungen; danach gilt
 * nur noch `RawBatch`.
 *
 * Durchweg tolerant — ein Datensatz ohne lesbaren Zeitstempel oder ohne endlichen
 * Wert wird übersprungen, statt den Batch zu verwerfen.
 */

function epochSeconds(iso: string): number | null {
  const millis = Date.parse(iso);
  return Number.isFinite(millis) ? Math.floor(millis / MS_PER_SECOND) : null;
}

/**
 * Tageswerte aus punktuellen Messungen.
 *
 * Health Connect legt HRV, Atemfrequenz und Sauerstoffsättigung als **einzelne
 * Messpunkte** ab, die Auswertung erwartet einen Wert je Zivildatum. Gemittelt
 * wird, weil der Primärschlüssel der Rohschicht nur eine Zeile je
 * `(Metrik, Datum, Feld)` zulässt — ohne Zusammenfassung entschiede schlicht die
 * Reihenfolge der Antwort, welcher Punkt den Tag beschreibt.
 */
function dailyMean(
  points: readonly { readonly date: CivilDate; readonly value: number }[],
): Map<CivilDate, number> {
  const byDate = new Map<CivilDate, { sum: number; count: number }>();
  for (const point of points) {
    const entry = byDate.get(point.date) ?? { sum: 0, count: 0 };
    byDate.set(point.date, {
      sum: entry.sum + point.value,
      count: entry.count + 1,
    });
  }
  return new Map(
    [...byDate.entries()]
      .sort(([left], [right]) => left - right)
      .map(([date, entry]) => [date, entry.sum / entry.count]),
  );
}

/**
 * Punktuelle Messungen auf eine Tagesmetrik.
 *
 * Der Positiv-Filter der Auswertung (§2.1) verwirft Nicht-Positives ohnehin;
 * hier gar nicht erst zu schreiben spart der Rohschicht die Zeile.
 */
type Instantaneous = {
  readonly time: string;
  readonly zoneOffset?: { readonly totalSeconds: number };
};

function ingestInstantaneous<T extends Instantaneous>(
  records: readonly T[],
  valueOf: (record: T) => number | undefined,
  metric: MetricId,
  field: FieldId,
  fallbackOffsetSeconds: number,
): RawBatch {
  const points: { date: CivilDate; value: number }[] = [];
  let newest: Date | null = null;

  for (const record of records) {
    const ts = epochSeconds(record.time);
    const value = valueOf(record);
    if (ts === null || value === undefined) continue;
    if (!Number.isFinite(value) || value <= 0) continue;

    points.push({
      date: civilDateFromEpoch(
        ts,
        record.zoneOffset?.totalSeconds ?? fallbackOffsetSeconds,
      ),
      value,
    });
    newest = newestOf(newest, new Date(ts * MS_PER_SECOND));
  }

  const daily: RawDailyRow[] = [...dailyMean(points).entries()].map(
    ([date, value]) => ({ metric, date, field, value }),
  );

  return { samples: [], daily, sessions: [], newest };
}

/**
 * Schlafsessions.
 *
 * `SleepSessionRecord` führt **keinen Zonenoffset** — anders als die punktuellen
 * Satztypen, die einen mitbringen dürfen. Das Zivildatum einer Nacht wird aber in
 * der Zone der Messung gebildet (§7.1 in `DECISIONS.md`), und die kennt Health
 * Connect für Sessions nicht.
 *
 * Verwendet wird deshalb die **aktuelle Zone des Geräts**. Für den Regelfall ist
 * das exakt dasselbe; wer während einer Reise synchronisiert, kann eine Nacht um
 * einen Tag verschoben sehen. Das ist der Preis dieser Quelle und keine
 * Nachlässigkeit — erfunden wird nichts, und der Offset wandert mit in die
 * Rohschicht, statt beim Lesen jedes Mal neu geraten zu werden.
 */
export function ingestSleep(
  records: readonly RecordResult<'SleepSession'>[],
  tzOffsetSeconds: number,
): RawBatch {
  const sessions: RawSessionRow[] = [];
  let newest: Date | null = null;

  for (const record of records) {
    const sleep = normalizeHealthConnectSleep(record, tzOffsetSeconds);
    if (sleep === null) continue;

    sessions.push({
      metric: MetricId.sleep,
      startTs: sleep.startTs,
      endTs: sleep.endTs,
      tzOffsetSeconds: sleep.tzOffsetSeconds,
      sleep,
      sourcePayload: JSON.stringify(record),
    });
    newest = newestOf(newest, new Date(sleep.endTs * MS_PER_SECOND));
  }

  return { samples: [], daily: [], sessions, newest };
}

/**
 * Herzfrequenz.
 *
 * Ein `HeartRateRecord` ist ein **Behälter**: Der Messwert steckt in `samples`,
 * nicht im Datensatz selbst. Ein Datensatz kann Minuten oder Stunden abdecken.
 */
export function ingestHeartRate(
  records: readonly RecordResult<'HeartRate'>[],
  fallbackOffsetSeconds: number,
): RawBatch {
  const samples: RawSampleRow[] = [];
  let newest: Date | null = null;

  for (const record of records) {
    for (const sample of record.samples) {
      const ts = epochSeconds(sample.time);
      if (ts === null) continue;
      if (
        !Number.isFinite(sample.beatsPerMinute) ||
        sample.beatsPerMinute <= 0
      ) {
        continue;
      }

      samples.push({
        metric: MetricId.heartRate,
        ts,
        field: FieldId.value,
        tzOffsetSeconds: fallbackOffsetSeconds,
        value: sample.beatsPerMinute,
      });
      newest = newestOf(newest, new Date(ts * MS_PER_SECOND));
    }
  }

  return { samples, daily: [], sessions: [], newest };
}

export function ingestHeartRateVariability(
  records: readonly RecordResult<'HeartRateVariabilityRmssd'>[],
  fallbackOffsetSeconds: number,
): RawBatch {
  return ingestInstantaneous(
    records,
    (record: RecordResult<'HeartRateVariabilityRmssd'>) =>
      record.heartRateVariabilityMillis,
    MetricId.dailyHeartRateVariability,
    // Nicht `hrvDeepSleep`: Health Connect sagt nicht, in welcher Schlafphase
    // gemessen wurde. Die Auswertung bevorzugt den Tiefschlafwert und fällt auf
    // diesen zurück (§11.2) — als Tiefschlaf auszugeben, was ein Tagesmittel
    // ist, wäre eine Behauptung.
    FieldId.hrvAverage,
    fallbackOffsetSeconds,
  );
}

export function ingestRespiratoryRate(
  records: readonly RecordResult<'RespiratoryRate'>[],
  fallbackOffsetSeconds: number,
): RawBatch {
  return ingestInstantaneous(
    records,
    (record: RecordResult<'RespiratoryRate'>) => record.rate,
    MetricId.dailyRespiratoryRate,
    FieldId.value,
    fallbackOffsetSeconds,
  );
}

export function ingestOxygenSaturation(
  records: readonly RecordResult<'OxygenSaturation'>[],
  fallbackOffsetSeconds: number,
): RawBatch {
  return ingestInstantaneous(
    records,
    (record: RecordResult<'OxygenSaturation'>) => record.percentage,
    MetricId.dailyOxygenSaturation,
    FieldId.spo2Average,
    fallbackOffsetSeconds,
  );
}

/**
 * Hauttemperatur — der Fall, der eine Baseline braucht.
 *
 * Health Connect legt Hauttemperatur als **Abweichung** ab (`deltas`), die
 * Auswertung erwartet einen **absoluten** Wert in °C: `tempNightly` ist laut §1
 * in `DECISIONS.md` eine Hauttemperatur, keine Abweichung, und der Positiv-Filter
 * aus §2.1 verwirft alles ≤ 0. Deltas direkt zu schreiben hieße, die kalte
 * Hälfte aller Nächte lautlos wegzuwerfen und die andere als Temperatur
 * auszugeben.
 *
 * Absolut wird daraus nur mit `baseline`, und die ist optional. Fehlt sie, wird
 * die Nacht **übersprungen** — eine fehlende Beobachtung ist der Auswertung
 * lieber als eine erfundene. Die Herkunftsanzeige sagt das (`healthConnectFacts`).
 */
export function ingestSkinTemperature(
  records: readonly RecordResult<'SkinTemperature'>[],
): RawBatch {
  const points: { date: CivilDate; value: number }[] = [];
  let newest: Date | null = null;

  for (const record of records) {
    const baseline = record.baseline?.inCelsius;
    if (baseline === undefined || !Number.isFinite(baseline)) continue;

    const deltas = record.deltas
      .map(delta => delta.delta.inCelsius)
      .filter(value => Number.isFinite(value));
    if (deltas.length === 0) continue;

    const endTs = epochSeconds(record.endTime);
    if (endTs === null) continue;

    const mean = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
    const absolute = baseline + mean;
    if (absolute <= 0) continue;

    points.push({
      // Über das **Ende** datiert, wie eine Nacht auch: Eine Messung, die um
      // 23:40 beginnt, gehört zum Morgen danach.
      date: civilDateFromEpoch(
        endTs,
        record.endZoneOffset?.totalSeconds ??
          record.startZoneOffset?.totalSeconds ??
          0,
      ),
      value: absolute,
    });
    newest = newestOf(newest, new Date(endTs * MS_PER_SECOND));
  }

  const daily: RawDailyRow[] = [...dailyMean(points).entries()].map(
    ([date, value]) => ({
      metric: MetricId.dailySleepTemperatureDerivations,
      date,
      field: FieldId.tempNightly,
      value,
    }),
  );

  return { samples: [], daily, sessions: [], newest };
}

export function ingestRestingHeartRate(
  days: readonly RestingHeartRateDay[],
): RawBatch {
  if (days.length === 0) return emptyBatch();

  return {
    samples: [],
    daily: days.map(day => ({
      metric: MetricId.dailyRestingHeartRate,
      date: day.date,
      field: FieldId.value,
      value: day.value,
    })),
    sessions: [],
    // Ein Tageswert hat keine Uhrzeit. Mittag des jüngsten Tages ist der
    // Zeitpunkt, den der Sync-Zustand daraus machen kann, ohne an einer
    // Tagesgrenze in den Vortag zu rutschen.
    newest: newestOf(
      ...days.map(day => new Date(civilDateToNoonUTC(day.date))),
    ),
  };
}

function civilDateToNoonUTC(date: CivilDate): number {
  return Date.UTC(
    Math.trunc(date / 10000),
    (Math.trunc(date / 100) % 100) - 1,
    date % 100,
    12,
  );
}

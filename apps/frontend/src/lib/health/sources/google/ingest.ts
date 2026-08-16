import { MetricId } from '../../ids';
import {
  newestOf,
  type RawBatch,
  type RawDailyRow,
  type RawSampleRow,
  type RawSessionRow,
} from '../types';
import { azmField, type DataTypeSpec } from './catalog';
import {
  asNumber,
  asString,
  at,
  civilDate,
  epochSeconds,
  offsetSeconds,
  type Json,
} from './json';
import { normalizeSleepSession } from './normalizeSleep';

/**
 * Übersetzt Datenpunkte der Google Health API in Rohzeilen.
 *
 * Die quellenseitige Hälfte des Adapters: Hier endet Googles JSON, danach gilt
 * nur noch `RawBatch`.
 *
 * Bewusst tolerant: Ein Punkt ohne brauchbaren Zeitstempel oder ohne endlichen
 * Wert wird übersprungen, statt den ganzen Batch zu verwerfen. Ein einzelnes
 * `"NaN"` darf keine Nacht Schlafdaten mitreißen.
 */
export function ingestPoints(
  spec: DataTypeSpec,
  points: readonly Json[],
): RawBatch {
  const samples: RawSampleRow[] = [];
  const daily: RawDailyRow[] = [];
  const sessions: RawSessionRow[] = [];
  let newest: Date | null = null;

  const note = (date: Date | null) => {
    newest = newestOf(newest, date);
  };

  for (const point of points) {
    const payload = at(point, spec.payloadKey);
    if (payload === undefined) continue;

    switch (spec.shape) {
      case 'sample':
        note(
          appendSamples(samples, spec, payload, {
            time: at(payload, 'sampleTime.physicalTime'),
            offset: at(payload, 'sampleTime.utcOffset'),
          }),
        );
        break;

      case 'interval':
        note(
          appendSamples(samples, spec, payload, {
            time: at(payload, 'interval.startTime'),
            offset: at(payload, 'interval.startUtcOffset'),
          }),
        );
        break;

      case 'daily': {
        const date = civilDate(at(payload, 'date'));
        if (date === null) continue;
        for (const [field, key] of spec.fields) {
          const value = asNumber(at(payload, key));
          if (value === null) continue;
          daily.push({ metric: spec.metric, date, field, value });
        }
        note(civilDateToUTCDate(date));
        break;
      }

      case 'session': {
        const startTs = epochSeconds(at(payload, 'interval.startTime'));
        const endTs = epochSeconds(at(payload, 'interval.endTime'));
        if (startTs === null || endTs === null) continue;
        sessions.push({
          metric: spec.metric,
          startTs,
          endTs,
          tzOffsetSeconds: offsetSeconds(
            at(payload, 'interval.startUtcOffset'),
          ),
          sleep:
            spec.metric === MetricId.sleep
              ? normalizeSleepSession(payload)
              : null,
          sourcePayload: JSON.stringify(payload),
        });
        note(new Date(endTs * 1000));
        break;
      }
    }
  }

  return { samples, daily, sessions, newest };
}

function appendSamples(
  into: RawSampleRow[],
  spec: DataTypeSpec,
  payload: Json,
  time: { time: Json | undefined; offset: Json | undefined },
): Date | null {
  const timestamp = epochSeconds(time.time);
  if (timestamp === null) return null;
  const tzOffsetSeconds = offsetSeconds(time.offset);

  // Active Zone Minutes: Die Feldkennung steckt im Zonenwert, nicht im Schema.
  const discriminator = spec.discriminatorKey
    ? asString(at(payload, spec.discriminatorKey))
    : null;
  const override = discriminator === null ? null : azmField(discriminator);

  for (const [field, key] of spec.fields) {
    const value = asNumber(at(payload, key));
    if (value === null) continue;
    into.push({
      metric: spec.metric,
      ts: timestamp,
      field: override ?? field,
      tzOffsetSeconds,
      value,
    });
  }

  return new Date(timestamp * 1000);
}

function civilDateToUTCDate(value: number): Date {
  return new Date(
    Date.UTC(
      Math.trunc(value / 10000),
      (Math.trunc(value / 100) % 100) - 1,
      value % 100,
    ),
  );
}

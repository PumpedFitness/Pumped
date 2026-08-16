import type { Permission, RecordType } from 'react-native-health-connect';

import { FieldId, MetricId } from '../../ids';
import type { SourceFact } from '../types';

/**
 * Welche Health-Connect-Datensätze eine Metrik braucht.
 *
 * Health Connect ist kein Gerät und keine App, sondern der Ablageort, in den
 * Samsung Health, Fitbit, Oura, Garmin, Whoop und Google Fit schreiben. Was
 * tatsächlich ankommt, hängt deshalb **nicht** an dieser Tabelle, sondern daran,
 * welche App der Nutzer koppelt: Die Plattform kennt für jede unserer sechs
 * Größen einen Satztyp, aber Samsung Health schreibt zum Beispiel weder HRV noch
 * Atemfrequenz oder Hauttemperatur hinein.
 *
 * Das ist kein Fehlerfall. Eine fehlende Größe fällt aus der Normalisierung,
 * statt als Null hineinzugehen (§5.1 in `DECISIONS.md`) — der Score wird dünner,
 * nicht falsch. `HealthSource.metrics` meldet deshalb, was die **Plattform**
 * hergeben kann; was davon leer bleibt, entscheidet der Sync pro Lauf.
 */
const RECORDS_BY_METRIC = {
  [MetricId.sleep]: ['SleepSession'],
  [MetricId.heartRate]: ['HeartRate'],
  // Beide: `RestingHeartRate` ist die gemessene Zahl, `HeartRate` die
  // Rückfallebene, aus der wir sie ableiten. Siehe `restingHeartRate.ts`.
  [MetricId.dailyRestingHeartRate]: ['RestingHeartRate', 'HeartRate'],
  [MetricId.dailyHeartRateVariability]: ['HeartRateVariabilityRmssd'],
  [MetricId.dailyRespiratoryRate]: ['RespiratoryRate'],
  [MetricId.dailySleepTemperatureDerivations]: ['SkinTemperature'],
  [MetricId.dailyOxygenSaturation]: ['OxygenSaturation'],
} as const satisfies Partial<Record<MetricId, readonly RecordType[]>>;

export const HEALTH_CONNECT_METRICS: ReadonlySet<MetricId> = new Set(
  Object.keys(RECORDS_BY_METRIC).map(Number) as MetricId[],
);

export function recordsFor(metric: MetricId): readonly RecordType[] {
  return RECORDS_BY_METRIC[metric as keyof typeof RECORDS_BY_METRIC] ?? [];
}

/** Jeder Satztyp, den diese Quelle je liest — die Liste für den Consent. */
export const READ_PERMISSIONS: readonly Permission[] = [
  ...new Set(Object.values(RECORDS_BY_METRIC).flat()),
].map(recordType => ({ accessType: 'read', recordType } as Permission));

/**
 * Ob für diese Metrik **alles** vorliegt, was sie braucht.
 *
 * Der Ruhepuls ist die Ausnahme: Ihm genügt einer der beiden Satztypen, weil der
 * eine die Messung und der andere die Ableitung trägt.
 */
export function isReadable(
  metric: MetricId,
  granted: ReadonlySet<RecordType>,
): boolean {
  const needed = recordsFor(metric);
  if (needed.length === 0) return false;
  return metric === MetricId.dailyRestingHeartRate
    ? needed.some(record => granted.has(record))
    : needed.every(record => granted.has(record));
}

/** Woher ein Wert technisch stammt, wie die Detailebene es nennt. */
export function healthConnectFacts(
  metric: MetricId,
  fields: readonly FieldId[],
): SourceFact[] {
  const records = recordsFor(metric);
  if (records.length === 0) return [];

  const facts: SourceFact[] = [
    {
      label: 'Record type',
      value: records.join('\n'),
      stacked: records.length > 1,
    },
  ];

  if (metric === MetricId.dailyRestingHeartRate) {
    facts.push({
      label: 'Derived',
      value:
        'Used as measured when the connected app writes RestingHeartRate. Otherwise the 5th percentile of heart rate during sleep.',
      stacked: true,
    });
  }

  if (metric === MetricId.dailySleepTemperatureDerivations) {
    // Health Connect legt Hauttemperatur als Abweichung ab, die Auswertung
    // erwartet einen Absolutwert (§1 in `DECISIONS.md`). Ohne Baseline lässt
    // sich der nicht bilden — das gehört auf den Herkunftsschirm, sonst wirkt
    // die leere Reihe wie ein Fehler.
    facts.push({
      label: 'Needs baseline',
      value:
        'Health Connect stores skin temperature as a delta. Nights without a baseline are skipped.',
      stacked: true,
    });
  }

  if (metric === MetricId.dailyHeartRateVariability) {
    facts.push({
      label: 'Field',
      value: fields.includes(FieldId.hrvAverage)
        ? 'heartRateVariabilityMillis (RMSSD), averaged per day'
        : 'heartRateVariabilityMillis (RMSSD)',
      stacked: true,
    });
  }

  return facts;
}

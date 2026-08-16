import type { CivilDate } from './civilDate';

/**
 * Die geführten Größen.
 *
 * Die Reihenfolge ist die Anzeigereihenfolge und bestimmt zugleich die
 * Iterationsreihenfolge im Estimator — damit bleibt die Gleitkomma-Summation
 * reproduzierbar und ein Golden-File-Vergleich bitgenau.
 */
export const METRIC_ORDER = [
  'hrv',
  'rhr',
  'sleepScore',
  'sleep',
  'deep',
  'resp',
  'temp',
] as const;

export type Metric = (typeof METRIC_ORDER)[number];

/**
 * Bei `-1` ist ein niedrigerer Wert der bessere; der z-Wert wird gedreht, bevor
 * er in den Score eingeht.
 */
export const METRIC_DIRECTION: Record<Metric, 1 | -1> = {
  hrv: 1,
  rhr: -1,
  sleepScore: 1,
  sleep: 1,
  deep: 1,
  resp: -1,
  temp: -1,
};

/**
 * Größen, die in keinem Modell ein Term sind.
 *
 * Sie bekommen Baseline, Normalband und Verlauf wie jede andere — nur keinen
 * Anteil am Score. Der Tiefschlaf gehört dazu: Er ist die aussagekräftigste
 * Phase der Nacht, aber die Schlafdauer trägt ihn im Score bereits mit, und ihn
 * ein zweites Mal zu gewichten hieße, dieselbe Nacht doppelt zu zählen.
 */
/**
 * Gemessen, aber in keinem Modell gewichtet.
 *
 * `sleep` und `deep` stehen hier, seit die **Schlafnote** den Dauer-Term
 * abgelöst hat: Beide gehen in sie ein, und zusätzlich als eigener Term zählten
 * sie doppelt. Sichtbar bleiben sie als Beobachtung ohne Gewicht.
 */
export const UNWEIGHTED_METRICS: readonly Metric[] = ['sleep', 'deep', 'temp'];

/** Tageswerte einer Metrik. Ein fehlender Tag ist keine Null, sondern nichts. */
export type MetricValues = ReadonlyMap<CivilDate, number>;

export type MetricSeries = ReadonlyMap<Metric, MetricValues>;

/** Gewichte je Metrik. Siehe `UNWEIGHTED_METRICS` für die ohne Anteil. */
export type MetricWeights = Readonly<Partial<Record<Metric, number>>>;

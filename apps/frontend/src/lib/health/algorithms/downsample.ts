import { median } from './baseline';

export type TimedValue = {
  /** Unix-Sekunden. */
  readonly ts: number;
  readonly value: number;
};

/** Auflösung, in der eine Nacht gespeichert wird. */
export const NIGHT_BUCKET_SECONDS = 300;

/**
 * Verdichtet eine hochfrequente Messreihe auf feste Zeiteimer.
 *
 * Die Quelle liefert die Herzfrequenz im Drei-Sekunden-Takt — eine Nacht sind
 * rund 10.800 Punkte, sechzig Nächte über 600.000. Für die Frage „wie lief die
 * Nacht" ist das sinnlos genau: Ein Punkt je fünf Minuten zeichnet dieselbe
 * Kurve mit rund 110 Werten.
 *
 * Je Eimer der **Median**, nicht der Mittelwert. Eine Bewegung im Schlaf treibt
 * einzelne Schläge kurz nach oben; der Mittelwert nimmt sie mit, der Median
 * nicht. Dieselbe Überlegung wie bei der Phasenreferenz.
 *
 * Die Eimergrenzen liegen auf Vielfachen von `bucketSeconds` seit der Epoche,
 * nicht relativ zum ersten Wert — sonst verschöbe sich das Raster von Nacht zu
 * Nacht, und zwei Läufe über denselben Zeitraum schrieben verschiedene Zeilen.
 */
export function downsampleToBuckets(
  samples: readonly TimedValue[],
  bucketSeconds: number = NIGHT_BUCKET_SECONDS,
): TimedValue[] {
  if (samples.length === 0 || bucketSeconds <= 0) return [];

  const buckets = new Map<number, number[]>();
  for (const sample of samples) {
    if (!Number.isFinite(sample.value)) continue;
    const start = Math.floor(sample.ts / bucketSeconds) * bucketSeconds;
    const existing = buckets.get(start);
    if (existing === undefined) buckets.set(start, [sample.value]);
    else existing.push(sample.value);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([ts, values]) => ({ ts, value: median(values) }));
}

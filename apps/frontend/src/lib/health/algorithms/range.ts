import { summarise } from './baseline';

/**
 * Der Bereich, in dem ein Wert liegen sollte, samt Enden der Skala.
 *
 * `high === null` heißt **nach oben offen**: Beim Schlafbedarf und bei der
 * Effizienz ist mehr nicht schlechter, und ein oberes Ende zu zeichnen
 * behauptete eine Obergrenze, die es nicht gibt. Phasendauern haben dagegen
 * eine echte Spanne nach beiden Seiten — auffällig viel Tiefschlaf ist auch
 * eine Auffälligkeit.
 *
 * Eigenes Modul, weil sowohl die Nachtnote als auch die Phasenauswertung
 * Bereiche bilden. Läge der Typ bei einem von beiden, importierten sie sich
 * gegenseitig.
 */
export type TermRange = {
  readonly low: number;
  readonly high: number | null;
  readonly scaleMin: number;
  readonly scaleMax: number;
};

export type RangeStatus = 'below' | 'in' | 'above';

/**
 * Ein Bereich ohne oberes Ende.
 *
 * Das Skalenende kommt von außen: Bei der Dauer richtet es sich nach der Nacht,
 * bei der Effizienz sind 100 % eine harte Obergrenze, über die keine Skala
 * hinauslaufen darf.
 */
export function openRange(
  low: number,
  scaleMin: number,
  scaleMax: number,
): TermRange {
  return { low, high: null, scaleMin, scaleMax };
}

/**
 * Die übliche Spanne aus einer Messreihe, als Median ± MAD.
 *
 * Median und MAD, nicht Mittelwert und SD: Eine einzelne durchwachte Nacht in
 * der Historie soll die Spanne nicht aufblähen. Streut die Reihe gar nicht,
 * gibt es keine Spanne — ein Bereich der Breite null wäre kein Bereich, sondern
 * eine Linie, an der jede Abweichung „außerhalb" hieße.
 *
 * `measured` geht nur in das Skalenende ein, damit ein Ausreißer der letzten
 * Nacht im Bild bleibt statt am Rand zu kleben.
 */
export function spreadRange(
  history: readonly number[],
  measured: number,
): TermRange | null {
  if (history.length === 0) return null;

  const { center, spread } = summarise(history, 'median', 'mad');
  if (spread <= 0) return null;

  return {
    low: Math.max(0, center - spread),
    high: center + spread,
    scaleMin: 0,
    scaleMax: Math.max(center + spread, measured) * 1.2,
  };
}

/** Wo der Wert relativ zum Bereich liegt. `null`, wenn eines von beiden fehlt. */
export function rangeStatus(
  value: number | null,
  range: TermRange | null,
): RangeStatus | null {
  if (value === null || range === null) return null;
  if (value < range.low) return 'below';
  if (range.high !== null && value > range.high) return 'above';
  return 'in';
}

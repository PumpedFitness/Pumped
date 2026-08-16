import type { UsualRange } from '@/lib/health/algorithms/params';
import type { SleepNight } from '@/lib/health/algorithms/sleep';

/**
 * Höhe der Grafik.
 *
 * Die Phasen liegen als ganzhohe Felder im Hintergrund, die Kurve darüber —
 * es gibt keine getrennten Spuren mehr, deren Höhen sich addieren würden.
 */
export const CHART_HEIGHT = 150;

const CURVE_PADDING = 8;
const HOUR = 3600;

/**
 * Schrittweiten für die Pulsachse, aufsteigend.
 *
 * Genommen wird die kleinste, die höchstens vier Marken ergibt: Mehr wäre ein
 * Zaun, weniger sagt nichts über die Zwischenräume.
 */
const TICK_STEPS = [5, 10, 20, 25, 50];
const MAX_VALUE_TICKS = 4;

export type TimedValue = { ts: number; value: number };

/**
 * Volle Stunden im Fenster.
 *
 * Der Schritt richtet sich nach der Länge der Nacht: Zehn Linien sind ein Zaun,
 * vier sind eine Orientierung. Die Marken liegen auf **vollen Stunden**, nicht
 * auf gleichmäßigen Bruchteilen des Fensters — sonst stünde dort „23:47", und
 * niemand liest eine Achse mit krummen Zeiten.
 */
export function hourTicks(startTs: number, endTs: number): number[] {
  const span = endTs - startTs;
  if (span <= 0) return [];
  const step = span > 7 * HOUR ? 2 * HOUR : HOUR;
  const first = Math.ceil(startTs / step) * step;

  const ticks: number[] = [];
  for (let ts = first; ts < endTs; ts += step) ticks.push(ts);
  return ticks;
}

/** Ein Extremwert der Nacht, mit dem Zeitpunkt, an dem er auftrat. */
export type Extreme = { readonly ts: number; readonly value: number };

export type NightScale = {
  readonly hasCurve: boolean;
  readonly low: number;
  readonly high: number;
  /** Tiefster und höchster **gemessener** Punkt — Beschriftung der y-Achse. */
  readonly minPoint: Extreme | null;
  readonly maxPoint: Extreme | null;
  /** Zeit → x. Gilt für **beide** Blöcke, das ist der Punkt der Sache. */
  readonly x: (ts: number) => number;
  /** Runde bpm-Werte innerhalb der Skala, für die Achse links. */
  readonly valueTicks: readonly number[];
  /** bpm → y, relativ zum Kurvenblock. */
  readonly y: (value: number) => number;
  readonly path: string;
  readonly ticks: readonly number[];
};

/**
 * Achsen und Pfad für eine Nacht.
 *
 * Die x-Achse ist das Schlaffenster und für Spuren wie Kurve dieselbe — nur
 * dadurch lässt sich eine Spalte von oben nach unten lesen. Die y-Achse gehört
 * dagegen **nur** der Kurve: Bei den Spuren heißt „oben" wach, bei der Kurve
 * hoher Puls. Zwei Bedeutungen auf einer Achse liest niemand, deshalb liegen
 * die Blöcke untereinander statt übereinander.
 *
 * Die y-Skala umfasst Kurve **und** Normalband, sonst läge das Band außerhalb
 * des Bildes, sobald die Nacht ungewöhnlich verlief.
 */
export function nightScale(
  night: SleepNight,
  curve: readonly TimedValue[],
  restingBand: UsualRange | null,
  width: number,
  /** Breite der Pulsachse links. Das Diagramm beginnt erst dahinter. */
  axisWidth = 0,
): NightScale {
  const span = night.endTs - night.startTs;
  const hasCurve = curve.length > 1 && span > 0;

  const domain = [
    ...curve.map(point => point.value),
    ...(restingBand === null ? [] : [restingBand.low, restingBand.high]),
  ];
  const low = hasCurve ? Math.min(...domain) : 0;
  const high = hasCurve ? Math.max(...domain) : 0;
  const range = high - low || 1;

  const plotWidth = Math.max(0, width - axisWidth);
  const x = (ts: number) =>
    span <= 0
      ? axisWidth
      : axisWidth + ((ts - night.startTs) / span) * plotWidth;
  // Die vertikale Achse gehört allein der Kurve. Die Phasen belegen nur die
  // Zeitachse — deshalb lässt sich beides überlagern, ohne dass „oben"
  // zweierlei bedeutet.
  const y = (value: number) =>
    CURVE_PADDING +
    (1 - (value - low) / range) * (CHART_HEIGHT - CURVE_PADDING * 2);

  return {
    hasCurve,
    low,
    high,
    // Aus der Kurve, nicht aus `low`/`high`: Die Skala schließt das Normalband
    // ein, damit es nicht aus dem Bild fällt. Beschriftet wird aber, was
    // tatsächlich gemessen wurde — sonst klebte die Zahl an einer Stelle, an
    // der die Linie gar nicht verläuft.
    minPoint: hasCurve ? extreme(curve, (a, b) => a.value < b.value) : null,
    maxPoint: hasCurve ? extreme(curve, (a, b) => a.value > b.value) : null,
    x,
    y,
    path: hasCurve && plotWidth > 0 ? buildPath(curve, x, y) : '',
    ticks: hourTicks(night.startTs, night.endTs),
    valueTicks: hasCurve ? valueTicks(low, high) : [],
  };
}

/**
 * Runde Werte innerhalb der Skala.
 *
 * Bewusst **nicht** die Skalenenden: Die tragen bereits die beiden Pillen an
 * Hoch- und Tiefpunkt, und dieselbe Zahl zweimal im Bild erklärt nichts. Runde
 * Zwischenwerte machen dagegen die Höhe dazwischen ablesbar.
 */
function valueTicks(low: number, high: number): number[] {
  const step =
    TICK_STEPS.find(
      candidate =>
        Math.floor(high / candidate) - Math.ceil(low / candidate) + 1 <=
        MAX_VALUE_TICKS,
    ) ?? TICK_STEPS[TICK_STEPS.length - 1];

  const ticks: number[] = [];
  for (let value = Math.ceil(low / step) * step; value <= high; value += step) {
    ticks.push(value);
  }
  return ticks;
}

/** Erster Punkt, der `wins` gegen alle vorherigen gewinnt. */
function extreme(
  curve: readonly TimedValue[],
  wins: (a: TimedValue, b: TimedValue) => boolean,
): Extreme {
  return curve.reduce((best, point) => (wins(point, best) ? point : best));
}

/**
 * Eine Lücke von mehr als drei Messabständen ist keine Pause von Sekunden,
 * sondern ein Loch — dort bricht die Linie ab, statt sie zu überbrücken.
 */
function buildPath(
  curve: readonly TimedValue[],
  x: (ts: number) => number,
  y: (value: number) => number,
): string {
  const maxGap =
    3 *
    Math.max(
      1,
      Math.min(...curve.slice(1).map((point, i) => point.ts - curve[i].ts)),
    );

  return curve
    .map((point, index) => {
      const previous = curve[index - 1];
      const broken = previous !== undefined && point.ts - previous.ts > maxGap;
      return `${index === 0 || broken ? 'M' : 'L'} ${x(point.ts)} ${y(
        point.value,
      )}`;
    })
    .join(' ');
}

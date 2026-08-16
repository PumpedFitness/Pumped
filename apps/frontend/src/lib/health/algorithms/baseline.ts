import type { CivilDate } from '../civilDate';
import type { Metric, MetricValues } from '../metrics';
import { isAnnotatedAway, type Annotation } from './annotations';
import type {
  BaselineStats,
  CentralTendency,
  EstimatorParams,
  SpreadKind,
} from './params';

/**
 * Unter dieser Zahl von Messungen wird kein Score gebildet. Ein Score aus vier
 * Nächten ist Rauschen mit einer Zahl davor.
 */
export const MINIMUM_SAMPLES = 14;

/** Skaliert MAD auf die Standardabweichung einer Normalverteilung. */
const MAD_TO_SIGMA = 1.4826;

/** Ab dieser Abweichung ist eine Änderung überhaupt eine Änderung. */
export const WORTHWHILE_Z = 0.5;

// MARK: - Statistik

export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

/**
 * Mitte und Streuung einer Wertemenge.
 *
 * Zwei Eigenheiten, beide beabsichtigt: Die Standardabweichung ist die der
 * **Stichprobe** (`n − 1`), und sie wird um `center` gebildet — bei
 * `central: 'median'` also um den Median, nicht um den Mittelwert.
 *
 * Ist MAD null, obwohl die Werte streuen, fällt die Streuung auf die SD
 * zurück. Bei ganzzahlig gerasterten Größen wie dem Ruhepuls in bpm ist das
 * kein Grenzfall: Sobald über die Hälfte der Werte identisch ist, wäre der MAD
 * null und die Metrik verschwände lautlos aus der Normalisierung.
 */
export function summarise(
  values: readonly number[],
  central: CentralTendency,
  spread: SpreadKind,
): { center: number; spread: number } {
  if (values.length === 0) return { center: 0, spread: 0 };

  const count = values.length;
  const center =
    central === 'mean'
      ? values.reduce((sum, value) => sum + value, 0) / count
      : median(values);

  const standardDeviation = () =>
    count > 1
      ? Math.sqrt(
          values.reduce(
            (sum, value) => sum + (value - center) * (value - center),
            0,
          ) /
            (count - 1),
        )
      : 0;

  if (spread === 'sd') return { center, spread: standardDeviation() };

  const absoluteDeviation =
    median(values.map(value => Math.abs(value - center))) * MAD_TO_SIGMA;
  return {
    center,
    spread: absoluteDeviation === 0 ? standardDeviation() : absoluteDeviation,
  };
}

// MARK: - Baseline

/**
 * Die Werte, auf denen die Baseline gebildet wird — gefenstert,
 * annotationsbereinigt und gegebenenfalls logarithmiert.
 *
 * Der Stichtag ist **nicht** enthalten: Der aktuelle Wert soll seine eigene
 * Referenz nicht mitbestimmen. Deshalb ist die Länge dieser Liste auch die
 * Zahl, die gegen `MINIMUM_SAMPLES` zählt — sie beschreibt die Referenz, nicht
 * die Messreihe.
 *
 * Gefenstert wird **vor** dem Annotationsfilter. Annotierte Tage werden
 * entfernt, es rücken keine älteren nach; wer 60 nicht-annotierte Tage
 * einsammelt, rechnet über ein längeres Fenster und bekommt andere Zahlen.
 */
export function history(
  values: MetricValues,
  metric: Metric,
  referenceDate: CivilDate,
  params: EstimatorParams,
  annotations: readonly Annotation[],
): number[] {
  const candidates = [...values.entries()]
    .filter(([date]) => date < referenceDate)
    .sort(([a], [b]) => b - a)
    .slice(0, params.window)
    .filter(
      ([date]) =>
        !params.excludeAnnotated || !isAnnotatedAway(annotations, date),
    )
    .map(([, value]) => value);

  if (!params.logTransform.has(metric)) return candidates;
  return candidates.filter(value => value > 0).map(Math.log);
}

/**
 * Baseline einer Metrik, oder `null`, wenn die Historie zu dünn ist oder nicht
 * streut.
 *
 * Die Mindestmenge wird **vor** dem Ausreißerverwurf geprüft; `count` ist die
 * Zahl danach und darf dadurch unter 14 fallen.
 */
export function baselineStats(
  values: MetricValues,
  metric: Metric,
  referenceDate: CivilDate,
  params: EstimatorParams,
  annotations: readonly Annotation[],
): BaselineStats | null {
  let sample = history(values, metric, referenceDate, params, annotations);
  if (sample.length < MINIMUM_SAMPLES) return null;

  if (params.outlierReject) {
    // Der Grobdurchlauf nutzt immer mean/sd, unabhängig von den Parametern.
    const rough = summarise(sample, 'mean', 'sd');
    if (rough.spread > 0) {
      sample = sample.filter(
        value => Math.abs(value - rough.center) < 3 * rough.spread,
      );
    }
  }

  const stats = summarise(sample, params.central, params.spread);
  if (stats.spread <= 0) return null;
  return { center: stats.center, spread: stats.spread, count: sample.length };
}

/** Bereitet einen Rohwert so auf, wie ihn die Baseline sieht. */
export function transform(
  value: number,
  metric: Metric,
  params: EstimatorParams,
): number | null {
  if (!params.logTransform.has(metric)) return value;
  return value > 0 ? Math.log(value) : null;
}

export function zScore(stats: BaselineStats, value: number): number {
  return stats.spread > 0 ? (value - stats.center) / stats.spread : 0;
}

export function smallestWorthwhileChange(stats: BaselineStats): number {
  return WORTHWHILE_Z * stats.spread;
}

// MARK: - Zusammenhang

/**
 * Pearson-Korrelation. `null`, wenn eine der beiden Reihen nicht streut — dann
 * ist der Quotient nicht definiert, und 0 wäre eine Behauptung.
 */
export function correlation(
  pairs: readonly { x: number; y: number }[],
): number | null {
  if (pairs.length < 3) return null;

  const count = pairs.length;
  const meanX = pairs.reduce((sum, pair) => sum + pair.x, 0) / count;
  const meanY = pairs.reduce((sum, pair) => sum + pair.y, 0) / count;

  let numerator = 0;
  let varianceX = 0;
  let varianceY = 0;
  for (const pair of pairs) {
    const dx = pair.x - meanX;
    const dy = pair.y - meanY;
    numerator += dx * dy;
    varianceX += dx * dx;
    varianceY += dy * dy;
  }

  if (varianceX <= 0 || varianceY <= 0) return null;
  return numerator / Math.sqrt(varianceX * varianceY);
}

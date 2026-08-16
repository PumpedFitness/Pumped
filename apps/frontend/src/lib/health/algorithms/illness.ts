import { addDays, type CivilDate } from '../civilDate';
import {
  METRIC_DIRECTION,
  METRIC_ORDER,
  type Metric,
  type MetricSeries,
  type MetricValues,
} from '../metrics';
import { isAnnotatedAway, type Annotation } from './annotations';
import {
  baselineStats,
  history,
  MINIMUM_SAMPLES,
  transform,
  zScore,
} from './baseline';
import { DEFAULT_PARAMS, type EstimatorParams } from './params';

/**
 * Die Größen, an denen sich ein Infekt zeigt.
 *
 * Alle vier sind autonom, keine davon willentlich beeinflussbar. Schlaf und
 * Nachtnote stehen bewusst **nicht** dabei: Eine kurze Nacht ist auch eine
 * kurze Nacht, wenn das Kind wach war, und sie mitzuzählen machte aus jedem
 * Wochenende einen Krankheitsverdacht.
 */
export const ILLNESS_METRICS: readonly Metric[] = [
  'hrv',
  'rhr',
  'resp',
  'temp',
];

/**
 * Parameter der Erkennung.
 *
 * Bewusst **nicht** die Einstellungen des Nutzers: Welches Modell er für die
 * Anzeige gewählt hat, ist eine Geschmacksfrage; ob ein Tag auffällig war, soll
 * es nicht sein. Die Log-Transformation der HRV steht deshalb fest — ohne sie
 * ist ihre Standardabweichung unbrauchbar, und genau die ist hier der Maßstab.
 */
const DETECTION_PARAMS: EstimatorParams = {
  ...DEFAULT_PARAMS,
  logTransform: new Set<Metric>(['hrv']),
};

/**
 * Ab dieser gerichteten Abweichung gilt eine Größe an einem Tag als auffällig.
 *
 * Anderthalb σ, nicht eines. Bei einer engen Baseline — und die autonomen
 * Größen sind eng — erreicht schon der übliche Wochenrhythmus ein σ; eine
 * Schwelle dort meldete jeden Montag. Ein Infekt schlägt bei allen vier
 * Größen deutlich weiter aus, die Erkennung verliert dadurch nichts.
 */
const FLAGGED_Z = -1.5;

/**
 * So viele auffällige Größen braucht ein Tag.
 *
 * Zwei, nicht eine. Eine einzelne Größe kippt regelmäßig ohne Krankheit — ein
 * später Abend hebt den Ruhepuls, ein warmes Schlafzimmer die Hauttemperatur.
 * Erst wenn mehrere gleichzeitig in dieselbe Richtung zeigen, ist es ein
 * Muster statt eines Ausreißers.
 */
const MIN_FLAGGED_METRICS = 2;

/** Und so weit muss das Mittel **aller** gemessenen Größen darunterliegen. */
const MIN_MEAN_Z = -1.25;

/**
 * Ein einzelner unauffälliger Tag trennt zwei Zeiträume noch nicht.
 *
 * Eine nicht getragene Uhr oder ein scheinbar besserer Mittwoch zerlegte einen
 * Infekt sonst in zwei Meldungen, und der Nutzer bestätigte zweimal dasselbe.
 */
const SPAN_GAP_DAYS = 1;

/**
 * So weit zurück wird überhaupt gesucht.
 *
 * Dieselbe Spanne, auf die eine offene Markierung gedeckelt ist: Was länger
 * zurückliegt, kann der Nutzer nicht mehr zuverlässig zuordnen, und eine
 * Rückfrage dazu ist keine Hilfe mehr, sondern eine Quizfrage.
 */
export const DETECTION_WINDOW_DAYS = 14;

/** Eine Größe, die an diesem Zeitraum auffällig war. */
export type IllnessMarker = {
  readonly metric: Metric;
  /**
   * Gerichtete Abweichung, gemittelt über die auffälligen Tage. Negativ heißt
   * „schlechter als sonst", unabhängig davon, ob die Größe dafür steigt oder
   * fällt.
   */
  readonly z: number;
};

export type IllnessCandidate = {
  readonly from: CivilDate;
  readonly to: CivilDate;
  /** Tage im Zeitraum, einschließlich beider Enden. */
  readonly dayCount: number;
  /** Die auffälligen Größen, stärkste Abweichung zuerst. */
  readonly markers: readonly IllnessMarker[];
};

type DayVerdict = {
  readonly date: CivilDate;
  readonly zByMetric: ReadonlyMap<Metric, number>;
};

/**
 * Zeiträume, die nach einem Infekt aussehen.
 *
 * Die Baseline wird **einmal** zum Stichtag gebildet, nicht je Tag neu: Gefragt
 * ist, welche der letzten Tage gegen das heutige Normal auffallen, nicht wie
 * sich das Normal damals darstellte. Das ist zugleich die billigere Rechnung —
 * vier Baselines statt vier je Tag.
 *
 * Die auslösenden Tage stecken selbst noch in dieser Baseline, solange sie
 * nicht markiert sind. Das macht die Erkennung eher zu vorsichtig als zu
 * eifrig, was die richtige Richtung ist: Ein übersehener Infekt kostet eine
 * Markierung von Hand, ein erfundener kostet Vertrauen.
 *
 * Zurückgegeben wird nichts, was bereits markiert ist — weder als Krankheit
 * noch als Reise oder Alkohol. Wer den Grund schon eingetragen hat, soll nicht
 * gefragt werden, ob er ihn eintragen möchte.
 */
export function detectIllness(input: {
  readonly series: MetricSeries;
  readonly referenceDate: CivilDate;
  readonly annotations: readonly Annotation[];
  readonly window?: number;
}): IllnessCandidate[] {
  const window = input.window ?? DETECTION_WINDOW_DAYS;
  const earliest = addDays(input.referenceDate, -(window - 1));

  const baselines = new Map<Metric, ReturnType<typeof baselineStats>>();
  for (const metric of ILLNESS_METRICS) {
    baselines.set(
      metric,
      baselineStats(
        input.series.get(metric) ?? new Map(),
        metric,
        input.referenceDate,
        DETECTION_PARAMS,
        input.annotations,
      ),
    );
  }

  const flagged: DayVerdict[] = [];
  for (
    let date = earliest;
    date <= input.referenceDate;
    date = addDays(date, 1)
  ) {
    // Ein bereits markierter Tag ist beantwortet. Ihn erneut zu melden hieße,
    // die Antwort des Nutzers zu ignorieren.
    if (isAnnotatedAway(input.annotations, date)) continue;

    const verdict = judge(date, input.series, baselines);
    if (verdict !== null) flagged.push(verdict);
  }

  return groupIntoSpans(flagged).map(toCandidate);
}

// MARK: - Rückblick

/**
 * Der Rückblick nach Themen geordnet.
 *
 * Zwei Gruppen, weil die Frage zwei Hälften hat: Was hat der Kreislauf gemacht,
 * und was der Schlaf. Die Erkennung stützt sich weiter allein auf `vitals` —
 * eine kurze Nacht ist kein Beleg für einen Infekt —, aber im Rückblick ist
 * gerade der Schlaf das, was man wissen will.
 */
export const ILLNESS_REVIEW_GROUPS = [
  { key: 'vitals', metrics: ILLNESS_METRICS },
  { key: 'sleep', metrics: ['sleepScore', 'sleep', 'deep'] as const },
] as const;

export type IllnessReviewGroup = (typeof ILLNESS_REVIEW_GROUPS)[number]['key'];

// Von hier weiter exportiert: Die Anzeige muss sagen können, wie viele Tage
// noch fehlen, und soll dafür nicht die eigene Zahl 14 danebenstellen.
export { MINIMUM_SAMPLES };

/** Wie sich eine Größe über einen eingetragenen Zeitraum verhalten hat. */
export type IllnessMetricRow = {
  readonly metric: Metric;
  /** Rohmittel über die Tage mit Messung. `null`, wenn keiner etwas hat. */
  readonly average: number | null;
  /**
   * Gerichtete Abweichung, über dieselben Tage gemittelt. Negativ heißt
   * „schlechter als sonst". `null`, solange die Baseline zu dünn ist.
   */
  readonly z: number | null;
  /**
   * Die Mitte der Baseline, zurückgerechnet in die Einheit der Größe.
   *
   * Ohne sie ist „2,1σ daneben" eine Zahl ohne Bezug. Zurückgerechnet, weil die
   * HRV logarithmiert gerechnet wird und ihre Mitte sonst als ln(79) dastünde.
   */
  readonly baseline: number | null;
  /** Tage in der Baseline — die Zahl hinter „noch nicht genug Historie". */
  readonly sampleCount: number;
  /** Tage mit Messung im Zeitraum — nicht jede Nacht wird aufgezeichnet. */
  readonly days: number;
};

/**
 * Was der Körper während eines eingetragenen Zeitraums gemacht hat.
 *
 * Gibt **alle** geführten Größen zurück, nicht nur die auffälligen: Im
 * Rückblick ist „Atmung wie sonst" eine Information, im Verdacht wäre sie
 * Füllmaterial gewesen.
 *
 * Die Baseline schließt markierte Tage aus — auch die dieses Zeitraums. Der
 * Vergleich lautet damit „gegen dein gesundes Normal" und nicht „gegen einen
 * Durchschnitt, in dem die Krankheit schon steckt".
 *
 * Fehlendes wird unterschieden statt zusammengeworfen: `average === null` heißt
 * „an diesen Tagen wurde nichts gemessen", `z === null` heißt „zu wenig
 * Historie für einen Vergleich". Beides als einen Strich zu zeigen ließe den
 * Nutzer raten, welcher der beiden Mängel vorliegt.
 */
export function summariseIllness(input: {
  readonly series: MetricSeries;
  readonly from: CivilDate;
  readonly to: CivilDate;
  readonly annotations: readonly Annotation[];
  readonly referenceDate: CivilDate;
}): IllnessMetricRow[] {
  return METRIC_ORDER.map(metric => {
    const values =
      (input.series.get(metric) as MetricValues | undefined) ??
      new Map<CivilDate, number>();
    const stats = baselineStats(
      values,
      metric,
      input.referenceDate,
      DETECTION_PARAMS,
      input.annotations,
    );

    const raw: number[] = [];
    const deviations: number[] = [];
    for (let date = input.from; date <= input.to; date = addDays(date, 1)) {
      const value = values.get(date);
      if (value === undefined) continue;
      raw.push(value);
      if (stats === null) continue;
      const transformed = transform(value, metric, DETECTION_PARAMS);
      if (transformed !== null) {
        deviations.push(zScore(stats, transformed) * METRIC_DIRECTION[metric]);
      }
    }

    const undo = DETECTION_PARAMS.logTransform.has(metric)
      ? Math.exp
      : (value: number) => value;

    return {
      metric,
      average: raw.length === 0 ? null : mean(raw),
      z: deviations.length === 0 ? null : mean(deviations),
      baseline: stats === null ? null : undo(stats.center),
      sampleCount:
        stats?.count ??
        history(
          values,
          metric,
          input.referenceDate,
          DETECTION_PARAMS,
          input.annotations,
        ).length,
      days: raw.length,
    };
  });
}

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// MARK: - Intern

function judge(
  date: CivilDate,
  series: MetricSeries,
  baselines: ReadonlyMap<Metric, ReturnType<typeof baselineStats>>,
): DayVerdict | null {
  const zByMetric = new Map<Metric, number>();

  for (const metric of ILLNESS_METRICS) {
    const stats = baselines.get(metric) ?? null;
    if (stats === null) continue;

    const raw = (series.get(metric) as MetricValues | undefined)?.get(date);
    if (raw === undefined) continue;

    const value = transform(raw, metric, DETECTION_PARAMS);
    if (value === null) continue;

    zByMetric.set(metric, zScore(stats, value) * METRIC_DIRECTION[metric]);
  }

  const values = [...zByMetric.values()];
  if (values.length === 0) return null;

  const belowThreshold = values.filter(z => z <= FLAGGED_Z).length;
  const mean = values.reduce((sum, z) => sum + z, 0) / values.length;
  if (belowThreshold < MIN_FLAGGED_METRICS || mean > MIN_MEAN_Z) return null;

  return { date, zByMetric };
}

/** Auffällige Tage zu Zeiträumen zusammenfassen, kleine Lücken überbrückend. */
function groupIntoSpans(days: readonly DayVerdict[]): DayVerdict[][] {
  const spans: DayVerdict[][] = [];

  for (const day of days) {
    const current = spans[spans.length - 1];
    const previous = current?.[current.length - 1];
    if (
      current !== undefined &&
      previous !== undefined &&
      daysApart(previous.date, day.date) <= SPAN_GAP_DAYS + 1
    ) {
      current.push(day);
    } else {
      spans.push([day]);
    }
  }

  return spans;
}

function daysApart(from: CivilDate, to: CivilDate): number {
  let steps = 0;
  let cursor = from;
  // Höchstens die Fensterbreite; die Tage kommen sortiert und aus einem
  // begrenzten Bereich.
  while (cursor < to && steps <= DETECTION_WINDOW_DAYS) {
    cursor = addDays(cursor, 1);
    steps += 1;
  }
  return steps;
}

function toCandidate(span: readonly DayVerdict[]): IllnessCandidate {
  const totals = new Map<Metric, { sum: number; count: number }>();
  for (const day of span) {
    for (const [metric, z] of day.zByMetric) {
      const entry = totals.get(metric) ?? { sum: 0, count: 0 };
      totals.set(metric, { sum: entry.sum + z, count: entry.count + 1 });
    }
  }

  const markers = ILLNESS_METRICS.flatMap<IllnessMarker>(metric => {
    const entry = totals.get(metric);
    if (entry === undefined || entry.count === 0) return [];
    const z = entry.sum / entry.count;
    // Nur die Größen zeigen, die tatsächlich in die Richtung ausschlagen. Eine
    // unauffällige Zeile in der Begründung schwächt die Meldung, statt sie zu
    // belegen.
    return z <= FLAGGED_Z ? [{ metric, z }] : [];
  }).sort((a, b) => a.z - b.z);

  const from = span[0].date;
  const to = span[span.length - 1].date;
  return { from, to, dayCount: daysApart(from, to) + 1, markers };
}

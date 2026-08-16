import type { ReferenceDate } from '../civilDate';
import {
  METRIC_DIRECTION,
  METRIC_ORDER,
  type Metric,
  type MetricSeries,
  type MetricWeights,
} from '../metrics';
import type { Annotation } from './annotations';
import {
  baselineStats,
  history,
  transform,
  WORTHWHILE_Z,
  zScore,
} from './baseline';
import type { ModelDefinition, ModelId } from './models';
import {
  LOGIC_VERSION,
  cloneParams,
  paramsFingerprint,
  type BaselineStats,
  type EstimatorParams,
  type UsualRange,
} from './params';
import {
  DEFAULT_SCALE,
  DEFAULT_THRESHOLDS,
  scoreLabel,
  SCORE_MAX,
  SCORE_MIN,
  type ScoreLabel,
  type ScoreThresholds,
} from './scoreScale';
import { resolveModel, type EstimatorSettings } from './settings';
import { sleepDebtHours } from './sleepDebt';

export const SLEEP_DEBT_FACTOR = 2.1;

// Skala und Etikettengrenzen sind einstellbar und leben in `scoreScale`. Von
// hier weiter exportiert, weil sie zur öffentlichen Fläche des Scores gehören.
export { DEFAULT_SCALE, DEFAULT_THRESHOLDS, SCORE_MAX, SCORE_MIN, scoreLabel };
export type { ScoreLabel, ScoreThresholds };

export type Contribution = {
  readonly metric: Metric;
  /** Rohwert des Stichtags. `null`, wenn für den Tag nichts vorliegt. */
  readonly value: number | null;
  /** `null`, wenn die Baseline zu dünn ist — dann geht die Metrik nicht ein. */
  readonly z: number | null;
  /** Anteil am Score **nach** Renormalisierung. 0, wenn ausgeschlossen. */
  readonly weight: number;
  readonly sampleCount: number;
  readonly baseline: BaselineStats | null;
  /**
   * Ob die Baseline auf logarithmierten Werten gebildet wurde. Ohne diese
   * Angabe lässt sich `baseline` nicht in die Einheit der Metrik
   * zurückrechnen — eine Mitte von 4,1 ist dann kein Ruhepuls, sondern
   * ln(60 ms).
   */
  readonly isLogTransformed: boolean;
  readonly contributes: boolean;
  readonly exceedsWorthwhileChange: boolean;
  /** Das persönliche Normalband als ±1σ, zurückgerechnet in die Einheit. */
  readonly usualRange: UsualRange | null;
};

export type UnavailableReason =
  /** Keine Metrik hat genug Historie. */
  | 'insufficient_data'
  /** Alle Gewichte stehen auf null — die Datenlage ist nicht das Problem. */
  | 'no_weights';

export type ScoreResult = {
  readonly score: number | null;
  readonly label: ScoreLabel | null;
  readonly unavailableReason: UnavailableReason | null;
  readonly contributions: readonly Contribution[];
  /** Summe der Gewichte, die mangels Daten herausgenommen wurden. */
  readonly droppedWeight: number;
  /** Dieselbe Zahl als Anteil — bei Custom-Gewichten summiert sich nichts auf 1. */
  readonly droppedWeightFraction: number;
  readonly referenceDate: ReferenceDate;
  readonly modelId: ModelId;
  readonly params: EstimatorParams;
  readonly logicVersion: number;
  readonly paramsFingerprint: string;
};

export type ScoreInput = {
  readonly settings: EstimatorSettings;
  readonly series: MetricSeries;
  readonly annotations: readonly Annotation[];
  readonly referenceDate: ReferenceDate;
};

/**
 * Berechnet den Readiness-Score.
 *
 * ```
 * z_m = (x_m − center_W) / spread_W · dir_m
 * S   = clamp(50 + scale · Σ w_m·z_m, 1, 99)   [− 2.1 · debt]
 * ```
 *
 * `scale` ist einstellbar: Wie viele Punkte ein σ Abweichung wert ist, ist
 * eine Frage der Auflösung, keine des Verfahrens.
 */
export function score(input: ScoreInput): ScoreResult {
  const model = resolveModel(input.settings);
  const params = effectiveParams(input.settings.params, model);
  const weights = model.weights ?? {};

  const rows = METRIC_ORDER.filter(metric => weights[metric] !== undefined).map(
    metric =>
      evaluate({
        metric,
        weight: weights[metric] as number,
        series: input.series,
        annotations: input.annotations,
        params,
        date: input.referenceDate.date,
      }),
  );

  const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
  const usableWeight = rows
    .filter(row => row.z !== null)
    .reduce((sum, row) => sum + row.weight, 0);
  const droppedWeight = totalWeight - usableWeight;

  const shared = {
    droppedWeight,
    droppedWeightFraction: totalWeight > 0 ? droppedWeight / totalWeight : 0,
    referenceDate: input.referenceDate,
    modelId: model.id,
    params,
    logicVersion: LOGIC_VERSION,
    paramsFingerprint: paramsFingerprint(params),
  };

  if (usableWeight <= 0) {
    // Kein Gewicht gesetzt ist etwas anderes als keine Daten. Beides mit
    // „nicht genug Daten" zu beschriften schöbe dem Nutzer einen Mangel unter,
    // den seine Historie nicht hat.
    return {
      ...shared,
      score: null,
      label: null,
      unavailableReason: totalWeight <= 0 ? 'no_weights' : 'insufficient_data',
      contributions: rows.map(row => toContribution(row, 0, params)),
    };
  }

  let sum = 0;
  const contributions = rows.map(row => {
    const normalised = row.z === null ? 0 : row.weight / usableWeight;
    if (row.z !== null) sum += normalised * row.z;
    return toContribution(row, normalised, params);
  });

  let value = 50 + input.settings.scale * sum;
  if (model.appliesSleepDebt) {
    value -=
      SLEEP_DEBT_FACTOR *
      sleepDebtHours(
        input.series.get('sleep') ?? new Map(),
        input.referenceDate.date,
      );
  }

  // Runden, dann klemmen — die Reihenfolge gehört zum Ergebnis.
  const clamped = Math.min(SCORE_MAX, Math.max(SCORE_MIN, Math.round(value)));

  return {
    ...shared,
    score: clamped,
    label: scoreLabel(clamped, input.settings.thresholds),
    unavailableReason: null,
    contributions,
  };
}

/**
 * Eine Größe gegen die eigene Baseline gestellt, **ohne** sie zu gewichten.
 *
 * Der Score kennt nur seine Terme. Gemessen wird mehr: Die Hauttemperatur ist
 * in keinem Modell ein Term und bliebe sonst als einzige geführte Größe ohne
 * Auswertung. Gilt nur für Metriken **außerhalb** der Modellgewichte — sonst
 * stünde auf derselben Seite eine zweite, anders gerechnete Zahl für dieselbe
 * Metrik.
 */
export function observation(
  input: ScoreInput & { readonly metric: Metric },
): Contribution {
  const model = resolveModel(input.settings);
  const params = effectiveParams(input.settings.params, model);

  return toContribution(
    evaluate({
      metric: input.metric,
      weight: 0,
      series: input.series,
      annotations: input.annotations,
      params,
      date: input.referenceDate.date,
    }),
    0,
    params,
  );
}

// MARK: - Intern

function effectiveParams(
  params: EstimatorParams,
  model: ModelDefinition,
): EstimatorParams {
  const effective = cloneParams(params);
  if (model.usesLogHRV) {
    (effective.logTransform as Set<Metric>).add('hrv');
  }
  return effective;
}

type EvaluatedMetric = {
  metric: Metric;
  weight: number;
  value: number | null;
  z: number | null;
  stats: BaselineStats | null;
  count: number;
};

function evaluate(input: {
  metric: Metric;
  weight: number;
  series: MetricSeries;
  annotations: readonly Annotation[];
  params: EstimatorParams;
  date: number;
}): EvaluatedMetric {
  const values = input.series.get(input.metric) ?? new Map();
  const stats = baselineStats(
    values,
    input.metric,
    input.date,
    input.params,
    input.annotations,
  );
  const today = values.get(input.date) ?? null;

  let z: number | null = null;
  if (stats !== null && today !== null) {
    const transformed = transform(today, input.metric, input.params);
    if (transformed !== null) {
      z = zScore(stats, transformed) * METRIC_DIRECTION[input.metric];
    }
  }

  // Ohne Baseline zählt dieselbe Grundmenge, die sie gebildet hätte — sonst
  // zeigt die Zeile eine andere Zahl an, als gegen die Mindestmenge geprüft
  // wurde.
  const count =
    stats?.count ??
    history(values, input.metric, input.date, input.params, input.annotations)
      .length;

  return {
    metric: input.metric,
    weight: input.weight,
    value: today,
    z,
    stats,
    count,
  };
}

function toContribution(
  row: EvaluatedMetric,
  weight: number,
  params: EstimatorParams,
): Contribution {
  const isLogTransformed = params.logTransform.has(row.metric);
  const undo = isLogTransformed ? Math.exp : (value: number) => value;

  return {
    metric: row.metric,
    value: row.value,
    z: row.z,
    weight,
    sampleCount: row.count,
    baseline: row.stats,
    isLogTransformed,
    contributes: row.z !== null,
    exceedsWorthwhileChange: row.z !== null && Math.abs(row.z) >= WORTHWHILE_Z,
    usualRange:
      row.stats === null
        ? null
        : {
            low: undo(row.stats.center - row.stats.spread),
            center: undo(row.stats.center),
            high: undo(row.stats.center + row.stats.spread),
          },
  };
}

/** Gewichte des Modells, wie der Score sie sieht. */
export function modelWeights(settings: EstimatorSettings): MetricWeights {
  return resolveModel(settings).weights ?? {};
}

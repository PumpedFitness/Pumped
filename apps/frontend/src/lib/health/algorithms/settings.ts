import type { Metric, MetricWeights } from '../metrics';
import { MODELS, type ModelDefinition, type ModelId } from './models';
import { DEFAULT_PARAMS, type EstimatorParams } from './params';
import {
  DEFAULT_SCALE,
  DEFAULT_THRESHOLDS,
  type ScoreThresholds,
} from './scoreScale';

export type EstimatorSettings = {
  readonly modelId: ModelId;
  readonly customWeights: MetricWeights;
  readonly customUsesLogHRV: boolean;
  readonly customAppliesSleepDebt: boolean;
  readonly params: EstimatorParams;
  /** Punkte je σ gewichteter Abweichung. */
  readonly scale: number;
  /** Ab wann der Score welches Wort bekommt. */
  readonly thresholds: ScoreThresholds;
};

/** Vorgabe ist `rec`, nicht `z`. */
export const DEFAULT_SETTINGS: EstimatorSettings = {
  modelId: 'rec',
  customWeights: { hrv: 0.4, rhr: 0.25, sleep: 0.25, resp: 0.1 },
  customUsesLogHRV: false,
  customAppliesSleepDebt: false,
  params: DEFAULT_PARAMS,
  scale: DEFAULT_SCALE,
  thresholds: DEFAULT_THRESHOLDS,
};

/** Das aktive Modell mit aufgelösten Gewichten und Schaltern. */
export function resolveModel(settings: EstimatorSettings): ModelDefinition {
  const model = MODELS[settings.modelId];
  if (model.weights !== null) return model;
  return {
    id: model.id,
    weights: settings.customWeights,
    usesLogHRV: settings.customUsesLogHRV,
    appliesSleepDebt: settings.customAppliesSleepDebt,
  };
}

/** Gewichte des aktiven Modells, auf 1.0 normalisiert — nur für die Anzeige. */
export function activeWeights(settings: EstimatorSettings): MetricWeights {
  const raw = resolveModel(settings).weights ?? {};
  const total = Object.values(raw).reduce<number>(
    (sum, weight) => sum + (weight ?? 0),
    0,
  );
  if (total <= 0) return raw;

  const normalised: Partial<Record<Metric, number>> = {};
  for (const [metric, weight] of Object.entries(raw) as [Metric, number][]) {
    normalised[metric] = weight / total;
  }
  return normalised;
}

/**
 * Ein Gewicht zu ziehen schaltet auf Custom — sonst veränderte man ein
 * vordefiniertes Modell, und es hieße weiter wie vorher.
 *
 * Eingefroren werden **Gewichte und beide Schalter**. Nur die Gewichte zu
 * übernehmen hieße: Wer im Sleep-Modell einen Regler anfasst, verliert
 * schlagartig den Schlafdefizit-Abzug, und wer es im HRV-Modell tut, die
 * Log-Transformation. Der Score spränge ohne sichtbare Ursache.
 */
export function setWeight(
  settings: EstimatorSettings,
  metric: Metric,
  value: number,
): EstimatorSettings {
  const frozen =
    settings.modelId === 'custom'
      ? settings
      : {
          ...settings,
          modelId: 'custom' as const,
          customWeights:
            MODELS[settings.modelId].weights ?? settings.customWeights,
          customUsesLogHRV: MODELS[settings.modelId].usesLogHRV,
          customAppliesSleepDebt: MODELS[settings.modelId].appliesSleepDebt,
        };

  return {
    ...frozen,
    customWeights: { ...frozen.customWeights, [metric]: Math.max(0, value) },
  };
}

/**
 * Wie aus einer Abweichung eine Zahl und aus der Zahl ein Wort wird.
 *
 * Beides ist Geschmackssache und gehört deshalb dem Nutzer, nicht dem
 * Algorithmus: Die Terme sagen, wie weit heute vom eigenen Normal abweicht —
 * wie viele Punkte ein σ wert ist und ab wann das „bereit" heißt, sagt diese
 * Datei. Eigenes Modul, weil sowohl der Estimator als auch die Einstellungen
 * es brauchen und der Estimator die Einstellungen bereits importiert.
 */

export const SCORE_MIN = 1;
export const SCORE_MAX = 99;

/** Punkte je Standardabweichung gewichteter Abweichung. */
export const DEFAULT_SCALE = 16;

/** Der Regler bleibt in einem Bereich, in dem der Score noch lesbar ist. */
export const SCALE_MIN = 4;
export const SCALE_MAX = 40;

/** Produktsprache. Vor einer Übersetzung entscheiden, ob sie englisch bleibt. */
export type ScoreLabel =
  | 'PRIMED'
  | 'READY'
  | 'MODERATE'
  | 'STRAINED'
  | 'DEPLETED';

/** Die Etiketten mit einer Untergrenze, von oben nach unten. */
export type ThresholdLabel = Exclude<ScoreLabel, 'DEPLETED'>;

export const THRESHOLD_ORDER: readonly ThresholdLabel[] = [
  'PRIMED',
  'READY',
  'MODERATE',
  'STRAINED',
];

export type ScoreThresholds = Readonly<Record<ThresholdLabel, number>>;

export const DEFAULT_THRESHOLDS: ScoreThresholds = {
  PRIMED: 80,
  READY: 67,
  MODERATE: 45,
  STRAINED: 30,
};

export function scoreLabel(
  score: number,
  thresholds: ScoreThresholds = DEFAULT_THRESHOLDS,
): ScoreLabel {
  if (score >= thresholds.PRIMED) return 'PRIMED';
  if (score >= thresholds.READY) return 'READY';
  if (score >= thresholds.MODERATE) return 'MODERATE';
  if (score >= thresholds.STRAINED) return 'STRAINED';
  return 'DEPLETED';
}

export type ThresholdBounds = { readonly min: number; readonly max: number };

/**
 * Wie weit eine einzelne Schwelle wandern darf, ohne ihre Nachbarn zu
 * überholen.
 *
 * Die Grenze klemmt den gezogenen Wert, statt die Nachbarn mitzuschieben: Wer
 * „Bereit" nach oben zieht, will nicht nebenbei „Topfit" verschoben haben. Am
 * Anschlag steht der Regler still — das ist sichtbar, ein stiller Mitzug wäre
 * es nicht.
 */
export function thresholdBounds(
  thresholds: ScoreThresholds,
  label: ThresholdLabel,
): ThresholdBounds {
  const index = THRESHOLD_ORDER.indexOf(label);
  const above = THRESHOLD_ORDER[index - 1];
  const below = THRESHOLD_ORDER[index + 1];
  return {
    min: below === undefined ? SCORE_MIN : thresholds[below] + 1,
    max: above === undefined ? SCORE_MAX : thresholds[above] - 1,
  };
}

export function setThreshold(
  thresholds: ScoreThresholds,
  label: ThresholdLabel,
  value: number,
): ScoreThresholds {
  const { min, max } = thresholdBounds(thresholds, label);
  return { ...thresholds, [label]: Math.min(max, Math.max(min, value)) };
}

/**
 * Repariert gespeicherte Schwellen, die nicht mehr streng fallen.
 *
 * Gelesen wird aus MMKV, und dort kann eine ältere oder von Hand veränderte
 * Fassung liegen. Ein nicht fallender Satz ließe ein Etikett unerreichbar
 * werden, ohne dass die UI es zeigt.
 */
export function normalizeThresholds(value: unknown): ScoreThresholds {
  if (typeof value !== 'object' || value === null) return DEFAULT_THRESHOLDS;
  const raw = value as Partial<Record<ThresholdLabel, unknown>>;
  let previous = SCORE_MAX + 1;
  const result: Record<ThresholdLabel, number> = { ...DEFAULT_THRESHOLDS };

  for (const label of THRESHOLD_ORDER) {
    const candidate = raw[label];
    const fallback = DEFAULT_THRESHOLDS[label];
    const numeric =
      typeof candidate === 'number' && Number.isFinite(candidate)
        ? Math.round(candidate)
        : fallback;
    result[label] = Math.min(previous - 1, Math.max(SCORE_MIN, numeric));
    previous = result[label];
  }
  return result;
}

export function normalizeScale(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_SCALE;
  }
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(value)));
}

import { METRIC_ORDER, type Metric } from '../metrics';

export type CentralTendency = 'mean' | 'median';
export type SpreadKind = 'sd' | 'mad';

/**
 * Stellschrauben des Estimators.
 *
 * Die sichtbare Formel bleibt dieselbe. Was hier steht, sind die statistischen
 * Einwände als Parameter, nicht als zweite Formel.
 */
export type EstimatorParams = {
  readonly central: CentralTendency;
  readonly spread: SpreadKind;
  /**
   * Metriken, deren Verteilung log-normal ist und die vor der z-Bildung
   * logarithmiert werden. RMSSD gehört dazu: ohne Logarithmus ist die
   * Standardabweichung unbrauchbar und einzelne gute Nächte verzerren die
   * Referenz.
   */
  readonly logTransform: ReadonlySet<Metric>;
  readonly excludeAnnotated: boolean;
  readonly window: number;
  readonly outlierReject: boolean;
};

export type BaselineStats = {
  readonly center: number;
  readonly spread: number;
  /** Zahl der Werte **nach** dem Ausreißerverwurf. Darf unter 14 liegen. */
  readonly count: number;
};

export type UsualRange = {
  readonly low: number;
  readonly center: number;
  readonly high: number;
};

/** Verhalten wie im Design-Handoff, unverändert als Vergleichsmaßstab. */
export const HANDOFF_PARAMS: EstimatorParams = {
  central: 'mean',
  spread: 'sd',
  logTransform: new Set(),
  excludeAnnotated: false,
  window: 60,
  outlierReject: false,
};

/**
 * Der Auslieferungszustand: Handoff-Verhalten, aber ohne markierte Tage in der
 * Referenz.
 *
 * `HANDOFF_PARAMS` bleibt daneben stehen und behält `excludeAnnotated: false`.
 * Der Schalter dort umzulegen hieße, den Maßstab zu verstellen, gegen den das
 * Verfahren geprüft wird — und der Fingerabdruck führte weiterhin denselben
 * Namen für zwei verschiedene Rechnungen.
 *
 * Ohne diese Ausnahme wäre die Markierung folgenlos: Der Nutzer trüge ein, dass
 * er krank war, und die Woche zöge trotzdem seine Baseline nach unten — genau
 * das, wogegen die Markierung gedacht ist.
 */
export const DEFAULT_PARAMS: EstimatorParams = {
  ...HANDOFF_PARAMS,
  excludeAnnotated: true,
};

/** Robust gegen einzelne schlechte Wochen. */
export const ROBUST_PARAMS: EstimatorParams = {
  central: 'median',
  spread: 'mad',
  logTransform: new Set<Metric>(['hrv']),
  excludeAnnotated: true,
  window: 60,
  outlierReject: false,
};

/**
 * Tiefe Kopie.
 *
 * `{...params}` teilt das `Set`. Der Estimator fügt für Modelle mit
 * `usesLogHRV` die HRV hinzu — ohne Klon veränderte der erste Score dauerhaft
 * die übergebenen Parameter, und jeder folgende Score rechnete mit einer
 * Log-Transformation, die niemand angefordert hat. Swift versteckt das hinter
 * Value Semantics; hier ist es ein stiller, bleibender Fehler.
 */
export function cloneParams(params: EstimatorParams): EstimatorParams {
  return { ...params, logTransform: new Set(params.logTransform) };
}

/**
 * Version der Rechenschicht. Steigt, wenn sich der Algorithmus ändert.
 *
 * Wandert zusammen mit `paramsFingerprint` an jeden abgeleiteten Wert, damit
 * ein Recompute weiß, womit gerechnet wurde.
 */
export const LOGIC_VERSION = 1;

/**
 * Kanonischer Fingerabdruck der Parameter.
 *
 * Bewusst eine lesbare Zeichenkette und kein Hash — im Debugger sofort
 * verständlich und ohne Abhängigkeit. Eine feste Versionsnummer je Preset
 * täte es nicht: Ein verändertes Handoff-Preset trüge weiterhin dieselbe
 * Nummer, und ein Recompute könnte die beiden nicht unterscheiden.
 */
export function paramsFingerprint(params: EstimatorParams): string {
  const logged = METRIC_ORDER.filter(metric =>
    params.logTransform.has(metric),
  ).join(',');
  return [
    `c=${params.central}`,
    `s=${params.spread}`,
    `log=${logged}`,
    `ann=${params.excludeAnnotated ? 1 : 0}`,
    `w=${params.window}`,
    `out=${params.outlierReject ? 1 : 0}`,
  ].join(';');
}

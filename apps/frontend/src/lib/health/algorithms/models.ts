import type { MetricWeights } from '../metrics';

export const MODEL_IDS = ['z', 'rec', 'slp', 'custom'] as const;

export type ModelId = (typeof MODEL_IDS)[number];

/**
 * Ein Schätzer.
 *
 * Die Gewichte sind Produkt, kein Implementierungsdetail — sie werden in der UI
 * offengelegt. Name, Untertitel und Formeltext gehören nach i18n und stehen
 * deshalb nicht hier.
 */
export type ModelDefinition = {
  readonly id: ModelId;
  /** `null` bedeutet: Gewichte kommen aus der Nutzereinstellung. */
  readonly weights: MetricWeights | null;
  readonly usesLogHRV: boolean;
  readonly appliesSleepDebt: boolean;
};

/**
 * Der Schlafterm ist die **Nachtnote**, nicht die Stundenzahl.
 *
 * Vorher wog `sleep` — allein die Zeit im Schlaf. Tiefschlaf lag unbenotet
 * daneben, REM und Effizienz kamen gar nicht vor, obwohl alle drei gemessen
 * werden. Die Note fasst sie zusammen, und sie **ersetzt** die Dauer, statt
 * neben ihr zu stehen: Als eigener Term zählte die Dauer sonst zweimal, einmal
 * roh und einmal in der Note.
 *
 * Sie geht wie jede andere Größe als z-Wert gegen die eigene Baseline ein. Das
 * hält die Aussage des Scores einheitlich — „so weicht die Nacht von deinen
 * üblichen ab" — und bedeutet zugleich, dass gleichbleibend schlechter Schlaf
 * bei z≈0 landet. Für die absolute Untergrenze ist der Defizit-Term zuständig,
 * den `slp` mitführt.
 */
export const MODELS: Readonly<Record<ModelId, ModelDefinition>> = {
  z: {
    id: 'z',
    weights: { hrv: 0.4, rhr: 0.25, sleepScore: 0.25, resp: 0.1 },
    usesLogHRV: false,
    appliesSleepDebt: false,
  },
  rec: {
    id: 'rec',
    weights: { hrv: 0.6, rhr: 0.2, sleepScore: 0.15, resp: 0.05 },
    usesLogHRV: true,
    appliesSleepDebt: false,
  },
  slp: {
    id: 'slp',
    weights: { hrv: 0.25, rhr: 0.15, sleepScore: 0.5, resp: 0.1 },
    usesLogHRV: false,
    appliesSleepDebt: true,
  },
  // Gewichte **und** beide Schalter kommen aus den Einstellungen. Ein Regler
  // darf nicht nebenbei das Verhalten des verlassenen Modells wegwerfen.
  custom: {
    id: 'custom',
    weights: null,
    usesLogHRV: false,
    appliesSleepDebt: false,
  },
};

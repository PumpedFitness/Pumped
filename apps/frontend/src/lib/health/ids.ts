/**
 * Stabile Kennungen für die Rohschicht. **Werte niemals ändern** — sie stehen
 * als Integer in den `health_raw_*`-Tabellen und würden sonst bestehende Zeilen
 * umdeuten.
 *
 * Das ist das Vokabular, in dem die App über Messgrößen spricht. Welche Quelle
 * sie liefert und unter welchem Namen, steht hinter `HealthSource` — oberhalb
 * dieser Grenze kennt niemand mehr Googles Endpunkte oder Feldnamen.
 */
export const MetricId = {
  heartRate: 1,
  heartRateVariability: 2,
  dailyHeartRateVariability: 3,
  dailyRestingHeartRate: 4,
  sleep: 5,
  dailyRespiratoryRate: 6,
  respiratoryRateSleepSummary: 7,
  oxygenSaturation: 8,
  dailyOxygenSaturation: 9,
  dailySleepTemperatureDerivations: 10,
  steps: 11,
  activeZoneMinutes: 12,
  activeEnergyBurned: 13,
  distance: 14,
  exercise: 15,
  dailyVo2Max: 16,
} as const;

export type MetricId = (typeof MetricId)[keyof typeof MetricId];

/** Feldkennung innerhalb einer Metrik. Ebenfalls stabil. */
export const FieldId = {
  /** Einziger Wert eines Sample- oder Interval-Typs. */
  value: 0,

  hrvAverage: 1,
  hrvDeepSleep: 2,
  nonRemHeartRate: 3,
  entropy: 4,

  spo2Average: 5,
  spo2Lower: 6,
  spo2Upper: 7,

  tempNightly: 8,
  tempBaseline: 9,
  tempRelativeStddev30d: 10,

  vo2Max: 11,
  vo2Covariance: 12,

  // Active Zone Minutes kommen je Herzfrequenzzone getrennt — mehrere
  // Datenpunkte teilen sich denselben Zeitstempel und unterscheiden sich nur in
  // der Zone. Deshalb ist das Feld Teil des Primärschlüssels.
  azmFatBurn: 13,
  azmCardio: 14,
  azmPeak: 15,

  respDeep: 16,
  respLight: 17,
  respRem: 18,
  respFull: 19,
} as const;

export type FieldId = (typeof FieldId)[keyof typeof FieldId];

/**
 * Klartext für die Statuszeile während eines Syncs.
 *
 * Bewusst nicht der Endpunktname der Quelle — der gehört Google, nicht der
 * Größe, und bei einer zweiten Quelle hieße dieselbe Metrik unterwegs plötzlich
 * anders. Übersetzung gehört nach i18n.
 */
export const METRIC_ID_LABEL: Record<MetricId, string> = {
  [MetricId.heartRate]: 'heart rate',
  [MetricId.heartRateVariability]: 'heart rate variability',
  [MetricId.dailyHeartRateVariability]: 'daily heart rate variability',
  [MetricId.dailyRestingHeartRate]: 'resting heart rate',
  [MetricId.sleep]: 'sleep',
  [MetricId.dailyRespiratoryRate]: 'respiratory rate',
  [MetricId.respiratoryRateSleepSummary]: 'respiratory rate by sleep stage',
  [MetricId.oxygenSaturation]: 'oxygen saturation',
  [MetricId.dailyOxygenSaturation]: 'daily oxygen saturation',
  [MetricId.dailySleepTemperatureDerivations]: 'skin temperature',
  [MetricId.steps]: 'steps',
  [MetricId.activeZoneMinutes]: 'active zone minutes',
  [MetricId.activeEnergyBurned]: 'active energy',
  [MetricId.distance]: 'distance',
  [MetricId.exercise]: 'exercise',
  [MetricId.dailyVo2Max]: 'VO₂ max',
};

/**
 * Was die Auswertung braucht.
 *
 * Ohne `heartRate`: Der 3-Sekunden-Takt macht daraus Millionen Zeilen, und
 * nichts davon geht in einen Score ein. Eine Quelle, die davon nur einen Teil
 * kennt, liefert eben nur den Teil — der Sync schneidet die Liste gegen
 * `HealthSource.metrics`.
 */
export const ESSENTIAL_METRIC_IDS: readonly MetricId[] = [
  MetricId.dailyHeartRateVariability,
  MetricId.dailyRestingHeartRate,
  MetricId.sleep,
  MetricId.dailyRespiratoryRate,
  // Atemfrequenz je Schlafphase — eine Stichprobe je Nacht mit vier Feldern,
  // kein Zeitverlauf. Billig zu holen und die einzige Quelle für „wie ruhig
  // war die Atmung im Tiefschlaf".
  MetricId.respiratoryRateSleepSummary,
  MetricId.dailySleepTemperatureDerivations,
];

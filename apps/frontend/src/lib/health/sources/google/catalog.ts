import { FieldId, MetricId } from '../../ids';

export type RecordShape = 'sample' | 'interval' | 'daily' | 'session';

/**
 * Ein Datentyp der Google Health API.
 *
 * `endpoint` und `filterPrefix` verwenden **unterschiedliche Schreibweisen** —
 * `daily-heart-rate-variability` gegen `daily_heart_rate_variability`. Beide
 * stehen hier nebeneinander, damit sie nicht auseinanderlaufen können.
 */
export type DataTypeSpec = {
  readonly metric: MetricId;
  readonly endpoint: string;
  readonly filterPrefix: string;
  readonly payloadKey: string;
  readonly shape: RecordShape;
  /** Feldkennung und zugehöriger JSON-Schlüssel im Payload-Objekt. */
  readonly fields: readonly (readonly [FieldId, string])[];
  /**
   * Wenn gesetzt, ergibt sich die Feldkennung zur Laufzeit aus dem Wert dieses
   * Schlüssels statt aus `fields`. Nur Active Zone Minutes brauchen das — sie
   * liefern je Herzfrequenzzone einen eigenen Punkt zum selben Zeitstempel.
   */
  readonly discriminatorKey?: string;
};

/** `exercise` und `sleep` sind serverseitig hart auf 25 gedeckelt. */
export function pageSize(spec: DataTypeSpec): number {
  return spec.shape === 'session' ? 25 : 10_000;
}

/** Filterfeld nach Record-Form. */
export function timeField(spec: DataTypeSpec): string {
  switch (spec.shape) {
    case 'sample':
      return `${spec.filterPrefix}.sample_time.physical_time`;
    case 'interval':
      return `${spec.filterPrefix}.interval.start_time`;
    case 'daily':
      return `${spec.filterPrefix}.date`;
    case 'session':
      return `${spec.filterPrefix}.interval.end_time`;
  }
}

/** Googles Zonennamen auf die Feldkennung. `"FAT_BURN"` ist Googles Schreibweise. */
export function azmField(zone: string): FieldId {
  switch (zone) {
    case 'FAT_BURN':
      return FieldId.azmFatBurn;
    case 'CARDIO':
      return FieldId.azmCardio;
    case 'PEAK':
      return FieldId.azmPeak;
    default:
      return FieldId.value;
  }
}

/** Feldnamen sind gegen ein echtes Konto verifiziert, nicht aus der Doku geraten. */
export const DATA_TYPES: readonly DataTypeSpec[] = [
  {
    metric: MetricId.heartRate,
    endpoint: 'heart-rate',
    filterPrefix: 'heart_rate',
    payloadKey: 'heartRate',
    shape: 'sample',
    fields: [[FieldId.value, 'beatsPerMinute']],
  },
  {
    metric: MetricId.heartRateVariability,
    endpoint: 'heart-rate-variability',
    filterPrefix: 'heart_rate_variability',
    payloadKey: 'heartRateVariability',
    shape: 'sample',
    fields: [
      [FieldId.value, 'rootMeanSquareOfSuccessiveDifferencesMilliseconds'],
    ],
  },
  {
    metric: MetricId.dailyHeartRateVariability,
    endpoint: 'daily-heart-rate-variability',
    filterPrefix: 'daily_heart_rate_variability',
    payloadKey: 'dailyHeartRateVariability',
    shape: 'daily',
    fields: [
      [FieldId.hrvAverage, 'averageHeartRateVariabilityMilliseconds'],
      [
        FieldId.hrvDeepSleep,
        'deepSleepRootMeanSquareOfSuccessiveDifferencesMilliseconds',
      ],
      [FieldId.nonRemHeartRate, 'nonRemHeartRateBeatsPerMinute'],
      [FieldId.entropy, 'entropy'],
    ],
  },
  {
    metric: MetricId.dailyRestingHeartRate,
    endpoint: 'daily-resting-heart-rate',
    filterPrefix: 'daily_resting_heart_rate',
    payloadKey: 'dailyRestingHeartRate',
    shape: 'daily',
    fields: [[FieldId.value, 'beatsPerMinute']],
  },
  {
    metric: MetricId.sleep,
    endpoint: 'sleep',
    filterPrefix: 'sleep',
    payloadKey: 'sleep',
    shape: 'session',
    fields: [],
  },
  {
    metric: MetricId.dailyRespiratoryRate,
    endpoint: 'daily-respiratory-rate',
    filterPrefix: 'daily_respiratory_rate',
    payloadKey: 'dailyRespiratoryRate',
    shape: 'daily',
    fields: [[FieldId.value, 'breathsPerMinute']],
  },
  {
    metric: MetricId.respiratoryRateSleepSummary,
    endpoint: 'respiratory-rate-sleep-summary',
    filterPrefix: 'respiratory_rate_sleep_summary',
    payloadKey: 'respiratoryRateSleepSummary',
    shape: 'sample',
    fields: [
      [FieldId.respFull, 'fullSleepStats.breathsPerMinute'],
      [FieldId.respDeep, 'deepSleepStats.breathsPerMinute'],
      [FieldId.respLight, 'lightSleepStats.breathsPerMinute'],
      [FieldId.respRem, 'remSleepStats.breathsPerMinute'],
    ],
  },
  // Der Wertschlüssel ist hier **nicht** verifiziert: Die Sonde bekam für
  // diesen Typ keinen Datenpunkt zurück. Vor der Verwendung gegen ein echtes
  // Sample prüfen.
  {
    metric: MetricId.oxygenSaturation,
    endpoint: 'oxygen-saturation',
    filterPrefix: 'oxygen_saturation',
    payloadKey: 'oxygenSaturation',
    shape: 'sample',
    fields: [[FieldId.value, 'percentage']],
  },
  {
    metric: MetricId.dailyOxygenSaturation,
    endpoint: 'daily-oxygen-saturation',
    filterPrefix: 'daily_oxygen_saturation',
    payloadKey: 'dailyOxygenSaturation',
    shape: 'daily',
    fields: [
      [FieldId.spo2Average, 'averagePercentage'],
      [FieldId.spo2Lower, 'lowerBoundPercentage'],
      [FieldId.spo2Upper, 'upperBoundPercentage'],
    ],
  },
  // `baselineTemperatureCelsius` und `relativeNightlyStddev30dCelsius` kommen
  // als String `"NaN"`, solange Fitbit nicht kalibriert hat — `asNumber`
  // verwirft sie, gespeichert wird dann nur der Nachtwert. Alle drei sind
  // **absolute** Temperaturen in °C, keine Abweichungen.
  {
    metric: MetricId.dailySleepTemperatureDerivations,
    endpoint: 'daily-sleep-temperature-derivations',
    filterPrefix: 'daily_sleep_temperature_derivations',
    payloadKey: 'dailySleepTemperatureDerivations',
    shape: 'daily',
    fields: [
      [FieldId.tempNightly, 'nightlyTemperatureCelsius'],
      [FieldId.tempBaseline, 'baselineTemperatureCelsius'],
      [FieldId.tempRelativeStddev30d, 'relativeNightlyStddev30dCelsius'],
    ],
  },
  {
    metric: MetricId.steps,
    endpoint: 'steps',
    filterPrefix: 'steps',
    payloadKey: 'steps',
    shape: 'interval',
    fields: [[FieldId.value, 'count']],
  },
  {
    metric: MetricId.activeZoneMinutes,
    endpoint: 'active-zone-minutes',
    filterPrefix: 'active_zone_minutes',
    payloadKey: 'activeZoneMinutes',
    shape: 'interval',
    fields: [[FieldId.value, 'activeZoneMinutes']],
    discriminatorKey: 'heartRateZone',
  },
  {
    metric: MetricId.activeEnergyBurned,
    endpoint: 'active-energy-burned',
    filterPrefix: 'active_energy_burned',
    payloadKey: 'activeEnergyBurned',
    shape: 'interval',
    fields: [[FieldId.value, 'kcal']],
  },
  {
    metric: MetricId.distance,
    endpoint: 'distance',
    filterPrefix: 'distance',
    payloadKey: 'distance',
    shape: 'interval',
    fields: [[FieldId.value, 'millimeters']],
  },
  {
    metric: MetricId.exercise,
    endpoint: 'exercise',
    filterPrefix: 'exercise',
    payloadKey: 'exercise',
    shape: 'session',
    fields: [],
  },
  {
    metric: MetricId.dailyVo2Max,
    endpoint: 'daily-vo2-max',
    filterPrefix: 'daily_vo2_max',
    payloadKey: 'dailyVo2Max',
    shape: 'daily',
    fields: [
      [FieldId.vo2Max, 'vo2Max'],
      [FieldId.vo2Covariance, 'vo2MaxCovariance'],
    ],
  },
];

export const GOOGLE_METRICS: ReadonlySet<MetricId> = new Set(
  DATA_TYPES.map(spec => spec.metric),
);

export function specFor(metric: MetricId): DataTypeSpec | undefined {
  return DATA_TYPES.find(spec => spec.metric === metric);
}

import type { IconName } from '@pumped/ui/icons/ClayIcon';
import type { MetricKey } from '@/data/local/metrics/metricSamples';
import type { MetricAggregation } from './metricSeries';

/** How a metric's raw value is presented (and converted) for display. */
export type MetricUnit = 'weight' | 'percent' | 'tonnes' | 'count' | 'minutes';

export type MetricDef = {
  key: MetricKey;
  icon: IconName;
  unit: MetricUnit;
  /** How the samples inside one bucket combine into its value. */
  aggregation: MetricAggregation;
  /** Per-exercise metric — the widget config must carry an exerciseId. */
  needsExercise: boolean;
};

/**
 * Every metric the tracker widget can show. Adding a metric is one entry here,
 * one case in `loadMetricSamples` and a translation under
 * `widgets.metricTracker.metrics`.
 */
export const METRIC_CATALOG: Record<MetricKey, MetricDef> = {
  bodyweight: {
    key: 'bodyweight',
    icon: 'scale',
    unit: 'weight',
    aggregation: 'avg',
    needsExercise: false,
  },
  bodyFat: {
    key: 'bodyFat',
    icon: 'percent',
    unit: 'percent',
    aggregation: 'avg',
    needsExercise: false,
  },
  tonnage: {
    key: 'tonnage',
    icon: 'trend',
    unit: 'tonnes',
    aggregation: 'sum',
    needsExercise: false,
  },
  workouts: {
    key: 'workouts',
    icon: 'calendar',
    unit: 'count',
    aggregation: 'sum',
    needsExercise: false,
  },
  sets: {
    key: 'sets',
    icon: 'dumbbell',
    unit: 'count',
    aggregation: 'sum',
    needsExercise: false,
  },
  trainingTime: {
    key: 'trainingTime',
    icon: 'clock',
    unit: 'minutes',
    aggregation: 'sum',
    needsExercise: false,
  },
  e1rm: {
    key: 'e1rm',
    icon: 'award',
    unit: 'weight',
    aggregation: 'max',
    needsExercise: true,
  },
  topWeight: {
    key: 'topWeight',
    icon: 'target',
    unit: 'weight',
    aggregation: 'max',
    needsExercise: true,
  },
};

export const METRIC_KEYS = Object.keys(METRIC_CATALOG) as MetricKey[];

export function isMetricKey(value: unknown): value is MetricKey {
  return typeof value === 'string' && value in METRIC_CATALOG;
}

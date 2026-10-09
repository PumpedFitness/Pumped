import type { MetricKey } from '@/data/local/metrics/metricSamples';
import { isMetricKey } from './metricCatalog';
import {
  DEFAULT_RANGE_BUCKET,
  RANGE_BUCKETS,
  type MetricBucket,
  type MetricRange,
} from './metricSeries';

export type MetricChart = 'number' | 'line' | 'bar';

export const METRIC_CHARTS: MetricChart[] = ['number', 'line', 'bar'];
export const METRIC_RANGES: MetricRange[] = ['1m', '3m', '6m', '1y'];

/** Persisted per widget instance, inside its layout placement. */
export type MetricTrackerConfig = {
  metric: MetricKey;
  /** Only for per-exercise metrics (see MetricDef.needsExercise). */
  exerciseId: string | null;
  chart: MetricChart;
  range: MetricRange;
  bucket: MetricBucket;
};

export const DEFAULT_METRIC_TRACKER_CONFIG: MetricTrackerConfig = {
  metric: 'tonnage',
  exerciseId: null,
  chart: 'bar',
  range: '3m',
  bucket: 'week',
};

function oneOf<T extends string>(
  value: unknown,
  options: readonly T[],
  fallback: T,
): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

/**
 * Reads a stored config defensively — the layout lives in MMKV and outlives
 * app versions, so anything unknown falls back instead of crashing the grid.
 */
export function parseMetricTrackerConfig(raw: unknown): MetricTrackerConfig {
  if (typeof raw !== 'object' || raw === null) {
    return DEFAULT_METRIC_TRACKER_CONFIG;
  }
  const value = raw as Record<string, unknown>;
  const range = oneOf(
    value.range,
    METRIC_RANGES,
    DEFAULT_METRIC_TRACKER_CONFIG.range,
  );
  return {
    metric: isMetricKey(value.metric)
      ? value.metric
      : DEFAULT_METRIC_TRACKER_CONFIG.metric,
    exerciseId: typeof value.exerciseId === 'string' ? value.exerciseId : null,
    chart: oneOf(
      value.chart,
      METRIC_CHARTS,
      DEFAULT_METRIC_TRACKER_CONFIG.chart,
    ),
    range,
    bucket: oneOf(
      value.bucket,
      RANGE_BUCKETS[range],
      DEFAULT_RANGE_BUCKET[range],
    ),
  };
}

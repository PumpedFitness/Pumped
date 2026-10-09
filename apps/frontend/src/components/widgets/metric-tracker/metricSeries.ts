import type { MetricSample } from '@/data/local/metrics/metricSamples';

export type MetricAggregation = 'sum' | 'avg' | 'max' | 'last';
export type MetricRange = '1m' | '3m' | '6m' | '1y';
export type MetricBucket = 'day' | 'week' | 'month';

const RANGE_MONTHS: Record<MetricRange, number> = {
  '1m': 1,
  '3m': 3,
  '6m': 6,
  '1y': 12,
};

/** Bucket sizes that give a readable number of points for each range. */
export const RANGE_BUCKETS: Record<MetricRange, MetricBucket[]> = {
  '1m': ['day', 'week'],
  '3m': ['day', 'week'],
  '6m': ['week', 'month'],
  '1y': ['week', 'month'],
};

export const DEFAULT_RANGE_BUCKET: Record<MetricRange, MetricBucket> = {
  '1m': 'day',
  '3m': 'week',
  '6m': 'week',
  '1y': 'month',
};

export type MetricSeriesPoint = {
  /** Local-time start of the bucket (unix ms). */
  start: number;
  /** Aggregated value, or null for a bucket without samples (avg/max/last). */
  value: number | null;
};

export type MetricSeries = {
  points: MetricSeriesPoint[];
  /** Value of the latest bucket that has one — the headline number. */
  current: number | null;
  /** Value of the bucket with a value before `current`, for the delta. */
  previous: number | null;
};

/** Local-midnight start of the bucket containing `t` (weeks start Monday). */
export function bucketStart(t: number, bucket: MetricBucket): number {
  const date = new Date(t);
  date.setHours(0, 0, 0, 0);
  if (bucket === 'week') {
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  } else if (bucket === 'month') {
    date.setDate(1);
  }
  return date.getTime();
}

function nextBucketStart(start: number, bucket: MetricBucket): number {
  const date = new Date(start);
  if (bucket === 'day') date.setDate(date.getDate() + 1);
  else if (bucket === 'week') date.setDate(date.getDate() + 7);
  else date.setMonth(date.getMonth() + 1);
  return date.getTime();
}

/** Start of the first bucket a range covers — samples before it are ignored. */
export function seriesStart(
  range: MetricRange,
  bucket: MetricBucket,
  now: number,
): number {
  const date = new Date(now);
  date.setMonth(date.getMonth() - RANGE_MONTHS[range]);
  return nextBucketStart(bucketStart(date.getTime(), bucket), bucket);
}

function aggregate(
  values: number[],
  aggregation: MetricAggregation,
): number | null {
  if (aggregation === 'sum') {
    return values.reduce((total, value) => total + value, 0);
  }
  if (values.length === 0) return null;
  if (aggregation === 'avg') {
    return values.reduce((total, value) => total + value, 0) / values.length;
  }
  if (aggregation === 'max') return Math.max(...values);
  return values[values.length - 1];
}

/**
 * Buckets time-ordered samples into consecutive day/week/month slots covering
 * `range` up to `now`, and aggregates each slot. Empty `sum` slots are 0 (no
 * training that week is a real zero); empty slots of the other aggregations
 * are null (no weigh-in is not a weight of 0).
 */
export function buildMetricSeries(
  samples: MetricSample[],
  options: {
    range: MetricRange;
    bucket: MetricBucket;
    aggregation: MetricAggregation;
    now: number;
  },
): MetricSeries {
  const { range, bucket, aggregation, now } = options;
  const starts: number[] = [];
  for (
    let start = seriesStart(range, bucket, now);
    start <= now;
    start = nextBucketStart(start, bucket)
  ) {
    starts.push(start);
  }

  const grouped: number[][] = starts.map(() => []);
  let index = 0;
  [...samples]
    .sort((a, b) => a.t - b.t)
    .forEach(sample => {
      if (starts.length === 0 || sample.t < starts[0] || sample.t > now) return;
      while (index + 1 < starts.length && sample.t >= starts[index + 1]) {
        index += 1;
      }
      grouped[index].push(sample.value);
    });

  const points = starts.map((start, i) => ({
    start,
    value: aggregate(grouped[i], aggregation),
  }));

  const filled = points.filter(point => point.value != null);
  return {
    points,
    current: filled[filled.length - 1]?.value ?? null,
    previous: filled[filled.length - 2]?.value ?? null,
  };
}

import type { WeightUnit } from '@/data/local/schema/userProfile';
import type { ExerciseChartPoint } from '@/hooks/useExerciseAnalytics';
import { displayWeight } from '@/utils/units';

export type TrendMetric = 'strength' | 'volume' | 'bodyweight';

export type TrendSeries = {
  /** Chart values, oldest → newest, already in display units. */
  values: number[];
  /** Latest value (last of `values`) or null when empty. */
  latest: number | null;
  /** Change vs. the first plotted point, in display units. */
  delta: number | null;
};

// The chart shows a rolling window; the design calls it "Last 8 weeks".
export const TREND_WINDOW = 8;

// Axis labels for the plotted window (design: W1 · W3 · W5 · W7 · Now).
export const TREND_AXIS_LABELS = ['W1', 'W3', 'W5', 'W7', 'Now'] as const;

function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/**
 * Takes the daily analytics points for one metric, keeps the most recent
 * `TREND_WINDOW` of them, and converts kg-based series into display units.
 * Bodyweight/volume are already-metric numbers we pass through with the same
 * unit conversion so the axis and big number agree.
 */
export function buildTrendSeries(
  points: ExerciseChartPoint[],
  { convertWeight, weightUnit }: { convertWeight: boolean; weightUnit: WeightUnit },
): TrendSeries {
  const windowed = points.slice(-TREND_WINDOW);
  const values = windowed.map(point => {
    const value = convertWeight
      ? displayWeight(point.value, weightUnit)
      : point.value;
    return roundTo(value, 1);
  });

  if (values.length === 0) {
    return { values, latest: null, delta: null };
  }

  const latest = values[values.length - 1];
  const first = values[0];
  const delta = values.length > 1 ? roundTo(latest - first, 1) : null;

  return { values, latest, delta };
}

/** "+4.0" / "-1.2" / "0.0" — always signed so the chip reads as a change. */
export function formatDelta(delta: number): string {
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
  return `${sign}${Math.abs(delta).toFixed(1)}`;
}

/** Big-number display: whole for large magnitudes, one decimal otherwise. */
export function formatMetricValue(value: number): string {
  if (Math.abs(value) >= 1000) {
    return Math.round(value).toLocaleString();
  }
  return roundTo(value, 1).toLocaleString();
}

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  METRIC_TABLES,
  loadMetricSamples,
} from '@/data/local/metrics/metricSamples';
import { useTableQuery } from '@/data/local/tableVersions';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import {
  METRIC_CATALOG,
  type MetricUnit,
} from '@/components/widgets/metric-tracker/metricCatalog';
import {
  buildMetricSeries,
  bucketStart,
  seriesStart,
  type MetricSeries,
} from '@/components/widgets/metric-tracker/metricSeries';
import type { MetricTrackerConfig } from '@/components/widgets/metric-tracker/metricTrackerConfig';
import { displayWeight } from '@/utils/units';
import { useUserProfile } from './useUserProfile';

export type MetricSeriesResult = {
  series: MetricSeries;
  unitLabel: string;
  format: (value: number) => string;
};

function toDisplayUnit(
  value: number,
  unit: MetricUnit,
  weightUnit: WeightUnit,
): number {
  if (unit === 'weight') return displayWeight(value, weightUnit);
  if (unit === 'tonnes') return value / 1000;
  return value;
}

const DECIMALS: Record<MetricUnit, number> = {
  weight: 1,
  percent: 1,
  tonnes: 1,
  count: 0,
  minutes: 0,
};

/**
 * The aggregated series for one tracker widget config, in display units.
 * Re-runs when the metric's tables change; the window is anchored to the start
 * of today so it stays stable (and cached) across renders within a day.
 */
export function useMetricSeries(
  config: MetricTrackerConfig,
): MetricSeriesResult {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const def = METRIC_CATALOG[config.metric];
  const today = bucketStart(Date.now(), 'day');
  const since = seriesStart(config.range, config.bucket, today);

  const samples = useTableQuery(
    METRIC_TABLES[config.metric],
    () => loadMetricSamples(config.metric, config, since),
    [config.metric, config.exerciseId, since],
  );

  return useMemo(() => {
    const weightUnit = profile.weightUnit;
    const series = buildMetricSeries(
      samples.map(sample => ({
        t: sample.t,
        value: toDisplayUnit(sample.value, def.unit, weightUnit),
      })),
      {
        range: config.range,
        bucket: config.bucket,
        aggregation: def.aggregation,
        now: Date.now(),
      },
    );
    const decimals = DECIMALS[def.unit];
    return {
      series,
      unitLabel:
        def.unit === 'weight'
          ? weightUnit
          : t(`widgets.metricTracker.units.${def.unit}`),
      format: (value: number) => value.toFixed(decimals),
    };
  }, [samples, def, config.range, config.bucket, profile.weightUnit, t]);
}

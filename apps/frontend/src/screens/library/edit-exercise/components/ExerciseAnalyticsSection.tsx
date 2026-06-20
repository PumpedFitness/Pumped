import { useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { SegmentedControl } from '@/components/clay/SegmentedControl';
import { MetricChart } from '@/screens/tracking/metric-history/components/MetricChart';
import type {
  ExerciseChartMetric,
  ExerciseChartPoint,
} from '@/hooks/useExerciseAnalytics';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import { displayWeight } from '@/utils/units';

type ExerciseAnalyticsSectionProps = {
  chartData: Record<ExerciseChartMetric, ExerciseChartPoint[]>;
  weightUnit: WeightUnit;
};

function convertPoints(
  metric: ExerciseChartMetric,
  points: ExerciseChartPoint[],
  weightUnit: WeightUnit,
): ExerciseChartPoint[] {
  if (metric === 'maxReps') return points;
  return points.map(point => ({
    ...point,
    value: displayWeight(point.value, weightUnit),
  }));
}

export function ExerciseAnalyticsSection({
  chartData,
  weightUnit,
}: ExerciseAnalyticsSectionProps) {
  const { t } = useTranslation();
  const [metric, setMetric] = useState<ExerciseChartMetric>('volume');
  const data = convertPoints(metric, chartData[metric], weightUnit);
  const latest = data.at(-1);
  const unit =
    metric === 'maxReps' ? t('exerciseOverview.analytics.reps') : weightUnit;

  return (
    <Card>
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="t-heading">
            {t('exerciseOverview.analytics.title')}
          </Text>
          <Text className="t-caption mt-1 text-text-secondary">
            {t('exerciseOverview.analytics.subtitle')}
          </Text>
        </View>
        {latest ? (
          <View className="items-end">
            <Text className="t-eyebrow text-muted">
              {t('exerciseOverview.analytics.latest')}
            </Text>
            <Text className="t-label">
              {Math.round(latest.value).toLocaleString()} {unit}
            </Text>
          </View>
        ) : null}
      </View>

      <SegmentedControl
        className="mt-4"
        value={metric}
        onChange={value => setMetric(value as ExerciseChartMetric)}
        options={[
          {
            value: 'volume',
            label: t('exerciseOverview.analytics.metrics.volume'),
          },
          {
            value: 'topWeight',
            label: t('exerciseOverview.analytics.metrics.topWeight'),
          },
          {
            value: 'estimated1Rm',
            label: t('exerciseOverview.analytics.metrics.estimated1Rm'),
          },
          {
            value: 'maxReps',
            label: t('exerciseOverview.analytics.metrics.maxReps'),
          },
        ]}
      />

      {data.length >= 2 ? (
        <View className="mt-4">
          <MetricChart data={data} height={170} yAxisUnit={unit} />
        </View>
      ) : (
        <View className="mt-4 rounded-[18px] border border-dashed border-border-soft bg-surface-sunk px-4 py-8">
          <Text className="t-label text-center">
            {t('exerciseOverview.analytics.emptyTitle')}
          </Text>
          <Text className="t-caption mt-2 text-center text-text-secondary">
            {t('exerciseOverview.analytics.emptyBody')}
          </Text>
        </View>
      )}
    </Card>
  );
}

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MetricChart } from '@/screens/tracking/metric-history/components/MetricChart';
import { displayWeight } from '@/utils/units';
import type {
  ExerciseChartMetric,
  ExerciseChartPoint,
} from '@/hooks/useExerciseAnalytics';
import type { WeightUnit } from '@/data/local/schema/userProfile';

type DashboardVolumeTrendProps = {
  chartData: Record<ExerciseChartMetric, ExerciseChartPoint[]>;
  weightUnit: WeightUnit;
};

type TrendMetric = Exclude<ExerciseChartMetric, 'maxReps'>;

const CHIPS = [
  { metric: 'volume', labelKey: 'exerciseOverview.analytics.metrics.volume' },
  {
    metric: 'topWeight',
    labelKey: 'exerciseOverview.analytics.metrics.topWeight',
  },
  {
    metric: 'estimated1Rm',
    labelKey: 'exerciseOverview.analytics.metrics.estimated1Rm',
  },
] as const;

export function DashboardVolumeTrend({
  chartData,
  weightUnit,
}: DashboardVolumeTrendProps) {
  const { t } = useTranslation();
  const [metric, setMetric] = useState<TrendMetric>('volume');
  const data = chartData[metric].map(point => ({
    ...point,
    value: displayWeight(point.value, weightUnit),
  }));

  return (
    <View className="rounded-[20px] border border-border-hairline bg-surface-card p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-[13.5px] font-bold text-foreground">
          {t('exerciseOverview.dashboard.volumeTrend')}
        </Text>
        <View className="flex-row gap-[5px]">
          {CHIPS.map(chip => {
            const active = chip.metric === metric;
            return (
              <Pressable
                key={chip.metric}
                onPress={() => setMetric(chip.metric)}
                className={`rounded-full px-[9px] py-[3px] active:opacity-70 ${
                  active ? 'bg-accent' : ''
                }`}
              >
                <Text
                  className={`text-[11px] ${
                    active
                      ? 'font-bold text-accent-foreground'
                      : 'font-semibold text-muted'
                  }`}
                >
                  {t(chip.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {data.length >= 2 ? (
        <View className="mt-[10px]">
          <MetricChart data={data} height={92} yAxisUnit={weightUnit} />
        </View>
      ) : (
        <View className="mt-[10px] rounded-[16px] border border-dashed border-border-soft bg-surface-sunk px-4 py-6">
          <Text className="text-center text-[13.5px] font-semibold text-foreground">
            {t('exerciseOverview.analytics.emptyTitle')}
          </Text>
          <Text className="mt-2 text-center text-[12.5px] text-text-secondary">
            {t('exerciseOverview.analytics.emptyBody')}
          </Text>
        </View>
      )}
    </View>
  );
}

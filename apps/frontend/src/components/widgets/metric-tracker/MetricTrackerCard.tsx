import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@pumped/ui/clay/Card';
import { Badge } from '@pumped/ui/clay/Pill';
import { BarGroup } from '@pumped/ui/clay/BarRow';
import { LineChart } from '@pumped/ui/clay/LineChart';
import { Sparkline } from '@pumped/ui/clay/Sparkline';
import { colors } from '@pumped/ui/theme/tokens';
import { useExerciseOptions } from '@/hooks/useExerciseOptions';
import { useMetricSeries } from '@/hooks/useMetricSeries';
import { WidgetLabelRow } from '../shell/WidgetLabelRow';
import { METRIC_CATALOG } from './metricCatalog';
import type { MetricSeriesPoint } from './metricSeries';
import type { MetricTrackerConfig } from './metricTrackerConfig';

type MetricTrackerCardProps = {
  config: MetricTrackerConfig;
  colSpan: number;
  width: number;
};

type MetricChartProps = {
  config: MetricTrackerConfig;
  points: MetricSeriesPoint[];
  colSpan: number;
  width: number;
};

// bar-idle for all but the last two bars (ink, accent) per the v2 spec.
function barColors(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    if (i === n - 1) return colors.accent;
    if (i === n - 2) return colors.ink;
    return colors.barIdle;
  });
}

function barGap(count: number): number {
  if (count > 40) return 1;
  if (count > 16) return 2;
  return 4;
}

function MetricChart({ config, points, colSpan, width }: MetricChartProps) {
  if (config.chart === 'bar') {
    const values = points.map(point => point.value ?? 0);
    const max = Math.max(...values, 0);
    if (max <= 0) return null;
    return (
      <BarGroup
        heights={values.map(value => value / max)}
        height={colSpan === 3 ? 64 : colSpan === 2 ? 38 : 28}
        gap={barGap(values.length)}
        colors={barColors(values.length)}
      />
    );
  }

  const values = points.flatMap(point =>
    point.value == null ? [] : [point.value],
  );
  if (values.length < 2) return null;
  if (colSpan === 3) {
    return <LineChart data={values} height={96} />;
  }
  return (
    <Sparkline
      data={values}
      color={colors.accent}
      width={width}
      height={colSpan === 2 ? 34 : 28}
      fillArea
    />
  );
}

/** "Bench Press · e1RM" for per-exercise metrics, the metric name otherwise.
 *  `missingExercise` flags a per-exercise config with no (or a deleted) exercise. */
function useMetricTitle(config: MetricTrackerConfig): {
  title: string;
  missingExercise: boolean;
} {
  const { t } = useTranslation();
  const exerciseOptions = useExerciseOptions();
  const metricName = t(`widgets.metricTracker.metrics.${config.metric}`);
  if (!METRIC_CATALOG[config.metric].needsExercise) {
    return { title: metricName, missingExercise: false };
  }
  const exerciseName = exerciseOptions.find(
    option => option.id === config.exerciseId,
  )?.name;
  return exerciseName
    ? {
        title: t('widgets.metricTracker.titleForExercise', {
          metric: metricName,
          exercise: exerciseName,
        }),
        missingExercise: false,
      }
    : { title: metricName, missingExercise: true };
}

type MetricValueProps = {
  config: MetricTrackerConfig;
  current: number;
  previous: number | null;
  unitLabel: string;
  format: (value: number) => string;
  showDelta: boolean;
};

function MetricValue({
  config,
  current,
  previous,
  unitLabel,
  format,
  showDelta,
}: MetricValueProps) {
  const { t } = useTranslation();
  const delta = previous != null ? current - previous : null;
  return (
    <>
      <View className="flex-row items-baseline">
        <Text
          className="text-[30px] font-[800] tracking-[-0.9px] text-foreground"
          numberOfLines={1}
        >
          {format(current)}
        </Text>
        {unitLabel ? (
          <Text className="ml-[3px] text-[13px] font-[600] text-muted">
            {unitLabel}
          </Text>
        ) : null}
      </View>
      {delta != null && showDelta ? (
        <Text className="text-[12px] font-[600] text-muted">
          {t('widgets.metricTracker.delta', {
            delta: `${delta >= 0 ? '+' : ''}${format(delta)}`,
            unit: unitLabel,
            period: t(`widgets.metricTracker.previous.${config.bucket}`),
          })}
        </Text>
      ) : null}
    </>
  );
}

/** The tracker widget's face — also the live preview in its config screen. */
export function MetricTrackerCard({
  config,
  colSpan,
  width,
}: MetricTrackerCardProps) {
  const { t } = useTranslation();
  const { series, unitLabel, format } = useMetricSeries(config);
  const { title, missingExercise } = useMetricTitle(config);
  const pad = colSpan === 1 ? 15 : 16;
  const { current } = series;

  return (
    <Card radius="lg" pad={pad}>
      <View className="gap-[10px]">
        <WidgetLabelRow
          label={title}
          right={
            colSpan > 1 ? (
              <Badge tone="accent">
                {t(`widgets.metricTracker.ranges.${config.range}`)}
              </Badge>
            ) : undefined
          }
        />
        {current == null || missingExercise ? (
          <Text className="text-[13px] font-[500] leading-[1.4] text-muted">
            {missingExercise
              ? t('widgets.metricTracker.pickExercise')
              : t('widgets.metricTracker.empty')}
          </Text>
        ) : (
          <>
            <MetricValue
              config={config}
              current={current}
              previous={series.previous}
              unitLabel={unitLabel}
              format={format}
              showDelta={colSpan > 1}
            />
            {config.chart !== 'number' ? (
              <MetricChart
                config={config}
                points={series.points}
                colSpan={colSpan}
                width={width - pad * 2 - 2}
              />
            ) : null}
          </>
        )}
      </View>
    </Card>
  );
}

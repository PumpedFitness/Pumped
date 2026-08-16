import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Annotation } from '@/lib/health/algorithms/annotations';
import type { Contribution } from '@/lib/health/algorithms/estimator';
import { MINIMUM_SAMPLES } from '@/lib/health/algorithms/baseline';
import type { CivilDate } from '@/lib/health/civilDate';
import type { SeriesPoint } from '@/lib/health/stats/series';
import { formatMetric, formatSigma, METRIC_UNIT } from '../formatMetric';
import { ScrubbableChart } from './ScrubbableChart';

type VitalCardProps = {
  contribution: Contribution;
  points: readonly SeriesPoint[];
  width: number;
  formatDate: (date: CivilDate) => string;
  annotations: readonly Annotation[];
};

/**
 * Eine Größe im Verlauf, mit ihrem Normalband.
 *
 * „Ruhepuls 52, dein Normalbereich 48–54" sagt mehr als eine Prozentzahl.
 * Solange die Baseline zu dünn ist, steht dort keine erfundene Spanne, sondern
 * der Stand der Historie.
 */
export function VitalCard({
  contribution,
  points,
  width,
  formatDate,
  annotations,
}: VitalCardProps) {
  const { t } = useTranslation();
  const { metric, value, baseline, usualRange } = contribution;
  const unit = METRIC_UNIT[metric];

  return (
    <View
      style={{ width }}
      className="rounded-[22px] border border-border-hairline bg-surface-card p-4"
    >
      <View className="flex-row items-baseline">
        <Text className="flex-1 text-[13px] font-semibold text-foreground">
          {t(`health.metric.${metric}`)}
        </Text>
        <Text className="text-[12.5px] text-muted">
          {formatSigma(contribution.z)}
        </Text>
      </View>

      <View className="flex-row items-baseline gap-1 mt-0.5">
        <Text className="text-[27px] font-[800] text-foreground tracking-[-0.7px]">
          {value === null ? '—' : formatMetric(metric, value)}
        </Text>
        {unit !== '' ? (
          <Text className="text-[13px] text-muted">{unit}</Text>
        ) : null}
      </View>

      <View className="mt-2">
        <ScrubbableChart
          points={points}
          band={usualRange}
          width={width - 32}
          height={78}
          formatValue={value =>
            `${formatMetric(metric, value)}${unit === '' ? '' : ` ${unit}`}`
          }
          formatDate={formatDate}
          annotations={annotations}
        />
      </View>

      {points.length > 1 ? (
        <View className="flex-row justify-between mt-1.5">
          <Text className="text-[11.5px] text-muted">
            {formatDate(points[0].date)}
          </Text>
          <Text className="text-[11.5px] text-muted">
            {formatDate(points[points.length - 1].date)}
          </Text>
        </View>
      ) : null}

      <Text className="text-[12px] text-muted mt-1.5">
        {usualRange !== null && baseline !== null
          ? t('health.metrics.usualRange', {
              low: formatMetric(metric, usualRange.low),
              high: formatMetric(metric, usualRange.high),
              unit,
              count: baseline.count,
            })
          : t('health.metrics.needMore', {
              have: contribution.sampleCount,
              need: MINIMUM_SAMPLES,
            })}
      </Text>
    </View>
  );
}

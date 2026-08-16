import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sparkline } from '@pumped/ui/clay/Sparkline';
import { colors } from '@pumped/ui/theme/tokens';
import type { Contribution } from '@/lib/health/algorithms/estimator';
import type { SeriesPoint } from '@/lib/health/stats/series';
import { formatMetric, METRIC_UNIT } from '../formatMetric';

type ContributionRowProps = {
  contribution: Contribution;
  minimumSamples: number;
  points: readonly SeriesPoint[];
};

/**
 * Eine Größe mit ihrem Normalband.
 *
 * „Ruhepuls 52, dein Normalbereich 48–54" sagt mehr als eine Prozentzahl.
 * Solange die Baseline zu dünn ist, steht dort keine erfundene Spanne, sondern
 * der Stand der Historie.
 */
export function ContributionRow({
  contribution,
  minimumSamples,
  points,
}: ContributionRowProps) {
  const { t } = useTranslation();
  const { metric, value, z, baseline, usualRange, weight } = contribution;
  const unit = METRIC_UNIT[metric];

  return (
    <View className="rounded-[22px] border border-border-hairline bg-surface-card p-4">
      <View className="flex-row items-baseline gap-2">
        <Text className="flex-1 text-[11px] font-bold uppercase tracking-[1.3px] text-muted">
          {t(`health.metric.${metric}`)}
        </Text>
        {weight > 0 ? (
          <Text className="text-[11px] font-semibold text-muted">
            {Math.round(weight * 100)}%
          </Text>
        ) : null}
      </View>

      <View className="flex-row items-end gap-2 mt-1">
        <Text className="text-[26px] font-[800] text-foreground tracking-[-0.6px]">
          {value === null ? '—' : formatMetric(metric, value)}
        </Text>
        {value !== null && unit !== '' ? (
          <Text className="text-[13px] text-muted mb-[5px]">{unit}</Text>
        ) : null}
        <View className="flex-1" />
        {points.length > 1 ? (
          <View className="mb-[3px]">
            <Sparkline
              data={points.map(point => point.value)}
              color={colors.accent}
              width={86}
              height={26}
            />
          </View>
        ) : null}
      </View>

      {usualRange !== null && baseline !== null ? (
        <Text className="text-[12px] text-muted mt-2">
          {t('health.metrics.usualRange', {
            low: formatMetric(metric, usualRange.low),
            high: formatMetric(metric, usualRange.high),
            unit,
            count: baseline.count,
          })}
        </Text>
      ) : (
        <Text className="text-[12px] text-muted mt-2">
          {t('health.metrics.needMore', {
            have: contribution.sampleCount,
            need: minimumSamples,
          })}
        </Text>
      )}

      {z !== null && contribution.exceedsWorthwhileChange ? (
        <Text className="text-[12px] font-semibold text-accent mt-1.5">
          {t(z > 0 ? 'health.metrics.aboveUsual' : 'health.metrics.belowUsual')}
        </Text>
      ) : null}
    </View>
  );
}

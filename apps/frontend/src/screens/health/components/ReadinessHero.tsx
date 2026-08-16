import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import {
  SCORE_MAX,
  type Contribution,
  type ScoreResult,
} from '@/lib/health/algorithms/estimator';
import type { Metric } from '@/lib/health/metrics';
import { formatCompactHours, formatMetric, METRIC_UNIT } from '../formatMetric';
import { SegmentGauge } from './SegmentGauge';

type ReadinessHeroProps = {
  result: ScoreResult;
  /**
   * Größen ohne Gewicht.
   *
   * Die Zeit im Schlaf steht seit dem Wechsel auf die Nachtnote hier und nicht
   * mehr unter den Termen. Sie bleibt trotzdem eine der drei Zahlen, die man
   * morgens sucht — der Fußzeile ist egal, ob eine Größe gewichtet wird.
   */
  observations: readonly Contribution[];
};

const STATS: readonly Metric[] = ['hrv', 'rhr', 'sleep'];

function StatColumn({
  metric,
  value,
  first,
}: {
  metric: Metric;
  value: number | null;
  first: boolean;
}) {
  const { t } = useTranslation();
  const text =
    value === null
      ? '—'
      : metric === 'sleep'
      ? formatCompactHours(value)
      : formatMetric(metric, value);
  const unit = metric === 'sleep' ? 'hr' : METRIC_UNIT[metric];

  return (
    <View
      className={
        'flex-1 ' +
        (first ? '' : 'border-l border-[rgba(250,247,242,0.16)] pl-4')
      }
    >
      <View className="flex-row items-baseline gap-1">
        <Text
          className="text-[27px] font-[800] tracking-[-0.8px]"
          style={{ color: colors.cream }}
        >
          {text}
        </Text>
        <Text className="text-[12px]" style={{ color: colors.creamDim }}>
          {unit}
        </Text>
      </View>
      <Text
        className="text-[11.5px] mt-[1px]"
        style={{ color: colors.creamDim }}
      >
        {t(`health.short.${metric}`)}
      </Text>
    </View>
  );
}

/**
 * Die Bereitschaft als dunkle Karte — der eine Blick vor dem Training.
 *
 * Die drei Werte unten sind bewusst die Terme mit dem größten Gewicht und nicht
 * „alles, was wir haben": Eine Zahlenwand liest niemand vor dem ersten Satz.
 */
export function ReadinessHero({ result, observations }: ReadinessHeroProps) {
  const { t } = useTranslation();
  const hasScore = result.score !== null && result.label !== null;

  const valueOf = (metric: Metric) =>
    [...result.contributions, ...observations].find(
      entry => entry.metric === metric,
    )?.value ?? null;

  return (
    <View
      className="rounded-[26px] px-5 pt-5 pb-5 overflow-hidden"
      style={{ backgroundColor: colors.moss }}
    >
      <View className="flex-row items-start">
        <View className="flex-row items-center gap-2.5 flex-1">
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(250,247,242,0.12)' }}
          >
            <ClayIcon name="pulse" size={17} color={colors.cream} />
          </View>
          <Text
            className="text-[16px] font-bold"
            style={{ color: colors.cream }}
          >
            {t('health.metrics.readiness')}
          </Text>
        </View>
        <View className="items-end">
          <Text
            className="text-[14px] font-semibold"
            style={{ color: colors.cream }}
          >
            {t(`health.model.${result.modelId}.name`)}
          </Text>
          <Text className="text-[11.5px]" style={{ color: colors.creamDim }}>
            {t('health.settings.model')}
          </Text>
        </View>
      </View>

      {hasScore ? (
        <>
          <View className="flex-row items-end mt-4">
            <Text
              className="text-[64px] font-[800] tracking-[-2.5px] leading-[68px]"
              style={{ color: colors.cream }}
            >
              {result.score}
            </Text>
            <Text
              className="text-[19px] font-semibold mb-[11px] ml-0.5"
              style={{ color: colors.creamDim }}
            >
              /{SCORE_MAX}
            </Text>
            <View className="flex-1" />
            <Text
              className="text-[14px] font-bold uppercase tracking-[1.4px] mb-[14px]"
              style={{ color: colors.accentHover }}
            >
              {t(`health.label.${result.label}`)}
            </Text>
          </View>

          <View className="flex-row justify-between mt-1 mb-1.5">
            <Text className="text-[11px]" style={{ color: colors.creamDim }}>
              0
            </Text>
            <Text className="text-[11px]" style={{ color: colors.creamDim }}>
              {SCORE_MAX}
            </Text>
          </View>

          <SegmentGauge
            fraction={(result.score ?? 0) / SCORE_MAX}
            filled={colors.accentHover}
            empty="rgba(250,247,242,0.14)"
          />
        </>
      ) : (
        <Text
          className="text-[19px] font-bold mt-4 mb-3 leading-[26px]"
          style={{ color: colors.cream }}
        >
          {t(
            result.unavailableReason === 'no_weights'
              ? 'health.metrics.noWeightsTitle'
              : 'health.metrics.notEnoughTitle',
          )}
        </Text>
      )}

      <View className="flex-row gap-4 pt-4 mt-1 border-t border-[rgba(250,247,242,0.16)]">
        {STATS.map((metric, index) => (
          <StatColumn
            key={metric}
            metric={metric}
            value={valueOf(metric)}
            first={index === 0}
          />
        ))}
      </View>
    </View>
  );
}

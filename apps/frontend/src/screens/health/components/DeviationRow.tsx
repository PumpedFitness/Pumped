import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@pumped/ui/theme/tokens';
import type { Contribution } from '@/lib/health/algorithms/estimator';
import { formatMetric, formatSigma, METRIC_UNIT } from '../formatMetric';

type DeviationRowProps = {
  contribution: Contribution;
};

/** Bis hierhin reicht die Skala — jenseits von 3σ ist der Ausschlag nur noch groß. */
const SIGMA_LIMIT = 3;
const TICKS = 25;

/**
 * Eine Größe als Abweichung von der eigenen Mitte.
 *
 * Die Strichskala ist bewusst nicht beschriftet: Die Zahl steht daneben, und
 * was zählt, ist die Lage zur Mitte — nicht ein ablesbarer σ-Wert an einer
 * winzigen Achse.
 */
export function DeviationRow({ contribution }: DeviationRowProps) {
  const { t } = useTranslation();
  const { metric, value, z, weight } = contribution;
  const unit = METRIC_UNIT[metric];

  const center = (TICKS - 1) / 2;
  const position =
    z === null
      ? null
      : center +
        (Math.max(-SIGMA_LIMIT, Math.min(SIGMA_LIMIT, z)) / SIGMA_LIMIT) *
          center;

  return (
    <View className="py-3">
      <View className="flex-row items-baseline">
        <Text className="flex-1 text-[14px] font-semibold text-foreground">
          {t(`health.metric.${metric}`)}
        </Text>
        <Text className="text-[14px] font-semibold text-foreground">
          {value === null ? '—' : formatMetric(metric, value)}
          {unit !== '' ? (
            <Text className="text-[12px] text-muted"> {unit}</Text>
          ) : null}
        </Text>
        <Text className="text-[12.5px] text-muted w-[58px] text-right">
          {formatSigma(z)}
        </Text>
      </View>

      <View className="flex-row items-center h-[18px] mt-2 gap-[3px]">
        {Array.from({ length: TICKS }, (_, index) => {
          const isCenter = index === center;
          const isMark = position !== null && Math.abs(index - position) < 0.5;
          return (
            <View
              key={index}
              className="flex-1 rounded-[1px]"
              style={{
                height: isMark ? 18 : isCenter ? 12 : 8,
                backgroundColor: isMark
                  ? colors.accent
                  : isCenter
                  ? colors.muted
                  : colors.barIdle,
              }}
            />
          );
        })}
      </View>

      {weight > 0 ? (
        <Text className="text-[11.5px] text-muted mt-1.5">
          {t('health.metrics.weightShare', {
            percent: Math.round(weight * 100),
          })}
        </Text>
      ) : null}
    </View>
  );
}

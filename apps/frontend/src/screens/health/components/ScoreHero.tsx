import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import type { ScoreResult } from '@/lib/health/algorithms/estimator';

type ScoreHeroProps = {
  result: ScoreResult;
  daysStale: number;
};

/**
 * Der Score, sein Etikett und — wenn es etwas zu sagen gibt — warum er fehlt.
 *
 * Ein fehlender Score bekommt hier keine Ersatzzahl. „Nicht genug Daten" und
 * „kein Gewicht gesetzt" sind zwei verschiedene Zustände und lesen sich auch
 * verschieden; sie zu vermengen schöbe dem Nutzer einen Mangel unter, den seine
 * Historie nicht hat.
 */
export function ScoreHero({ result, daysStale }: ScoreHeroProps) {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={FadeInDown.duration(320)}
      className="rounded-[26px] border border-border-hairline bg-surface-card px-6 py-7 items-center"
    >
      <Text className="text-[11px] font-bold uppercase tracking-[2px] text-accent">
        {t(`health.model.${result.modelId}.name`)}
      </Text>

      {result.score === null || result.label === null ? (
        <>
          <Text className="text-[26px] font-[800] text-foreground tracking-[-0.5px] mt-3 text-center">
            {t(
              result.unavailableReason === 'no_weights'
                ? 'health.metrics.noWeightsTitle'
                : 'health.metrics.notEnoughTitle',
            )}
          </Text>
          <Text className="text-[13.5px] text-muted mt-2 text-center leading-[20px]">
            {t(
              result.unavailableReason === 'no_weights'
                ? 'health.metrics.noWeightsBody'
                : 'health.metrics.notEnoughBody',
            )}
          </Text>
        </>
      ) : (
        <>
          <Text className="text-[76px] font-[800] text-foreground tracking-[-3px] leading-[82px] mt-1">
            {result.score}
          </Text>
          <Text className="text-[13px] font-bold uppercase tracking-[2.4px] text-foreground">
            {t(`health.label.${result.label}`)}
          </Text>
        </>
      )}

      {daysStale > 0 ? (
        <View className="flex-row items-center gap-2 mt-4">
          <ClayIcon name="clock" size={14} color={colors.muted} />
          <Text className="text-[12px] text-muted">
            {t('health.metrics.stale', { count: daysStale })}
          </Text>
        </View>
      ) : null}

      {result.score !== null && result.droppedWeightFraction > 0 ? (
        <View className="flex-row items-center gap-2 mt-3 px-3">
          <ClayIcon name="warning" size={14} color={colors.muted} />
          <Text className="flex-1 text-[12px] text-muted leading-[17px]">
            {t('health.metrics.dropped', {
              percent: Math.round(result.droppedWeightFraction * 100),
            })}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

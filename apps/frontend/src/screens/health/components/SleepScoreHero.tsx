import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import { SCORE_MAX } from '@/lib/health/algorithms/estimator';
import type { SleepScoreResult } from '@/lib/health/algorithms/sleepScore';
import { SegmentGauge } from './SegmentGauge';

type SleepScoreHeroProps = {
  result: SleepScoreResult;
  /** Die Zeit im Schlaf — die eine Zahl, die jeder zuerst sucht. */
  hoursAsleep: number | null;
  formatHours: (hours: number) => string;
};

/**
 * Die Nachtnote als dunkle Karte, gebaut wie der Readiness-Hero.
 *
 * Dieselbe Form für dieselbe Art Aussage: eine Zahl auf 1–99 mit Band, Etikett
 * und Skala. Zwei verschieden gestaltete Karten für zwei Scores auf derselben
 * Skala ließen den Nutzer vermuten, sie bedeuteten Verschiedenes.
 */
export function SleepScoreHero({
  result,
  hoursAsleep,
  formatHours,
}: SleepScoreHeroProps) {
  const { t } = useTranslation();
  if (result.score === null || result.label === null) return null;

  return (
    <View
      className="rounded-[26px] px-5 pt-5 pb-5 overflow-hidden mb-2.5"
      style={{ backgroundColor: colors.moss }}
    >
      <View className="flex-row items-center">
        <View className="flex-row items-center gap-2.5 flex-1">
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(250,247,242,0.12)' }}
          >
            <ClayIcon name="moon" size={17} color={colors.cream} />
          </View>
          <Text
            className="text-[16px] font-bold"
            style={{ color: colors.cream }}
          >
            {t('health.sleepScore.title')}
          </Text>
        </View>
        {hoursAsleep === null ? null : (
          <View className="items-end">
            <Text
              className="text-[14px] font-semibold"
              style={{ color: colors.cream }}
            >
              {formatHours(hoursAsleep)}
            </Text>
            <Text className="text-[11.5px]" style={{ color: colors.creamDim }}>
              {t('health.short.sleep')}
            </Text>
          </View>
        )}
      </View>

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
        fraction={result.score / SCORE_MAX}
        filled={colors.accentHover}
        empty="rgba(250,247,242,0.14)"
      />
    </View>
  );
}

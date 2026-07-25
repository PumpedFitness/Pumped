import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TrendMetric } from '../trendsModel';

type CalculationPanelProps = {
  metric: TrendMetric;
};

type CalcExplanationKey = `trends.calc.${TrendMetric}`;

const EXPLANATION_KEY: Record<TrendMetric, CalcExplanationKey> = {
  strength: 'trends.calc.strength',
  volume: 'trends.calc.volume',
  bodyweight: 'trends.calc.bodyweight',
};

export function CalculationPanel({ metric }: CalculationPanelProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-2 rounded-[22px] bg-[rgba(252,251,250,0.6)] p-[18px]">
      <Text className="text-[12px] font-[600] leading-none text-muted">
        {t('trends.calc.label')}
      </Text>
      <Text className="text-[13px] font-[500] leading-[1.6] text-foreground-secondary">
        {t(EXPLANATION_KEY[metric])}
      </Text>
    </View>
  );
}

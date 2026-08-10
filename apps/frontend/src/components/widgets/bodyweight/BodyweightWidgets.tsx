import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@pumped/ui/clay/Card';
import { Sparkline } from '@pumped/ui/clay/Sparkline';
import { colors } from '@pumped/ui/theme/tokens';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';
import { WidgetLabelRow } from '../shell/WidgetLabelRow';

type WidgetProps = { colSpan: number; width: number };

function BodyweightValue() {
  const { t } = useTranslation();
  const { bodyweightValue, weightUnitLabel } = useHomeWidgetData();
  if (bodyweightValue == null) {
    return (
      <Text className="text-[13px] font-[500] leading-[1.4] text-cream-dim">
        {t('widgets.bodyweight.empty')}
      </Text>
    );
  }
  return (
    <View className="flex-row items-baseline">
      <Text className="text-[30px] font-[800] tracking-[-0.9px] text-cream">
        {bodyweightValue.toFixed(1)}
      </Text>
      <Text className="ml-[3px] text-[13px] font-[600] text-cream-dim">
        {weightUnitLabel}
      </Text>
    </View>
  );
}

export function BodyweightCompactWidget(_props: WidgetProps) {
  const { t } = useTranslation();
  return (
    <Card variant="raised" radius="lg" pad={15}>
      <View className="gap-[10px]">
        <WidgetLabelRow label={t('widgets.bodyweight.title')} inverted />
        <BodyweightValue />
      </View>
    </Card>
  );
}

export function BodyweightWideWidget(_props: WidgetProps) {
  const { t } = useTranslation();
  const { bodyweightDeltaPerWeek, bodyweightSpark, weightUnitLabel } =
    useHomeWidgetData();
  return (
    <Card variant="raised" radius="lg" pad={16}>
      <View className="gap-[12px]">
        <WidgetLabelRow label={t('widgets.bodyweight.title')} inverted />
        <BodyweightValue />
        {bodyweightDeltaPerWeek != null ? (
          <Text className="text-[12px] font-[600] text-cream-dim">
            {t('widgets.bodyweight.trend', {
              delta: `${bodyweightDeltaPerWeek >= 0 ? '+' : ''}${bodyweightDeltaPerWeek.toFixed(1)}`,
              unit: weightUnitLabel,
            })}
          </Text>
        ) : null}
        {bodyweightSpark.length > 1 ? (
          <Sparkline
            data={bodyweightSpark}
            color={colors.cream}
            width={140}
            height={30}
          />
        ) : null}
      </View>
    </Card>
  );
}

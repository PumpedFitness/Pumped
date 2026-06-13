import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { RingGauge } from '@/components/clay/RingGauge';
import { Button } from '@/components/clay/Button';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';

type RecoveryWidgetProps = {
  colSpan: number;
  width: number;
};

export function RecoveryWidget(_props: RecoveryWidgetProps) {
  const { t } = useTranslation();

  return (
    <Card variant="raised" radius="2xl" pad={20}>
      <View className="flex-row items-center gap-4">
        <RingGauge value={86} size={84} thickness={11}>
          <Text className="text-[21px] font-bold text-cream tracking-[-0.3px]">
            86
          </Text>
          <Text className="text-[11px] font-bold text-cream-dim uppercase tracking-[1.2px] mt-[-2px]">
            {t('widgets.recovery.ready')}
          </Text>
        </RingGauge>

        <View className="flex-1">
          <Text className="text-[11px] font-bold text-cream-dim uppercase tracking-[1.2px] mb-1">
            {t('widgets.recovery.title')}
          </Text>
          <Text className="text-xl font-bold text-cream leading-[26px]">
            {t('widgets.recovery.primed')}
          </Text>
        </View>
      </View>

      <View className="h-px bg-border-on-moss mt-4 mb-[14px]" />

      <View className="flex-row items-center">
        <View className="flex-1 flex-row gap-5">
          <View>
            <Text className="text-[21px] font-bold text-cream">6</Text>
            <Text className="text-[11px] text-cream-dim mt-[2px]">
              {t('widgets.recovery.movements')}
            </Text>
          </View>
          <View>
            <View className="flex-row items-baseline">
              <Text className="text-[21px] font-bold text-cream">48</Text>
              <Text className="text-[12.5px] font-medium text-cream-dim ml-[2px]">
                m
              </Text>
            </View>
            <Text className="text-[11px] text-cream-dim mt-[2px]">
              {t('widgets.recovery.estTime')}
            </Text>
          </View>
        </View>

        <Button
          variant="primary"
          size="sm"
          iconRight={
            <ClayIcon name="play" size={16} color={colors.accentInk} />
          }
        >
          {t('widgets.recovery.start')}
        </Button>
      </View>
    </Card>
  );
}

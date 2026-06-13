import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';

type WeeklyVolumeWidgetProps = {
  colSpan: number;
  width: number;
};

export function WeeklyVolumeWidget(_props: WeeklyVolumeWidgetProps) {
  const { t } = useTranslation();

  return (
    <Card variant="raised" radius="lg" pad={15}>
      <Text className="text-[12.5px] font-semibold text-cream-dim">
        {t('widgets.weeklyVolume.title')}
      </Text>
      <View className="flex-row items-baseline mt-[6px]">
        <Text className="text-[28px] font-bold text-cream tabular-nums tracking-[-0.3px]">
          24.8k
        </Text>
        <Text className="text-[13.5px] font-medium text-cream-dim ml-1">
          kg
        </Text>
      </View>
    </Card>
  );
}

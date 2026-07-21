import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';
import { useAppSettingsStore } from '@/stores/appSettingsStore';
import { displayWeight } from '@/utils/units';

type WeeklyVolumeWidgetProps = {
  colSpan: number;
  width: number;
};

export function WeeklyVolumeCompactWidget(_props: WeeklyVolumeWidgetProps) {
  const { t } = useTranslation();
  const { weeklyVolumeKg } = useHomeWidgetData();
  const weightUnit = useAppSettingsStore(state => state.weightUnit);
  const volume = displayWeight(weeklyVolumeKg, weightUnit);
  const formatted =
    volume >= 1000
      ? `${(volume / 1000).toFixed(1)}k`
      : Math.round(volume).toLocaleString();

  return (
    <Card variant="raised" radius="lg" pad={15}>
      <Text className="text-[12.5px] font-semibold text-cream-dim">
        {t('widgets.weeklyVolume.title')}
      </Text>
      <View className="flex-row items-baseline mt-[6px]">
        <Text className="text-[28px] font-bold text-cream tabular-nums tracking-[-0.3px]">
          {formatted}
        </Text>
        <Text className="text-[13.5px] font-medium text-cream-dim ml-1">
          {weightUnit}
        </Text>
      </View>
    </Card>
  );
}

import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';

type NextWorkoutWidgetProps = {
  colSpan: number;
  width: number;
};

export function LastSessionFullWidget(_props: NextWorkoutWidgetProps) {
  const { t } = useTranslation();
  const { lastWorkout } = useHomeWidgetData();

  return (
    <Card variant="card" radius="2xl" pad={18}>
      <View className="flex-row items-center gap-[14px]">
        <View className="w-11 h-11 rounded-[14px] bg-accent-soft items-center justify-center">
          <ClayIcon name="dumbbell" size={22} color={colors.accent} />
        </View>

        <View className="flex-1">
          <Text className="text-[12.5px] text-muted font-medium">
            {t('widgets.lastSession.caption')}
          </Text>
          <Text className="text-[15px] font-bold text-foreground mt-[2px]">
            {lastWorkout?.name ?? t('widgets.lastSession.title')}
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          <ClayIcon name="award" size={16} color={colors.sage} />
          <Text className="text-[13.5px] font-semibold text-sage">
            {lastWorkout
              ? t('common.minutesShort', { count: lastWorkout.durationMinutes })
              : t('widgets.lastSession.prs', { count: 0 })}
          </Text>
        </View>
      </View>
    </Card>
  );
}

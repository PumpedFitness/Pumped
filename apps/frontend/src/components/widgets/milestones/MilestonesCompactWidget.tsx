import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';
import { colors } from '@/theme/tokens';

type MilestonesCompactWidgetProps = { colSpan: number; width: number };

function nextMilestone(count: number): number {
  if (count < 10) return 10;
  if (count < 25) return 25;
  if (count < 50) return 50;
  return Math.ceil((count + 1) / 100) * 100;
}

export function MilestonesCompactWidget(_props: MilestonesCompactWidgetProps) {
  const { t } = useTranslation();
  const count = useHomeWidgetData().lifetimeWorkoutCount;
  const target = nextMilestone(count);

  return (
    <Card radius="lg" pad={15}>
      <View className="flex-row items-center justify-between">
        <Text className="t-caption font-semibold text-muted">
          {t('widgets.milestones.title')}
        </Text>
        <ClayIcon name="star" size={16} color={colors.accent} />
      </View>
      <Text className="mt-2 text-[28px] font-bold text-foreground">
        {count}
      </Text>
      <Text className="text-[11px] text-muted">
        {t('widgets.milestones.remaining', { count: target - count, target })}
      </Text>
    </Card>
  );
}

import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { RingGauge } from '@/components/clay/RingGauge';
import {
  localDayIndex,
  startOfWeek,
  templateIdsForDay,
} from '@/data/local/schedules/scheduleResolution';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';
import { useSchedules } from '@/hooks/useSchedules';

type WeeklyGoalWideWidgetProps = { colSpan: number; width: number };

export function WeeklyGoalWideWidget(_props: WeeklyGoalWideWidgetProps) {
  const { t } = useTranslation();
  const { activeSchedule } = useSchedules();
  const { workouts } = useHomeWidgetData();
  const today = localDayIndex();
  const weekStart = startOfWeek(today);
  const target = activeSchedule
    ? Array.from(
        { length: 7 },
        (_, day) => templateIdsForDay(activeSchedule, weekStart + day).length,
      ).reduce((sum, value) => sum + value, 0)
    : 0;
  const completed = workouts.filter(workout => {
    const day = localDayIndex(workout.startedAt);
    return day >= weekStart && day < weekStart + 7;
  }).length;
  const goal = target || Math.max(3, completed);

  return (
    <Card radius="lg" pad={15}>
      <View className="flex-row items-center gap-3">
        <RingGauge
          value={Math.min(100, (completed / goal) * 100)}
          size={58}
          thickness={7}
        >
          <Text className="text-[16px] font-bold text-cream">
            {completed}/{goal}
          </Text>
        </RingGauge>
        <View className="flex-1">
          <Text className="t-caption font-semibold text-muted">
            {t('widgets.weeklyGoal.title')}
          </Text>
          <Text className="t-heading mt-1">
            {t('widgets.weeklyGoal.summary', {
              count: Math.max(0, goal - completed),
            })}
          </Text>
        </View>
      </View>
    </Card>
  );
}

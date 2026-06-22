import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '@/components/clay/Card';
import { useSchedules } from '@/hooks/useSchedules';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import {
  localDayIndex,
  resolveDay,
  startOfWeek,
} from '@/data/local/schedules/scheduleResolution';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { openCurrentWorkout } from '@/navigation/openCurrentWorkout';

type ScheduleWidgetProps = {
  colSpan: number;
  width: number;
};

type DayStatus = 'done' | 'today' | 'rest' | 'upcoming';

// 2024-01-01 was a Monday — used only to derive localized weekday labels.
function weekdayLabel(language: string, mondayOffset: number): string {
  return new Date(Date.UTC(2024, 0, 1 + mondayOffset))
    .toLocaleDateString(language, { weekday: 'short', timeZone: 'UTC' })
    .slice(0, 2);
}

const DOT_CLASSES: Record<DayStatus, string> = {
  done: 'bg-sage',
  today: 'bg-accent',
  rest: 'bg-muted',
  upcoming: 'bg-text-secondary',
};

export function ScheduleWidget(_props: ScheduleWidgetProps) {
  const { t, i18n } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { schedules, today, todayTemplateIds } = useSchedules();
  const { templates, sessions } = useWorkoutTemplates();
  const { currentWorkout, startTemplateWorkout } = useCurrentWorkout();

  const templateNames = useMemo(
    () => new Map(templates.map(template => [template.id, template.name])),
    [templates],
  );

  const completedDays = useMemo(
    () =>
      new Set(
        sessions
          .filter(session => session.endedAt)
          .map(session => localDayIndex(session.startedAt)),
      ),
    [sessions],
  );

  const days = useMemo(() => {
    const weekStart = startOfWeek(today);
    return Array.from({ length: 7 }, (_, weekday) => {
      const dayIndex = weekStart + weekday;
      const hasWorkout = resolveDay(schedules, dayIndex).templateIds.length > 0;
      let status: DayStatus;
      if (dayIndex === today) {
        status = 'today';
      } else if (!hasWorkout) {
        status = 'rest';
      } else if (dayIndex < today) {
        status = completedDays.has(dayIndex) ? 'done' : 'rest';
      } else {
        status = 'upcoming';
      }
      return { weekday, status };
    });
  }, [completedDays, schedules, today]);

  const todayName =
    todayTemplateIds.length > 0
      ? templateNames.get(todayTemplateIds[0]) ?? null
      : null;

  const onPress = () => {
    if (!todayName) {
      return;
    }
    if (currentWorkout) {
      openCurrentWorkout(navigation);
      return;
    }
    try {
      startTemplateWorkout(todayTemplateIds[0]);
      openCurrentWorkout(navigation);
    } catch {
      // Starting can fail if a workout is already in progress — ignored; the
      // existing in-progress overlay already surfaces that state.
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!todayName}
      onPress={onPress}
    >
      <Card variant="card" radius="lg" pad={15}>
        <View className="mb-[10px] flex-row items-center justify-between">
          <Text className="text-[12.5px] font-semibold text-muted">
            {t('widgets.schedule.title')}
          </Text>
          <Text
            className={`text-[12.5px] font-semibold ${
              todayName ? 'text-accent' : 'text-muted'
            }`}
            numberOfLines={1}
          >
            {todayName ?? t('schedule.restDay')}
          </Text>
        </View>

        <View className="flex-row justify-between">
          {days.map(({ weekday, status }) => {
            const isToday = status === 'today';
            return (
              <View key={weekday} className="items-center gap-[6px]">
                <Text
                  className={`text-[11px] ${
                    isToday ? 'font-bold text-accent' : 'font-medium text-muted'
                  }`}
                >
                  {weekdayLabel(i18n.language, weekday)}
                </Text>
                <View
                  className={`rounded-full ${
                    isToday ? 'h-[10px] w-[10px]' : 'h-2 w-2'
                  } ${DOT_CLASSES[status]}`}
                />
              </View>
            );
          })}
        </View>
      </Card>
    </Pressable>
  );
}

import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WorkoutHistoryItem } from '@/hooks/useWorkoutHistory';
import { useAppSettingsStore } from '@/stores/appSettingsStore';
import { SummarySlideHeader } from './SummarySlideHeader';
import {
  buildMonthWeeks,
  buildWeekdayLabels,
  getMonthSummary,
} from './workoutHistorySummaryModel';

type WorkoutCalendarSummarySlideProps = {
  workouts: WorkoutHistoryItem[];
};

export function WorkoutCalendarSummarySlide({
  workouts,
}: WorkoutCalendarSummarySlideProps) {
  const { t, i18n } = useTranslation();
  const firstDayOfWeek = useAppSettingsStore(state => state.firstDayOfWeek);
  const summary = getMonthSummary(workouts, i18n.language);
  const calendarWeeks = buildMonthWeeks(workouts, firstDayOfWeek);
  const weekdayLabels = buildWeekdayLabels(i18n.language, firstDayOfWeek);

  return (
    <View className="flex-1 gap-4 p-5" collapsable={false}>
      <SummarySlideHeader
        eyebrow={t('history.summary.calendar.eyebrow')}
        title={t('common.workout', { count: summary.workouts.length })}
        description={
          summary.activeDays === 0
            ? t('history.summary.calendar.emptyDescription')
            : t('history.summary.calendar.activeDays', {
                count: summary.activeDays,
                month: summary.label,
              })
        }
        icon="calendar"
      />

      <View className="gap-1.5 border-t border-border-on-moss pt-3">
        <View className="flex-row items-center justify-between">
          <Text className="t-label text-cream">{summary.label}</Text>
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-accent" />
            <Text className="t-caption text-cream-dim">
              {t('history.summary.calendar.legendWorkout')}
            </Text>
          </View>
        </View>
        <View className="flex-row">
          {weekdayLabels.map((label, index) => (
            <Text
              key={`${label}-${index}`}
              className="t-eyebrow flex-1 text-center text-cream-dim"
            >
              {label}
            </Text>
          ))}
        </View>
        <View className="gap-1">
          {calendarWeeks.map((week, weekIndex) => (
            <View key={weekIndex} className="flex-row">
              {week.map((day, dayIndex) => (
                <View
                  key={day?.key ?? `${weekIndex}-${dayIndex}`}
                  className="h-7 flex-1 items-center justify-center"
                >
                  {day ? (
                    <View
                      className={`h-6 w-6 items-center justify-center rounded-full ${
                        day.active ? 'bg-accent' : ''
                      }`}
                    >
                      <Text className="text-[10px] font-semibold tabular-nums text-cream">
                        {day.date.getDate()}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

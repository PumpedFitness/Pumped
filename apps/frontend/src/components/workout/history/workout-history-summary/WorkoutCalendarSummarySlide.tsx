import { Text, View } from 'react-native';
import type { WorkoutHistoryItem } from '../../../../hooks/useWorkoutHistory';
import { SummarySlideHeader } from './SummarySlideHeader';
import { buildMonthDays, getMonthSummary } from './workoutHistorySummaryModel';

type WorkoutCalendarSummarySlideProps = {
  workouts: WorkoutHistoryItem[];
};

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function WorkoutCalendarSummarySlide({
  workouts,
}: WorkoutCalendarSummarySlideProps) {
  const summary = getMonthSummary(workouts);
  const calendarDays = buildMonthDays(workouts);
  const workoutLabel = summary.workouts.length === 1 ? 'workout' : 'workouts';

  return (
    <View className="flex-1 gap-4 p-5" collapsable={false}>
      <SummarySlideHeader
        eyebrow="Calendar"
        title={`${summary.workouts.length} ${workoutLabel}`}
        description={
          summary.activeDays === 0
            ? 'Your training activity will appear here.'
            : `${summary.activeDays} active ${
                summary.activeDays === 1 ? 'day' : 'days'
              } in ${summary.label}`
        }
        icon="calendar"
      />

      <View className="gap-1.5 border-t border-border-on-moss pt-3">
        <View className="flex-row items-center justify-between">
          <Text className="t-label text-cream">{summary.label}</Text>
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-accent" />
            <Text className="t-caption text-cream-dim">Workout</Text>
          </View>
        </View>
        <View className="flex-row">
          {WEEKDAY_LABELS.map((label, index) => (
            <Text
              key={`${label}-${index}`}
              className="t-eyebrow flex-1 text-center text-cream-dim"
            >
              {label}
            </Text>
          ))}
        </View>
        <View className="flex-row flex-wrap">
          {calendarDays.map(day => (
            <View
              key={day.key}
              className="h-7 w-[14.2857%] items-center justify-center"
            >
              <View
                className={`h-6 w-6 items-center justify-center rounded-full ${
                  day.active ? 'bg-accent' : ''
                }`}
              >
                <Text
                  className={`text-[10px] font-semibold tabular-nums ${
                    day.inMonth ? 'text-cream' : 'text-cream/20'
                  }`}
                >
                  {day.date.getDate()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

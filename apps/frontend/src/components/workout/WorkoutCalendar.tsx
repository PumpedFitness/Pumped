import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { WorkoutSession, WorkoutTemplate } from '../../types/workout';
import { colors } from '../../theme/tokens';
import { ClayIcon } from '../icons/ClayIcon';
import { buildWorkoutCalendarDays } from './workoutCalendarModel';

type WorkoutCalendarProps = {
  templates: WorkoutTemplate[];
  sessions: WorkoutSession[];
};

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function WorkoutCalendar({ templates, sessions }: WorkoutCalendarProps) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const days = useMemo(
    () => buildWorkoutCalendarDays(month, templates, sessions),
    [month, sessions, templates],
  );
  const monthLabel = month.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const moveMonth = (direction: -1 | 1) => {
    setMonth(
      current =>
        new Date(current.getFullYear(), current.getMonth() + direction, 1),
    );
  };

  return (
    <View className="gap-4 rounded-[26px] border border-border-hairline bg-surface-card p-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="t-heading">Training calendar</Text>
          <Text className="t-caption mt-0.5">
            Completed and upcoming workouts
          </Text>
        </View>
        <View className="flex-row rounded-full bg-surface-sunk p-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-card"
            onPress={() => moveMonth(-1)}
          >
            <ClayIcon name="back" size={17} color={colors.ink} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next month"
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-card"
            onPress={() => moveMonth(1)}
          >
            <ClayIcon name="chevron" size={17} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <Text className="text-[16px] font-bold text-foreground">
        {monthLabel}
      </Text>

      <View className="flex-row">
        {WEEKDAY_LABELS.map((label, index) => (
          <View key={`${label}-${index}`} className="flex-1 items-center py-1">
            <Text className="t-eyebrow">{label}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {days.map(day => {
          const completed = day.entries.filter(
            entry => entry.kind === 'COMPLETED',
          );
          const planned = day.entries.filter(entry => entry.kind === 'PLANNED');

          return (
            <View
              key={day.key}
              className={`min-h-[78px] w-[14.2857%] border-t border-border-soft px-1 py-2 ${
                day.inMonth ? '' : 'opacity-30'
              }`}
            >
              <View
                className={`h-7 w-7 items-center justify-center rounded-full ${
                  day.isToday ? 'bg-accent' : ''
                }`}
              >
                <Text
                  className={`text-[12px] tabular-nums ${
                    completed.length > 0 ? 'font-bold' : 'font-medium'
                  } ${
                    day.isToday
                      ? 'text-accent-foreground'
                      : 'text-foreground-secondary'
                  }`}
                >
                  {day.date.getDate()}
                </Text>
              </View>

              <View className="mt-1 gap-0.5">
                {completed.slice(0, 1).map(entry => (
                  <View key={entry.id} className="flex-row items-center gap-1">
                    <View
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <Text
                      className="flex-1 text-[11px] font-bold leading-[12px] text-foreground"
                      numberOfLines={1}
                    >
                      {entry.name}
                    </Text>
                  </View>
                ))}
                {planned.slice(0, completed.length > 0 ? 1 : 2).map(entry => (
                  <View
                    key={entry.id}
                    className="flex-row items-center gap-1 opacity-[0.45]"
                  >
                    <View
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <Text
                      className="flex-1 text-[11px] font-medium leading-[12px] text-foreground"
                      numberOfLines={1}
                    >
                      {entry.name}
                    </Text>
                  </View>
                ))}
                {day.entries.length > 2 && (
                  <Text className="text-[11px] font-bold text-muted">
                    +{day.entries.length - 2}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View className="flex-row gap-4 border-t border-border-soft pt-3">
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-foreground" />
          <Text className="t-caption font-bold">Completed</Text>
        </View>
        <View className="flex-row items-center gap-2 opacity-50">
          <View className="h-2 w-2 rounded-full bg-foreground" />
          <Text className="t-caption">Planned</Text>
        </View>
      </View>
    </View>
  );
}

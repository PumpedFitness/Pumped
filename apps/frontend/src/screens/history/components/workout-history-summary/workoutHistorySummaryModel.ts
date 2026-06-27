import type { WorkoutTemplateColor } from '@/data/local/enums';
import type { WorkoutHistoryItem } from '@/hooks/useWorkoutHistory';
import {
  firstDayOfWeekToIndex,
  type FirstDayOfWeek,
} from '@/stores/appSettingsStore';

const DAYS_PER_WEEK = 7;
const SUNDAY_REFERENCE_DATE = new Date(2024, 0, 7);

type ActivityDay = {
  date: Date;
  key: string;
  active: boolean;
  /** Color of that day's workout (latest if several); null = none/legacy. */
  color: WorkoutTemplateColor | null;
};

type ActivityWeek = Array<ActivityDay | null>;

type DailyVolume = {
  key: string;
  label: string;
  volumeKg: number;
};

type MuscleFocus = {
  name: string;
  count: number;
  share: number;
};

type MonthSummary = {
  workouts: WorkoutHistoryItem[];
  label: string;
  activeDays: number;
  volumeKg: number;
  minutes: number;
};

function dateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function makeEmptyWeek(): ActivityWeek {
  return Array<ActivityDay | null>(DAYS_PER_WEEK).fill(null);
}

function getMonthDateCount(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getCalendarWeekdayIndex(date: Date, weekStartsOn: number): number {
  return (date.getDay() - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK;
}

export function getMonthSummary(
  workouts: WorkoutHistoryItem[],
  language: string,
  now = new Date(),
): MonthSummary {
  const monthWorkouts = workouts.filter(workout => {
    const date = new Date(workout.startedAt);
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  });

  return {
    workouts: monthWorkouts,
    label: now.toLocaleDateString(language, {
      month: 'long',
      year: 'numeric',
    }),
    activeDays: new Set(
      monthWorkouts.map(workout => dateKey(new Date(workout.startedAt))),
    ).size,
    volumeKg: monthWorkouts.reduce(
      (total, workout) => total + workout.totalVolumeKg,
      0,
    ),
    minutes: monthWorkouts.reduce(
      (total, workout) => total + workout.durationMinutes,
      0,
    ),
  };
}

export function buildMonthWeeks(
  workouts: WorkoutHistoryItem[],
  firstDayOfWeek: FirstDayOfWeek,
  now = new Date(),
): ActivityWeek[] {
  // `workouts` arrives newest-first, so the first color seen for a date is that
  // day's latest workout — what the calendar dot should show.
  const colorByDate = new Map<string, WorkoutTemplateColor | null>();
  workouts.forEach(workout => {
    const key = dateKey(new Date(workout.startedAt));
    if (!colorByDate.has(key)) {
      colorByDate.set(key, workout.color);
    }
  });
  const weekStartsOn = firstDayOfWeekToIndex(firstDayOfWeek);
  const weeks: ActivityWeek[] = [makeEmptyWeek()];
  const daysInMonth = getMonthDateCount(now);

  for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
    const weekdayIndex = getCalendarWeekdayIndex(date, weekStartsOn);

    if (dayOfMonth > 1 && weekdayIndex === 0) {
      weeks.push(makeEmptyWeek());
    }

    const key = dateKey(date);
    const weekIndex = weeks.length - 1;
    weeks[weekIndex][weekdayIndex] = {
      date,
      key,
      active: colorByDate.has(key),
      color: colorByDate.get(key) ?? null,
    };
  }

  return weeks;
}

export function buildWeekdayLabels(
  language: string,
  firstDayOfWeek: FirstDayOfWeek,
): string[] {
  const weekStartsOn = firstDayOfWeekToIndex(firstDayOfWeek);
  return Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
    const date = new Date(SUNDAY_REFERENCE_DATE);
    date.setDate(SUNDAY_REFERENCE_DATE.getDate() + weekStartsOn + index);
    return date.toLocaleDateString(language, { weekday: 'narrow' });
  });
}

export function buildDailyVolume(
  workouts: WorkoutHistoryItem[],
  language: string,
  now = new Date(),
): DailyVolume[] {
  const volumeByDate = new Map<string, number>();
  workouts.forEach(workout => {
    const key = dateKey(new Date(workout.startedAt));
    volumeByDate.set(key, (volumeByDate.get(key) ?? 0) + workout.totalVolumeKg);
  });

  return Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (DAYS_PER_WEEK - 1 - index));
    const key = dateKey(date);
    return {
      key,
      label: date.toLocaleDateString(language, { weekday: 'narrow' }),
      volumeKg: volumeByDate.get(key) ?? 0,
    };
  });
}

export function buildMuscleFocus(
  workouts: WorkoutHistoryItem[],
  limit = 4,
): MuscleFocus[] {
  const counts = new Map<string, number>();
  workouts.forEach(workout => {
    workout.muscleGroupNames.forEach(name => {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
  });
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);

  return [...counts]
    .map(([name, count]) => ({
      name,
      count,
      share: total > 0 ? count / total : 0,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}m`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return Math.round(value).toLocaleString();
}

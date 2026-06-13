import type { WorkoutHistoryItem } from '@/hooks/useWorkoutHistory';

type ActivityDay = {
  date: Date;
  key: string;
  active: boolean;
  inMonth: boolean;
};

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

export function buildMonthDays(
  workouts: WorkoutHistoryItem[],
  now = new Date(),
): ActivityDay[] {
  const activeDates = new Set(
    workouts.map(workout => dateKey(new Date(workout.startedAt))),
  );
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const gridStart = new Date(monthStart);
  const mondayOffset = (monthStart.getDay() + 6) % 7;
  gridStart.setDate(gridStart.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      date,
      key: dateKey(date),
      active: activeDates.has(dateKey(date)),
      inMonth: date.getMonth() === now.getMonth(),
    };
  });
}

export function buildWeekdayLabels(language: string): string[] {
  // 2024-01-01 is a Monday; the calendar grid starts on Monday.
  return Array.from({ length: 7 }, (_, index) =>
    new Date(2024, 0, 1 + index).toLocaleDateString(language, {
      weekday: 'narrow',
    }),
  );
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

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
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
    .slice(0, 4);
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

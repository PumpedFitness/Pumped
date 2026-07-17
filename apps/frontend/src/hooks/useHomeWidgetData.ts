import { useMemo } from 'react';
import { localDayIndex } from '@/data/local/schedules/scheduleResolution';
import { useWorkoutHistory } from './useWorkoutHistory';

const DAY_MS = 86_400_000;

type DailyVolume = { time: string; value: number };

function dateKey(timestamp: number): string {
  const date = new Date(timestamp);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function useHomeWidgetData() {
  const { workouts } = useWorkoutHistory();

  return useMemo(() => {
    const now = new Date();
    const today = localDayIndex(now.getTime());
    const activeDays = new Set(
      workouts.map(workout => localDayIndex(workout.startedAt)),
    );
    let streak = 0;
    let day = activeDays.has(today) ? today : today - 1;
    while (activeDays.has(day)) {
      streak += 1;
      day -= 1;
    }

    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    const weeklyVolumeKg = workouts
      .filter(workout => workout.startedAt >= weekStart.getTime())
      .reduce((sum, workout) => sum + workout.totalVolumeKg, 0);

    const volumeByDate = new Map<string, number>();
    workouts.forEach(workout => {
      const key = dateKey(workout.startedAt);
      volumeByDate.set(
        key,
        (volumeByDate.get(key) ?? 0) + workout.totalVolumeKg,
      );
    });
    const dailyVolume: DailyVolume[] = Array.from(
      { length: 30 },
      (_, index) => {
        const timestamp = now.getTime() - (29 - index) * DAY_MS;
        const time = dateKey(timestamp);
        return { time, value: Math.round(volumeByDate.get(time) ?? 0) };
      },
    );

    return {
      workouts,
      lastWorkout: workouts[0] ?? null,
      streak,
      weeklyActivity: Array.from({ length: 7 }, (_, offset) =>
        activeDays.has(today - (6 - offset)),
      ),
      weeklyVolumeKg,
      dailyVolume,
    };
  }, [workouts]);
}

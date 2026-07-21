import { useMemo } from 'react';
import { localDayIndex } from '@/data/local/schedules/scheduleResolution';
import { useWorkoutHistory } from './useWorkoutHistory';
import { useExerciseOptions } from './useExerciseOptions';
import { resolveSetWeightReps } from '@/data/local/sets/setTypes';

const DAY_MS = 86_400_000;

type DailyVolume = { time: string; value: number };

type ExerciseProgress = {
  exerciseId: string;
  name: string;
  latestEstimateKg: number;
  changeKg: number | null;
};

type RecentPr = {
  exerciseId: string;
  exerciseName: string;
  estimateKg: number;
  achievedAt: number;
};

function estimatedOneRepMax(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

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
  const exerciseOptions = useExerciseOptions();

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

    const exerciseNames = new Map(
      exerciseOptions.map(exercise => [exercise.id, exercise.name]),
    );
    const sessionsByExercise = new Map<
      string,
      Array<{ startedAt: number; estimateKg: number }>
    >();
    workouts.forEach(workout => {
      const bestByExercise = new Map<string, number>();
      workout.sets.forEach(set => {
        const { weight, reps } = resolveSetWeightReps(set);
        if (!weight || reps <= 0) return;
        const estimate = estimatedOneRepMax(weight, reps);
        bestByExercise.set(
          set.exerciseId,
          Math.max(bestByExercise.get(set.exerciseId) ?? 0, estimate),
        );
      });
      bestByExercise.forEach((estimateKg, exerciseId) => {
        const entries = sessionsByExercise.get(exerciseId) ?? [];
        entries.push({ startedAt: workout.startedAt, estimateKg });
        sessionsByExercise.set(exerciseId, entries);
      });
    });

    let exerciseProgress: ExerciseProgress | null = null;
    let recentPr: RecentPr | null = null;
    let recentPrCount = 0;
    sessionsByExercise.forEach((entries, exerciseId) => {
      const chronological = [...entries].sort(
        (a, b) => a.startedAt - b.startedAt,
      );
      let best = 0;
      chronological.forEach(entry => {
        if (entry.estimateKg > best) {
          if (entry.startedAt === workouts[0]?.startedAt) recentPrCount += 1;
          if (!recentPr || entry.startedAt > recentPr.achievedAt) {
            recentPr = {
              exerciseId,
              exerciseName: exerciseNames.get(exerciseId) ?? '—',
              estimateKg: entry.estimateKg,
              achievedAt: entry.startedAt,
            };
          }
          best = entry.estimateKg;
        }
      });

      const latest = entries[0];
      const previous = entries[1];
      if (
        latest &&
        (!exerciseProgress ||
          entries.length >
            (sessionsByExercise.get(exerciseProgress.exerciseId)?.length ?? 0))
      ) {
        exerciseProgress = {
          exerciseId,
          name: exerciseNames.get(exerciseId) ?? '—',
          latestEstimateKg: latest.estimateKg,
          changeKg: previous ? latest.estimateKg - previous.estimateKg : null,
        };
      }
    });

    const muscleCounts = new Map<string, number>();
    workouts
      .filter(workout => workout.startedAt >= now.getTime() - 28 * DAY_MS)
      .forEach(workout => {
        workout.muscleGroupNames.forEach(name =>
          muscleCounts.set(name, (muscleCounts.get(name) ?? 0) + 1),
        );
      });
    const muscleTotal = [...muscleCounts.values()].reduce(
      (sum, count) => sum + count,
      0,
    );
    const muscleFocus = [...muscleCounts]
      .map(([name, count]) => ({
        name,
        count,
        share: muscleTotal ? count / muscleTotal : 0,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    const activityDays = Array.from({ length: 56 }, (_, offset) =>
      activeDays.has(today - (55 - offset)),
    );
    // These values are selected while iterating maps above. Preserve their
    // declared nullable types across TypeScript's callback control-flow edge.
    const selectedExerciseProgress =
      exerciseProgress as ExerciseProgress | null;
    const selectedRecentPr = recentPr as RecentPr | null;

    return {
      workouts,
      lastWorkout: workouts[0] ?? null,
      streak,
      weeklyActivity: Array.from({ length: 7 }, (_, offset) =>
        activeDays.has(today - (6 - offset)),
      ),
      weeklyVolumeKg,
      dailyVolume,
      exerciseProgress: selectedExerciseProgress,
      recentPr: selectedRecentPr,
      recentPrCount,
      muscleFocus,
      activityDays,
      lifetimeWorkoutCount: workouts.length,
    };
  }, [exerciseOptions, workouts]);
}

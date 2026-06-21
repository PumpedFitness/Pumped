import { useMemo } from 'react';
import { eq } from 'drizzle-orm';
import { performedSets, workoutSessions } from '@/data/local/schema';
import { useRepository } from '@/data/local/useRepository';
import { resolveSetWeightReps } from '@/data/local/sets/setTypes';
import { useWorkoutHistory } from './useWorkoutHistory';
import type { PerformedSet } from '@/types/workout';

export type ExerciseChartMetric =
  | 'volume'
  | 'topWeight'
  | 'estimated1Rm'
  | 'maxReps';

export type ExerciseChartPoint = {
  time: string;
  value: number;
};

export type ExerciseHistoryEntry = {
  workoutId: string;
  workoutName: string;
  startedAt: number;
  endedAt: number | null;
  setCount: number;
  volumeKg: number;
  topWeightKg: number | null;
  sets: PerformedSet[];
};

export type ExercisePrKind =
  | 'volumeSet'
  | 'topWeight'
  | 'estimated1Rm'
  | 'maxReps';

export type ExerciseDerivedPr = {
  kind: ExercisePrKind;
  value: number;
  weightKg: number | null;
  reps: number;
  achievedAt: number;
  workoutName: string;
};

export type ExerciseAnalytics = {
  chartData: Record<ExerciseChartMetric, ExerciseChartPoint[]>;
  prs: ExerciseDerivedPr[];
  history: ExerciseHistoryEntry[];
};

type SessionRow = typeof workoutSessions.$inferSelect;
type SetRow = typeof performedSets.$inferSelect;

function dateKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function estimateOneRepMax(weight: number, reps: number): number {
  // Epley formula: weight * (1 + reps / 30).
  return weight * (1 + reps / 30);
}

function roundMetric(value: number): number {
  return Math.round(value * 10) / 10;
}

function buildChartData(
  sessions: SessionRow[],
  sets: SetRow[],
): Record<ExerciseChartMetric, ExerciseChartPoint[]> {
  const sessionById = new Map(sessions.map(session => [session.id, session]));
  const daily = new Map<
    string,
    {
      volume: number;
      topWeight: number;
      estimated1Rm: number;
      maxReps: number;
    }
  >();

  sets.forEach(set => {
    const session = sessionById.get(set.workoutSessionId);
    if (!session || session.endedAt === null) return;

    const key = dateKey(session.startedAt);
    const { weight: rawWeight, reps } = resolveSetWeightReps(set);
    const weight = rawWeight ?? 0;
    const next = daily.get(key) ?? {
      volume: 0,
      topWeight: 0,
      estimated1Rm: 0,
      maxReps: 0,
    };

    next.volume += weight * reps;
    next.topWeight = Math.max(next.topWeight, weight);
    next.maxReps = Math.max(next.maxReps, reps);
    if (weight > 0 && reps > 0) {
      next.estimated1Rm = Math.max(
        next.estimated1Rm,
        estimateOneRepMax(weight, reps),
      );
    }

    daily.set(key, next);
  });

  const entries = [...daily.entries()].sort(([a], [b]) => a.localeCompare(b));
  return {
    volume: entries.map(([time, day]) => ({
      time,
      value: roundMetric(day.volume),
    })),
    topWeight: entries.map(([time, day]) => ({
      time,
      value: roundMetric(day.topWeight),
    })),
    estimated1Rm: entries.map(([time, day]) => ({
      time,
      value: roundMetric(day.estimated1Rm),
    })),
    maxReps: entries.map(([time, day]) => ({ time, value: day.maxReps })),
  };
}

function buildHistory(
  exerciseId: string,
  workouts: ReturnType<typeof useWorkoutHistory>['workouts'],
): ExerciseHistoryEntry[] {
  return workouts
    .map(workout => {
      const sets = workout.sets
        .filter(set => set.exerciseId === exerciseId)
        .sort((a, b) => a.setPosition - b.setPosition);

      if (sets.length === 0) return null;

      const resolved = sets.map(resolveSetWeightReps);
      const volumeKg = resolved.reduce(
        (total, value) => total + (value.weight ?? 0) * value.reps,
        0,
      );
      const topWeightKg = resolved.reduce<number | null>((top, value) => {
        if (value.weight == null) return top;
        return top == null ? value.weight : Math.max(top, value.weight);
      }, null);

      return {
        workoutId: workout.id,
        workoutName: workout.name,
        startedAt: workout.startedAt,
        endedAt: workout.endedAt,
        setCount: sets.length,
        volumeKg,
        topWeightKg,
        sets,
      };
    })
    .filter((entry): entry is ExerciseHistoryEntry => entry !== null)
    .sort((a, b) => b.startedAt - a.startedAt);
}

function betterPr(
  current: ExerciseDerivedPr | null,
  candidate: ExerciseDerivedPr,
): ExerciseDerivedPr {
  if (!current) return candidate;
  if (candidate.value !== current.value) {
    return candidate.value > current.value ? candidate : current;
  }
  return candidate.achievedAt > current.achievedAt ? candidate : current;
}

function buildDerivedPrs(history: ExerciseHistoryEntry[]): ExerciseDerivedPr[] {
  const records: Partial<Record<ExercisePrKind, ExerciseDerivedPr>> = {};

  history.forEach(entry => {
    entry.sets.forEach(set => {
      const { weight: weightKg, reps } = resolveSetWeightReps(set);
      const achievedAt = set.performedAt ?? entry.startedAt;
      const base = {
        weightKg,
        reps,
        achievedAt,
        workoutName: entry.workoutName,
      };

      if (weightKg != null && weightKg > 0 && reps > 0) {
        records.volumeSet = betterPr(records.volumeSet ?? null, {
          kind: 'volumeSet',
          value: roundMetric(weightKg * reps),
          ...base,
        });
        records.topWeight = betterPr(records.topWeight ?? null, {
          kind: 'topWeight',
          value: roundMetric(weightKg),
          ...base,
        });
        records.estimated1Rm = betterPr(records.estimated1Rm ?? null, {
          kind: 'estimated1Rm',
          value: roundMetric(estimateOneRepMax(weightKg, reps)),
          ...base,
        });
      }

      if (reps > 0) {
        records.maxReps = betterPr(records.maxReps ?? null, {
          kind: 'maxReps',
          value: reps,
          ...base,
        });
      }
    });
  });

  return (['volumeSet', 'topWeight', 'estimated1Rm', 'maxReps'] as const)
    .map(kind => records[kind])
    .filter((record): record is ExerciseDerivedPr => record != null);
}

export function useExerciseAnalytics(exerciseId: string): ExerciseAnalytics {
  const sessionRepo = useRepository(workoutSessions);
  const setRepo = useRepository(performedSets);
  const { workouts } = useWorkoutHistory();

  const chartData = useMemo(
    () =>
      buildChartData(
        sessionRepo.query(),
        setRepo.query({ where: eq(performedSets.exerciseId, exerciseId) }),
      ),
    [exerciseId, sessionRepo, setRepo],
  );

  const history = useMemo(
    () => buildHistory(exerciseId, workouts),
    [exerciseId, workouts],
  );
  const prs = useMemo(() => buildDerivedPrs(history), [history]);

  return { chartData, history, prs };
}

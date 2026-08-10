import { useMemo } from 'react';
import { asc } from 'drizzle-orm';
import { bodyWeightEntries } from '@/data/local/schema/bodyMetrics';
import { performedSets } from '@/data/local/schema';
import { useRepository } from '@/data/local/useRepository';
import {
  useExerciseAnalytics,
  type ExerciseChartPoint,
  type ExerciseDerivedPr,
} from '@/hooks/useExerciseAnalytics';
import { useExerciseOptions } from '@/hooks/useExerciseOptions';

export type TrendsData = {
  /** Name of the exercise the strength/volume series is drawn from. */
  focusExerciseName: string | null;
  strengthPoints: ExerciseChartPoint[];
  volumePoints: ExerciseChartPoint[];
  bodyweightPoints: ExerciseChartPoint[];
  prs: ExerciseDerivedPr[];
};

const EMPTY_POINTS: ExerciseChartPoint[] = [];

function dateKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

// The most-logged exercise is the most representative single lift to trend.
function pickFocusExerciseId(setRows: { exerciseId: string }[]): string | null {
  const counts = new Map<string, number>();
  setRows.forEach(row => {
    counts.set(row.exerciseId, (counts.get(row.exerciseId) ?? 0) + 1);
  });

  let best: string | null = null;
  let bestCount = 0;
  counts.forEach((count, exerciseId) => {
    if (count > bestCount) {
      bestCount = count;
      best = exerciseId;
    }
  });
  return best;
}

export function useTrendsData(): TrendsData {
  const setRepo = useRepository(performedSets);
  const bodyWeightRepo = useRepository(bodyWeightEntries);
  const exerciseOptions = useExerciseOptions();

  const focusExerciseId = useMemo(
    () => pickFocusExerciseId(setRepo.query()),
    [setRepo],
  );

  // useExerciseAnalytics needs a stable string; '' yields empty series.
  const analytics = useExerciseAnalytics(focusExerciseId ?? '');

  const focusExerciseName = useMemo(() => {
    if (!focusExerciseId) return null;
    return (
      exerciseOptions.find(option => option.id === focusExerciseId)?.name ??
      null
    );
  }, [focusExerciseId, exerciseOptions]);

  const bodyweightPoints = useMemo<ExerciseChartPoint[]>(() => {
    const entries = bodyWeightRepo.query({
      orderBy: asc(bodyWeightEntries.recordedAt),
    });
    return entries.map(entry => ({
      time: dateKey(entry.recordedAt),
      value: entry.value,
    }));
  }, [bodyWeightRepo]);

  return {
    focusExerciseName,
    strengthPoints: focusExerciseId
      ? analytics.chartData.estimated1Rm
      : EMPTY_POINTS,
    volumePoints: focusExerciseId ? analytics.chartData.volume : EMPTY_POINTS,
    bodyweightPoints,
    prs: focusExerciseId ? analytics.prs : [],
  };
}

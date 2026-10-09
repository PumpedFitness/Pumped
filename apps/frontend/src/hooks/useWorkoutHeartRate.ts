import { useEffect, useState } from 'react';

import { loadHeartRateCurve } from '@/data/local/health/rawStore';
import { healthSources } from '@/data/local/health/source';
import { syncWorkoutHeartRate } from '@/data/local/health/syncService';
import * as schema from '@/data/local/schema';
import { useTableQuery } from '@/data/local/tableVersions';
import { MetricId } from '@/lib/health/ids';
import {
  analyseWorkoutHeartRate,
  workoutHeartRateWindow,
  type WorkoutHeartRate,
} from '@/lib/health/algorithms/workoutHeartRate';
import { useHealthSettingsStore } from '@/stores/healthSettingsStore';
import type { WorkoutSessionDetails } from '@/types/workout';

export type WorkoutHeartRateState = {
  /** False when no health source is connected — the UI shows nothing. */
  readonly isAvailable: boolean;
  /** True while the window is being fetched from the source. */
  readonly isFetching: boolean;
  readonly heartRate: WorkoutHeartRate;
};

function sessionKey(workout: WorkoutSessionDetails): string {
  return workout.sets
    .map(set => `${set.id}@${set.performedAt ?? ''}`)
    .join(',');
}

/**
 * Heart rate of one finished workout, matched to its sets and exercises.
 *
 * Reads what the health sync already stored. When the stored curve is missing
 * or too sparse for per-set detail, it asks the connected source for this
 * workout's window once — older workouts fall outside the sync's recent range,
 * and the watch may have synced only after the last app sync.
 */
export function useWorkoutHeartRate(
  workout: WorkoutSessionDetails,
): WorkoutHeartRateState {
  const isConnected = useHealthSettingsStore(state => state.sourceConnected);
  const [isFetching, setFetching] = useState(false);
  const endedAt =
    workout.endedAt ??
    Math.max(
      workout.startedAt,
      ...workout.sets.map(set => set.performedAt ?? 0),
    );
  const setsKey = sessionKey(workout);

  const heartRate = useTableQuery(
    [schema.healthRawSample],
    () => {
      const { from, to } = workoutHeartRateWindow(workout.startedAt, endedAt);
      return analyseWorkoutHeartRate({
        startedAt: workout.startedAt,
        endedAt,
        curve: loadHeartRateCurve(from, to),
        sets: workout.sets.map(set => ({
          id: set.id,
          exerciseKey: `${set.exercisePosition}:${set.exerciseId}`,
          performedAt: set.performedAt,
        })),
      });
    },
    [workout.startedAt, endedAt, setsKey],
  );

  const needsFetch = isConnected && heartRate.resolution !== 'detailed';

  useEffect(() => {
    if (!needsFetch) return;
    const source = healthSources.active;
    if (!source.metrics.has(MetricId.heartRate)) return;

    let active = true;
    setFetching(true);
    syncWorkoutHeartRate(source, { startedAt: workout.startedAt, endedAt })
      // A failed fetch leaves the card in its empty state; the settings
      // screen is where sync errors are surfaced.
      .catch(() => undefined)
      .finally(() => {
        if (active) setFetching(false);
      });
    return () => {
      active = false;
    };
    // Once per workout — a re-render with the same window must not re-fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, workout.startedAt, endedAt]);

  return { isAvailable: isConnected, isFetching, heartRate };
}

import { useCallback, useMemo } from 'react';
import { useTableQuery } from '@/data/local/tableVersions';
import { skippedDays } from '@/data/local/schema';
import { localDayIndex } from '@/data/local/schedules/scheduleResolution';
import {
  listSkippedDayIndexes,
  skipDay,
  unskipDay,
} from '@/data/local/schedules/skippedDays';
import {
  useWorkoutHistory,
  type WorkoutHistoryItem,
} from './useWorkoutHistory';
import { useWorkoutTemplates } from './useWorkoutTemplates';
import { useSchedules } from './useSchedules';

// The mutually exclusive states today's header can be in. Precedence (highest
// first): done > skipped > pending — finishing a workout always wins over a
// stale skip flag for the same day.
export type TodayWorkout =
  | { kind: 'no-schedule' }
  | { kind: 'rest' }
  | { kind: 'pending'; templateId: string; workoutName: string }
  | { kind: 'done'; workout: WorkoutHistoryItem }
  | { kind: 'skipped'; templateId: string; workoutName: string };

type UseTodayWorkoutResult = {
  today: TodayWorkout;
  skip: () => void;
  unskip: () => void;
};

export function useTodayWorkout(): UseTodayWorkoutResult {
  const {
    today: todayIndex,
    todayTemplateIds,
    activeSchedule,
  } = useSchedules();
  const { templates } = useWorkoutTemplates();
  const { workouts } = useWorkoutHistory();

  const skippedDayIndexes = useTableQuery([skippedDays], () =>
    listSkippedDayIndexes(),
  );

  const today = useMemo<TodayWorkout>(() => {
    if (!activeSchedule) {
      return { kind: 'no-schedule' };
    }

    const templateId = todayTemplateIds[0];
    if (!templateId) {
      return { kind: 'rest' };
    }

    const doneToday = workouts.find(
      workout => localDayIndex(workout.startedAt) === todayIndex,
    );
    if (doneToday) {
      return { kind: 'done', workout: doneToday };
    }

    const workoutName =
      templates.find(template => template.id === templateId)?.name ?? '';

    if (skippedDayIndexes.includes(todayIndex)) {
      return { kind: 'skipped', templateId, workoutName };
    }

    return { kind: 'pending', templateId, workoutName };
  }, [
    activeSchedule,
    todayTemplateIds,
    workouts,
    todayIndex,
    templates,
    skippedDayIndexes,
  ]);

  const skip = useCallback(() => skipDay(todayIndex), [todayIndex]);
  const unskip = useCallback(() => unskipDay(todayIndex), [todayIndex]);

  return { today, skip, unskip };
}

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
import { usePeriodizations } from './usePeriodizations';
import { periodizationWorkoutsForDay } from '@/data/local/periodizations/periodizationResolution';
import type { WorkoutTemplate } from '@/types/workout';

// The mutually exclusive states today's header can be in. Precedence (highest
// first): done > skipped > pending — finishing a workout always wins over a
// stale skip flag for the same day.
export type TodayWorkout =
  | { kind: 'no-schedule' }
  | { kind: 'rest' }
  | {
      kind: 'pending';
      template: WorkoutTemplate;
      workoutName: string;
      source: 'schedule' | 'periodization';
    }
  | { kind: 'done'; workout: WorkoutHistoryItem }
  | {
      kind: 'skipped';
      template: WorkoutTemplate;
      workoutName: string;
      source: 'schedule' | 'periodization';
    };

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
  const { activePeriodization } = usePeriodizations();
  const { workouts } = useWorkoutHistory();

  const skippedDayIndexes = useTableQuery([skippedDays], () =>
    listSkippedDayIndexes(),
  );

  const today = useMemo<TodayWorkout>(() => {
    if (!activeSchedule && !activePeriodization) {
      return { kind: 'no-schedule' };
    }

    const periodizationTemplate = activePeriodization
      ? periodizationWorkoutsForDay(activePeriodization, todayIndex)[0]
          ?.template
      : null;
    const scheduledTemplate = templates.find(
      template => template.id === todayTemplateIds[0],
    );
    const template = periodizationTemplate ?? scheduledTemplate;
    if (!template) {
      return { kind: 'rest' };
    }

    const doneToday = workouts.find(
      workout => localDayIndex(workout.startedAt) === todayIndex,
    );
    if (doneToday) {
      return { kind: 'done', workout: doneToday };
    }

    const workoutName = template.name;
    const source = periodizationTemplate ? 'periodization' : 'schedule';

    if (skippedDayIndexes.includes(todayIndex)) {
      return { kind: 'skipped', template, workoutName, source };
    }

    return { kind: 'pending', template, workoutName, source };
  }, [
    activeSchedule,
    activePeriodization,
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

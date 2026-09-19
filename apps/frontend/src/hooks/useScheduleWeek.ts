import { useMemo } from 'react';
import { useTableQuery } from '@/data/local/tableVersions';
import { skippedDays } from '@/data/local/schema';
import { localDayIndex } from '@/data/local/schedules/scheduleResolution';
import { listSkippedDayIndexes } from '@/data/local/schedules/skippedDays';
import {
  buildEmbeddedPlanWeek,
  buildScheduleWeek,
  type ScheduleWeek,
} from '@/screens/schedule/components/scheduleWeekModel';
import { useSchedules } from './useSchedules';
import { useWorkoutTemplates } from './useWorkoutTemplates';
import { useWorkoutHistory } from './useWorkoutHistory';
import { usePeriodizations } from './usePeriodizations';
import { periodizationWorkoutsForDay } from '@/data/local/periodizations/periodizationResolution';

type UseScheduleWeekResult = ScheduleWeek & {
  hasActiveSchedule: boolean;
  scheduleName: string | null;
};

// The active schedule's current Monday–Sunday week, enriched with logged
// (done) and skipped days, plus a tomorrow lookahead. Powers the Active tab.
export function useScheduleWeek(): UseScheduleWeekResult {
  const { activeSchedule, today } = useSchedules();
  const { activePeriodization } = usePeriodizations();
  const { templates } = useWorkoutTemplates();
  const { workouts } = useWorkoutHistory();

  const skippedDayIndexes = useTableQuery([skippedDays], () =>
    listSkippedDayIndexes(),
  );

  const doneDayIndexes = useMemo(
    () => new Set(workouts.map(workout => localDayIndex(workout.startedAt))),
    [workouts],
  );

  const week = useMemo(
    () =>
      activePeriodization
        ? buildEmbeddedPlanWeek(
            dayIndex =>
              periodizationWorkoutsForDay(activePeriodization, dayIndex).map(
                workout => workout.template,
              ),
            today,
            doneDayIndexes,
            skippedDayIndexes,
          )
        : buildScheduleWeek(
            activeSchedule,
            templates,
            today,
            doneDayIndexes,
            skippedDayIndexes,
          ),
    [
      activePeriodization,
      activeSchedule,
      templates,
      today,
      doneDayIndexes,
      skippedDayIndexes,
    ],
  );

  return {
    ...week,
    hasActiveSchedule: activeSchedule != null || activePeriodization != null,
    scheduleName: activePeriodization?.name ?? activeSchedule?.name ?? null,
  };
}

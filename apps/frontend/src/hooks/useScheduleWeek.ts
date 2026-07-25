import { useMemo } from 'react';
import { useTableQuery } from '@/data/local/tableVersions';
import { skippedDays } from '@/data/local/schema';
import { localDayIndex } from '@/data/local/schedules/scheduleResolution';
import { listSkippedDayIndexes } from '@/data/local/schedules/skippedDays';
import {
  buildScheduleWeek,
  type ScheduleWeek,
} from '@/screens/schedule/components/scheduleWeekModel';
import { useSchedules } from './useSchedules';
import { useWorkoutTemplates } from './useWorkoutTemplates';
import { useWorkoutHistory } from './useWorkoutHistory';

type UseScheduleWeekResult = ScheduleWeek & {
  hasActiveSchedule: boolean;
  scheduleName: string | null;
};

// The active schedule's current Monday–Sunday week, enriched with logged
// (done) and skipped days, plus a tomorrow lookahead. Powers the Active tab.
export function useScheduleWeek(): UseScheduleWeekResult {
  const { activeSchedule, today } = useSchedules();
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
      buildScheduleWeek(
        activeSchedule,
        templates,
        today,
        doneDayIndexes,
        skippedDayIndexes,
      ),
    [activeSchedule, templates, today, doneDayIndexes, skippedDayIndexes],
  );

  return {
    ...week,
    hasActiveSchedule: activeSchedule != null,
    scheduleName: activeSchedule?.name ?? null,
  };
}

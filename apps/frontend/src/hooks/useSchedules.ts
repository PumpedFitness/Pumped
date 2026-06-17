import { useCallback, useMemo } from 'react';
import { useTableQuery } from '@/data/local/tableVersions';
import { schedules, scheduleSlots } from '@/data/local/schema';
import {
  deleteSchedule as deleteScheduleFn,
  listSchedules,
  saveSchedule as saveScheduleFn,
  setActiveSchedule,
} from '@/data/local/schedules/schedules';
import {
  localDayIndex,
  resolveDay,
} from '@/data/local/schedules/scheduleResolution';
import type { Schedule, SaveScheduleInput } from '@/types/schedule';

type UseSchedulesResult = {
  schedules: Schedule[];
  advancedSchedules: Schedule[];
  activeSchedule: Schedule | null;
  today: number;
  todayTemplateIds: string[];
  saveSchedule: (input: SaveScheduleInput) => Schedule;
  setActive: (scheduleId: string, active: boolean) => void;
  deleteSchedule: (scheduleId: string) => void;
};

export function useSchedules(): UseSchedulesResult {
  const allSchedules = useTableQuery([schedules, scheduleSlots], () =>
    listSchedules(),
  );

  const advancedSchedules = useMemo(
    () => allSchedules.filter(schedule => schedule.kind === 'ADVANCED'),
    [allSchedules],
  );
  const activeSchedule = useMemo(
    () => advancedSchedules.find(schedule => schedule.isActive) ?? null,
    [advancedSchedules],
  );

  const today = localDayIndex();
  const todayTemplateIds = useMemo(
    () => resolveDay(allSchedules, today).templateIds,
    [allSchedules, today],
  );

  const saveSchedule = useCallback(
    (input: SaveScheduleInput) => saveScheduleFn(input),
    [],
  );
  const setActive = useCallback(
    (scheduleId: string, active: boolean) =>
      setActiveSchedule(scheduleId, active),
    [],
  );
  const deleteSchedule = useCallback(
    (scheduleId: string) => deleteScheduleFn(scheduleId),
    [],
  );

  return {
    schedules: allSchedules,
    advancedSchedules,
    activeSchedule,
    today,
    todayTemplateIds,
    saveSchedule,
    setActive,
    deleteSchedule,
  };
}

// Pure schedule math — no DB access. Local time is the source of truth for day
// boundaries everywhere here; nothing uses UTC clock time.

import type { ResolvedDay, Schedule } from '@/types/schedule';

const MS_PER_DAY = 86_400_000;

function mod(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

// Local-midnight day index: whole days since the 1970 epoch, derived from the
// device's local calendar date. It advances exactly at local midnight and is
// DST-safe because it uses calendar components, not elapsed milliseconds.
export function localDayIndex(timestamp: number = Date.now()): number {
  const date = new Date(timestamp);
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY,
  );
}

// Weekday with Monday = 0 … Sunday = 6, derived purely from a day index.
// Day index 0 (1970-01-01) was a Thursday, i.e. Monday-based index 3.
export function weekdayMon0(dayIndex: number): number {
  return mod(dayIndex + 3, 7);
}

// Day index of the Monday that starts the local week containing `dayIndex`.
export function startOfWeek(dayIndex: number): number {
  return dayIndex - weekdayMon0(dayIndex);
}

// The rotation offset a schedule maps a given local day onto.
export function dayOffsetForDay(schedule: Schedule, dayIndex: number): number {
  if (schedule.recurrenceType === 'CYCLE') {
    return mod(dayIndex - schedule.anchorDay, schedule.periodLength);
  }
  // WEEKLY: count whole weeks between the anchor's Monday and the target's
  // Monday, wrap by the rotation length, then add the weekday within the week.
  const weeks = Math.round(
    (startOfWeek(dayIndex) - startOfWeek(schedule.anchorDay)) / 7,
  );
  const weekIndex = mod(weeks, schedule.periodLength);
  return weekIndex * 7 + weekdayMon0(dayIndex);
}

// Ordered workout template ids a single schedule places on the given day.
export function templateIdsForDay(
  schedule: Schedule,
  dayIndex: number,
): string[] {
  const offset = dayOffsetForDay(schedule, dayIndex);
  return schedule.slots
    .filter(slot => slot.dayOffset === offset)
    .sort((a, b) => a.position - b.position)
    .map(slot => slot.workoutTemplateId);
}

// Today's workouts come from the single active schedule (if any).
export function resolveDay(
  schedules: Schedule[],
  dayIndex: number,
): ResolvedDay {
  const active = schedules.find(schedule => schedule.isActive);
  return {
    dayIndex,
    templateIds: active ? templateIdsForDay(active, dayIndex) : [],
  };
}

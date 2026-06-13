// Pure validation rules for workout data. No DB access.

import { i18n } from '@/i18n';
import type { WorkoutScheduleType, WorkoutWeekday } from '@/data/local/enums';

export const LOCAL_USER_ID = 'local';

export type WorkoutTemplateScheduleInput = {
  type: WorkoutScheduleType;
  interval: number;
  weekdays?: WorkoutWeekday[];
};

export function requireText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(i18n.t('errors.fieldBlank', { field }));
  }
  return normalized;
}

export function validateSchedule(
  schedule: WorkoutTemplateScheduleInput | null | undefined,
): WorkoutTemplateScheduleInput | null {
  if (!schedule) {
    return null;
  }
  if (!Number.isInteger(schedule.interval) || schedule.interval < 1) {
    throw new Error(i18n.t('errors.scheduleIntervalPositive'));
  }

  const weekdays = [...new Set(schedule.weekdays ?? [])];
  if (schedule.type === 'DAYS' && weekdays.length > 0) {
    throw new Error(i18n.t('errors.dayScheduleNoWeekdays'));
  }
  if (schedule.type === 'WEEKS' && weekdays.length === 0) {
    throw new Error(i18n.t('errors.weekScheduleNeedsWeekday'));
  }

  return { ...schedule, weekdays };
}

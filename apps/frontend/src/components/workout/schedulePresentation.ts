import type { TFunction } from 'i18next';
import type { Schedule } from '@/types/schedule';

// "2-week rotation · 3 workouts" style summary for a Schedule.
export function formatScheduleSummary(
  t: TFunction,
  schedule: Schedule,
): string {
  const workouts = new Set(schedule.slots.map(slot => slot.workoutTemplateId))
    .size;
  const rotation =
    schedule.recurrenceType === 'WEEKLY'
      ? t('schedule.summary.weeks', { count: schedule.periodLength })
      : t('schedule.summary.days', { count: schedule.periodLength });
  return `${rotation} · ${t('schedule.summary.workouts', { count: workouts })}`;
}

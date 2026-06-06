import type { WorkoutTemplate } from '../../types/workout';

const WEEKDAY_LABELS = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
} as const;

export function countTemplateSets(template: WorkoutTemplate): number {
  return template.exercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0,
  );
}

export function formatTemplateSchedule(template: WorkoutTemplate): string {
  const { schedule } = template;
  if (!schedule) {
    return 'No schedule';
  }

  if (schedule.type === 'DAYS') {
    return schedule.interval === 1
      ? 'Every day'
      : `Every ${schedule.interval} days`;
  }

  const days = schedule.weekdays
    .map(weekday => WEEKDAY_LABELS[weekday])
    .join(', ');
  const interval =
    schedule.interval === 1 ? 'Every week' : `Every ${schedule.interval} weeks`;

  return `${interval} · ${days}`;
}

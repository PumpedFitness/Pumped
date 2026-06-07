import type { WorkoutTemplateColor } from '../../../data/local/enums';
import type { WorkoutTemplate } from '../../../types/workout';

export type WorkoutTemplateColorOption = {
  value: WorkoutTemplateColor;
  label: string;
  hex: string;
};

export const WORKOUT_TEMPLATE_COLORS: WorkoutTemplateColorOption[] = [
  { value: 'TERRACOTTA', label: 'Terracotta', hex: '#C67B52' },
  { value: 'HONEY', label: 'Honey', hex: '#C2974C' },
  { value: 'SAGE', label: 'Sage', hex: '#7E9061' },
  { value: 'ROSE', label: 'Rose', hex: '#B26B62' },
  { value: 'MOSS', label: 'Moss', hex: '#46583C' },
  { value: 'SLATE', label: 'Slate', hex: '#68706A' },
];

const WEEKDAY_LABELS = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
} as const;

export function getWorkoutTemplateColor(
  color: WorkoutTemplateColor,
): WorkoutTemplateColorOption {
  return (
    WORKOUT_TEMPLATE_COLORS.find(option => option.value === color) ??
    WORKOUT_TEMPLATE_COLORS[0]
  );
}

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

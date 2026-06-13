import type { TFunction } from 'i18next';
import type { WorkoutTemplateColor, WorkoutWeekday } from '@/data/local/enums';
import type { WorkoutTemplate } from '@/types/workout';

type WorkoutTemplateColorLabelKey =
  | 'templateEditor.appearance.colors.terracotta'
  | 'templateEditor.appearance.colors.honey'
  | 'templateEditor.appearance.colors.sage'
  | 'templateEditor.appearance.colors.rose'
  | 'templateEditor.appearance.colors.moss'
  | 'templateEditor.appearance.colors.slate';

type WorkoutTemplateColorOption = {
  value: WorkoutTemplateColor;
  labelKey: WorkoutTemplateColorLabelKey;
  hex: string;
};

export const WORKOUT_TEMPLATE_COLORS: WorkoutTemplateColorOption[] = [
  {
    value: 'TERRACOTTA',
    labelKey: 'templateEditor.appearance.colors.terracotta',
    hex: '#C67B52',
  },
  {
    value: 'HONEY',
    labelKey: 'templateEditor.appearance.colors.honey',
    hex: '#C2974C',
  },
  {
    value: 'SAGE',
    labelKey: 'templateEditor.appearance.colors.sage',
    hex: '#7E9061',
  },
  {
    value: 'ROSE',
    labelKey: 'templateEditor.appearance.colors.rose',
    hex: '#B26B62',
  },
  {
    value: 'MOSS',
    labelKey: 'templateEditor.appearance.colors.moss',
    hex: '#46583C',
  },
  {
    value: 'SLATE',
    labelKey: 'templateEditor.appearance.colors.slate',
    hex: '#68706A',
  },
];

const WEEKDAY_LABEL_KEYS: Record<
  WorkoutWeekday,
  | 'plan.schedule.weekdayShort.monday'
  | 'plan.schedule.weekdayShort.tuesday'
  | 'plan.schedule.weekdayShort.wednesday'
  | 'plan.schedule.weekdayShort.thursday'
  | 'plan.schedule.weekdayShort.friday'
  | 'plan.schedule.weekdayShort.saturday'
  | 'plan.schedule.weekdayShort.sunday'
> = {
  MONDAY: 'plan.schedule.weekdayShort.monday',
  TUESDAY: 'plan.schedule.weekdayShort.tuesday',
  WEDNESDAY: 'plan.schedule.weekdayShort.wednesday',
  THURSDAY: 'plan.schedule.weekdayShort.thursday',
  FRIDAY: 'plan.schedule.weekdayShort.friday',
  SATURDAY: 'plan.schedule.weekdayShort.saturday',
  SUNDAY: 'plan.schedule.weekdayShort.sunday',
};

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

export function formatTemplateSchedule(
  t: TFunction,
  schedule: WorkoutTemplate['schedule'],
): string {
  if (!schedule) {
    return t('plan.schedule.none');
  }

  if (schedule.type === 'DAYS') {
    return schedule.interval === 1
      ? t('plan.schedule.everyDay')
      : t('plan.schedule.everyNDays', { count: schedule.interval });
  }

  const days = schedule.weekdays
    .map(weekday => t(WEEKDAY_LABEL_KEYS[weekday]))
    .join(', ');
  const interval: string =
    schedule.interval === 1
      ? t('plan.schedule.everyWeek')
      : t('plan.schedule.everyNWeeks', { count: schedule.interval });

  return `${interval} · ${days}`;
}

import type { WorkoutWeekday } from '../../data/local/enums';
import type { WorkoutSession, WorkoutTemplate } from '../../types/workout';
import { getWorkoutTemplateColor } from './workoutTemplateColors';

export type WorkoutCalendarEntry = {
  id: string;
  name: string;
  color: string;
  kind: 'COMPLETED' | 'PLANNED';
  templateId: string | null;
};

export type WorkoutCalendarDay = {
  date: Date;
  key: string;
  inMonth: boolean;
  isToday: boolean;
  entries: WorkoutCalendarEntry[];
};

const WEEKDAY_INDEX: Record<WorkoutWeekday, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date): Date {
  const result = startOfDay(date);
  result.setDate(result.getDate() - result.getDay());
  return result;
}

function differenceInCalendarDays(later: Date, earlier: Date): number {
  const laterUtc = Date.UTC(
    later.getFullYear(),
    later.getMonth(),
    later.getDate(),
  );
  const earlierUtc = Date.UTC(
    earlier.getFullYear(),
    earlier.getMonth(),
    earlier.getDate(),
  );
  return Math.floor((laterUtc - earlierUtc) / 86_400_000);
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isPlannedOnDate(template: WorkoutTemplate, date: Date): boolean {
  const { schedule } = template;
  if (!schedule || template.status !== 'ACTIVE') {
    return false;
  }

  const anchor = startOfDay(new Date(template.createdAt));
  if (date < anchor) {
    return false;
  }

  if (schedule.type === 'DAYS') {
    return differenceInCalendarDays(date, anchor) % schedule.interval === 0;
  }

  const selectedWeekdays = new Set(
    schedule.weekdays.map(weekday => WEEKDAY_INDEX[weekday]),
  );
  const weekDifference =
    differenceInCalendarDays(startOfWeek(date), startOfWeek(anchor)) / 7;

  return (
    Number.isInteger(weekDifference) &&
    weekDifference % schedule.interval === 0 &&
    selectedWeekdays.has(date.getDay())
  );
}

export function buildWorkoutCalendarDays(
  month: Date,
  templates: WorkoutTemplate[],
  sessions: WorkoutSession[],
  now = new Date(),
): WorkoutCalendarDay[] {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - monthStart.getDay());
  const gridEnd = new Date(monthEnd);
  gridEnd.setDate(gridEnd.getDate() + (6 - monthEnd.getDay()));

  const completedByDate = new Map<string, WorkoutCalendarEntry[]>();
  const templatesById = new Map(
    templates.map(template => [template.id, template] as const),
  );
  sessions
    .filter(session => session.endedAt !== null)
    .forEach(session => {
      const key = dateKey(new Date(session.startedAt));
      const entries = completedByDate.get(key) ?? [];
      const sourceTemplate = session.workoutTemplateId
        ? templatesById.get(session.workoutTemplateId)
        : null;
      entries.push({
        id: session.id,
        name: session.name,
        color: sourceTemplate
          ? getWorkoutTemplateColor(sourceTemplate.color).hex
          : '#68706A',
        kind: 'COMPLETED',
        templateId: session.workoutTemplateId,
      });
      completedByDate.set(key, entries);
    });

  const today = startOfDay(now);
  const days: WorkoutCalendarDay[] = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const date = new Date(cursor);
    const key = dateKey(date);
    const completed = completedByDate.get(key) ?? [];
    const completedTemplateIds = new Set(
      completed
        .map(entry => entry.templateId)
        .filter((templateId): templateId is string => templateId !== null),
    );
    const planned =
      date >= today
        ? templates
            .filter(
              template =>
                !completedTemplateIds.has(template.id) &&
                isPlannedOnDate(template, date),
            )
            .map(template => ({
              id: `${template.id}:${key}`,
              name: template.name,
              color: getWorkoutTemplateColor(template.color).hex,
              kind: 'PLANNED' as const,
              templateId: template.id,
            }))
        : [];

    days.push({
      date,
      key,
      inMonth: date.getMonth() === month.getMonth(),
      isToday: dateKey(date) === dateKey(today),
      entries: [...completed, ...planned],
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

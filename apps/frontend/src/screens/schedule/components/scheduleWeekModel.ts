// Pure presentation model for the active-schedule week overview. No DB access —
// `useScheduleWeek` wires the data and calls into here. Day boundaries follow
// the same local-midnight day index used everywhere else (see
// scheduleResolution); nothing here touches UTC clock time.

import type { WorkoutTemplateColor } from '@/data/local/enums';
import type { IconName } from '@pumped/ui/icons/ClayIcon';
import type { Schedule } from '@/types/schedule';
import type { WorkoutTemplate } from '@/types/workout';
import {
  startOfWeek,
  templateIdsForDay,
  weekdayMon0,
} from '@/data/local/schedules/scheduleResolution';

const DAYS_PER_WEEK = 7;

// A workout placed on a schedule day, reduced to just its visual identity.
export type ScheduledTemplate = {
  id: string;
  name: string;
  color: WorkoutTemplateColor;
  icon: IconName | null;
  picture: string | null;
};

// Mutually exclusive per-day states for the week strip. Precedence (highest
// first): done > skipped > rest > planned — a logged workout always wins.
export type WeekDayStatus = 'rest' | 'planned' | 'done' | 'skipped';

export type WeekDay = {
  dayIndex: number;
  weekday: number; // Monday = 0 … Sunday = 6
  isToday: boolean;
  isPast: boolean;
  status: WeekDayStatus;
  templates: ScheduledTemplate[];
};

export type TomorrowPlan = {
  isRest: boolean;
  templates: ScheduledTemplate[];
};

export type ScheduleWeek = {
  days: WeekDay[];
  tomorrow: TomorrowPlan;
};

function toScheduledTemplate(template: WorkoutTemplate): ScheduledTemplate {
  return {
    id: template.id,
    name: template.name,
    color: template.color,
    icon: template.icon,
    picture: template.picture,
  };
}

function resolveTemplates(
  ids: string[],
  templatesById: Map<string, WorkoutTemplate>,
): ScheduledTemplate[] {
  return ids
    .map(id => templatesById.get(id))
    .filter((template): template is WorkoutTemplate => template != null)
    .map(toScheduledTemplate);
}

function dayStatus(
  templates: ScheduledTemplate[],
  isDone: boolean,
  isSkipped: boolean,
): WeekDayStatus {
  if (isDone) {
    return 'done';
  }
  if (isSkipped) {
    return 'skipped';
  }
  return templates.length === 0 ? 'rest' : 'planned';
}

// Builds the Monday–Sunday overview for the local week containing `todayIndex`,
// plus a lookahead at tomorrow. `schedule` is the active schedule, or null.
export function buildScheduleWeek(
  schedule: Schedule | null,
  templates: WorkoutTemplate[],
  todayIndex: number,
  doneDayIndexes: Set<number>,
  skippedDayIndexes: number[],
): ScheduleWeek {
  const templatesById = new Map(
    templates.map(template => [template.id, template]),
  );
  const skipped = new Set(skippedDayIndexes);
  const weekStart = startOfWeek(todayIndex);

  const templatesForDay = (dayIndex: number): ScheduledTemplate[] =>
    schedule
      ? resolveTemplates(templateIdsForDay(schedule, dayIndex), templatesById)
      : [];

  const days = Array.from({ length: DAYS_PER_WEEK }, (_, offset): WeekDay => {
    const dayIndex = weekStart + offset;
    const dayTemplates = templatesForDay(dayIndex);
    return {
      dayIndex,
      weekday: weekdayMon0(dayIndex),
      isToday: dayIndex === todayIndex,
      isPast: dayIndex < todayIndex,
      status: dayStatus(
        dayTemplates,
        doneDayIndexes.has(dayIndex),
        skipped.has(dayIndex),
      ),
      templates: dayTemplates,
    };
  });

  const tomorrowTemplates = templatesForDay(todayIndex + 1);

  return {
    days,
    tomorrow: {
      isRest: tomorrowTemplates.length === 0,
      templates: tomorrowTemplates,
    },
  };
}

import type { WorkoutSession, WorkoutTemplate } from '../../types/workout';
import { buildWorkoutCalendarDays } from './workoutCalendarModel';

function createTemplate(
  overrides: Partial<WorkoutTemplate> = {},
): WorkoutTemplate {
  return {
    id: 'template-1',
    userId: 'local',
    name: 'Push Day',
    description: null,
    status: 'ACTIVE',
    color: 'TERRACOTTA',
    schedule: {
      type: 'WEEKS',
      interval: 1,
      weekdays: ['MONDAY'],
    },
    exercises: [],
    createdAt: new Date(2026, 5, 1).getTime(),
    updatedAt: new Date(2026, 5, 1).getTime(),
    ...overrides,
  };
}

function createSession(
  overrides: Partial<WorkoutSession> = {},
): WorkoutSession {
  return {
    id: 'session-1',
    userId: 'local',
    workoutTemplateId: 'template-1',
    name: 'Push Day',
    startedAt: new Date(2026, 5, 1, 18).getTime(),
    endedAt: new Date(2026, 5, 1, 19).getTime(),
    notes: null,
    ...overrides,
  };
}

describe('buildWorkoutCalendarDays', () => {
  test('shows completed sessions and future active recurrence entries', () => {
    const days = buildWorkoutCalendarDays(
      new Date(2026, 5, 1),
      [createTemplate()],
      [createSession()],
      new Date(2026, 5, 6),
    );

    expect(days.find(day => day.key === '2026-06-01')?.entries[0]?.kind).toBe(
      'COMPLETED',
    );
    expect(days.find(day => day.key === '2026-06-01')?.entries[0]?.color).toBe(
      '#C67B52',
    );
    expect(days.find(day => day.key === '2026-06-08')?.entries[0]?.kind).toBe(
      'PLANNED',
    );
  });

  test('does not generate plans for inactive or archived templates', () => {
    const days = buildWorkoutCalendarDays(
      new Date(2026, 5, 1),
      [
        createTemplate({ status: 'INACTIVE' }),
        createTemplate({ id: 'template-2', status: 'ARCHIVED' }),
      ],
      [],
      new Date(2026, 5, 1),
    );

    expect(days.flatMap(day => day.entries)).toEqual([]);
  });

  test('uses createdAt as the interval anchor for day schedules', () => {
    const template = createTemplate({
      schedule: { type: 'DAYS', interval: 3, weekdays: [] },
      createdAt: new Date(2026, 5, 2).getTime(),
    });
    const days = buildWorkoutCalendarDays(
      new Date(2026, 5, 1),
      [template],
      [],
      new Date(2026, 5, 1),
    );
    const plannedDates = days
      .filter(day => day.entries.some(entry => entry.kind === 'PLANNED'))
      .map(day => day.key);

    expect(plannedDates.slice(0, 3)).toEqual([
      '2026-06-02',
      '2026-06-05',
      '2026-06-08',
    ]);
  });
});

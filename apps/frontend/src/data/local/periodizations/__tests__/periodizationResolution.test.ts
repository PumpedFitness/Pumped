import type {
  Periodization,
  PeriodizationWorkout,
} from '@/types/periodization';
import {
  periodizationWorkoutDayOffsets,
  periodizationWorkoutsForDay,
} from '../periodizationResolution';

function workout(
  id: string,
  week: number,
  weekday: number,
): PeriodizationWorkout {
  return {
    id,
    sourceTemplateId: null,
    week,
    weekday,
    template: {
      id: `template-${id}`,
      userId: 'local',
      name: id,
      description: null,
      color: 'TERRACOTTA',
      icon: null,
      picture: null,
      exercises: [],
      supersets: [],
      createdAt: 1,
      updatedAt: 1,
    },
  };
}

const periodization: Periodization = {
  id: 'periodization',
  userId: 'local',
  name: 'Strength cycle',
  anchorDay: 100,
  isActive: true,
  createdAt: 1,
  updatedAt: 1,
  phases: [
    {
      id: 'base',
      name: 'Base',
      workouts: [workout('base-1', 1, 1), workout('base-2', 2, 3)],
    },
    {
      id: 'peak',
      name: 'Peak',
      workouts: [workout('peak-1', 1, 1)],
    },
  ],
};

describe('periodization resolution', () => {
  it('places phases sequentially from the activation day', () => {
    const offsets = periodizationWorkoutDayOffsets(periodization);

    expect(offsets.get(0)?.[0].id).toBe('base-1');
    expect(offsets.get(9)?.[0].id).toBe('base-2');
    expect(offsets.get(14)?.[0].id).toBe('peak-1');
  });

  it('resolves private workouts without repeating the periodization', () => {
    expect(periodizationWorkoutsForDay(periodization, 100)[0].id).toBe(
      'base-1',
    );
    expect(periodizationWorkoutsForDay(periodization, 114)[0].id).toBe(
      'peak-1',
    );
    expect(periodizationWorkoutsForDay(periodization, 121)).toEqual([]);
  });

  it('does not resolve before activation', () => {
    expect(periodizationWorkoutsForDay(periodization, 99)).toEqual([]);
  });
});

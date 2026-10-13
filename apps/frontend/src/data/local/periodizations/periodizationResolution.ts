import type {
  Periodization,
  PeriodizationPhase,
  PeriodizationWorkout,
} from '@/types/periodization';

const DAYS_PER_WEEK = 7;

export function phaseLengthDays(phase: PeriodizationPhase): number {
  const lastWeek = phase.workouts.reduce(
    (latest, workout) => Math.max(latest, workout.week),
    0,
  );
  return lastWeek * DAYS_PER_WEEK;
}

export function periodizationWorkoutDayOffsets(
  periodization: Periodization,
): Map<number, PeriodizationWorkout[]> {
  const byOffset = new Map<number, PeriodizationWorkout[]>();
  let phaseStart = 0;

  periodization.phases.forEach(phase => {
    phase.workouts.forEach(workout => {
      const offset =
        phaseStart +
        (Math.max(1, workout.week) - 1) * DAYS_PER_WEEK +
        (Math.max(1, workout.weekday) - 1);
      byOffset.set(offset, [...(byOffset.get(offset) ?? []), workout]);
    });
    phaseStart += phaseLengthDays(phase);
  });

  return byOffset;
}

export function periodizationWorkoutsForDay(
  periodization: Periodization,
  dayIndex: number,
): PeriodizationWorkout[] {
  if (periodization.anchorDay == null || dayIndex < periodization.anchorDay) {
    return [];
  }
  return (
    periodizationWorkoutDayOffsets(periodization).get(
      dayIndex - periodization.anchorDay,
    ) ?? []
  );
}

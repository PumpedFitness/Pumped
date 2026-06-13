import type { TFunction } from 'i18next';

export type WorkoutOverlayProgress = {
  completedSets: number;
  totalSets: number;
  percentage: number;
};

export function getWorkoutOverlayProgress(
  completedSets: number,
  totalSets: number,
): WorkoutOverlayProgress {
  const safeTotal = Math.max(0, Math.floor(totalSets));
  const safeCompleted = Math.min(
    safeTotal,
    Math.max(0, Math.floor(completedSets)),
  );

  return {
    completedSets: safeCompleted,
    totalSets: safeTotal,
    percentage:
      safeTotal === 0 ? 0 : Math.round((safeCompleted / safeTotal) * 100),
  };
}

export function formatWorkoutElapsedTime(
  t: TFunction,
  elapsedMinutes: number,
): string {
  const safeMinutes = Math.max(0, Math.floor(elapsedMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours === 0) {
    return t('common.minutesShort', { count: minutes });
  }

  return t('common.elapsedHoursMinutes', {
    hours,
    minutes: minutes.toString().padStart(2, '0'),
  });
}

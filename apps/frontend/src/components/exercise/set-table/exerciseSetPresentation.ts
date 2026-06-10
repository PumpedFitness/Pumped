import type { WorkoutSetType } from '../../../data/local/enums';
import type { EditableExerciseSet } from '../../../types/exercise';

export const EXERCISE_SET_TYPE_OPTIONS: {
  value: WorkoutSetType;
  label: string;
}[] = [
  { value: 'WARMUP', label: 'Warmup' },
  { value: 'NORMAL', label: 'Working' },
  { value: 'BACKOFF', label: 'Backoff' },
  { value: 'DROP', label: 'Drop' },
  { value: 'AMRAP', label: 'AMRAP' },
];

export function formatExerciseSetSummary(sets: EditableExerciseSet[]): string {
  return EXERCISE_SET_TYPE_OPTIONS.map(option => ({
    label: option.label.toLocaleLowerCase(),
    count: sets.filter(set => set.setType === option.value).length,
  }))
    .filter(item => item.count > 0)
    .map(item => `${item.count} ${item.label}`)
    .join(' · ');
}

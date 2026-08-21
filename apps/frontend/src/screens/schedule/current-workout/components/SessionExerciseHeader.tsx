import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { CurrentWorkoutExercise } from '@/stores/currentWorkoutModel';
import type { ExerciseSectionState } from '@/components/exercise/ExerciseSectionHeader';
import { SessionBlockBand } from './SessionBlockBand';
import { requestRemoveExercise } from './currentWorkoutConfirm';

export type ExerciseTrayState = ExerciseSectionState;

type SessionExerciseHeaderProps = {
  index: number;
  name: string;
  exercise: CurrentWorkoutExercise;
  state: ExerciseTrayState;
  /** Stable store action; the confirm flow is bound here, not by the parent,
   *  so this component memoizes cleanly. */
  onRemoveExercise: (exerciseId: string) => void;
};

// The band that pins while scrolling this exercise's sets. Only the active
// exercise wears the accent; finished read as done, upcoming as still ahead.
// Memoized: unchanged exercises don't re-render when a sibling is edited.
export const SessionExerciseHeader = memo(function SessionExerciseHeader({
  index,
  name,
  exercise,
  state,
  onRemoveExercise,
}: SessionExerciseHeaderProps) {
  const { t } = useTranslation();
  const doneCount = exercise.sets.filter(set => set.isDone).length;

  return (
    <SessionBlockBand
      index={index}
      title={name}
      statusLabel={t('currentWorkout.setsDoneShort', {
        done: doneCount,
        total: exercise.sets.length,
      })}
      state={state}
      removeAccessibilityLabel={t('currentWorkout.removeExerciseA11y', {
        name,
      })}
      onRemove={() => {
        void requestRemoveExercise(t, exercise, onRemoveExercise);
      }}
    />
  );
});

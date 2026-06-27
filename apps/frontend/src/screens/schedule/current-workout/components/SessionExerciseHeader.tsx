import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { CurrentWorkoutExercise } from '@/stores/currentWorkoutModel';
import {
  ExerciseSectionHeader,
  type ExerciseSectionState,
} from '@/components/exercise/ExerciseSectionHeader';
import { exerciseColorTokens } from './exerciseColorTokens';
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

// A thin, opaque band that pins while scrolling its sets. Only the active
// exercise wears its color; finished read as done, upcoming as disabled.
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
    <ExerciseSectionHeader
      index={index}
      name={name}
      doneCount={doneCount}
      totalCount={exercise.sets.length}
      state={state}
      tone={exerciseColorTokens(exercise.color)}
      removeAccessibilityLabel={t('currentWorkout.removeExerciseA11y', {
        name,
      })}
      onRemove={() => {
        void requestRemoveExercise(t, exercise, onRemoveExercise);
      }}
    />
  );
});

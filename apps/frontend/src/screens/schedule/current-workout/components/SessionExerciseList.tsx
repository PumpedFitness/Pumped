import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type {
  CurrentWorkoutExercise,
  UpdateCurrentWorkoutSetInput,
} from '@/stores/currentWorkoutModel';
import type { ExerciseOption } from '@/types/exercise';
import type { SetTypeWithFields } from '@/types/setType';
import { colors } from '@/theme/tokens';
import type { SetTypeOption } from '@/components/exercise/set-table';
import { ClayIcon } from '@/components/icons/ClayIcon';
import {
  SessionExerciseHeader,
  type ExerciseTrayState,
} from './SessionExerciseHeader';
import { SessionExerciseBody } from './SessionExerciseBody';
import { allSetsDone, useExerciseSnap } from './useExerciseSnap';

type SessionExerciseListProps = {
  exercises: CurrentWorkoutExercise[];
  optionById: Map<string, ExerciseOption>;
  setTypeOptions: SetTypeOption[];
  setTypesById: Map<string, SetTypeWithFields>;
  weightUnit: WeightUnit;
  onCreateSetType: (name: string) => string;
  // Raw, stable actions — the memoized header/body bind their own per-exercise
  // callbacks from these so only the edited exercise re-renders.
  addSet: (exerciseId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    values: UpdateCurrentWorkoutSetInput,
  ) => void;
  toggleSetDone: (exerciseId: string, setId: string) => boolean;
  restStart: (seconds: number, sourceSetId?: string) => void;
  activeRestSetId: string | null;
  removeSet: (exerciseId: string, setId: string) => void;
  removeExercise: (exerciseId: string) => void;
  onChooseExercises: (selectedExerciseIds: string[]) => void;
};

function bodyOpacity(state: ExerciseTrayState): number {
  if (state === 'active') {
    return 1;
  }
  return state === 'finished' ? 0.55 : 0.45;
}

export function SessionExerciseList({
  exercises,
  optionById,
  setTypeOptions,
  setTypesById,
  weightUnit,
  onCreateSetType,
  addSet,
  updateSet,
  toggleSetDone,
  restStart,
  activeRestSetId,
  removeSet,
  removeExercise,
  onChooseExercises,
}: SessionExerciseListProps) {
  const { t } = useTranslation();
  const {
    activeId,
    setOffset,
    scrollProps,
    onViewportLayout,
    onContentSizeChange,
  } = useExerciseSnap(exercises);

  const nameFor = (id: string) =>
    optionById.get(id)?.name ?? t('plan.card.fallbackExercise');
  const stateFor = (exercise: CurrentWorkoutExercise): ExerciseTrayState =>
    allSetsDone(exercise)
      ? 'finished'
      : exercise.id === activeId
      ? 'active'
      : 'upcoming';

  const items: ReactNode[] = [];
  const stickyIndices: number[] = [];

  exercises.forEach((exercise, index) => {
    const state = stateFor(exercise);
    stickyIndices.push(items.length);
    items.push(
      <View
        key={`header-${exercise.id}`}
        onLayout={event => setOffset(index, event.nativeEvent.layout.y)}
      >
        <SessionExerciseHeader
          index={index}
          name={nameFor(exercise.exerciseId)}
          exercise={exercise}
          state={state}
          onRemoveExercise={removeExercise}
        />
      </View>,
    );
    items.push(
      <View
        key={`body-${exercise.id}`}
        className="gap-3 px-4 pb-6 pt-3"
        style={{ opacity: bodyOpacity(state) }}
      >
        <SessionExerciseBody
          exercise={exercise}
          weightUnit={weightUnit}
          setTypeOptions={setTypeOptions}
          setTypesById={setTypesById}
          onCreateSetType={onCreateSetType}
          updateSet={updateSet}
          toggleSetDone={toggleSetDone}
          restStart={restStart}
          activeRestSetId={activeRestSetId}
          removeSet={removeSet}
          addSet={addSet}
        />
      </View>,
    );
  });

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="pb-8"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={stickyIndices}
      onLayout={onViewportLayout}
      onContentSizeChange={onContentSizeChange}
      {...scrollProps}
    >
      {items}

      <Pressable
        accessibilityRole="button"
        className="mx-4 mt-2 min-h-14 flex-row items-center justify-center gap-2 rounded-[20px] border border-dashed border-accent bg-accent-soft px-4"
        onPress={() =>
          onChooseExercises(exercises.map(exercise => exercise.exerciseId))
        }
      >
        <ClayIcon name="plus" size={18} color={colors.accent} />
        <Text className="t-label text-accent">
          {t('currentWorkout.addOrRemoveExercises')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type {
  CurrentWorkout,
  UpdateCurrentWorkoutSetInput,
} from '@/stores/currentWorkoutModel';
import type { ExerciseOption } from '@/types/exercise';
import type { SetTypeWithFields } from '@/types/setType';
import { colors } from '@pumped/ui/theme/tokens';
import type { SetTypeOption } from '@/components/exercise/set-table';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { blockSnapSections, buildSessionBlocks } from './sessionBlocks';
import { useSectionSnap } from './useSectionSnap';
import { useSessionListItems } from './useSessionListItems';

type SessionExerciseListProps = {
  workout: CurrentWorkout;
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
  onSetLogged: (restSeconds: number, sourceSetId?: string) => void;
  activeRestSetId: string | null;
  removeSet: (exerciseId: string, setId: string) => void;
  removeExercise: (exerciseId: string) => void;
  onChooseExercises: (selectedExerciseIds: string[]) => void;
};

export function SessionExerciseList({
  workout,
  optionById,
  setTypeOptions,
  setTypesById,
  weightUnit,
  onCreateSetType,
  addSet,
  updateSet,
  toggleSetDone,
  onSetLogged,
  activeRestSetId,
  removeSet,
  removeExercise,
  onChooseExercises,
}: SessionExerciseListProps) {
  const { t } = useTranslation();
  const blocks = useMemo(() => buildSessionBlocks(workout), [workout]);
  const sections = useMemo(() => blockSnapSections(blocks), [blocks]);
  const {
    activeId,
    setOffset,
    scrollProps,
    onViewportLayout,
    onContentSizeChange,
  } = useSectionSnap(sections);

  const nameFor = useCallback(
    (id: string) => optionById.get(id)?.name ?? t('plan.card.fallbackExercise'),
    [optionById, t],
  );

  const { items, stickyIndices } = useSessionListItems({
    blocks,
    activeId,
    nameFor,
    setOffset,
    weightUnit,
    setTypeOptions,
    setTypesById,
    onCreateSetType,
    addSet,
    updateSet,
    toggleSetDone,
    onSetLogged,
    activeRestSetId,
    removeSet,
    removeExercise,
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
          onChooseExercises(
            workout.exercises.map(exercise => exercise.exerciseId),
          )
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

import { useMemo, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type {
  CurrentWorkoutExercise,
  UpdateCurrentWorkoutSetInput,
} from '@/stores/currentWorkoutModel';
import type { SetTypeWithFields } from '@/types/setType';
import { colors } from '@pumped/ui/theme/tokens';
import type { SetTypeOption } from '@/components/exercise/set-table';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import {
  SessionExerciseHeader,
  type ExerciseTrayState,
} from './SessionExerciseHeader';
import { SessionSupersetHeader } from './SessionSupersetHeader';
import { SessionExerciseBody } from './SessionExerciseBody';
import { SupersetRoundList } from './SupersetRoundList';
import { blockState, type SessionBlock } from './sessionBlocks';

type UseSessionListItemsOptions = {
  blocks: SessionBlock[];
  activeId: string | undefined;
  nameFor: (exerciseId: string) => string;
  setOffset: (index: number, y: number) => void;
  weightUnit: WeightUnit;
  setTypeOptions: SetTypeOption[];
  setTypesById: Map<string, SetTypeWithFields>;
  onCreateSetType: (name: string) => string;
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
};

// Blocks you are not on recede, but stay readable — you scroll through them to
// see what is coming, and the set cards inside already dim their own upcoming
// rows, so the two dims multiply.
function bodyOpacity(state: ExerciseTrayState): number {
  if (state === 'active') {
    return 1;
  }
  return state === 'finished' ? 0.6 : 0.55;
}

/**
 * Builds the sticky headers and bodies for the session list.
 *
 * Memoized deliberately: the snap hook flips a piece of state while you scroll,
 * and without this every set card would be rebuilt mid-gesture — which reads as
 * the scroll stuttering.
 */
export function useSessionListItems({
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
}: UseSessionListItemsOptions): {
  items: ReactNode[];
  stickyIndices: number[];
} {
  const { t } = useTranslation();

  return useMemo(() => {
    const renderBody = (exercise: CurrentWorkoutExercise) => (
      <SessionExerciseBody
        exercise={exercise}
        weightUnit={weightUnit}
        setTypeOptions={setTypeOptions}
        setTypesById={setTypesById}
        onCreateSetType={onCreateSetType}
        updateSet={updateSet}
        toggleSetDone={toggleSetDone}
        onSetLogged={onSetLogged}
        activeRestSetId={activeRestSetId}
        removeSet={removeSet}
        addSet={addSet}
      />
    );
    const items: ReactNode[] = [];
    const stickyIndices: number[] = [];

    blocks.forEach((block, index) => {
      const state = blockState(block, activeId);
      stickyIndices.push(items.length);
      items.push(
        <View
          key={`header-${block.id}`}
          onLayout={event => setOffset(index, event.nativeEvent.layout.y)}
        >
          {block.kind === 'superset' ? (
            <SessionSupersetHeader
              index={index}
              title={block.exercises
                .map(item => nameFor(item.exerciseId))
                .join(' · ')}
              currentRound={block.currentRound}
              rounds={block.rounds}
              state={state}
            />
          ) : (
            <SessionExerciseHeader
              index={index}
              name={nameFor(block.exercise.exerciseId)}
              exercise={block.exercise}
              state={state}
              onRemoveExercise={removeExercise}
            />
          )}
        </View>,
      );

      items.push(
        <View
          key={`body-${block.id}`}
          className="gap-3 px-4 pb-7 pt-1"
          style={{ opacity: bodyOpacity(state) }}
        >
          {block.kind === 'superset' ? (
            <>
              <SupersetRoundList
                block={block}
                nameFor={nameFor}
                weightUnit={weightUnit}
                setTypeOptions={setTypeOptions}
                setTypesById={setTypesById}
                onCreateSetType={onCreateSetType}
                updateSet={updateSet}
                toggleSetDone={toggleSetDone}
                onSetLogged={onSetLogged}
                activeRestSetId={activeRestSetId}
                removeSet={removeSet}
              />
              <Pressable
                accessibilityRole="button"
                testID="add_superset_round"
                className="min-h-11 flex-row items-center justify-center gap-2 rounded-full bg-accent-soft px-4"
                onPress={() => addSet(block.exercises[0].id)}
              >
                <ClayIcon name="plus" size={16} color={colors.accent} />
                <Text className="t-label text-accent">
                  {t('currentWorkout.superset.addRound')}
                </Text>
              </Pressable>
            </>
          ) : (
            renderBody(block.exercise)
          )}
        </View>,
      );
    });

    return { items, stickyIndices };
  }, [
    blocks,
    activeId,
    nameFor,
    weightUnit,
    setTypeOptions,
    setTypesById,
    onCreateSetType,
    updateSet,
    toggleSetDone,
    onSetLogged,
    activeRestSetId,
    removeSet,
    removeExercise,
    addSet,
    setOffset,
    t,
  ]);
}

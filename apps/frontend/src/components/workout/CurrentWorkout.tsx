import { useEffect, useRef } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from 'heroui-native';
import { useCurrentWorkout } from '../../hooks/useCurrentWorkout';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type {
  CurrentWorkoutExercise,
  CurrentWorkoutSet,
} from '../../stores/currentWorkoutModel';
import { colors } from '../../theme/tokens';
import type { ExerciseSelectionResult } from '../../types/exercise';
import { ExerciseCard } from '../exercise/ExerciseCard';
import {
  EXERCISE_SET_TYPE_OPTIONS,
  ExerciseSetTable,
} from '../exercise/set-table';
import { ClayIcon } from '../icons/ClayIcon';

type CurrentWorkoutProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CurrentWorkout'>;
  exerciseSelection?: ExerciseSelectionResult;
  onChooseExercises: (selectedExerciseIds: string[]) => void;
};

type CurrentWorkoutNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'CurrentWorkout'
>;
type FinishWorkout = ReturnType<typeof useCurrentWorkout>['finishWorkout'];
type RemoveSet = ReturnType<typeof useCurrentWorkout>['removeSet'];
type RemoveExercise = ReturnType<typeof useCurrentWorkout>['removeExercise'];

type EmptyWorkoutProps = {
  onBack: () => void;
};

function EmptyWorkout({ onBack }: EmptyWorkoutProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-surface-card">
        <ClayIcon name="dumbbell" size={26} color={colors.muted} />
      </View>
      <Text className="t-heading text-center">No workout in progress</Text>
      <Text className="t-caption text-center">
        Start one by selecting a template from your plan.
      </Text>
      <Button
        className="mt-2 rounded-full"
        variant="secondary"
        feedbackVariant="scale"
        onPress={onBack}
      >
        <Button.Label>Back to plan</Button.Label>
      </Button>
    </View>
  );
}

function completeWorkout(
  navigation: CurrentWorkoutNavigation,
  finishWorkout: FinishWorkout,
  updateTemplate = false,
) {
  try {
    finishWorkout({ updateTemplate });
    navigation.goBack();
  } catch (error) {
    Alert.alert(
      'Could not finish workout',
      error instanceof Error ? error.message : 'Please try again.',
    );
  }
}

function requestFinishWorkout(
  navigation: CurrentWorkoutNavigation,
  finishWorkout: FinishWorkout,
  canFinish: boolean,
  shouldPromptForTemplate: boolean,
) {
  if (!canFinish) {
    return;
  }
  if (!shouldPromptForTemplate) {
    completeWorkout(navigation, finishWorkout);
    return;
  }
  Alert.alert(
    'Update workout template?',
    'You changed the exercises or sets during this workout.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Keep template',
        onPress: () => completeWorkout(navigation, finishWorkout),
      },
      {
        text: 'Update template',
        onPress: () => completeWorkout(navigation, finishWorkout, true),
      },
    ],
  );
}

function requestRemoveSet(
  exercise: CurrentWorkoutExercise,
  set: CurrentWorkoutSet,
  removeSet: RemoveSet,
) {
  if (!set.isDone) {
    removeSet(exercise.id, set.id);
    return;
  }
  Alert.alert('Remove completed set?', 'Its logged values will be deleted.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Remove',
      style: 'destructive',
      onPress: () => removeSet(exercise.id, set.id),
    },
  ]);
}

function requestRemoveExercise(
  exercise: CurrentWorkoutExercise,
  removeExercise: RemoveExercise,
) {
  const remove = () => removeExercise(exercise.id);
  if (!exercise.sets.some(set => set.isDone)) {
    remove();
    return;
  }
  Alert.alert(
    'Remove completed exercise?',
    'Its completed sets and logged values will be deleted.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: remove },
    ],
  );
}

function applyExerciseSelection(
  currentExercises: CurrentWorkoutExercise[],
  selection: ExerciseSelectionResult,
  updateExercises: (exerciseIds: string[]) => void,
) {
  const selectedIds = new Set(selection.exerciseIds);
  const removesCompletedExercise = currentExercises.some(
    exercise =>
      !selectedIds.has(exercise.exerciseId) &&
      exercise.sets.some(set => set.isDone),
  );
  if (!removesCompletedExercise) {
    updateExercises(selection.exerciseIds);
    return;
  }
  Alert.alert(
    'Remove completed exercises?',
    'Completed sets and their logged values will be deleted.',
    [
      { text: 'Keep exercises', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => updateExercises(selection.exerciseIds),
      },
    ],
  );
}

type CurrentWorkoutFooterProps = {
  canFinish: boolean;
  shouldPromptForTemplate: boolean;
  navigation: CurrentWorkoutNavigation;
  finishWorkout: FinishWorkout;
  discardWorkout: () => void;
};

function CurrentWorkoutFooter({
  canFinish,
  shouldPromptForTemplate,
  navigation,
  finishWorkout,
  discardWorkout,
}: CurrentWorkoutFooterProps) {
  const requestDiscard = () =>
    Alert.alert(
      'Discard workout?',
      'This workout has not been saved to your history.',
      [
        { text: 'Keep workout', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            discardWorkout();
            navigation.goBack();
          },
        },
      ],
    );

  return (
    <View className="flex-row gap-3 border-t border-border-soft bg-background px-5 py-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Discard workout"
        className="h-12 w-12 items-center justify-center rounded-full border border-border-hairline bg-surface-card active:bg-surface-sunk"
        onPress={requestDiscard}
      >
        <ClayIcon name="trash" size={19} color={colors.muted} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Finish workout"
        accessibilityState={{ disabled: !canFinish }}
        disabled={!canFinish}
        className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full ${
          canFinish ? 'bg-accent' : 'bg-surface-sunk'
        }`}
        onPress={() =>
          requestFinishWorkout(
            navigation,
            finishWorkout,
            canFinish,
            shouldPromptForTemplate,
          )
        }
      >
        <ClayIcon
          name="check"
          size={18}
          color={canFinish ? colors.accentInk : colors.muted}
        />
        <Text
          className={`t-label ${
            canFinish ? 'text-accent-foreground' : 'text-muted'
          }`}
        >
          Finish workout
        </Text>
      </Pressable>
    </View>
  );
}

export function CurrentWorkout({
  navigation,
  exerciseSelection,
  onChooseExercises,
}: CurrentWorkoutProps) {
  const appliedSelectionId = useRef<string | null>(null);
  const {
    currentWorkout,
    exerciseOptions,
    discardWorkout,
    finishWorkout,
    updateSet,
    toggleSetDone,
    addSet,
    removeSet,
    updateExercises,
    removeExercise,
    canFinish,
    structureChanged,
  } = useCurrentWorkout();

  useEffect(() => {
    if (
      exerciseSelection &&
      exerciseSelection.id !== appliedSelectionId.current &&
      currentWorkout
    ) {
      appliedSelectionId.current = exerciseSelection.id;
      applyExerciseSelection(
        currentWorkout.exercises,
        exerciseSelection,
        updateExercises,
      );
    }
  }, [currentWorkout, exerciseSelection, updateExercises]);

  if (!currentWorkout) {
    return <EmptyWorkout onBack={() => navigation.goBack()} />;
  }

  const exerciseNames = new Map(
    exerciseOptions.map(exercise => [exercise.id, exercise.name] as const),
  );
  const allSets = currentWorkout.exercises.flatMap(exercise => exercise.sets);
  const completedSetCount = allSets.filter(set => set.isDone).length;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-8 pt-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-[24px] bg-moss px-5 py-5">
          <Text className="t-eyebrow text-surface-card/70">
            Workout in progress
          </Text>
          <Text className="t-title mt-1 text-surface-card">
            {currentWorkout.name}
          </Text>
          <Text className="t-caption mt-2 text-surface-card/70">
            {completedSetCount} of {allSets.length} sets completed
          </Text>
        </View>

        {currentWorkout.exercises.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            name={exerciseNames.get(exercise.exerciseId) ?? 'Exercise'}
            description={`${
              exercise.sets.filter(set => set.isDone).length
            } of ${exercise.sets.length} sets done`}
            onRemove={() => requestRemoveExercise(exercise, removeExercise)}
          >
            <ExerciseSetTable
              sets={exercise.sets}
              setTypeOptions={EXERCISE_SET_TYPE_OPTIONS}
              onAddSet={() => addSet(exercise.id)}
              onChangeSet={(setId, values) =>
                updateSet(exercise.id, setId, values)
              }
              onToggleSetDone={setId => toggleSetDone(exercise.id, setId)}
              onRemoveSet={set => requestRemoveSet(exercise, set, removeSet)}
            />
          </ExerciseCard>
        ))}

        <Pressable
          accessibilityRole="button"
          className="min-h-14 flex-row items-center justify-center gap-2 rounded-[20px] border border-dashed border-accent bg-accent-soft px-4"
          onPress={() =>
            onChooseExercises(
              currentWorkout.exercises.map(exercise => exercise.exerciseId),
            )
          }
        >
          <ClayIcon name="plus" size={18} color={colors.accent} />
          <Text className="t-label text-accent">Add or remove exercises</Text>
        </Pressable>
      </ScrollView>

      <CurrentWorkoutFooter
        canFinish={canFinish}
        shouldPromptForTemplate={structureChanged}
        navigation={navigation}
        finishWorkout={finishWorkout}
        discardWorkout={discardWorkout}
      />
    </View>
  );
}

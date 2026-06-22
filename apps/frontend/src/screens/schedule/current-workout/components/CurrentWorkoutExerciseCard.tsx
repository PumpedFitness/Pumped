import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import {
  ExerciseSetTable,
  type SetTypeOption,
} from '@/components/exercise/set-table';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import { useProgressionSuggestion } from '@/hooks/useProgressionSuggestion';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type {
  CurrentWorkoutExercise,
  CurrentWorkoutSet,
  UpdateCurrentWorkoutSetInput,
} from '@/stores/currentWorkoutModel';
import type { SetTypeWithFields } from '@/types/setType';
import type { WorkoutTemplateExercise } from '@/types/workout';
import type { DeleteResult } from '@/components/clay/SwipeToDelete';
import {
  requestRemoveExercise,
  requestRemoveSet,
} from './currentWorkoutConfirm';

type CurrentWorkoutNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'CurrentWorkout'
>;

type CurrentWorkoutExerciseCardProps = {
  exercise: CurrentWorkoutExercise;
  exerciseName: string;
  setTypeOptions: SetTypeOption[];
  setTypesById: Map<string, SetTypeWithFields>;
  weightUnit: WeightUnit;
  createSetType: (name: string) => string;
  navigation: CurrentWorkoutNavigation;
  addSet: (exerciseId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    values: UpdateCurrentWorkoutSetInput,
  ) => void;
  toggleSetDone: (exerciseId: string, setId: string) => boolean;
  removeSet: (exerciseId: string, setId: string) => void;
  removeExercise: (exerciseId: string) => void;
};

function fallbackTemplateExercise(
  exercise: CurrentWorkoutExercise,
): WorkoutTemplateExercise {
  return {
    id: exercise.sourceTemplateExerciseId ?? exercise.id,
    exerciseId: exercise.exerciseId,
    position: exercise.position,
    typeId: null,
    color: exercise.color,
    goal: exercise.goal,
    notes: exercise.notes,
    progressionMode: undefined,
    sets: exercise.sets.map(set => ({
      id: set.sourceTemplateSetId ?? set.id,
      position: set.position,
      setType: set.setType,
      restSeconds: set.restSeconds,
      fieldValues: [],
    })),
  };
}

function repeatSuggestedSets<T>(sets: T[], count: number): T[] {
  if (sets.length >= count) {
    return sets.slice(0, count);
  }
  const lastSet = sets[sets.length - 1];
  if (!lastSet) {
    return [];
  }
  return Array.from({ length: count }, (_, index) => sets[index] ?? lastSet);
}

export function CurrentWorkoutExerciseCard({
  exercise,
  exerciseName,
  setTypeOptions,
  setTypesById,
  weightUnit,
  createSetType,
  navigation,
  addSet,
  updateSet,
  toggleSetDone,
  removeSet,
  removeExercise,
}: CurrentWorkoutExerciseCardProps) {
  const { t } = useTranslation();
  const doneCount = exercise.sets.filter(set => set.isDone).length;
  const progression = useProgressionSuggestion({
    exerciseId: exercise.exerciseId,
    templateExercise:
      exercise.sourceTemplateExercise ?? fallbackTemplateExercise(exercise),
  });
  const suggestedSets = useMemo(
    () => repeatSuggestedSets(progression.suggestedSets, exercise.sets.length),
    [exercise.sets.length, progression.suggestedSets],
  );

  return (
    <ExerciseCard
      name={exerciseName}
      description={t('currentWorkout.setsDone', {
        done: doneCount,
        total: exercise.sets.length,
      })}
      progress={exercise.sets.length ? doneCount / exercise.sets.length : 0}
      openAccessibilityLabel={t('exerciseOverview.openA11y', {
        name: exerciseName,
      })}
      onOpen={() =>
        navigation.navigate('EditExercise', {
          exerciseId: exercise.exerciseId,
        })
      }
      onRemove={() => requestRemoveExercise(t, exercise, removeExercise)}
    >
      <ExerciseSetTable
        sets={exercise.sets}
        suggestedSets={suggestedSets}
        setTypeOptions={setTypeOptions}
        setTypesById={setTypesById}
        weightUnit={weightUnit}
        onCreateSetType={createSetType}
        onAddSet={() => addSet(exercise.id)}
        onChangeSet={(setId, values) => updateSet(exercise.id, setId, values)}
        onToggleSetDone={setId => toggleSetDone(exercise.id, setId)}
        onRemoveSet={(set: CurrentWorkoutSet): DeleteResult =>
          requestRemoveSet(t, exercise, set, removeSet)
        }
      />
    </ExerciseCard>
  );
}

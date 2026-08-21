import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type { ExerciseOption } from '@/types/exercise';
import type { PerformedSet } from '@/types/workout';
import type { WorkoutHistoryItem } from '@/hooks/useWorkoutHistory';
import type { SetTypeOption } from '@/components/exercise/set-table';
import type { SetTypeWithFields } from '@/types/setType';
import { CompletedExerciseHistorySection } from '@/components/exercise/CompletedExerciseHistorySection';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import {
  groupCompletedExercises,
  supersetLabels,
  type CompletedExercise,
} from './completedWorkoutModel';

type CompletedWorkoutExercisesProps = {
  workout: WorkoutHistoryItem;
  exerciseById: Map<string, ExerciseOption>;
  setTypeOptions: SetTypeOption[];
  setTypesById: Map<string, SetTypeWithFields>;
  weightUnit: WeightUnit;
  previousSetsFor: (exercise: CompletedExercise) => PerformedSet[] | undefined;
};

export function CompletedWorkoutExercises({
  workout,
  exerciseById,
  setTypeOptions,
  setTypesById,
  weightUnit,
  previousSetsFor,
}: CompletedWorkoutExercisesProps) {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const exercises = groupCompletedExercises(workout);
  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(
    () => new Set(exercises.map(exercise => exercise.key)),
  );
  // Supersets are labelled A, B, … in the order they were performed, so two
  // exercises that alternated read as one block instead of two unrelated ones.
  const labelBySupersetId = supersetLabels(exercises);

  const toggleCollapsed = (exerciseKey: string) => {
    setCollapsedExercises(previous => {
      const next = new Set(previous);
      if (next.has(exerciseKey)) {
        next.delete(exerciseKey);
      } else {
        next.add(exerciseKey);
      }
      return next;
    });
  };

  return (
    <>
      {exercises.map((exercise, index) => {
        const option = exerciseById.get(exercise.exerciseId);
        const supersetLabel = exercise.supersetId
          ? labelBySupersetId.get(exercise.supersetId)
          : undefined;

        return (
          <CompletedExerciseHistorySection
            key={exercise.key}
            collapseControlPosition="overview"
            index={index}
            name={option?.name ?? t('common.unknownExercise')}
            eyebrow={
              supersetLabel
                ? t('completedWorkout.supersetBadge', { label: supersetLabel })
                : undefined
            }
            sets={exercise.sets}
            previousSets={previousSetsFor(exercise)}
            isCollapsed={collapsedExercises.has(exercise.key)}
            onOpen={
              option
                ? () =>
                    navigation.navigate('EditExercise', {
                      exerciseId: exercise.exerciseId,
                    })
                : undefined
            }
            onToggleCollapsed={() => toggleCollapsed(exercise.key)}
            setTypeOptions={setTypeOptions}
            setTypesById={setTypesById}
            weightUnit={weightUnit}
          />
        );
      })}
    </>
  );
}

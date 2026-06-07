import { Pressable, Text } from 'react-native';
import { colors } from '../../../theme/tokens';
import { ExerciseEditorCard } from '../../exercise/ExerciseEditorCard';
import {
  EXERCISE_SET_TYPE_OPTIONS,
  formatExerciseSetSummary,
} from '../../exercise/exerciseSetPresentation';
import { FormSection } from '../../forms/FormSection';
import { ClayIcon } from '../../icons/ClayIcon';
import {
  createDraftSet,
  type DraftExercise,
} from '../hooks/useWorkoutTemplateEditorDraft';

type WorkoutTemplateExercisesSectionProps = {
  exercises: DraftExercise[];
  exerciseNames: Map<string, string>;
  onChooseExercises: () => void;
  onUpdateExercise: (
    exerciseId: string,
    update: (exercise: DraftExercise) => DraftExercise,
  ) => void;
  onRemoveExercise: (exerciseId: string) => void;
};

export function WorkoutTemplateExercisesSection({
  exercises,
  exerciseNames,
  onChooseExercises,
  onUpdateExercise,
  onRemoveExercise,
}: WorkoutTemplateExercisesSectionProps) {
  const chooseExercisesAction = (
    <Pressable
      accessibilityRole="button"
      className="min-h-11 flex-row items-center gap-2 rounded-full bg-accent-soft px-4"
      onPress={onChooseExercises}
    >
      <ClayIcon name="search" size={16} color={colors.accent} />
      <Text className="t-label text-accent">Choose exercises</Text>
    </Pressable>
  );

  return (
    <FormSection
      title="Exercises"
      description={`${exercises.length} ${
        exercises.length === 1 ? 'exercise' : 'exercises'
      }`}
      action={chooseExercisesAction}
    >
      {exercises.map(exercise => (
        <ExerciseEditorCard
          key={exercise.exerciseId}
          exercise={exercise}
          name={exerciseNames.get(exercise.exerciseId) ?? 'Unknown exercise'}
          setTypeOptions={EXERCISE_SET_TYPE_OPTIONS}
          setSummary={formatExerciseSetSummary(exercise.sets)}
          onGoalChange={goal =>
            onUpdateExercise(exercise.exerciseId, current => ({
              ...current,
              goal,
            }))
          }
          onSetChange={(setIndex, set) =>
            onUpdateExercise(exercise.exerciseId, current => ({
              ...current,
              sets: current.sets.map((currentSet, index) =>
                index === setIndex ? set : currentSet,
              ),
            }))
          }
          onAddSet={() =>
            onUpdateExercise(exercise.exerciseId, current => ({
              ...current,
              sets: [...current.sets, createDraftSet()],
            }))
          }
          onRemoveSet={setIndex =>
            onUpdateExercise(exercise.exerciseId, current => ({
              ...current,
              sets:
                current.sets.length > 1
                  ? current.sets.filter((_, index) => index !== setIndex)
                  : current.sets,
            }))
          }
          onRemove={() => onRemoveExercise(exercise.exerciseId)}
        />
      ))}

      {exercises.length === 0 && (
        <Pressable
          accessibilityRole="button"
          className="items-center gap-3 rounded-[22px] border border-dashed border-border-hairline px-5 py-8"
          onPress={onChooseExercises}
        >
          <ClayIcon name="search" size={23} color={colors.accent} />
          <Text className="t-heading">Search the exercise library</Text>
          <Text className="t-caption text-center">
            Choose exercises on a dedicated page and return here to set goals
            and working sets.
          </Text>
        </Pressable>
      )}
    </FormSection>
  );
}

import { Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/tokens';
import { ExerciseEditorCard } from './ExerciseEditorCard';
import {
  SET_TYPE_OPTIONS,
  formatExerciseSetSummary,
} from '@/components/exercise/set-table';
import { FormSection } from './FormSection';
import { ClayIcon } from '@/components/icons/ClayIcon';
import {
  createDraftSet,
  type DraftExercise,
} from '@/screens/workout/template-editor/useWorkoutTemplateEditorDraft';

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
  const { t } = useTranslation();

  const chooseExercisesAction = (
    <Pressable
      accessibilityRole="button"
      className="min-h-11 flex-row items-center gap-2 rounded-full bg-accent-soft px-4"
      onPress={onChooseExercises}
    >
      <ClayIcon name="search" size={16} color={colors.accent} />
      <Text className="t-label text-accent">
        {t('templateEditor.exercises.choose')}
      </Text>
    </Pressable>
  );

  return (
    <FormSection
      title={t('templateEditor.exercises.title')}
      description={t('common.exercise', { count: exercises.length })}
      action={chooseExercisesAction}
    >
      {exercises.map(exercise => (
        <ExerciseEditorCard
          key={exercise.exerciseId}
          exercise={exercise}
          name={
            exerciseNames.get(exercise.exerciseId) ??
            t('common.unknownExercise')
          }
          setTypeOptions={SET_TYPE_OPTIONS}
          setSummary={formatExerciseSetSummary(t, exercise.sets)}
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
          <Text className="t-heading">
            {t('templateEditor.exercises.emptyTitle')}
          </Text>
          <Text className="t-caption text-center">
            {t('templateEditor.exercises.emptyBody')}
          </Text>
        </Pressable>
      )}
    </FormSection>
  );
}

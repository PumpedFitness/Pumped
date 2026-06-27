import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { ExerciseSetTable } from '@/components/exercise/set-table';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTemplateEditor } from '@/screens/library/template-editor/templateEditorContext';
import type { EditorExercise } from '@/screens/library/template-editor/useEditorExercises';

type ExerciseEditorCardProps = {
  exercise: EditorExercise;
  dragHandle?: ReactNode;
};

export function ExerciseEditorCard({
  exercise,
  dragHandle,
}: ExerciseEditorCardProps) {
  const { t } = useTranslation();
  const { editExercise, openExerciseOverview, removeExercise } =
    useTemplateEditor();
  const { options: setTypeOptions, byId: setTypesById } = useSetTypeLibrary();
  const { profile } = useUserProfile();

  return (
    <ExerciseCard
      name={exercise.name}
      description={
        exercise.type?.name ?? t('templateEditor.exercises.cardDescription')
      }
      headerAccessory={dragHandle}
      openAccessibilityLabel={t('exerciseOverview.openA11y', {
        name: exercise.name,
      })}
      onOpen={() => openExerciseOverview(exercise)}
      onRemove={() => removeExercise(exercise.exerciseId)}
    >
      {exercise.goal ? (
        <Text className="t-caption text-foreground-secondary">
          {exercise.goal}
        </Text>
      ) : null}

      <Text className="t-label">
        {t('common.set', { count: exercise.sets.length })}
      </Text>

      {exercise.sets.length > 0 ? (
        <ExerciseSetTable
          readOnly
          mode="target"
          sets={exercise.sets}
          setTypeOptions={setTypeOptions}
          setTypesById={setTypesById}
          weightUnit={profile.weightUnit}
        />
      ) : (
        <Text className="t-caption text-muted">
          {t('templateEditor.exercises.noSets')}
        </Text>
      )}

      <Button
        variant="secondary"
        feedbackVariant="scale"
        onPress={() => editExercise(exercise)}
      >
        <Button.Label>{t('templateEditor.exercises.edit')}</Button.Label>
      </Button>
    </ExerciseCard>
  );
}

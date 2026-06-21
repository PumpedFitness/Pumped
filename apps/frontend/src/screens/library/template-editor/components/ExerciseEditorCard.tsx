import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
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
  const { editExercise, removeExercise } = useTemplateEditor();

  return (
    <ExerciseCard
      name={exercise.name}
      description={
        exercise.type?.name ?? t('templateEditor.exercises.cardDescription')
      }
      headerAccessory={dragHandle}
      onRemove={() => removeExercise(exercise.exerciseId)}
    >
      {exercise.goal ? (
        <Text className="t-caption text-foreground-secondary">
          {exercise.goal}
        </Text>
      ) : null}

      <View className="gap-2 rounded-[16px] border border-border-soft bg-surface-sunk p-3">
        <Text className="t-label">
          {t('common.set', { count: exercise.setViews.length })}
        </Text>

        {exercise.setViews.length > 0 ? (
          exercise.setViews.map((view, index) => (
            <View key={view.id} className="flex-row items-center gap-2">
              <Text className="w-5 text-center text-[12px] font-bold tabular-nums text-muted">
                {index + 1}
              </Text>
              <Text className="t-label w-20" numberOfLines={1}>
                {view.typeLabel}
              </Text>
              <Text
                className="t-caption flex-1 text-foreground-secondary"
                numberOfLines={1}
              >
                {view.detail || '—'}
              </Text>
            </View>
          ))
        ) : (
          <Text className="t-caption text-muted">
            {t('templateEditor.exercises.noSets')}
          </Text>
        )}
      </View>

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

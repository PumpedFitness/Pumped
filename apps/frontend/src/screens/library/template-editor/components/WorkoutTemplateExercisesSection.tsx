import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScrollViewContext from 'react-native/Libraries/Components/ScrollView/ScrollViewContext';
import {
  NestedReorderableList,
  useReorderableDrag,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { useTemplateEditor } from '@/screens/library/template-editor/templateEditorContext';
import type { EditorExercise } from '@/screens/library/template-editor/useEditorExercises';
import { ExerciseEditorCard } from './ExerciseEditorCard';
import { FormSection } from './FormSection';

function ExerciseDragHandle() {
  const { t } = useTranslation();
  const drag = useReorderableDrag();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('templateEditor.exercises.reorderA11y')}
      hitSlop={8}
      className="h-10 w-9 items-center justify-center rounded-full active:bg-surface-sunk"
      onLongPress={drag}
      delayLongPress={150}
    >
      <ClayIcon name="drag" size={18} color={colors.muted} />
    </Pressable>
  );
}

function renderItem({ item }: { item: EditorExercise }) {
  return (
    <ExerciseEditorCard exercise={item} dragHandle={<ExerciseDragHandle />} />
  );
}

export function WorkoutTemplateExercisesSection() {
  const { t } = useTranslation();
  const { exercises, chooseExercises, reorderExercises } = useTemplateEditor();

  const chooseExercisesAction = (
    <Pressable
      accessibilityRole="button"
      className="min-h-11 flex-row items-center gap-2 rounded-full bg-accent-soft px-4"
      onPress={chooseExercises}
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
      {exercises.length > 0 ? (
        // Hide the parent ScrollView context from the nested reorderable list:
        // it's intentionally nested inside the editor's ScrollViewContainer, and
        // this context is only read to emit the dev nesting warning.
        <ScrollViewContext.Provider value={null}>
          <NestedReorderableList
            data={exercises}
            scrollable={false}
            keyExtractor={(exercise, index) =>
              `template-exercise-${exercise.exerciseId}-${index}`
            }
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View className="h-3" />}
            onReorder={({ from, to }: ReorderableListReorderEvent) =>
              reorderExercises(from, to)
            }
          />
        </ScrollViewContext.Provider>
      ) : (
        <Pressable
          accessibilityRole="button"
          className="items-center gap-3 rounded-[22px] border border-dashed border-border-hairline px-5 py-8"
          onPress={chooseExercises}
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

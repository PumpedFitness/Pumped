import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from 'heroui-native';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import ScrollViewContext from 'react-native/Libraries/Components/ScrollView/ScrollViewContext';
import {
  NestedReorderableList,
  useReorderableDrag,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { colors } from '@pumped/ui/theme/tokens';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { SetSheetHost } from '@/components/exercise/set-table';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import { useTemplateEditor } from '@/screens/library/template-editor/templateEditorContext';
import type { EditorBlock } from '@/screens/library/template-editor/useEditorExercises';
import { ExerciseEditorCard } from './ExerciseEditorCard';
import { SupersetEditorCard } from './SupersetEditorCard';
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

function renderItem({ item }: { item: EditorBlock }) {
  if (item.kind === 'superset') {
    return (
      <SupersetEditorCard block={item} dragHandle={<ExerciseDragHandle />} />
    );
  }
  return (
    <ExerciseEditorCard
      exercise={item.exercise}
      headerAccessory={<ExerciseDragHandle />}
    />
  );
}

/** Stable across reorders — an index in the key would change every row's key on
 *  every drag, throwing away the memoized member cards underneath. */
function blockKey(block: EditorBlock): string {
  return block.kind === 'superset'
    ? `superset-${block.group.id}`
    : `exercise-${block.exercise.exerciseId}`;
}

export function WorkoutTemplateExercisesSection() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { exercises, blocks, chooseExercises, reorderBlocks, allowImport } =
    useTemplateEditor();
  const { options: setTypeOptions, createSetType } = useSetTypeLibrary();

  return (
    <FormSection
      title={t('templateEditor.exercises.title')}
      description={t('common.exercise', { count: exercises.length })}
    >
      <SetSheetHost
        setTypeOptions={setTypeOptions}
        onCreateSetType={createSetType}
      >
        <View className="gap-3">
          {exercises.length > 0 ? (
            // Hide the parent ScrollView context from the nested reorderable list:
            // it's intentionally nested inside the editor's ScrollViewContainer, and
            // this context is only read to emit the dev nesting warning.
            <ScrollViewContext.Provider value={null}>
              <NestedReorderableList
                data={blocks}
                scrollable={false}
                keyExtractor={blockKey}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View className="h-3" />}
                onReorder={({ from, to }: ReorderableListReorderEvent) =>
                  reorderBlocks(from, to)
                }
              />
            </ScrollViewContext.Provider>
          ) : (
            <>
              <View className="items-center gap-3 rounded-[22px] border border-dashed border-border-hairline px-5 py-8">
                <ClayIcon name="search" size={23} color={colors.accent} />
                <Text className="t-heading">
                  {t('templateEditor.exercises.emptyTitle')}
                </Text>
                <Text className="t-caption text-center">
                  {t('templateEditor.exercises.emptyBody')}
                </Text>
              </View>
              {allowImport ? (
                <Button
                  className="mt-1 self-center rounded-full"
                  variant="secondary"
                  feedbackVariant="scale"
                  onPress={() => navigation.navigate('ImportWorkoutTemplate')}
                >
                  <Button.Label>
                    {t('templateEditor.exercises.importPrevious')}
                  </Button.Label>
                </Button>
              ) : null}
            </>
          )}

          <Button
            className="h-12 rounded-full border border-dashed border-accent"
            variant="ghost"
            feedbackVariant="scale"
            onPress={chooseExercises}
          >
            <ClayIcon name="plus" size={16} color={colors.accent} />
            <Button.Label className="text-accent">
              {t('templateEditor.exercises.add')}
            </Button.Label>
          </Button>
        </View>
      </SetSheetHost>
    </FormSection>
  );
}

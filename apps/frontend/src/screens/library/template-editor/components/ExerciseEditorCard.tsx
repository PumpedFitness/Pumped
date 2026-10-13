import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SwipeToDelete } from '@pumped/ui/clay/SwipeToDelete';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import { TemplateSetTable } from '@/components/exercise/set-table';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTemplateEditor } from '@/screens/library/template-editor/templateEditorContext';
import type { EditorExercise } from '@/screens/library/template-editor/useEditorExercises';
import {
  createDraftSet,
  duplicateLastSet,
} from '@/screens/library/template-editor/useWorkoutTemplateEditorDraft';

type ExerciseEditorCardProps = {
  exercise: EditorExercise;
  /** Drag handle for a standalone exercise; the ▲/▼ controls for a superset
   *  member, whose whole block is dragged as one instead. */
  headerAccessory?: ReactNode;
};

export function ExerciseEditorCard({
  exercise,
  headerAccessory,
}: ExerciseEditorCardProps) {
  const { t } = useTranslation();
  const { openExerciseOverview, removeExercise, updateExercise } =
    useTemplateEditor();
  const {
    options: setTypeOptions,
    byId: setTypesById,
    createSetType,
  } = useSetTypeLibrary();
  const { profile } = useUserProfile();

  return (
    <SwipeToDelete
      onDelete={() => removeExercise(exercise.exerciseId)}
      borderRadius={0}
    >
      <View className="w-full gap-3 border-b border-border-soft bg-background py-4">
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={t('exerciseOverview.openA11y', {
              name: exercise.name,
            })}
            className="min-w-0 flex-1 flex-row items-center gap-1.5"
            onPress={() => openExerciseOverview(exercise)}
          >
            <Text className="t-heading shrink text-accent underline">
              {exercise.name}
            </Text>
            <ClayIcon name="chevron" size={15} color={colors.accent} />
          </Pressable>
          {headerAccessory}
        </View>

        {exercise.goal ? (
          <Text className="t-caption text-foreground-secondary">
            {exercise.goal}
          </Text>
        ) : null}

        <Text className="t-label">
          {exercise.setSummary || t('templateEditor.exercises.noSets')}
        </Text>

        <TemplateSetTable
          sets={exercise.sets}
          setTypeOptions={setTypeOptions}
          setTypesById={setTypesById}
          weightUnit={profile.weightUnit}
          onCreateSetType={createSetType}
          onAddSet={() =>
            updateExercise(exercise.exerciseId, current => ({
              ...current,
              sets: [...current.sets, createDraftSet()],
            }))
          }
          onDuplicateSet={() =>
            updateExercise(exercise.exerciseId, current => ({
              ...current,
              sets: duplicateLastSet(current.sets),
            }))
          }
          onChangeSet={(index, set) =>
            updateExercise(exercise.exerciseId, current => ({
              ...current,
              sets: current.sets.map((candidate, candidateIndex) =>
                candidateIndex === index ? set : candidate,
              ),
            }))
          }
          onRemoveSet={index =>
            updateExercise(exercise.exerciseId, current => ({
              ...current,
              sets:
                current.sets.length > 1
                  ? current.sets.filter(
                      (_, candidateIndex) => candidateIndex !== index,
                    )
                  : current.sets,
            }))
          }
        />
      </View>
    </SwipeToDelete>
  );
}

import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
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
  /** Drag handle for a standalone exercise; the ▲/▼ controls for a superset
   *  member, whose whole block is dragged as one instead. */
  headerAccessory?: ReactNode;
};

export function ExerciseEditorCard({
  exercise,
  headerAccessory,
}: ExerciseEditorCardProps) {
  const { t } = useTranslation();
  const {
    editExercise,
    openExerciseOverview,
    removeExercise,
    isExpanded,
    toggleExpanded,
  } = useTemplateEditor();
  const { options: setTypeOptions, byId: setTypesById } = useSetTypeLibrary();
  const { profile } = useUserProfile();
  const expanded = isExpanded(exercise.exerciseId);

  return (
    <ExerciseCard
      name={exercise.name}
      description={
        exercise.type?.name ?? t('templateEditor.exercises.cardDescription')
      }
      headerAccessory={headerAccessory}
      openAccessibilityLabel={t('exerciseOverview.openA11y', {
        name: exercise.name,
      })}
      isCollapsed={!expanded}
      collapseAccessibilityLabel={t(
        expanded
          ? 'templateEditor.exercises.collapseA11y'
          : 'templateEditor.exercises.expandA11y',
        { name: exercise.name },
      )}
      onToggleCollapsed={() => toggleExpanded(exercise.exerciseId)}
      onRemove={() => removeExercise(exercise.exerciseId)}
    >
      {exercise.goal ? (
        <Text className="t-caption text-foreground-secondary">
          {exercise.goal}
        </Text>
      ) : null}

      {/* Folded, the summary stands in for the set previews — it already reads
          "1 Warm-up · 3 Working", which is what the cards below would show. */}
      <Text className="t-label">
        {expanded
          ? t('common.set', { count: exercise.sets.length })
          : exercise.setSummary || t('templateEditor.exercises.noSets')}
      </Text>

      {expanded ? (
        <>
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

          {/* Opening the exercise's own page lives here rather than in the
              header, where its chevron read as a second fold control. Both
              carry an explicit pill — on this sunk card the stock variants
              render as bare text and don't read as tappable. */}
          <View className="flex-row gap-2">
            <Button
              className="min-h-11 flex-1 rounded-full border border-border-hairline bg-surface-card"
              variant="ghost"
              feedbackVariant="scale"
              onPress={() => openExerciseOverview(exercise)}
            >
              <Button.Label className="t-label text-foreground-secondary">
                {t('templateEditor.exercises.viewExercise')}
              </Button.Label>
            </Button>
            <Button
              className="min-h-11 flex-1 rounded-full bg-accent-soft"
              variant="ghost"
              feedbackVariant="scale"
              onPress={() => editExercise(exercise)}
            >
              <Button.Label className="t-label font-semibold text-accent">
                {t('templateEditor.exercises.edit')}
              </Button.Label>
            </Button>
          </View>
        </>
      ) : null}
    </ExerciseCard>
  );
}

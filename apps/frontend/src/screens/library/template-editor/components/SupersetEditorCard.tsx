import { useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
import { OptionalWheelPickerSheet } from '@pumped/ui/forms/OptionalWheelPickerSheet';
import {
  buildRestPickerConfig,
  formatRestValue,
} from '@/components/exercise/set-table';
import { PickerRow } from '@/components/exercise/PickerRow';
import { useTemplateEditor } from '@/screens/library/template-editor/templateEditorContext';
import type { EditorBlock } from '@/screens/library/template-editor/useEditorExercises';
import { ExerciseEditorCard } from './ExerciseEditorCard';
import { SupersetCardHeader } from './SupersetCardHeader';
import { SupersetMemberControls } from './SupersetMemberControls';

type SupersetBlockValue = Extract<EditorBlock, { kind: 'superset' }>;

type SupersetEditorCardProps = {
  block: SupersetBlockValue;
  dragHandle?: ReactNode;
};

/** Which of the group's two rest values the wheel is currently editing. */
type EditingRest = 'round' | 'transition';

export function SupersetEditorCard({
  block,
  dragHandle,
}: SupersetEditorCardProps) {
  const { t } = useTranslation();
  const {
    setSupersetRounds,
    ungroupSuperset,
    updateSuperset,
    moveSupersetMember,
    isExpanded,
    toggleExpanded,
  } = useTemplateEditor();
  const [editing, setEditing] = useState<EditingRest | null>(null);

  const { group, exercises, rounds } = block;
  // Folding the block hides its members too — it is one unit in the workout,
  // so it should take up one unit of space when you are not editing it.
  const blockKey = `superset:${group.id}`;
  const expanded = isExpanded(blockKey);
  const editingValue =
    editing === 'transition' ? group.transitionRestSeconds : group.restSeconds;
  // One sheet for both rows: which value it writes is decided when it opens.
  const restConfig = useMemo(
    () =>
      buildRestPickerConfig(t, editingValue, {
        title: t(
          editing === 'transition'
            ? 'templateEditor.superset.transitionRest'
            : 'templateEditor.superset.roundRest',
        ),
        description: t(
          editing === 'transition'
            ? 'templateEditor.superset.transitionRestHint'
            : 'templateEditor.superset.roundRestHint',
        ),
      }),
    [t, editing, editingValue],
  );

  return (
    <View className="gap-3 rounded-[24px] border border-accent-soft bg-surface-sunk p-3">
      <SupersetCardHeader
        rounds={rounds}
        memberCount={exercises.length}
        dragHandle={dragHandle}
        isCollapsed={!expanded}
        onToggleCollapsed={() => toggleExpanded(blockKey)}
        onChangeRounds={next => setSupersetRounds(group.id, next)}
      />

      {expanded ? (
        <>
          <PickerRow
            label={t('templateEditor.superset.roundRest')}
            value={
              group.restSeconds == null
                ? undefined
                : formatRestValue(group.restSeconds)
            }
            placeholder={t('templateEditor.superset.noRest')}
            onPress={() => setEditing('round')}
          />
          <PickerRow
            label={t('templateEditor.superset.transitionRest')}
            value={
              group.transitionRestSeconds == null
                ? undefined
                : formatRestValue(group.transitionRestSeconds)
            }
            placeholder={t('templateEditor.superset.noRest')}
            onPress={() => setEditing('transition')}
          />

          {exercises.map((exercise, index) => (
            <ExerciseEditorCard
              key={exercise.exerciseId}
              exercise={exercise}
              headerAccessory={
                <SupersetMemberControls
                  name={exercise.name}
                  canMoveUp={index > 0}
                  canMoveDown={index < exercises.length - 1}
                  onMoveUp={() =>
                    moveSupersetMember(group.id, index, index - 1)
                  }
                  onMoveDown={() =>
                    moveSupersetMember(group.id, index, index + 1)
                  }
                />
              }
            />
          ))}
          {/* An action on the group, so it sits with the group's contents
              rather than competing with the fold and drag controls. */}
          <Button
            className="min-h-11 rounded-full border border-border-hairline bg-surface-card"
            variant="ghost"
            feedbackVariant="scale"
            testID="ungroup_superset"
            onPress={() => ungroupSuperset(group.id)}
          >
            <Button.Label className="t-label text-foreground-secondary">
              {t('templateEditor.superset.ungroup')}
            </Button.Label>
          </Button>
        </>
      ) : null}

      <OptionalWheelPickerSheet
        visible={editing !== null}
        value={editingValue}
        config={restConfig}
        onClose={() => setEditing(null)}
        onChange={value =>
          updateSuperset(
            group.id,
            editing === 'transition'
              ? { transitionRestSeconds: value }
              : { restSeconds: value },
          )
        }
      />
    </View>
  );
}

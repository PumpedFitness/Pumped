import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
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

export function SupersetEditorCard({
  block,
  dragHandle,
}: SupersetEditorCardProps) {
  const { t } = useTranslation();
  const { ungroupSuperset, moveSupersetMember } = useTemplateEditor();
  const { group, exercises } = block;

  return (
    <View className="relative gap-3 border-l-2 border-l-accent pl-4">
      {/* A bracket keeps the members visibly grouped without turning the
          superset into a nested card. */}
      <View
        pointerEvents="none"
        className="absolute left-0 top-0 h-0.5 w-3 bg-accent"
      />
      <View
        pointerEvents="none"
        className="absolute bottom-0 left-0 h-0.5 w-3 bg-accent"
      />
      <SupersetCardHeader
        memberCount={exercises.length}
        dragHandle={dragHandle}
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
              onMoveUp={() => moveSupersetMember(group.id, index, index - 1)}
              onMoveDown={() => moveSupersetMember(group.id, index, index + 1)}
            />
          }
        />
      ))}
      <Button
        className="min-h-11 rounded-full border border-border-hairline bg-background"
        variant="ghost"
        feedbackVariant="scale"
        testID="ungroup_superset"
        onPress={() => ungroupSuperset(group.id)}
      >
        <Button.Label className="t-label text-foreground-secondary">
          {t('templateEditor.superset.ungroup')}
        </Button.Label>
      </Button>
    </View>
  );
}

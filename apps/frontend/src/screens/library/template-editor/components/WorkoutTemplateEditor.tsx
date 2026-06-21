import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
import { ScrollViewContainer } from 'react-native-reorderable-list';
import type { SaveWorkoutTemplateInput } from '@/data/local/workouts/templates';
import type { ExerciseOption } from '@/types/exercise';
import type { WorkoutTemplate } from '@/types/workout';
import { colors } from '@/theme/tokens';
import { AppView } from '@/components/layout/AppView';
import { ModalHeader } from '@/components/layout/ModalHeader';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { TemplateEditorProvider } from '@/screens/library/template-editor/templateEditorContext';
import { useTemplateEditorController } from '@/screens/library/template-editor/useTemplateEditorController';
import { WorkoutTemplateAppearanceSection } from './WorkoutTemplateAppearanceSection';
import { WorkoutTemplateDetailsSection } from './WorkoutTemplateDetailsSection';
import { WorkoutTemplateExercisesSection } from './WorkoutTemplateExercisesSection';

type WorkoutTemplateEditorProps = {
  template: WorkoutTemplate | null;
  exerciseOptions: ExerciseOption[];
  onSave: (input: SaveWorkoutTemplateInput) => WorkoutTemplate;
  onDelete: (templateId: string) => void;
};

const CONTENT_STYLE = {
  gap: 28,
  paddingHorizontal: 20,
  paddingBottom: 40,
  paddingTop: 24,
} as const;

export function WorkoutTemplateEditor({
  template,
  exerciseOptions,
  onSave,
  onDelete,
}: WorkoutTemplateEditorProps) {
  const { t } = useTranslation();
  const { draft, updateDraft, save, requestDelete, close, context } =
    useTemplateEditorController({
      template,
      exerciseOptions,
      onSave,
      onDelete,
    });

  return (
    <AppView edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ModalHeader
          title={
            template
              ? t('templateEditor.editTitle')
              : t('templateEditor.newTitle')
          }
          rightLabel={t('templateEditor.save')}
          onLeftPress={close}
          onRightPress={save}
        />

        <ScrollViewContainer
          style={{ flex: 1 }}
          contentContainerStyle={CONTENT_STYLE}
          keyboardShouldPersistTaps="handled"
        >
          <WorkoutTemplateDetailsSection
            autoFocus={!template}
            name={draft.name}
            description={draft.description}
            onNameChange={name => updateDraft({ name })}
            onDescriptionChange={description => updateDraft({ description })}
          />
          <WorkoutTemplateAppearanceSection
            color={draft.color}
            onColorChange={color => updateDraft({ color })}
          />

          <TemplateEditorProvider value={context}>
            <WorkoutTemplateExercisesSection />
          </TemplateEditorProvider>

          {draft.error && (
            <View className="rounded-[18px] bg-danger/10 px-4 py-3">
              <Text className="t-label text-danger">{draft.error}</Text>
            </View>
          )}

          <Button
            className="h-14 rounded-full bg-accent"
            feedbackVariant="scale"
            onPress={save}
          >
            <Button.Label className="text-[16px] font-bold text-accent-foreground">
              {t('templateEditor.saveCta')}
            </Button.Label>
          </Button>

          {template && (
            <Button
              className="h-14 rounded-full"
              variant="danger-soft"
              feedbackVariant="scale"
              onPress={requestDelete}
            >
              <ClayIcon name="trash" size={18} color={colors.danger} />
              <Button.Label>{t('templateEditor.deleteCta')}</Button.Label>
            </Button>
          )}
        </ScrollViewContainer>
      </KeyboardAvoidingView>
    </AppView>
  );
}

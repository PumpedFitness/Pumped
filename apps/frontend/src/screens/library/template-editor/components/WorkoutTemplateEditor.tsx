import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
import { ScrollViewContainer } from 'react-native-reorderable-list';
import type { SaveWorkoutTemplateInput } from '@/data/local/workouts/templates';
import type { ExerciseOption } from '@/types/exercise';
import type { WorkoutTemplate } from '@/types/workout';
import { colors } from '@pumped/ui/theme/tokens';
import { AppView } from '@/components/layout/AppView';
import { ModalHeader } from '@/components/layout/ModalHeader';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { TemplateEditorProvider } from '@/screens/library/template-editor/templateEditorContext';
import { useTemplateEditorController } from '@/screens/library/template-editor/useTemplateEditorController';
import { WorkoutAppearanceControl } from './WorkoutAppearanceControl';
import { WorkoutTemplateDetailsSection } from './WorkoutTemplateDetailsSection';
import { WorkoutTemplateExercisesSection } from './WorkoutTemplateExercisesSection';

type WorkoutTemplateEditorProps = {
  template: WorkoutTemplate | null;
  exerciseOptions: ExerciseOption[];
  onSave: (input: SaveWorkoutTemplateInput) => void;
  onDelete?: (templateId: string) => void;
  onClose: () => void;
  title?: string;
  beforeDetails?: ReactNode;
  allowImport?: boolean;
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
  onClose,
  title,
  beforeDetails,
  allowImport = true,
}: WorkoutTemplateEditorProps) {
  const { t } = useTranslation();
  const { draft, updateDraft, save, requestDelete, close, context } =
    useTemplateEditorController({
      template,
      exerciseOptions,
      onSave,
      onDelete,
      onClose,
      allowImport,
    });

  return (
    <AppView edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ModalHeader
          title={
            title ??
            (template
              ? t('templateEditor.editTitle')
              : t('templateEditor.newTitle'))
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
          {beforeDetails}
          <WorkoutTemplateDetailsSection
            autoFocus={!template}
            name={draft.name}
            description={draft.description}
            appearanceControl={
              <WorkoutAppearanceControl
                color={draft.color}
                icon={draft.icon}
                picture={draft.picture}
                onColorChange={color => updateDraft({ color })}
                onIconChange={icon => updateDraft({ icon })}
                onPictureChange={picture => updateDraft({ picture })}
              />
            }
            onNameChange={name => updateDraft({ name })}
            onDescriptionChange={description => updateDraft({ description })}
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

          {template && onDelete ? (
            <Button
              className="h-14 rounded-full"
              variant="danger-soft"
              feedbackVariant="scale"
              onPress={requestDelete}
            >
              <ClayIcon name="trash" size={18} color={colors.danger} />
              <Button.Label>{t('templateEditor.deleteCta')}</Button.Label>
            </Button>
          ) : null}
        </ScrollViewContainer>
      </KeyboardAvoidingView>
    </AppView>
  );
}

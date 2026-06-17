import { useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
import type { SaveWorkoutTemplateInput } from '@/data/local/workouts/templates';
import type { ExerciseOption, ExerciseSelectionResult } from '@/types/exercise';
import type { WorkoutTemplate } from '@/types/workout';
import { colors } from '@/theme/tokens';
import { AppView } from '@/components/layout/AppView';
import { ModalHeader } from '@/components/layout/ModalHeader';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { WorkoutTemplateAppearanceSection } from './WorkoutTemplateAppearanceSection';
import { WorkoutTemplateDetailsSection } from './WorkoutTemplateDetailsSection';
import { WorkoutTemplateExercisesSection } from './WorkoutTemplateExercisesSection';
import { WorkoutTemplateScheduleSection } from './WorkoutTemplateScheduleSection';
import { useWorkoutTemplateEditorDraft } from '@/screens/workout/template-editor/useWorkoutTemplateEditorDraft';

type WorkoutTemplateEditorProps = {
  template: WorkoutTemplate | null;
  exerciseOptions: ExerciseOption[];
  exerciseSelection?: ExerciseSelectionResult;
  onClose: () => void;
  onChooseExercises: (selectedExerciseIds: string[]) => void;
  onSave: (input: SaveWorkoutTemplateInput) => WorkoutTemplate;
  onOpenAdvancedSchedule: () => void;
  onRequestDelete: (template: WorkoutTemplate) => void;
};

export function WorkoutTemplateEditor({
  template,
  exerciseOptions,
  exerciseSelection,
  onClose,
  onChooseExercises,
  onSave,
  onOpenAdvancedSchedule,
  onRequestDelete,
}: WorkoutTemplateEditorProps) {
  const { t } = useTranslation();
  const appliedSelectionId = useRef<string | null>(null);
  const {
    draft,
    exerciseNames,
    updateDraft,
    toggleWeekday,
    updateExercise,
    removeExercise,
    updateSelectedExercises,
    save,
  } = useWorkoutTemplateEditorDraft({
    template,
    exerciseOptions,
    onSave,
    onSaved: onClose,
  });

  useEffect(() => {
    if (
      exerciseSelection &&
      exerciseSelection.id !== appliedSelectionId.current
    ) {
      appliedSelectionId.current = exerciseSelection.id;
      updateSelectedExercises(exerciseSelection.exerciseIds);
    }
  }, [exerciseSelection, updateSelectedExercises]);

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
          onLeftPress={onClose}
          onRightPress={save}
        />

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-7 px-5 pb-10 pt-6"
          keyboardShouldPersistTaps="handled"
        >
          <WorkoutTemplateDetailsSection
            autoFocus={!template}
            name={draft.name}
            description={draft.description}
            onNameChange={name => updateDraft({ name })}
            onDescriptionChange={description => updateDraft({ description })}
          />
          <WorkoutTemplateScheduleSection
            mode={draft.scheduleMode}
            interval={draft.scheduleInterval}
            weekdays={draft.weekdays}
            onModeChange={scheduleMode => updateDraft({ scheduleMode })}
            onIntervalChange={scheduleInterval =>
              updateDraft({ scheduleInterval })
            }
            onToggleWeekday={toggleWeekday}
            onOpenAdvancedSchedule={onOpenAdvancedSchedule}
          />
          <WorkoutTemplateAppearanceSection
            color={draft.color}
            status={draft.status}
            onColorChange={color => updateDraft({ color })}
            onStatusChange={status => updateDraft({ status })}
          />
          <WorkoutTemplateExercisesSection
            exercises={draft.exercises}
            exerciseNames={exerciseNames}
            onChooseExercises={() =>
              onChooseExercises(
                draft.exercises.map(exercise => exercise.exerciseId),
              )
            }
            onUpdateExercise={updateExercise}
            onRemoveExercise={removeExercise}
          />

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
              onPress={() => onRequestDelete(template)}
            >
              <ClayIcon name="trash" size={18} color={colors.danger} />
              <Button.Label>{t('templateEditor.deleteCta')}</Button.Label>
            </Button>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppView>
  );
}

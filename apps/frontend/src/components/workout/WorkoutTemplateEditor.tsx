import { useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Button } from 'heroui-native';
import type { SaveWorkoutTemplateInput } from '../../data/local/services';
import type {
  ExerciseOption,
  ExerciseSelectionResult,
} from '../../types/exercise';
import type { WorkoutTemplate } from '../../types/workout';
import { colors } from '../../theme/tokens';
import { AppView } from '../AppView';
import { ClayIcon } from '../icons/ClayIcon';
import { WorkoutTemplateAppearanceSection } from './template-editor/WorkoutTemplateAppearanceSection';
import { WorkoutTemplateDetailsSection } from './template-editor/WorkoutTemplateDetailsSection';
import { WorkoutTemplateExercisesSection } from './template-editor/WorkoutTemplateExercisesSection';
import { WorkoutTemplateScheduleSection } from './template-editor/WorkoutTemplateScheduleSection';
import { useWorkoutTemplateEditorDraft } from './hooks/useWorkoutTemplateEditorDraft';

type WorkoutTemplateEditorProps = {
  template: WorkoutTemplate | null;
  exerciseOptions: ExerciseOption[];
  exerciseSelection?: ExerciseSelectionResult;
  onClose: () => void;
  onChooseExercises: (selectedExerciseIds: string[]) => void;
  onSave: (input: SaveWorkoutTemplateInput) => void;
  onRequestDelete: (template: WorkoutTemplate) => void;
};

export function WorkoutTemplateEditor({
  template,
  exerciseOptions,
  exerciseSelection,
  onClose,
  onChooseExercises,
  onSave,
  onRequestDelete,
}: WorkoutTemplateEditorProps) {
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
        <View className="flex-row items-center justify-between border-b border-border-soft px-5 py-3">
          <Pressable
            accessibilityRole="button"
            className="h-11 min-w-16 items-start justify-center"
            onPress={onClose}
          >
            <Text className="t-label text-foreground-secondary">Cancel</Text>
          </Pressable>
          <Text className="t-heading">
            {template ? 'Edit template' : 'New template'}
          </Text>
          <Pressable
            accessibilityRole="button"
            className="h-11 min-w-16 items-end justify-center"
            onPress={save}
          >
            <Text className="t-label text-accent">Save</Text>
          </Pressable>
        </View>

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
              Save template
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
              <Button.Label>Delete template</Button.Label>
            </Button>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppView>
  );
}

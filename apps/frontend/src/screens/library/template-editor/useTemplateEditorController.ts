import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SaveWorkoutTemplateInput } from '@/data/local/workouts/templates';
import type {
  EditableExercise,
  ExerciseEditResult,
  ExerciseOption,
  ExerciseSelectionResult,
} from '@/types/exercise';
import type { WorkoutTemplate } from '@/types/workout';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useEditorExercises, type EditorExercise } from './useEditorExercises';
import { useWorkoutTemplateEditorDraft } from './useWorkoutTemplateEditorDraft';
import { useDiscardGuard } from './useDiscardGuard';
import type { TemplateEditorContextValue } from './templateEditorContext';

type EditorNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'WorkoutTemplateEditor'
>;
type EditorRoute = RouteProp<RootStackParamList, 'WorkoutTemplateEditor'>;

type UseTemplateEditorControllerOptions = {
  template: WorkoutTemplate | null;
  exerciseOptions: ExerciseOption[];
  onSave: (input: SaveWorkoutTemplateInput) => WorkoutTemplate;
  onDelete: (templateId: string) => void;
};

// Applies the screen results returned by the exercise picker and the set editor
// to the draft, each guarded by an applied-id ref so a result is consumed once.
function useAppliedExerciseResults(
  exerciseSelection: ExerciseSelectionResult | undefined,
  exerciseEdit: ExerciseEditResult | undefined,
  updateSelectedExercises: (exerciseIds: string[]) => void,
  updateExercise: (
    exerciseId: string,
    update: (exercise: EditableExercise) => EditableExercise,
  ) => void,
) {
  const appliedSelectionId = useRef<string | null>(null);
  const appliedEditId = useRef<string | null>(null);

  useEffect(() => {
    if (
      exerciseSelection &&
      exerciseSelection.id !== appliedSelectionId.current
    ) {
      appliedSelectionId.current = exerciseSelection.id;
      updateSelectedExercises(exerciseSelection.exerciseIds);
    }
  }, [exerciseSelection, updateSelectedExercises]);

  useEffect(() => {
    if (exerciseEdit && exerciseEdit.id !== appliedEditId.current) {
      appliedEditId.current = exerciseEdit.id;
      updateExercise(
        exerciseEdit.exercise.exerciseId,
        () => exerciseEdit.exercise,
      );
    }
  }, [exerciseEdit, updateExercise]);
}

export function useTemplateEditorController({
  template,
  exerciseOptions,
  onSave,
  onDelete,
}: UseTemplateEditorControllerOptions) {
  const { t } = useTranslation();
  const navigation = useNavigation<EditorNavigation>();
  const route = useRoute<EditorRoute>();

  // Flipped right before an intentional navigation (save / delete) so the
  // dirty-state back-guard doesn't prompt for those. A plain cancel/back does
  // NOT flip it, so the guard prompts when there are unsaved changes.
  const bypassGuard = useRef(false);
  const close = useCallback(() => navigation.goBack(), [navigation]);
  const closeAfterAction = useCallback(() => {
    bypassGuard.current = true;
    navigation.goBack();
  }, [navigation]);

  const {
    draft,
    isDirty,
    updateDraft,
    updateExercise,
    reorderExercises,
    removeExercise,
    updateSelectedExercises,
    save,
  } = useWorkoutTemplateEditorDraft({
    template,
    onSave,
    onSaved: closeAfterAction,
  });
  useDiscardGuard(isDirty, bypassGuard);
  useAppliedExerciseResults(
    route.params?.exerciseSelection,
    route.params?.exerciseEdit,
    updateSelectedExercises,
    updateExercise,
  );

  const { exercises } = useEditorExercises(draft.exercises, exerciseOptions);

  const chooseExercises = useCallback(() => {
    navigation.navigate('ExerciseSelection', {
      selectedExerciseIds: draft.exercises.map(exercise => exercise.exerciseId),
      returnRouteKey: route.key,
    });
  }, [navigation, route.key, draft.exercises]);

  const editExercise = useCallback(
    (exercise: EditorExercise) => {
      const editable = draft.exercises.find(
        candidate => candidate.exerciseId === exercise.exerciseId,
      );
      if (editable) {
        navigation.navigate('ExerciseSetEditor', {
          exercise: editable,
          name: exercise.name,
          returnRouteKey: route.key,
        });
      }
    },
    [navigation, route.key, draft.exercises],
  );

  const openExerciseOverview = useCallback(
    (exercise: EditorExercise) => {
      navigation.navigate('EditExercise', { exerciseId: exercise.exerciseId });
    },
    [navigation],
  );

  const requestDelete = useCallback(() => {
    if (!template) {
      return;
    }
    Alert.alert(
      t('templateEditor.alerts.deleteTitle', { name: template.name }),
      t('templateEditor.alerts.deleteBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            try {
              onDelete(template.id);
              closeAfterAction();
            } catch (error) {
              Alert.alert(
                t('templateEditor.alerts.deleteFailedTitle'),
                error instanceof Error ? error.message : t('common.tryAgain'),
              );
            }
          },
        },
      ],
    );
  }, [template, t, onDelete, closeAfterAction]);

  const context = useMemo<TemplateEditorContextValue>(
    () => ({
      exercises,
      chooseExercises,
      editExercise,
      openExerciseOverview,
      reorderExercises,
      removeExercise,
    }),
    [
      exercises,
      chooseExercises,
      editExercise,
      openExerciseOverview,
      reorderExercises,
      removeExercise,
    ],
  );

  return { draft, updateDraft, save, requestDelete, close, context };
}

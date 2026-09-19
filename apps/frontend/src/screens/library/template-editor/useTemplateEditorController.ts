import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { randomUUID } from 'expo-crypto';
import { confirmUsageDelete } from '@/components/feedback/confirmUsageDelete';
import type { UsageInfo } from '@/data/local/usageModel';
import { useUsage } from '@/hooks/useUsage';
import type { SaveWorkoutTemplateInput } from '@/data/local/workouts/templates';
import { getWorkoutSession } from '@/data/local/workouts/sessions';
import { workoutSessionToTemplateInput } from '@/data/local/workouts/workoutTemplateConversion';
import type { ExerciseOption, ExerciseSelectionResult } from '@/types/exercise';
import type { WorkoutTemplate } from '@/types/workout';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useEditorExercises, type EditorExercise } from './useEditorExercises';
import {
  createDraftSet,
  type DraftExercise,
  useWorkoutTemplateEditorDraft,
} from './useWorkoutTemplateEditorDraft';
import { useDiscardGuard } from './useDiscardGuard';
import { useExpandedCards } from './useExpandedCards';
import type { TemplateEditorContextValue } from './templateEditorContext';

type EditorNavigation = NativeStackNavigationProp<RootStackParamList>;
type EditorRoute = RouteProp<
  RootStackParamList,
  'WorkoutTemplateEditor' | 'PeriodizationWorkoutEditor'
>;

function templateInputExercisesToDraft(
  exercises: SaveWorkoutTemplateInput['exercises'],
): DraftExercise[] {
  return exercises.map(exercise => ({
    exerciseId: exercise.exerciseId,
    typeId: exercise.typeId ?? null,
    color: exercise.color ?? null,
    supersetId: exercise.supersetId ?? null,
    goal: '',
    notes: exercise.notes ?? null,
    sets: exercise.sets.map(set => ({
      ...createDraftSet(set.setType),
      fieldValues: set.fieldValues ?? [],
      progressionGoal: undefined,
    })),
  }));
}

// Warns when a schedule still plans this template — its slots cascade away
// with it, and the editor offers no undo.
function confirmDeleteTemplate(
  t: TFunction,
  template: WorkoutTemplate,
  usage: UsageInfo | undefined,
  onDelete: (templateId: string) => void,
  onDeleted: () => void,
): void {
  void confirmUsageDelete(
    t,
    {
      kind: 'template',
      name: template.name,
      usage,
      fallbackBody: t('templateEditor.alerts.deleteBody'),
    },
    () => {
      try {
        onDelete(template.id);
        onDeleted();
      } catch (error) {
        Alert.alert(
          t('templateEditor.alerts.deleteFailedTitle'),
          error instanceof Error ? error.message : t('common.tryAgain'),
        );
      }
    },
  );
}

type UseTemplateEditorControllerOptions = {
  template: WorkoutTemplate | null;
  exerciseOptions: ExerciseOption[];
  onSave: (input: SaveWorkoutTemplateInput) => void;
  onDelete?: (templateId: string) => void;
  onClose: () => void;
  allowImport: boolean;
};

// Applies the screen result returned by the exercise picker, guarded by an
// applied-id ref so a result is consumed once.
function useAppliedExerciseSelection(
  exerciseSelection: ExerciseSelectionResult | undefined,
  updateSelectedExercises: (exerciseIds: string[]) => void,
  addSuperset: (exerciseIds: string[]) => void,
) {
  const appliedSelectionId = useRef<string | null>(null);

  useEffect(() => {
    if (
      exerciseSelection &&
      exerciseSelection.id !== appliedSelectionId.current
    ) {
      appliedSelectionId.current = exerciseSelection.id;
      // The selection always replaces the exercise list; grouping is applied
      // on top of it, so a new member is in the draft before it is grouped.
      updateSelectedExercises(exerciseSelection.exerciseIds);
      if (exerciseSelection.newSupersetExerciseIds) {
        addSuperset(exerciseSelection.newSupersetExerciseIds);
      }
    }
  }, [exerciseSelection, updateSelectedExercises, addSuperset]);
}

export function useTemplateEditorController({
  template,
  exerciseOptions,
  onSave,
  onDelete,
  onClose,
  allowImport,
}: UseTemplateEditorControllerOptions) {
  const { t } = useTranslation();
  const navigation = useNavigation<EditorNavigation>();
  const route = useRoute<EditorRoute>();
  const templateUsage = useUsage('template');
  const appliedImportWorkoutId = useRef<string | null>(null);

  // Flipped right before an intentional navigation (save / delete) so the
  // dirty-state back-guard doesn't prompt for those. A plain cancel/back does
  // NOT flip it, so the guard prompts when there are unsaved changes.
  const bypassGuard = useRef(false);
  const close = useCallback(onClose, [onClose]);
  const closeAfterAction = useCallback(() => {
    bypassGuard.current = true;
    onClose();
  }, [onClose]);

  const {
    draft,
    isDirty,
    updateDraft,
    updateExercise,
    reorderBlocks,
    removeExercise,
    updateSelectedExercises,
    addSuperset,
    ungroupSuperset,
    moveSupersetMember,
    save,
  } = useWorkoutTemplateEditorDraft({
    template,
    onSave,
    onSaved: closeAfterAction,
  });
  useEffect(() => {
    const importWorkoutId = route.params?.importWorkoutId;

    if (
      !importWorkoutId ||
      appliedImportWorkoutId.current === importWorkoutId
    ) {
      return;
    }

    const workout = getWorkoutSession(importWorkoutId);

    if (!workout) {
      navigation.setParams({ importWorkoutId: undefined });
      return;
    }

    appliedImportWorkoutId.current = importWorkoutId;
    const imported = workoutSessionToTemplateInput(workout, randomUUID);
    updateDraft({
      exercises: templateInputExercisesToDraft(imported.exercises),
      supersets: imported.supersets ?? [],
    });
    navigation.setParams({ importWorkoutId: undefined });
  }, [navigation, route.params?.importWorkoutId, updateDraft]);

  useDiscardGuard(isDirty, bypassGuard);
  useAppliedExerciseSelection(
    route.params?.exerciseSelection,
    updateSelectedExercises,
    addSuperset,
  );

  const { isExpanded, toggleExpanded } = useExpandedCards();

  const { exercises, blocks } = useEditorExercises(
    draft.exercises,
    draft.supersets,
    exerciseOptions,
  );

  const chooseExercises = useCallback(() => {
    navigation.navigate('ExerciseSelection', {
      selectedExerciseIds: draft.exercises.map(exercise => exercise.exerciseId),
      returnRouteKey: route.key,
      allowSupersets: true,
    });
  }, [navigation, route.key, draft.exercises]);

  const openExerciseOverview = useCallback(
    (exercise: EditorExercise) => {
      navigation.navigate('EditExercise', { exerciseId: exercise.exerciseId });
    },
    [navigation],
  );

  const requestDelete = useCallback(() => {
    if (template && onDelete) {
      confirmDeleteTemplate(
        t,
        template,
        templateUsage.get(template.id),
        onDelete,
        closeAfterAction,
      );
    }
  }, [template, t, templateUsage, onDelete, closeAfterAction]);

  const context = useMemo<TemplateEditorContextValue>(
    () => ({
      exercises,
      blocks,
      chooseExercises,
      openExerciseOverview,
      updateExercise,
      reorderBlocks,
      removeExercise,
      ungroupSuperset,
      moveSupersetMember,
      allowImport,
      isExpanded,
      toggleExpanded,
    }),
    [
      exercises,
      blocks,
      chooseExercises,
      openExerciseOverview,
      updateExercise,
      reorderBlocks,
      removeExercise,
      ungroupSuperset,
      moveSupersetMember,
      allowImport,
      isExpanded,
      toggleExpanded,
    ],
  );

  return { draft, updateDraft, save, requestDelete, close, context };
}

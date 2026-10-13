import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { randomUUID } from 'expo-crypto';
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

type UseTemplateEditorControllerOptions = {
  template: WorkoutTemplate | null;
  exerciseOptions: ExerciseOption[];
  onSave: (input: SaveWorkoutTemplateInput) => void;
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
  onClose,
  allowImport,
}: UseTemplateEditorControllerOptions) {
  const navigation = useNavigation<EditorNavigation>();
  const route = useRoute<EditorRoute>();
  const appliedImportWorkoutId = useRef<string | null>(null);

  // Flipped right before an intentional navigation after saving so the
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

  return { draft, updateDraft, save, close, context };
}

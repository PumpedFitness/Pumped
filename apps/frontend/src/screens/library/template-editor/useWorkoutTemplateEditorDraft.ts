import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { randomUUID } from 'expo-crypto';
import type { workoutTemplates } from '@/data/local/schema/workoutTemplate';
import type {
  SaveWorkoutTemplateInput,
  WorkoutTemplateExerciseInput,
} from '@/data/local/workouts/templates';
import type {
  EditableExercise,
  EditableExerciseSet,
  ExerciseOption,
} from '@/types/exercise';
import type { WorkoutTemplate } from '@/types/workout';

type WorkoutTemplateRow = typeof workoutTemplates.$inferSelect;

type DraftSet = EditableExerciseSet;
export type DraftExercise = EditableExercise;

type WorkoutTemplateEditorDraft = {
  name: string;
  description: string;
  status: WorkoutTemplateRow['status'];
  color: WorkoutTemplateRow['color'];
  exercises: DraftExercise[];
  error: string | null;
};

type UseWorkoutTemplateEditorDraftOptions = {
  template: WorkoutTemplate | null;
  exerciseOptions: ExerciseOption[];
  onSave: (input: SaveWorkoutTemplateInput) => void;
  onSaved: () => void;
};

export function createDraftSet(
  setType: DraftSet['setType'] = 'NORMAL',
): DraftSet {
  return {
    id: randomUUID(),
    setType,
    targetReps: '',
    targetPercentage1Rm: '',
    targetRpe: '',
  };
}

function createInitialDraft(
  template: WorkoutTemplate | null,
): WorkoutTemplateEditorDraft {
  return {
    name: template?.name ?? '',
    description: template?.description ?? '',
    status: template?.status ?? 'ACTIVE',
    color: template?.color ?? 'TERRACOTTA',
    exercises:
      template?.exercises.map(exercise => ({
        exerciseId: exercise.exerciseId,
        goal: exercise.goal ?? '',
        notes: exercise.notes,
        sets: exercise.sets.map(set => ({
          id: randomUUID(),
          setType: set.setType,
          targetReps: set.targetReps?.toString() ?? '',
          targetPercentage1Rm: set.targetPercentage1Rm?.toString() ?? '',
          targetRpe: set.targetRpe?.toString() ?? '',
        })),
      })) ?? [],
    error: null,
  };
}

function createDraftExercise(exerciseId: string): DraftExercise {
  return {
    exerciseId,
    goal: '',
    notes: null,
    sets: [createDraftSet(), createDraftSet(), createDraftSet()],
  };
}

function parseOptionalNumber(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  return normalized ? Number(normalized) : null;
}

function buildExerciseInput(
  exercise: DraftExercise,
): WorkoutTemplateExerciseInput {
  return {
    exerciseId: exercise.exerciseId,
    goal: exercise.goal.trim() || null,
    notes: exercise.notes,
    sets: exercise.sets.map(set => ({
      setType: set.setType,
      targetReps: parseOptionalNumber(set.targetReps),
      targetPercentage1Rm: parseOptionalNumber(set.targetPercentage1Rm),
      targetRpe: parseOptionalNumber(set.targetRpe),
    })),
  };
}

function buildSaveInput(
  draft: WorkoutTemplateEditorDraft,
  templateId?: string,
): SaveWorkoutTemplateInput {
  return {
    id: templateId,
    name: draft.name,
    description: draft.description.trim() || null,
    status: draft.status,
    color: draft.color,
    exercises: draft.exercises.map(buildExerciseInput),
  };
}

export function useWorkoutTemplateEditorDraft({
  template,
  exerciseOptions,
  onSave,
  onSaved,
}: UseWorkoutTemplateEditorDraftOptions) {
  const { t } = useTranslation();
  // Seeded once per mount — the editor is remounted via a `key` on the
  // template id, so a fresh draft appears exactly when the template changes
  // and in-progress edits are never wiped by unrelated re-renders.
  const [draft, setDraft] = useState<WorkoutTemplateEditorDraft>(() =>
    createInitialDraft(template),
  );

  const exerciseNames = useMemo(
    () =>
      new Map(
        exerciseOptions.map(exercise => [exercise.id, exercise.name] as const),
      ),
    [exerciseOptions],
  );

  const updateDraft = useCallback(
    (update: Partial<WorkoutTemplateEditorDraft>) => {
      setDraft(current => ({ ...current, ...update, error: null }));
    },
    [],
  );

  const updateExercise = useCallback(
    (
      exerciseId: string,
      update: (exercise: DraftExercise) => DraftExercise,
    ) => {
      setDraft(current => ({
        ...current,
        error: null,
        exercises: current.exercises.map(exercise =>
          exercise.exerciseId === exerciseId ? update(exercise) : exercise,
        ),
      }));
    },
    [],
  );

  const removeExercise = useCallback((exerciseId: string) => {
    setDraft(current => ({
      ...current,
      error: null,
      exercises: current.exercises.filter(
        exercise => exercise.exerciseId !== exerciseId,
      ),
    }));
  }, []);

  const updateSelectedExercises = useCallback((exerciseIds: string[]) => {
    setDraft(current => {
      const currentById = new Map(
        current.exercises.map(
          exercise => [exercise.exerciseId, exercise] as const,
        ),
      );

      return {
        ...current,
        error: null,
        exercises: exerciseIds.map(
          exerciseId =>
            currentById.get(exerciseId) ?? createDraftExercise(exerciseId),
        ),
      };
    });
  }, []);

  const save = useCallback(() => {
    if (!draft.name.trim()) {
      setDraft(current => ({
        ...current,
        error: t('templateEditor.errors.nameRequired'),
      }));
      return;
    }

    try {
      onSave(buildSaveInput(draft, template?.id));
      onSaved();
    } catch (error) {
      setDraft(current => ({
        ...current,
        error:
          error instanceof Error
            ? error.message
            : t('templateEditor.errors.saveFailed'),
      }));
    }
  }, [draft, onSave, onSaved, t, template?.id]);

  return {
    draft,
    exerciseNames,
    updateDraft,
    updateExercise,
    removeExercise,
    updateSelectedExercises,
    save,
  };
}

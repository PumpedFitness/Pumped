import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { randomUUID } from 'expo-crypto';
import type { SetTypeId } from '@/data/local/enums';
import type { workoutTemplates } from '@/data/local/schema/workoutTemplate';
import type {
  SaveWorkoutTemplateInput,
  WorkoutTemplateExerciseInput,
} from '@/data/local/workouts/templates';
import type { EditableExercise, EditableExerciseSet } from '@/types/exercise';
import type { WorkoutTemplate } from '@/types/workout';

type WorkoutTemplateRow = typeof workoutTemplates.$inferSelect;

type DraftSet = EditableExerciseSet;
export type DraftExercise = EditableExercise;

type WorkoutTemplateEditorDraft = {
  name: string;
  description: string;
  color: WorkoutTemplateRow['color'];
  exercises: DraftExercise[];
  error: string | null;
};

type UseWorkoutTemplateEditorDraftOptions = {
  template: WorkoutTemplate | null;
  onSave: (input: SaveWorkoutTemplateInput) => void;
  onSaved: () => void;
};

export function createDraftSet(setType: SetTypeId = 'NORMAL'): DraftSet {
  return {
    id: randomUUID(),
    setType,
    restSeconds: null,
    progressionGoal: undefined,
    fieldValues: [],
  };
}

function createInitialDraft(
  template: WorkoutTemplate | null,
): WorkoutTemplateEditorDraft {
  return {
    name: template?.name ?? '',
    description: template?.description ?? '',
    color: template?.color ?? 'TERRACOTTA',
    exercises:
      template?.exercises.map(exercise => ({
        exerciseId: exercise.exerciseId,
        typeId: exercise.typeId,
        color: exercise.color,
        goal: exercise.goal ?? '',
        notes: exercise.notes,
        progressionMode: exercise.progressionMode,
        sets: exercise.sets.map(set => ({
          id: randomUUID(),
          setType: set.setType,
          restSeconds: set.restSeconds,
          progressionGoal: set.progressionGoal,
          fieldValues: set.fieldValues,
        })),
      })) ?? [],
    error: null,
  };
}

function createDraftExercise(exerciseId: string): DraftExercise {
  return {
    exerciseId,
    typeId: null,
    color: null,
    goal: '',
    notes: null,
    progressionMode: undefined,
    sets: [createDraftSet(), createDraftSet(), createDraftSet()],
  };
}

function buildExerciseInput(
  exercise: DraftExercise,
): WorkoutTemplateExerciseInput {
  return {
    exerciseId: exercise.exerciseId,
    typeId: exercise.typeId,
    color: exercise.color,
    goal: exercise.goal.trim() || null,
    notes: exercise.notes,
    progressionMode: exercise.progressionMode,
    sets: exercise.sets.map(set => ({
      setType: set.setType,
      restSeconds: set.restSeconds,
      progressionGoal: set.progressionGoal,
      fieldValues: set.fieldValues,
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
    color: draft.color,
    exercises: draft.exercises.map(buildExerciseInput),
  };
}

// Compares the editable portions of the draft (everything but the transient
// `error`) so the back-guard only prompts when there are real unsaved edits.
function draftFingerprint(draft: WorkoutTemplateEditorDraft): string {
  const { error: _error, ...rest } = draft;
  return JSON.stringify(rest);
}

export function duplicateLastSet(sets: DraftSet[]): DraftSet[] {
  if (sets.length === 0) {
    return [createDraftSet()];
  }
  const last = sets[sets.length - 1];
  return [
    ...sets,
    {
      ...last,
      id: randomUUID(),
      progressionGoal: last.progressionGoal
        ? { ...last.progressionGoal }
        : undefined,
      fieldValues: last.fieldValues.map(value => ({ ...value })),
    },
  ];
}

export function useWorkoutTemplateEditorDraft({
  template,
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
  const initialFingerprint = useRef(draftFingerprint(draft));
  const isDirty = draftFingerprint(draft) !== initialFingerprint.current;

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

  const reorderExercises = useCallback((from: number, to: number) => {
    setDraft(current => {
      if (from === to) {
        return current;
      }
      const exercises = [...current.exercises];
      const [moved] = exercises.splice(from, 1);
      exercises.splice(to, 0, moved);
      return { ...current, error: null, exercises };
    });
  }, []);

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
    isDirty,
    updateDraft,
    updateExercise,
    reorderExercises,
    removeExercise,
    updateSelectedExercises,
    save,
  };
}

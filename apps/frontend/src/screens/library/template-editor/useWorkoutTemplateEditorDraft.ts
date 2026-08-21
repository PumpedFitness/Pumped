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
import type { WorkoutTemplate, WorkoutTemplateSuperset } from '@/types/workout';
import {
  addSuperset as addSupersetToDraft,
  duplicateDraftSet,
  moveSupersetMember as moveSupersetMemberInDraft,
  removeDraftExercise,
  reorderBlocks as reorderBlocksInDraft,
  selectExercises,
  setSupersetRounds as setSupersetRoundsInDraft,
  ungroupSuperset as ungroupSupersetInDraft,
  updateSuperset as updateSupersetInDraft,
  type SupersetDraft,
} from './templateDraftSupersets';

type WorkoutTemplateRow = typeof workoutTemplates.$inferSelect;

type DraftSet = EditableExerciseSet;
export type DraftExercise = EditableExercise;

export type WorkoutTemplateEditorDraft = {
  name: string;
  description: string;
  color: WorkoutTemplateRow['color'];
  icon: WorkoutTemplateRow['icon'];
  picture: WorkoutTemplateRow['picture'];
  exercises: DraftExercise[];
  supersets: WorkoutTemplateSuperset[];
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
    icon: template?.icon ?? null,
    picture: template?.picture ?? null,
    exercises:
      template?.exercises.map(exercise => ({
        exerciseId: exercise.exerciseId,
        typeId: exercise.typeId,
        color: exercise.color,
        supersetId: exercise.supersetId,
        goal: exercise.goal ?? '',
        notes: exercise.notes,
        sets: exercise.sets.map(set => ({
          id: randomUUID(),
          setType: set.setType,
          restSeconds: set.restSeconds,
          progressionGoal: set.progressionGoal,
          fieldValues: set.fieldValues,
        })),
      })) ?? [],
    supersets: template?.supersets ?? [],
    error: null,
  };
}

export function createDraftExercise(exerciseId: string): DraftExercise {
  return {
    exerciseId,
    typeId: null,
    color: null,
    supersetId: null,
    goal: '',
    notes: null,
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
    supersetId: exercise.supersetId,
    goal: exercise.goal.trim() || null,
    notes: exercise.notes,
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
    icon: draft.icon,
    picture: draft.picture,
    exercises: draft.exercises.map(buildExerciseInput),
    supersets: draft.supersets,
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
  return [...sets, duplicateDraftSet(sets[sets.length - 1], randomUUID())];
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

  // Every superset action is a pure reducer applied here, so the invariants
  // live in one tested module rather than in the hook.
  const applySupersets = useCallback(
    (reduce: (draft: SupersetDraft) => SupersetDraft) => {
      setDraft(current => ({ ...current, error: null, ...reduce(current) }));
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
          exercise.exerciseId === exerciseId
            ? // Membership is the draft's to decide, not the set editor's —
              // it round-trips whole exercise objects through a modal screen.
              { ...update(exercise), supersetId: exercise.supersetId }
            : exercise,
        ),
      }));
    },
    [],
  );

  const reorderBlocks = useCallback(
    (from: number, to: number) =>
      applySupersets(current => reorderBlocksInDraft(current, from, to)),
    [applySupersets],
  );

  const removeExercise = useCallback(
    (exerciseId: string) =>
      applySupersets(current => removeDraftExercise(current, exerciseId)),
    [applySupersets],
  );

  const updateSelectedExercises = useCallback(
    (exerciseIds: string[]) =>
      applySupersets(current =>
        selectExercises(current, exerciseIds, createDraftExercise),
      ),
    [applySupersets],
  );

  const addSuperset = useCallback(
    (exerciseIds: string[]) =>
      applySupersets(current =>
        addSupersetToDraft(current, exerciseIds, randomUUID),
      ),
    [applySupersets],
  );

  const ungroupSuperset = useCallback(
    (supersetId: string) =>
      applySupersets(current => ungroupSupersetInDraft(current, supersetId)),
    [applySupersets],
  );

  const updateSuperset = useCallback(
    (supersetId: string, patch: Partial<Omit<WorkoutTemplateSuperset, 'id'>>) =>
      applySupersets(current =>
        updateSupersetInDraft(current, supersetId, patch),
      ),
    [applySupersets],
  );

  const setSupersetRounds = useCallback(
    (supersetId: string, rounds: number) =>
      applySupersets(current =>
        setSupersetRoundsInDraft(current, supersetId, rounds, randomUUID),
      ),
    [applySupersets],
  );

  const moveSupersetMember = useCallback(
    (supersetId: string, from: number, to: number) =>
      applySupersets(current =>
        moveSupersetMemberInDraft(current, supersetId, from, to),
      ),
    [applySupersets],
  );

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
    reorderBlocks,
    removeExercise,
    updateSelectedExercises,
    addSuperset,
    ungroupSuperset,
    updateSuperset,
    setSupersetRounds,
    moveSupersetMember,
    save,
  };
}

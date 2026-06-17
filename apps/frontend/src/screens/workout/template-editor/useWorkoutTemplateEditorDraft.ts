import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { randomUUID } from 'expo-crypto';
import type { WorkoutScheduleType, WorkoutWeekday } from '@/data/local/enums';
import type { workoutTemplates } from '@/data/local/schema/workoutTemplate';
import type {
  SaveWorkoutTemplateInput,
  WorkoutTemplateExerciseInput,
} from '@/data/local/workouts/templates';
import {
  deleteBasicScheduleForTemplate,
  getBasicScheduleForTemplate,
  saveSchedule,
} from '@/data/local/schedules/schedules';
import type {
  EditableExercise,
  EditableExerciseSet,
  ExerciseOption,
} from '@/types/exercise';
import type { Schedule, SaveScheduleInput } from '@/types/schedule';
import type { WorkoutTemplate } from '@/types/workout';

type WorkoutTemplateRow = typeof workoutTemplates.$inferSelect;

export type ScheduleMode = 'NONE' | WorkoutScheduleType;

type DraftSet = EditableExerciseSet;
export type DraftExercise = EditableExercise;

const WEEKDAY_ORDER: WorkoutWeekday[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const WEEKDAY_OFFSET: Record<WorkoutWeekday, number> = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6,
};

type WorkoutTemplateEditorDraft = {
  name: string;
  description: string;
  status: WorkoutTemplateRow['status'];
  color: WorkoutTemplateRow['color'];
  scheduleMode: ScheduleMode;
  scheduleInterval: number;
  weekdays: WorkoutWeekday[];
  // Carried so an edited basic schedule updates in place (preserving its anchor).
  basicScheduleId: string | null;
  basicAnchorDay: number | null;
  exercises: DraftExercise[];
  error: string | null;
};

type UseWorkoutTemplateEditorDraftOptions = {
  template: WorkoutTemplate | null;
  exerciseOptions: ExerciseOption[];
  onSave: (input: SaveWorkoutTemplateInput) => WorkoutTemplate;
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

function scheduleModeFor(schedule: Schedule | null): ScheduleMode {
  if (!schedule) {
    return 'NONE';
  }
  return schedule.recurrenceType === 'CYCLE' ? 'DAYS' : 'WEEKS';
}

function weekdaysFor(schedule: Schedule | null): WorkoutWeekday[] {
  if (!schedule || schedule.recurrenceType !== 'WEEKLY') {
    return [];
  }
  return [...new Set(schedule.slots.map(slot => slot.dayOffset % 7))]
    .sort((a, b) => a - b)
    .map(offset => WEEKDAY_ORDER[offset]);
}

function createInitialDraft(
  template: WorkoutTemplate | null,
): WorkoutTemplateEditorDraft {
  const basicSchedule = template
    ? getBasicScheduleForTemplate(template.id)
    : null;

  return {
    name: template?.name ?? '',
    description: template?.description ?? '',
    status: template?.status ?? 'ACTIVE',
    color: template?.color ?? 'TERRACOTTA',
    scheduleMode: scheduleModeFor(basicSchedule),
    scheduleInterval: basicSchedule?.periodLength ?? 1,
    weekdays: weekdaysFor(basicSchedule),
    basicScheduleId: basicSchedule?.id ?? null,
    basicAnchorDay: basicSchedule?.anchorDay ?? null,
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

// Translates the inline schedule controls into a BASIC schedule for the saved
// template (or null when the user chose "flexible").
function buildBasicScheduleInput(
  draft: WorkoutTemplateEditorDraft,
  template: WorkoutTemplate,
): SaveScheduleInput | null {
  if (draft.scheduleMode === 'NONE') {
    return null;
  }
  const isWeekly = draft.scheduleMode === 'WEEKS';
  return {
    id: draft.basicScheduleId ?? undefined,
    name: template.name,
    kind: 'BASIC',
    recurrenceType: isWeekly ? 'WEEKLY' : 'CYCLE',
    periodLength: draft.scheduleInterval,
    anchorDay: draft.basicAnchorDay ?? undefined,
    ownerTemplateId: template.id,
    slots: isWeekly
      ? draft.weekdays.map(weekday => ({
          dayOffset: WEEKDAY_OFFSET[weekday],
          workoutTemplateId: template.id,
        }))
      : [{ dayOffset: 0, workoutTemplateId: template.id }],
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

  const toggleWeekday = useCallback((weekday: WorkoutWeekday) => {
    setDraft(current => ({
      ...current,
      error: null,
      weekdays: current.weekdays.includes(weekday)
        ? current.weekdays.filter(value => value !== weekday)
        : [...current.weekdays, weekday],
    }));
  }, []);

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
    if (draft.scheduleMode === 'WEEKS' && draft.weekdays.length === 0) {
      setDraft(current => ({
        ...current,
        error: t('templateEditor.errors.weekdayRequired'),
      }));
      return;
    }

    try {
      const saved = onSave(buildSaveInput(draft, template?.id));
      const scheduleInput = buildBasicScheduleInput(draft, saved);
      if (scheduleInput) {
        saveSchedule(scheduleInput);
      } else {
        deleteBasicScheduleForTemplate(saved.id);
      }
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
    toggleWeekday,
    updateExercise,
    removeExercise,
    updateSelectedExercises,
    save,
  };
}

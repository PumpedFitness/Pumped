import { useCallback } from 'react';
import {
  deleteWorkoutTemplate,
  listWorkoutTemplates,
  saveWorkoutTemplate,
  updateWorkoutTemplateStatus,
  type SaveWorkoutTemplateInput,
} from '@/data/local/workouts/templates';
import { listWorkoutSessions } from '@/data/local/workouts/sessions';
import { useTableQuery } from '@/data/local/tableVersions';
import {
  workoutSessions,
  workoutTemplateExercises,
  workoutTemplateSets,
  workoutTemplates,
} from '@/data/local/schema';
import type { WorkoutTemplateStatus } from '@/data/local/enums';
import type { ExerciseOption } from '@/types/exercise';
import type { WorkoutSession, WorkoutTemplate } from '@/types/workout';
import { useExerciseOptions } from './useExerciseOptions';

type UseWorkoutTemplatesResult = {
  templates: WorkoutTemplate[];
  sessions: WorkoutSession[];
  exerciseOptions: ExerciseOption[];
  saveTemplate: (input: SaveWorkoutTemplateInput) => WorkoutTemplate;
  updateTemplateStatus: (
    templateId: string,
    status: WorkoutTemplateStatus,
  ) => WorkoutTemplate;
  deleteTemplate: (templateId: string) => void;
};

export function useWorkoutTemplates(): UseWorkoutTemplatesResult {
  const templates = useTableQuery(
    [workoutTemplates, workoutTemplateExercises, workoutTemplateSets],
    () => listWorkoutTemplates(),
  );
  const sessions = useTableQuery([workoutSessions], () =>
    listWorkoutSessions(),
  );
  const exerciseOptions = useExerciseOptions();

  // Writes notify table subscribers, so every reader re-renders — no manual
  // refresh needed.
  const saveTemplate = useCallback(
    (input: SaveWorkoutTemplateInput) => saveWorkoutTemplate(input),
    [],
  );
  const deleteTemplate = useCallback(
    (templateId: string) => deleteWorkoutTemplate(templateId),
    [],
  );
  const updateStatus = useCallback(
    (templateId: string, status: WorkoutTemplateStatus) =>
      updateWorkoutTemplateStatus(templateId, status),
    [],
  );

  return {
    templates,
    sessions,
    exerciseOptions,
    saveTemplate,
    updateTemplateStatus: updateStatus,
    deleteTemplate,
  };
}

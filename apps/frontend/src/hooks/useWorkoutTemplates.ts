import { useCallback } from 'react';
import {
  deleteWorkoutTemplate,
  listWorkoutTemplates,
  saveWorkoutTemplate,
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
import type { ExerciseOption } from '@/types/exercise';
import type { WorkoutSession, WorkoutTemplate } from '@/types/workout';
import { useExerciseOptions } from './useExerciseOptions';

type UseWorkoutTemplatesResult = {
  templates: WorkoutTemplate[];
  sessions: WorkoutSession[];
  exerciseOptions: ExerciseOption[];
  saveTemplate: (input: SaveWorkoutTemplateInput) => WorkoutTemplate;
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

  return {
    templates,
    sessions,
    exerciseOptions,
    saveTemplate,
    deleteTemplate,
  };
}

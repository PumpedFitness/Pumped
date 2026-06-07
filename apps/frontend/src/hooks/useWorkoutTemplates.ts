import { useCallback, useState } from 'react';
import {
  workoutService,
  type SaveWorkoutTemplateInput,
} from '../data/local/services';
import type { WorkoutTemplateStatus } from '../data/local/enums';
import type { ExerciseOption } from '../types/exercise';
import type { WorkoutSession, WorkoutTemplate } from '../types/workout';
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
  refresh: () => void;
};

export function useWorkoutTemplates(): UseWorkoutTemplatesResult {
  const [templates, setTemplates] = useState(() =>
    workoutService.listWorkoutTemplates(),
  );
  const [sessions, setSessions] = useState(() =>
    workoutService.listWorkoutSessions(),
  );

  const exerciseOptions = useExerciseOptions();

  const refresh = useCallback(() => {
    setTemplates(workoutService.listWorkoutTemplates());
    setSessions(workoutService.listWorkoutSessions());
  }, []);

  const saveTemplate = useCallback(
    (input: SaveWorkoutTemplateInput) => {
      const savedTemplate = workoutService.saveWorkoutTemplate(input);
      refresh();
      return savedTemplate;
    },
    [refresh],
  );

  const deleteTemplate = useCallback(
    (templateId: string) => {
      workoutService.deleteWorkoutTemplate(templateId);
      refresh();
    },
    [refresh],
  );

  const updateTemplateStatus = useCallback(
    (templateId: string, status: WorkoutTemplateStatus) => {
      const updatedTemplate = workoutService.updateWorkoutTemplateStatus(
        templateId,
        status,
      );
      refresh();
      return updatedTemplate;
    },
    [refresh],
  );

  return {
    templates,
    sessions,
    exerciseOptions,
    saveTemplate,
    updateTemplateStatus,
    deleteTemplate,
    refresh,
  };
}

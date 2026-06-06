import { useCallback, useMemo, useState } from 'react';
import { asc } from 'drizzle-orm';
import { db } from '../data/local/database';
import type {
  ExerciseCategory,
  ExerciseEquipment,
  MuscleGroup,
} from '../data/local/enums';
import { exercises } from '../data/local/schema';
import {
  workoutService,
  type SaveWorkoutTemplateInput,
} from '../data/local/services';
import type { WorkoutTemplateStatus } from '../data/local/enums';
import type { WorkoutSession, WorkoutTemplate } from '../types/workout';

export type ExerciseOption = {
  id: string;
  name: string;
  description: string | null;
  exerciseCategory: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment: ExerciseEquipment[];
};

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

  const exerciseOptions = useMemo(
    () =>
      db
        .select({
          id: exercises.id,
          name: exercises.name,
          description: exercises.description,
          exerciseCategory: exercises.exerciseCategory,
          muscleGroups: exercises.muscleGroups,
          equipment: exercises.equipment,
        })
        .from(exercises)
        .orderBy(asc(exercises.name))
        .all(),
    [],
  );

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

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { performedSets, workoutSessions } from '@/data/local/schema';
import { useTableQuery } from '@/data/local/tableVersions';
import {
  getWorkoutSession,
  listWorkoutSessions,
} from '@/data/local/workouts/sessions';
import type { WorkoutTemplateExercise } from '@/types/workout';
import {
  buildLinearResult,
  buildNoneResult,
} from './progressionSuggestionLogic';
import { useSetTypeLibrary } from './useSetTypeLibrary';
import { useUserProfile } from './useUserProfile';

export const DEFAULT_WEIGHT_INCREMENT_KG = 2.5;

type ProgressionSuggestionParams = {
  exerciseId: string;
  templateExercise: WorkoutTemplateExercise;
};

export type {
  ProgressionFieldSuggestion,
  ProgressionSuggestedSet,
  ProgressionSuggestionResult,
} from './progressionSuggestionTypes';

export function useProgressionSuggestion({
  exerciseId,
  templateExercise,
}: ProgressionSuggestionParams) {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const { byId: setTypesById } = useSetTypeLibrary();
  const lastPerformedSets = useTableQuery(
    [workoutSessions, performedSets],
    () => {
      const session = listWorkoutSessions()
        .filter(candidate => candidate.endedAt !== null)
        .map(candidate => getWorkoutSession(candidate.id))
        .find(
          candidate =>
            candidate?.sets.some(set => set.exerciseId === exerciseId) ?? false,
        );
      return session?.sets.filter(set => set.exerciseId === exerciseId) ?? [];
    },
    [exerciseId],
  );

  return useMemo(() => {
    const mode = templateExercise.progressionMode ?? 'none';
    const weightUnit = profile.weightUnit;
    const fieldsBySetType = new Map(
      [...setTypesById.entries()].map(([setType, value]) => [
        setType,
        value.fields,
      ]),
    );

    if (mode === 'none') {
      return buildNoneResult(
        t,
        templateExercise,
        lastPerformedSets,
        setTypesById,
        fieldsBySetType,
        weightUnit,
      );
    }

    return buildLinearResult(
      t,
      templateExercise,
      setTypesById,
      fieldsBySetType,
      lastPerformedSets,
      weightUnit,
    );
  }, [
    lastPerformedSets,
    profile.weightUnit,
    setTypesById,
    t,
    templateExercise,
  ]);
}

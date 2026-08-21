import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { performedSets, workoutSessions } from '@/data/local/schema';
import { useTableQuery } from '@/data/local/tableVersions';
import {
  getWorkoutSession,
  listWorkoutSessions,
} from '@/data/local/workouts/sessions';
import type { WorkoutTemplateExercise } from '@/types/workout';
import { buildProgressionSuggestionResult } from './progressionSuggestionLogic';
import { useSetTypeLibrary } from './useSetTypeLibrary';
import { useUserProfile } from './useUserProfile';

export const DEFAULT_WEIGHT_INCREMENT_KG = 2.5;

type ProgressionSuggestionParams = {
  exerciseId: string;
  templateExercise: WorkoutTemplateExercise;
};

import type {
  ProgressionFieldSuggestion,
  ProgressionSuggestedSet,
  ProgressionSuggestionResult,
} from './progressionSuggestionTypes';

export type {
  ProgressionFieldSuggestion,
  ProgressionSuggestedSet,
  ProgressionSuggestionResult,
};

/**
 * Suggestions for several exercises at once.
 *
 * A superset renders its members interleaved, so one component owns every
 * member's cards — and a hook cannot be called once per member from there.
 * Hydrating the history once for all of them is also strictly less work than
 * the per-exercise hook doing it N times.
 */
export function useProgressionSuggestions(
  items: ProgressionSuggestionParams[],
): Map<string, ProgressionSuggestionResult> {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const { byId: setTypesById } = useSetTypeLibrary();
  // Joined rather than the array itself: the caller rebuilds `items` every
  // render, and only the set of ids should re-run the query.
  const exerciseIdKey = items.map(item => item.exerciseId).join('\u0000');

  const performedByExercise = useTableQuery(
    [workoutSessions, performedSets],
    () => {
      const ids = exerciseIdKey ? exerciseIdKey.split('\u0000') : [];
      const sessions = listWorkoutSessions()
        .filter(candidate => candidate.endedAt !== null)
        .map(candidate => getWorkoutSession(candidate.id));
      return new Map(
        ids.map(id => {
          const session = sessions.find(
            candidate =>
              candidate?.sets.some(set => set.exerciseId === id) ?? false,
          );
          return [
            id,
            session?.sets.filter(set => set.exerciseId === id) ?? [],
          ] as const;
        }),
      );
    },
    [exerciseIdKey],
  );

  return useMemo(() => {
    const fieldsBySetType = new Map(
      [...setTypesById.entries()].map(([setType, value]) => [
        setType,
        value.fields,
      ]),
    );
    return new Map(
      items.map(item => [
        item.exerciseId,
        buildProgressionSuggestionResult({
          t,
          templateExercise: item.templateExercise,
          setTypesById,
          fieldsBySetType,
          performed: performedByExercise.get(item.exerciseId) ?? [],
          weightUnit: profile.weightUnit,
        }),
      ]),
    );
  }, [items, performedByExercise, profile.weightUnit, setTypesById, t]);
}

export function useProgressionSuggestion(
  params: ProgressionSuggestionParams,
): ProgressionSuggestionResult {
  const items = useMemo(() => [params], [params]);
  const byExercise = useProgressionSuggestions(items);
  return byExercise.get(params.exerciseId)!;
}

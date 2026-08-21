import { useCallback, useState } from 'react';
import type { ExerciseSelectionResult } from '@/types/exercise';
import { uniqueStrings } from '@/utils/dedupe';

export type ExerciseSelectionMode = 'individual' | 'superset';

type SelectionPayload = Omit<ExerciseSelectionResult, 'id'>;

/**
 * The picker does two jobs. Normally it edits the caller's whole exercise list.
 * In superset mode it collects a *separate*, initially empty set of exercises
 * to group — which is why the two selections are kept apart rather than
 * flagging the one list, where "make this a superset" would mean "make the
 * entire workout one superset".
 */
export function useExerciseSelectionMode(initialSelectedExerciseIds: string[]) {
  const [mode, setMode] = useState<ExerciseSelectionMode>('individual');
  const [selectedIds, setSelectedIds] = useState(initialSelectedExerciseIds);
  const [supersetIds, setSupersetIds] = useState<string[]>([]);

  const isSuperset = mode === 'superset';
  const activeIds = isSuperset ? supersetIds : selectedIds;

  const toggle = useCallback(
    (exerciseId: string) => {
      const update = (current: string[]) =>
        current.includes(exerciseId)
          ? current.filter(id => id !== exerciseId)
          : [...current, exerciseId];
      if (isSuperset) {
        setSupersetIds(update);
        return;
      }
      setSelectedIds(update);
    },
    [isSuperset],
  );

  const startSuperset = useCallback(() => {
    setSupersetIds([]);
    setMode('superset');
  }, []);

  const cancelSuperset = useCallback(() => {
    setSupersetIds([]);
    setMode('individual');
  }, []);

  // A superset member the workout does not have yet joins the exercise list
  // too; one it already has keeps its place.
  const buildResult = useCallback(
    (): SelectionPayload =>
      isSuperset
        ? {
            exerciseIds: uniqueStrings([...selectedIds, ...supersetIds]),
            newSupersetExerciseIds: supersetIds,
          }
        : { exerciseIds: selectedIds },
    [isSuperset, selectedIds, supersetIds],
  );

  return {
    mode,
    isSuperset,
    activeIds,
    selectedCount: activeIds.length,
    canConfirm: isSuperset ? supersetIds.length >= 2 : true,
    toggle,
    startSuperset,
    cancelSuperset,
    buildResult,
  };
}

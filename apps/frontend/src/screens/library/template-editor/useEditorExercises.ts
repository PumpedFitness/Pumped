import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatExerciseSetSummary } from '@/components/exercise/set-table';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import {
  useWorkoutExerciseTypes,
  type WorkoutExerciseTypeItem,
} from '@/hooks/useWorkoutExerciseTypes';
import type { WorkoutTemplateColor } from '@/data/local/enums';
import type { WorkoutTemplateSuperset } from '@/types/workout';
import {
  groupIntoBlocks,
  type SupersetBlock,
} from '@/data/local/workouts/supersets';
import type { EditableExercise, ExerciseOption } from '@/types/exercise';

/**
 * A draft exercise with every id already resolved to the object it points at —
 * the catalog exercise and its workout type — plus ready-to-render set views.
 * The editor card renders this directly and never has to look anything up.
 */
export type EditorExercise = {
  exerciseId: string;
  /** The loaded catalog exercise (name, picture, muscle groups, …). */
  option: ExerciseOption | null;
  name: string;
  type: WorkoutExerciseTypeItem | null;
  /** Per-placement accent color; null inherits the workout color. */
  color: WorkoutTemplateColor | null;
  /** Superset membership; null means the exercise stands alone. */
  supersetId: string | null;
  goal: string;
  setSummary: string;
  sets: EditableExercise['sets'];
};

/** What the exercises section actually renders: a standalone exercise or a
 *  whole superset. */
export type EditorBlock = SupersetBlock<EditorExercise>;

export function useEditorExercises(
  draftExercises: EditableExercise[],
  supersets: WorkoutTemplateSuperset[],
  exerciseOptions: ExerciseOption[],
): { exercises: EditorExercise[]; blocks: EditorBlock[] } {
  const { t } = useTranslation();
  const { options: setTypeOptions } = useSetTypeLibrary();
  const exerciseTypes = useWorkoutExerciseTypes();

  const optionsById = useMemo(
    () => new Map(exerciseOptions.map(option => [option.id, option] as const)),
    [exerciseOptions],
  );

  const exercises = useMemo<EditorExercise[]>(
    () =>
      draftExercises.map(exercise => ({
        exerciseId: exercise.exerciseId,
        option: optionsById.get(exercise.exerciseId) ?? null,
        name:
          optionsById.get(exercise.exerciseId)?.name ??
          t('common.unknownExercise'),
        type: exercise.typeId
          ? exerciseTypes.items.find(item => item.id === exercise.typeId) ??
            null
          : null,
        color: exercise.color,
        supersetId: exercise.supersetId,
        goal: exercise.goal,
        setSummary: formatExerciseSetSummary(t, exercise.sets, setTypeOptions),
        sets: exercise.sets,
      })),
    [draftExercises, optionsById, exerciseTypes.items, setTypeOptions, t],
  );

  const blocks = useMemo(
    () => groupIntoBlocks(exercises, supersets),
    [exercises, supersets],
  );

  return { exercises, blocks };
}

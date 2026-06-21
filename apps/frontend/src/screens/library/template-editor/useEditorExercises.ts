import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import {
  formatExerciseSetSummary,
  formatSetFieldDetail,
} from '@/components/exercise/set-table';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  useWorkoutExerciseTypes,
  type WorkoutExerciseTypeItem,
} from '@/hooks/useWorkoutExerciseTypes';
import type { SetTypeWithFields } from '@/types/setType';
import type {
  EditableExercise,
  EditableExerciseSet,
  ExerciseOption,
} from '@/types/exercise';

/** One set, resolved to display strings for the read-only card summary. */
export type EditorSetView = {
  id: string;
  typeLabel: string;
  detail: string;
};

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
  goal: string;
  setSummary: string;
  setViews: EditorSetView[];
  sets: EditableExerciseSet[];
};

function buildSetView(
  t: ReturnType<typeof useTranslation>['t'],
  set: EditableExerciseSet,
  setType: SetTypeWithFields | undefined,
  weightUnit: WeightUnit,
): EditorSetView {
  const typeLabel = setType?.name ?? set.setType;
  const parts: string[] = [];
  (setType?.fields ?? []).forEach(field => {
    const detail = formatSetFieldDetail(field, set.fieldValues, weightUnit);
    if (detail) {
      parts.push(detail);
    }
  });
  if (set.restSeconds != null) {
    parts.push(
      t('templateEditor.exercises.setSummary.rest', { value: set.restSeconds }),
    );
  }
  return { id: set.id, typeLabel, detail: parts.join(' · ') };
}

export function useEditorExercises(
  draftExercises: EditableExercise[],
  exerciseOptions: ExerciseOption[],
): { exercises: EditorExercise[] } {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const weightUnit = profile.weightUnit;
  const { options: setTypeOptions, byId: setTypesById } = useSetTypeLibrary();
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
          ? exerciseTypes.items.find(item => item.id === exercise.typeId) ?? null
          : null,
        goal: exercise.goal,
        setSummary: formatExerciseSetSummary(t, exercise.sets, setTypeOptions),
        setViews: exercise.sets.map(set =>
          buildSetView(t, set, setTypesById.get(set.setType), weightUnit),
        ),
        sets: exercise.sets,
      })),
    [
      draftExercises,
      optionsById,
      exerciseTypes.items,
      setTypeOptions,
      setTypesById,
      weightUnit,
      t,
    ],
  );

  return { exercises };
}

import {
  isProgressionGoalCompatible,
  normalizeProgressionGoal,
} from '@/data/local/sets/progressionGoals';
import type {
  ProgressionGoal,
  SetTypeFieldDef,
  SetTypeWithFields,
} from '@/types/setType';

type SetWithProgression = {
  progressionGoal?: ProgressionGoal | null;
};

export type SetCardProgressionKind = ProgressionGoal['kind'];

export type SetCardProgression = {
  goal: ProgressionGoal;
  fields: SetTypeFieldDef[];
  canUseLinear: boolean;
  readOnly: boolean;
  onChange: (goal: ProgressionGoal) => void;
};

function defaultProgressionGoal(
  setType: SetTypeWithFields | undefined,
): ProgressionGoal {
  if (!setType) {
    return { kind: 'none' };
  }
  return normalizeProgressionGoal(setType.progressionGoal, setType.fields);
}

function progressionFields(
  fields: SetTypeFieldDef[] | undefined,
): SetTypeFieldDef[] {
  return (fields ?? []).filter(
    field => field.dataType === 'number' || field.dataType === 'range',
  );
}

export function buildSetCardProgression(
  set: SetWithProgression,
  setType: SetTypeWithFields | undefined,
  onChange: (goal: ProgressionGoal) => void,
): SetCardProgression {
  return {
    goal: set.progressionGoal ?? defaultProgressionGoal(setType),
    fields: progressionFields(setType?.fields),
    canUseLinear: setType
      ? isProgressionGoalCompatible(
          { kind: 'linear', increment: 1 },
          setType.fields,
        )
      : false,
    readOnly: false,
    onChange: goal =>
      onChange(normalizeProgressionGoal(goal, setType?.fields ?? [])),
  };
}

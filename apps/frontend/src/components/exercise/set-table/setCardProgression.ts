import {
  normalizeProgressionGoal,
  progressionGoalOptions,
  type ProgressionGoalOption,
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
  options: ProgressionGoalOption[];
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
    options: progressionGoalOptions(setType?.fields ?? []),
    readOnly: false,
    onChange: goal =>
      onChange(normalizeProgressionGoal(goal, setType?.fields ?? [])),
  };
}

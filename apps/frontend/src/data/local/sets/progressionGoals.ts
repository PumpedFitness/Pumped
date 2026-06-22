import type { TFunction } from 'i18next';
import type {
  LinearProgressionGoal,
  ProgressionGoal,
  SetFieldRole,
  SetTypeFieldDef,
} from '@/types/setType';

type RoleField = Pick<
  SetTypeFieldDef,
  'id' | 'name' | 'dataType' | 'unit' | 'config'
>;

export const NO_PROGRESSION_GOAL: ProgressionGoal = { kind: 'none' };

export const DEFAULT_LINEAR_INCREMENT = 1;

export type WeightUnit = 'kg' | 'lbs';

function isNumericField(field: RoleField): boolean {
  return field.dataType === 'number' || field.dataType === 'range';
}

function isRepsField(field: RoleField): boolean {
  const name = field.name.toLowerCase();
  const id = field.id.toLowerCase();
  if (name.includes('rep') || id.includes('rep')) {
    return true;
  }
  return (
    field.unit === null &&
    isNumericField(field) &&
    (field.config.max == null || field.config.max > 10)
  );
}

export function getSetFieldRole(field: RoleField): SetFieldRole {
  if (field.unit === 'amount' && isNumericField(field)) {
    return 'weight';
  }
  if (field.unit === 'seconds' && isNumericField(field)) {
    return 'duration';
  }
  if (isRepsField(field)) {
    return 'reps';
  }
  return 'other';
}

export function fieldForRole(
  fields: RoleField[],
  role: SetFieldRole,
): RoleField | undefined {
  return fields.find(field => getSetFieldRole(field) === role);
}

export function linearProgressionFields(fields: RoleField[]): RoleField[] {
  return fields.filter(isNumericField);
}

export function defaultLinearProgressionFieldId(
  fields: RoleField[],
): string | undefined {
  return linearProgressionFields(fields)[0]?.id;
}

export function progressionField(
  fields: RoleField[],
  goal: LinearProgressionGoal,
): RoleField | undefined {
  const choices = linearProgressionFields(fields);
  return choices.find(field => field.id === goal.fieldId) ?? choices[0];
}

function defaultIncrementForField(field: RoleField | undefined): number {
  const role = field ? getSetFieldRole(field) : 'other';
  if (role === 'weight') {
    return 2.5;
  }
  if (role === 'duration') {
    return 5;
  }
  return DEFAULT_LINEAR_INCREMENT;
}

export function isProgressionGoalCompatible(
  goal: ProgressionGoal,
  fields: RoleField[],
): boolean {
  return goal.kind === 'none' || progressionField(fields, goal) != null;
}

export function normalizeProgressionGoal(
  goal: ProgressionGoal | null | undefined | { kind?: string },
  fields: RoleField[],
): ProgressionGoal {
  if (goal?.kind !== 'linear') {
    return NO_PROGRESSION_GOAL;
  }
  const field =
    progressionField(fields, goal as LinearProgressionGoal) ??
    linearProgressionFields(fields)[0];
  if (!field) {
    return NO_PROGRESSION_GOAL;
  }
  const increment =
    typeof (goal as LinearProgressionGoal).increment === 'number'
      ? (goal as LinearProgressionGoal).increment
      : defaultIncrementForField(field);
  return {
    kind: 'linear',
    fieldId: field.id,
    increment,
  };
}

export function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value
    .toFixed(2)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*[1-9])0$/, '$1');
}

export function formatProgressionGoal(
  t: TFunction,
  goal: ProgressionGoal,
): string {
  switch (goal.kind) {
    case 'linear':
      return t('progression.goal.summary.linear', {
        increment: formatNumber(goal.increment),
      });
    case 'none':
      return t('progression.goal.summary.none');
  }
}

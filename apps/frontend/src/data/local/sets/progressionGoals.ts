import type { ProgressionGoal, SetTypeFieldDef } from '@/types/setType';

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
  goal: Extract<ProgressionGoal, { kind: 'linear' }>,
): RoleField | undefined {
  const choices = linearProgressionFields(fields);
  return choices.find(field => field.id === goal.fieldId) ?? choices[0];
}

function decimalsForField(field: RoleField | undefined): number {
  return Math.max(0, field?.config.decimals ?? 0);
}

function normalizeIncrementForField(
  increment: number,
  field: RoleField | undefined,
): number {
  const decimals = decimalsForField(field);
  if (decimals === 0) {
    return Math.round(increment);
  }
  const factor = 10 ** decimals;
  return Math.round(increment * factor) / factor;
}

function defaultIncrementForField(field: RoleField | undefined): number {
  if (field?.unit === 'amount' && isNumericField(field)) {
    return normalizeIncrementForField(2.5, field);
  }
  if (field?.unit === 'seconds' && isNumericField(field)) {
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
    progressionField(
      fields,
      goal as Extract<ProgressionGoal, { kind: 'linear' }>,
    ) ?? linearProgressionFields(fields)[0];
  if (!field) {
    return NO_PROGRESSION_GOAL;
  }
  const increment =
    typeof (goal as Extract<ProgressionGoal, { kind: 'linear' }>).increment ===
    'number'
      ? (goal as Extract<ProgressionGoal, { kind: 'linear' }>).increment
      : defaultIncrementForField(field);
  return {
    kind: 'linear',
    fieldId: field.id,
    increment: normalizeIncrementForField(increment, field),
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

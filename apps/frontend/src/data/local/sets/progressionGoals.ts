import type { ProgressionGoal, SetTypeFieldDef } from '@/types/setType';

type RoleField = Pick<
  SetTypeFieldDef,
  'id' | 'name' | 'dataType' | 'unit' | 'config'
>;

export type ProgressionGoalLabelKey =
  | 'progression.modes.none'
  | 'progression.modes.linear'
  | 'progression.modes.rangeRollover';

export type GoalDefinition = {
  kind: ProgressionGoal['kind'];
  labelKey: ProgressionGoalLabelKey;
  isAvailable: (fields: RoleField[]) => boolean;
  createDefaultGoal: (fields: RoleField[]) => ProgressionGoal;
  normalize: (goal: ProgressionGoal, fields: RoleField[]) => ProgressionGoal;
};

export type ProgressionGoalOption = Pick<
  GoalDefinition,
  'kind' | 'labelKey'
> & {
  goal: ProgressionGoal;
};

export const NO_PROGRESSION_GOAL: ProgressionGoal = { kind: 'none' };

export const DEFAULT_LINEAR_INCREMENT = 1;

const DEFAULT_RANGE_MIN = 5;
const DEFAULT_RANGE_MAX = 8;

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

export function rangeRolloverFields(fields: RoleField[]): RoleField[] {
  return fields.filter(isNumericField);
}

export function rangeRolloverTargetFields(
  fields: RoleField[],
  rangeFieldId?: string,
): RoleField[] {
  return rangeRolloverFields(fields).filter(field => field.id !== rangeFieldId);
}

export function rangeRolloverRangeField(
  fields: RoleField[],
  goal: Extract<ProgressionGoal, { kind: 'rangeRollover' }>,
): RoleField | undefined {
  const choices = rangeRolloverFields(fields);
  return choices.find(field => field.id === goal.rangeFieldId) ?? choices[0];
}

export function rangeRolloverTargetField(
  fields: RoleField[],
  goal: Extract<ProgressionGoal, { kind: 'rangeRollover' }>,
): RoleField | undefined {
  const rangeField = rangeRolloverRangeField(fields, goal);
  const choices = rangeRolloverTargetFields(fields, rangeField?.id);
  return choices.find(field => field.id === goal.targetFieldId) ?? choices[0];
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

function normalizeLinearGoal(
  goal: ProgressionGoal,
  fields: RoleField[],
): ProgressionGoal {
  if (goal.kind !== 'linear') {
    return NO_PROGRESSION_GOAL;
  }
  const field =
    progressionField(fields, goal) ?? linearProgressionFields(fields)[0];
  if (!field) {
    return NO_PROGRESSION_GOAL;
  }
  const storedIncrement = (goal as { increment?: unknown }).increment;
  const increment =
    typeof storedIncrement === 'number'
      ? storedIncrement
      : defaultIncrementForField(field);
  return {
    kind: 'linear',
    fieldId: field.id,
    increment: normalizeIncrementForField(increment, field),
  };
}

function normalizeRangeValue(
  value: number,
  field: RoleField | undefined,
): number {
  return normalizeIncrementForField(value, field);
}

function normalizeRangeRolloverGoal(
  goal: ProgressionGoal,
  fields: RoleField[],
): ProgressionGoal {
  if (goal.kind !== 'rangeRollover') {
    return NO_PROGRESSION_GOAL;
  }
  const rangeField = rangeRolloverRangeField(fields, goal);
  const targetField = rangeRolloverTargetField(fields, {
    ...goal,
    rangeFieldId: rangeRolloverRangeField(fields, goal)?.id,
  });
  if (!rangeField || !targetField) {
    return NO_PROGRESSION_GOAL;
  }

  const storedRangeMin = (goal as { rangeMin?: unknown }).rangeMin;
  const storedRangeMax = (goal as { rangeMax?: unknown }).rangeMax;
  const storedRangeIncrement = (goal as { rangeIncrement?: unknown })
    .rangeIncrement;
  const storedTargetIncrement = (goal as { targetIncrement?: unknown })
    .targetIncrement;
  const rangeMin =
    typeof storedRangeMin === 'number' ? storedRangeMin : DEFAULT_RANGE_MIN;
  const rangeMax =
    typeof storedRangeMax === 'number' ? storedRangeMax : DEFAULT_RANGE_MAX;
  const normalizedMin = normalizeRangeValue(
    Math.min(rangeMin, rangeMax),
    rangeField,
  );
  const normalizedMax = normalizeRangeValue(
    Math.max(rangeMin, rangeMax),
    rangeField,
  );
  const rangeIncrement =
    typeof storedRangeIncrement === 'number'
      ? storedRangeIncrement
      : DEFAULT_LINEAR_INCREMENT;
  const targetIncrement =
    typeof storedTargetIncrement === 'number'
      ? storedTargetIncrement
      : defaultIncrementForField(targetField);

  return {
    kind: 'rangeRollover',
    rangeFieldId: rangeField.id,
    targetFieldId: targetField.id,
    rangeMin: normalizedMin,
    rangeMax: normalizedMax,
    rangeIncrement: normalizeIncrementForField(rangeIncrement, rangeField),
    targetIncrement: normalizeIncrementForField(targetIncrement, targetField),
  };
}

const progressionGoalDefinitions: GoalDefinition[] = [
  {
    kind: 'none',
    labelKey: 'progression.modes.none',
    isAvailable: () => true,
    createDefaultGoal: () => NO_PROGRESSION_GOAL,
    normalize: () => NO_PROGRESSION_GOAL,
  },
  {
    kind: 'linear',
    labelKey: 'progression.modes.linear',
    isAvailable: fields => linearProgressionFields(fields).length > 0,
    createDefaultGoal: fields => {
      const field = linearProgressionFields(fields)[0];
      return {
        kind: 'linear',
        fieldId: field?.id,
        increment: defaultIncrementForField(field),
      };
    },
    normalize: normalizeLinearGoal,
  },
  {
    kind: 'rangeRollover',
    labelKey: 'progression.modes.rangeRollover',
    isAvailable: fields => rangeRolloverFields(fields).length > 1,
    createDefaultGoal: fields => {
      const rangeField = rangeRolloverFields(fields)[0];
      const targetField = rangeRolloverTargetFields(fields, rangeField?.id)[0];
      return {
        kind: 'rangeRollover',
        rangeFieldId: rangeField?.id,
        targetFieldId: targetField?.id,
        rangeMin: DEFAULT_RANGE_MIN,
        rangeMax: DEFAULT_RANGE_MAX,
        rangeIncrement: DEFAULT_LINEAR_INCREMENT,
        targetIncrement: defaultIncrementForField(targetField),
      };
    },
    normalize: normalizeRangeRolloverGoal,
  },
];

export function progressionGoalDefinition(
  kind: ProgressionGoal['kind'],
): GoalDefinition {
  return (
    progressionGoalDefinitions.find(definition => definition.kind === kind) ??
    progressionGoalDefinitions[0]
  );
}

export function progressionGoalOptions(
  fields: RoleField[],
): ProgressionGoalOption[] {
  return progressionGoalDefinitions
    .filter(definition => definition.isAvailable(fields))
    .map(definition => ({
      kind: definition.kind,
      labelKey: definition.labelKey,
      goal: definition.createDefaultGoal(fields),
    }));
}

export function isProgressionGoalCompatible(
  goal: ProgressionGoal,
  fields: RoleField[],
): boolean {
  const definition = progressionGoalDefinition(goal.kind);
  return (
    definition.isAvailable(fields) &&
    definition.normalize(goal, fields).kind === goal.kind
  );
}

export function normalizeProgressionGoal(
  goal: ProgressionGoal | null | undefined | { kind?: string },
  fields: RoleField[],
): ProgressionGoal {
  if (
    goal?.kind !== 'none' &&
    goal?.kind !== 'linear' &&
    goal?.kind !== 'rangeRollover'
  ) {
    return NO_PROGRESSION_GOAL;
  }
  const typedGoal = goal as ProgressionGoal;
  return progressionGoalDefinition(typedGoal.kind).normalize(typedGoal, fields);
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

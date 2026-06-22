import type { SetTypeFieldDef } from '@/types/setType';

export type SuggestedSetValues = {
  weightKg?: number;
  reps?: number;
};

function isRepsField(field: SetTypeFieldDef): boolean {
  const name = field.name.toLowerCase();
  const id = field.id.toLowerCase();
  if (name.includes('rep') || id.includes('rep')) {
    return true;
  }
  return (
    field.unit === null &&
    (field.dataType === 'number' || field.dataType === 'range') &&
    (field.config.max == null || field.config.max > 10)
  );
}

export function suggestedNumberValue(
  field: SetTypeFieldDef,
  suggestion?: SuggestedSetValues,
): number | undefined {
  if (field.unit === 'amount') {
    return suggestion?.weightKg;
  }
  if (isRepsField(field)) {
    return suggestion?.reps;
  }
  return undefined;
}

// Pure validation rules for workout data. No DB access.

import { i18n } from '@/i18n';
import type { SaveScheduleInput } from '@/types/schedule';

export const LOCAL_USER_ID = 'local';

export function requireText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(i18n.t('errors.fieldBlank', { field }));
  }
  return normalized;
}

export function validateScheduleInput(
  input: SaveScheduleInput,
): SaveScheduleInput {
  if (!Number.isInteger(input.periodLength) || input.periodLength < 1) {
    throw new Error(i18n.t('errors.scheduleIntervalPositive'));
  }
  requireText(input.name, i18n.t('errors.fields.scheduleName'));

  const maxOffset =
    input.recurrenceType === 'WEEKLY'
      ? input.periodLength * 7
      : input.periodLength;
  for (const slot of input.slots) {
    if (
      !Number.isInteger(slot.dayOffset) ||
      slot.dayOffset < 0 ||
      slot.dayOffset >= maxOffset
    ) {
      throw new Error(i18n.t('errors.scheduleSlotOutOfRange'));
    }
    if (!slot.workoutTemplateId) {
      throw new Error(i18n.t('errors.scheduleSlotWorkoutRequired'));
    }
  }

  return input;
}

// Generic helpers for reading, writing and validating a set's field values.
// A set stores a sparse `SetFieldValue[]` keyed by `set_type_field.id`; the
// owning field's `dataType` selects the slot. For a `range` field, the target
// (template) lives in `range` and the actual (session) lives in `number`.

import type { SetFieldRange, SetFieldValue } from '@/types/workout';
import type { SetTypeFieldConfig, SetTypeFieldDef } from '@/types/setType';

/** Whether a value carrier holds anything (false ⇒ omit it from the array). */
function slotHasValue(value: SetFieldValue): boolean {
  if (value.number !== undefined && value.number !== null) {
    return true;
  }
  if (value.bool !== undefined && value.bool !== null) {
    return true;
  }
  if (
    value.text !== undefined &&
    value.text !== null &&
    value.text.trim() !== ''
  ) {
    return true;
  }
  if (
    value.range != null &&
    (value.range.min !== null || value.range.max !== null)
  ) {
    return true;
  }
  return false;
}

export function getFieldValue(
  values: SetFieldValue[],
  fieldId: string,
): SetFieldValue | undefined {
  return values.find(value => value.fieldId === fieldId);
}

export function getNumberValue(
  values: SetFieldValue[],
  fieldId: string,
): number | null {
  return getFieldValue(values, fieldId)?.number ?? null;
}

export function getBoolValue(
  values: SetFieldValue[],
  fieldId: string,
): boolean {
  return getFieldValue(values, fieldId)?.bool ?? false;
}

export function getTextValue(values: SetFieldValue[], fieldId: string): string {
  return getFieldValue(values, fieldId)?.text ?? '';
}

export function getRangeValue(
  values: SetFieldValue[],
  fieldId: string,
): SetFieldRange | null {
  return getFieldValue(values, fieldId)?.range ?? null;
}

function setSlot(
  values: SetFieldValue[],
  fieldId: string,
  slot: Omit<SetFieldValue, 'fieldId'>,
): SetFieldValue[] {
  const rest = values.filter(value => value.fieldId !== fieldId);
  const next: SetFieldValue = { fieldId, ...slot };
  return slotHasValue(next) ? [...rest, next] : rest;
}

export function setNumberValue(
  values: SetFieldValue[],
  fieldId: string,
  value: number | null,
): SetFieldValue[] {
  return setSlot(values, fieldId, { number: value });
}

export function setBoolValue(
  values: SetFieldValue[],
  fieldId: string,
  value: boolean,
): SetFieldValue[] {
  return setSlot(values, fieldId, { bool: value });
}

export function setTextValue(
  values: SetFieldValue[],
  fieldId: string,
  value: string,
): SetFieldValue[] {
  return setSlot(values, fieldId, { text: value });
}

export function setRangeValue(
  values: SetFieldValue[],
  fieldId: string,
  value: SetFieldRange | null,
): SetFieldValue[] {
  return setSlot(values, fieldId, { range: value });
}

/** Drop values whose field is no longer part of the set's type (e.g. after a
 *  set-type change). Ids are per-type, so changing type resets the values. */
export function reconcileValuesForType(
  values: SetFieldValue[],
  fields: SetTypeFieldDef[],
): SetFieldValue[] {
  const allowed = new Set(fields.map(field => field.id));
  return values.filter(value => allowed.has(value.fieldId));
}

/** Starting actuals for a session set, derived from a template set's targets.
 *  Scalar targets (number/boolean/text) carry over so the user can confirm or
 *  tweak; a range target does not — the session logs a single number. */
export function snapshotActualsFromTargets(
  targets: SetFieldValue[],
): SetFieldValue[] {
  return targets
    .filter(value => value.range == null)
    .map(value => {
      const next: SetFieldValue = { fieldId: value.fieldId };
      if (value.number != null) {
        next.number = value.number;
      }
      if (value.bool != null) {
        next.bool = value.bool;
      }
      if (value.text != null && value.text !== '') {
        next.text = value.text;
      }
      return next;
    })
    .filter(slotHasValue);
}

/** Mode selects which slot a `range` field uses: a template holds the target
 *  range, a session holds the single logged actual. */
export type FieldValueMode = 'target' | 'actual';

function isValidNumber(value: number, config: SetTypeFieldConfig): boolean {
  if (!Number.isFinite(value)) {
    return false;
  }
  if (config.min != null && value < config.min) {
    return false;
  }
  if (config.max != null && value > config.max) {
    return false;
  }
  if (config.decimals === 0 && !Number.isInteger(value)) {
    return false;
  }
  return true;
}

function isValidNumberSlot(
  value: SetFieldValue | undefined,
  config: SetTypeFieldConfig,
  required: boolean,
): boolean {
  const number = value?.number ?? null;
  return number === null ? !required : isValidNumber(number, config);
}

function isValidRangeSlot(
  value: SetFieldValue | undefined,
  config: SetTypeFieldConfig,
  required: boolean,
): boolean {
  const range = value?.range ?? null;
  if (!range || (range.min === null && range.max === null)) {
    return !required;
  }
  if (range.min !== null && !isValidNumber(range.min, config)) {
    return false;
  }
  if (range.max !== null && !isValidNumber(range.max, config)) {
    return false;
  }
  return range.min === null || range.max === null || range.min <= range.max;
}

export function isFieldValueValid(
  field: SetTypeFieldDef,
  value: SetFieldValue | undefined,
  mode: FieldValueMode,
): boolean {
  const required = field.config.required ?? false;
  if (field.dataType === 'boolean') {
    return (value?.bool ?? null) !== null || !required;
  }
  if (field.dataType === 'text') {
    return (value?.text ?? '').trim() !== '' || !required;
  }
  // A range field logs a single number in a session, a min–max in a template.
  if (field.dataType === 'range' && mode === 'target') {
    return isValidRangeSlot(value, field.config, required);
  }
  return isValidNumberSlot(value, field.config, required);
}

/** A set is complete when every field's value is valid for the mode. */
export function isSetComplete(
  fields: SetTypeFieldDef[],
  values: SetFieldValue[],
  mode: FieldValueMode,
): boolean {
  return fields.every(field =>
    isFieldValueValid(field, getFieldValue(values, field.id), mode),
  );
}

// Set-type reads. Plain functions over the local database — consumed by domain
// hooks (useSetTypeLibrary) and non-reactive callers (the current-workout store
// resolver). Built-in type/field names resolve via i18n at read time.

import { asc, eq } from 'drizzle-orm';
import { i18n } from '@/i18n';
import { db } from '@/data/local/database';
import { getTableVersion } from '@/data/local/tableVersions';
import { setTypeFields, setTypes } from '@/data/local/schema';
import {
  builtInSetFieldLabelKey,
  builtInSetTypeColor,
  builtInSetTypeLabelKey,
} from '@/data/local/builtins';
import { deriveSetTypeColor } from '@/data/local/sets/setTypeColor';
import { getNumberValue } from '@/data/local/sets/fieldValues';
import { normalizeProgressionGoal } from '@/data/local/sets/progressionGoals';
import type { SetTypeFieldDef, SetTypeWithFields } from '@/types/setType';
import type { PerformedSet } from '@/types/workout';

type SetTypeRow = typeof setTypes.$inferSelect;
type SetTypeFieldRow = typeof setTypeFields.$inferSelect;

/** Display name for a set type — built-in labels resolve via i18n. */
export function resolveSetTypeName(id: string, storedName: string): string {
  const key = builtInSetTypeLabelKey(id);
  return key ? i18n.t(key) : storedName;
}

/** Display name for a set-type field — built-in labels resolve via i18n. */
export function resolveSetFieldName(id: string, storedName: string): string {
  const key = builtInSetFieldLabelKey(id);
  return key ? i18n.t(key) : storedName;
}

function toFieldDef(row: SetTypeFieldRow): SetTypeFieldDef {
  return {
    id: row.id,
    setTypeId: row.setTypeId,
    name: resolveSetFieldName(row.id, row.name),
    dataType: row.dataType,
    unit: row.unit,
    position: row.position,
    config: row.config,
  };
}

function toSetTypeWithFields(
  row: SetTypeRow,
  fields: SetTypeFieldRow[],
): SetTypeWithFields {
  const fieldDefs = fields
    .filter(field => field.setTypeId === row.id)
    .sort((a, b) => a.position - b.position)
    .map(toFieldDef);
  return {
    id: row.id,
    name: resolveSetTypeName(row.id, row.name),
    icon: row.icon,
    color: builtInSetTypeColor(row.id) ?? deriveSetTypeColor(row.id),
    isBuiltIn: row.isBuiltIn,
    position: row.position,
    progressionGoal: normalizeProgressionGoal(row.progressionGoal, fieldDefs),
    fields: fieldDefs,
  };
}

// Field defs are read non-reactively on hot paths (completion checks fire once
// per done set on every workout mutation), so memoize them. The cache clears
// when the setTypeFields table changes or the UI language switches (built-in
// field labels resolve via i18n in toFieldDef).
const fieldDefCache = new Map<string, SetTypeFieldDef[]>();
let fieldDefCacheVersion = -1;
let fieldDefCacheLang = '';

/** Raw field defs for a set type (for validation/snapshot). Cached. */
export function getSetTypeFieldDefs(setTypeId: string): SetTypeFieldDef[] {
  const version = getTableVersion(setTypeFields);
  if (version !== fieldDefCacheVersion || i18n.language !== fieldDefCacheLang) {
    fieldDefCache.clear();
    fieldDefCacheVersion = version;
    fieldDefCacheLang = i18n.language;
  }
  const cached = fieldDefCache.get(setTypeId);
  if (cached) {
    return cached;
  }
  const defs = db
    .select()
    .from(setTypeFields)
    .where(eq(setTypeFields.setTypeId, setTypeId))
    .orderBy(asc(setTypeFields.position))
    .all()
    .map(toFieldDef);
  fieldDefCache.set(setTypeId, defs);
  return defs;
}

export function getSetTypeWithFields(
  setTypeId: string,
): SetTypeWithFields | null {
  const row = db
    .select()
    .from(setTypes)
    .where(eq(setTypes.id, setTypeId))
    .get();
  if (!row) {
    return null;
  }
  return toSetTypeWithFields(row, getSetTypeFieldRows(setTypeId));
}

function getSetTypeFieldRows(setTypeId: string): SetTypeFieldRow[] {
  return db
    .select()
    .from(setTypeFields)
    .where(eq(setTypeFields.setTypeId, setTypeId))
    .orderBy(asc(setTypeFields.position))
    .all();
}

/** Resolve a set's weight + reps from its type fields (first `amount`-unit
 *  field × first plain-count number field) for volume/analytics. */
export function resolveSetWeightReps(
  set: Pick<PerformedSet, 'setType' | 'fieldValues'>,
): { weight: number | null; reps: number } {
  const fields = getSetTypeFieldDefs(set.setType);
  const weightField = fields.find(field => field.unit === 'amount');
  const repsField = fields.find(
    field => field.dataType === 'number' && field.unit === null,
  );
  return {
    weight: weightField
      ? getNumberValue(set.fieldValues, weightField.id)
      : null,
    reps:
      (repsField ? getNumberValue(set.fieldValues, repsField.id) : null) ?? 0,
  };
}

export function listSetTypesWithFields(): SetTypeWithFields[] {
  const typeRows = db
    .select()
    .from(setTypes)
    .orderBy(asc(setTypes.position), asc(setTypes.name))
    .all();
  const fieldRows = db
    .select()
    .from(setTypeFields)
    .orderBy(asc(setTypeFields.position))
    .all();
  return typeRows.map(row => toSetTypeWithFields(row, fieldRows));
}

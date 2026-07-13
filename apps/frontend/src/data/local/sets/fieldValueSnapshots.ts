import { asc } from 'drizzle-orm';
import {
  BUILT_IN_SET_TYPE_FIELDS,
  builtInSetFieldId,
} from '@/data/local/builtins';
import { db } from '@/data/local/database';
import type { WorkoutSetType } from '@/data/local/enums';
import { setTypeFields } from '@/data/local/schema';
import type { SetTypeFieldDef } from '@/types/setType';
import type { HistoricalSetField, SetFieldValue } from '@/types/workout';

type ImportedSetScalars = {
  weight?: number | null;
  reps?: number | null;
  rpe?: number | null;
};

type CsvScalarKey = keyof ImportedSetScalars;

export function loadSetFields(): SetTypeFieldDef[] {
  return db
    .select()
    .from(setTypeFields)
    .orderBy(asc(setTypeFields.position))
    .all();
}

const BUILT_IN_FIELDS_BY_ID: ReadonlyMap<string, SetTypeFieldDef> = new Map(
  BUILT_IN_SET_TYPE_FIELDS.map((field, position) => [
    field.id,
    {
      id: field.id,
      setTypeId: field.setTypeId,
      name: field.name,
      dataType: field.dataType,
      unit: field.unit,
      position,
      config: field.config,
    } satisfies SetTypeFieldDef,
  ]),
);

export const BUILT_IN_FIELD_DEFINITIONS: readonly SetTypeFieldDef[] = [
  ...BUILT_IN_FIELDS_BY_ID.values(),
];

function normalizeFieldName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function importedScalarKey(field: SetTypeFieldDef): CsvScalarKey | null {
  const normalizedName = normalizeFieldName(field.name);

  if (field.id.endsWith(':weight') || normalizedName === 'weight') {
    return 'weight';
  }

  if (field.id.endsWith(':reps') || normalizedName === 'reps') {
    return 'reps';
  }

  if (field.id.endsWith(':rpe') || normalizedName === 'rpe') {
    return 'rpe';
  }

  return null;
}

function csvScalarField(
  setType: WorkoutSetType,
  key: CsvScalarKey,
  position: number,
): SetTypeFieldDef {
  const builtInField = BUILT_IN_FIELDS_BY_ID.get(
    builtInSetFieldId(setType, key),
  );
  if (builtInField) {
    return builtInField;
  }

  return {
    id: builtInSetFieldId(setType, key),
    setTypeId: setType,
    name: key === 'rpe' ? 'RPE' : key === 'reps' ? 'Reps' : 'Weight',
    dataType: 'number',
    unit: key === 'weight' ? 'amount' : null,
    position,
    config:
      key === 'rpe'
        ? { min: 0, max: 10, step: 0.5, decimals: 1 }
        : key === 'reps'
        ? { min: 0, decimals: 0 }
        : { min: 0, decimals: 2 },
  };
}

function inferredFieldDataType(
  value: SetFieldValue,
): SetTypeFieldDef['dataType'] {
  if (value.bool != null) {
    return 'boolean';
  }

  if (value.text != null) {
    return 'text';
  }

  if (value.range != null) {
    return 'range';
  }

  return 'number';
}

function fieldDefinition(field: SetTypeFieldDef): HistoricalSetField {
  return {
    fieldId: field.id,
    name: field.name,
    unit: field.unit,
  };
}

export function snapshotFieldDefinitions(
  values: SetFieldValue[],
  fields: readonly SetTypeFieldDef[],
): HistoricalSetField[] {
  const fieldsById = new Map(fields.map(field => [field.id, field]));

  return values.flatMap(value => {
    const field =
      fieldsById.get(value.fieldId) ?? BUILT_IN_FIELDS_BY_ID.get(value.fieldId);
    return field ? [fieldDefinition(field)] : [];
  });
}

export function buildCsvSetFields(
  setType: WorkoutSetType,
  values: ImportedSetScalars,
  fields: SetTypeFieldDef[],
): { fieldValues: SetFieldValue[]; fieldDefinitions: HistoricalSetField[] } {
  const fieldsForType = fields.filter(field => field.setTypeId === setType);
  const fieldsByScalar = new Map<CsvScalarKey, SetTypeFieldDef>();

  fieldsForType.forEach(field => {
    if (field.dataType !== 'number' && field.dataType !== 'range') {
      return;
    }

    const key = importedScalarKey(field);
    if (key) {
      fieldsByScalar.set(key, field);
    }
  });

  const csvFields = (
    ['weight', 'reps', 'rpe'] satisfies CsvScalarKey[]
  ).flatMap((key, index) => {
    const number = values[key];
    if (number == null) {
      return [];
    }

    return [
      fieldsByScalar.get(key) ??
        csvScalarField(setType, key, fieldsForType.length + index),
    ];
  });

  const fieldValues = csvFields.flatMap(field => {
    if (field.dataType !== 'number' && field.dataType !== 'range') {
      return [];
    }

    const key = importedScalarKey(field);
    if (!key) {
      return [];
    }

    const number = values[key];
    if (number == null) {
      return [];
    }

    return [{ fieldId: field.id, number }];
  });

  return {
    fieldValues,
    fieldDefinitions: snapshotFieldDefinitions(fieldValues, csvFields),
  };
}

export function historicalFieldsForSet(
  currentFields: SetTypeFieldDef[],
  setType: string,
  values: SetFieldValue[],
  fieldDefinitions: HistoricalSetField[],
): SetTypeFieldDef[] {
  const currentFieldIds = new Set(currentFields.map(field => field.id));
  const definitionsById = new Map(
    fieldDefinitions.map(field => [field.fieldId, field]),
  );
  const extraFields = values.flatMap((value, index): SetTypeFieldDef[] => {
    if (currentFieldIds.has(value.fieldId)) {
      return [];
    }

    const definition = definitionsById.get(value.fieldId);
    if (definition) {
      return [
        {
          id: value.fieldId,
          setTypeId: setType,
          name: definition.name,
          dataType: inferredFieldDataType(value),
          unit: definition.unit ?? null,
          position: currentFields.length + index,
          config: {},
        },
      ];
    }

    const builtInField = BUILT_IN_FIELDS_BY_ID.get(value.fieldId);
    if (builtInField) {
      return [builtInField];
    }

    return [];
  });

  return [...currentFields, ...extraFields].sort(
    (left, right) => left.position - right.position,
  );
}

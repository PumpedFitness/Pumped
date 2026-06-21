import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { randomUUID } from 'expo-crypto';
import { asc } from 'drizzle-orm';
import type { SetFieldDataType, SetFieldUnit } from '@/data/local/enums';
import { useRepository } from '@/data/local/useRepository';
import { setTypeFields, setTypes } from '@/data/local/schema';
import {
  builtInSetFieldLabelKey,
  builtInSetTypeColor,
  builtInSetTypeLabelKey,
} from '@/data/local/builtins';
import { deriveSetTypeColor } from '@/data/local/sets/setTypeColor';
import type {
  SetTypeFieldConfig,
  SetTypeFieldDef,
  SetTypeWithFields,
} from '@/types/setType';
import type { SetTypeOption } from '@/components/exercise/set-table';

export type NewSetTypeFieldInput = {
  name: string;
  dataType: SetFieldDataType;
  unit?: SetFieldUnit | null;
  config?: SetTypeFieldConfig;
};

export type SetTypeFieldPatch = {
  name?: string;
  dataType?: SetFieldDataType;
  unit?: SetFieldUnit | null;
  config?: SetTypeFieldConfig;
};

export type SetTypeLibrary = {
  items: SetTypeWithFields[];
  byId: Map<string, SetTypeWithFields>;
  /** Pickable options for the set-type picker (built-ins first, then customs). */
  options: SetTypeOption[];
  createSetType: (name: string, icon?: string | null) => string;
  updateSetType: (
    id: string,
    patch: { name?: string; icon?: string | null },
  ) => void;
  deleteSetType: (id: string) => void;
  addField: (setTypeId: string, field: NewSetTypeFieldInput) => string;
  updateField: (fieldId: string, patch: SetTypeFieldPatch) => void;
  removeField: (fieldId: string) => void;
  reorderFields: (orderedFieldIds: string[]) => void;
};

// The user-configurable set-type library, with each type's ordered fields.
// Built-in type/field labels resolve via i18n; user-created use the stored name.
export function useSetTypeLibrary(): SetTypeLibrary {
  const { t } = useTranslation();
  const typeRepo = useRepository(setTypes);
  const fieldRepo = useRepository(setTypeFields);
  const typeRows = typeRepo.query({ orderBy: asc(setTypes.position) });
  const fieldRows = fieldRepo.query({ orderBy: asc(setTypeFields.position) });

  const items = useMemo<SetTypeWithFields[]>(() => {
    const resolveTypeName = (id: string, name: string) => {
      const key = builtInSetTypeLabelKey(id);
      return key ? t(key) : name;
    };
    const resolveFieldName = (id: string, name: string) => {
      const key = builtInSetFieldLabelKey(id);
      return key ? t(key) : name;
    };
    return typeRows.map(typeRow => ({
      id: typeRow.id,
      name: resolveTypeName(typeRow.id, typeRow.name),
      icon: typeRow.icon,
      color: builtInSetTypeColor(typeRow.id) ?? deriveSetTypeColor(typeRow.id),
      isBuiltIn: typeRow.isBuiltIn,
      position: typeRow.position,
      fields: fieldRows
        .filter(field => field.setTypeId === typeRow.id)
        .map(
          (field): SetTypeFieldDef => ({
            id: field.id,
            setTypeId: field.setTypeId,
            name: resolveFieldName(field.id, field.name),
            dataType: field.dataType,
            unit: field.unit,
            position: field.position,
            config: field.config,
          }),
        ),
    }));
  }, [typeRows, fieldRows, t]);

  const byId = useMemo(
    () => new Map(items.map(item => [item.id, item] as const)),
    [items],
  );
  const options = useMemo<SetTypeOption[]>(
    () => items.map(item => ({ value: item.id, label: item.name })),
    [items],
  );

  const createSetType = useCallback(
    (name: string, icon: string | null = null) => {
      const id = randomUUID();
      typeRepo.create({
        id,
        name,
        icon,
        isBuiltIn: false,
        position: typeRows.length,
        createdAt: Date.now(),
      });
      return id;
    },
    [typeRepo, typeRows.length],
  );

  const updateSetType = useCallback(
    (id: string, patch: { name?: string; icon?: string | null }) =>
      typeRepo.update(id, patch),
    [typeRepo],
  );

  const deleteSetType = useCallback(
    (id: string) => {
      typeRepo.deleteById(id);
      // Fields cascade in SQLite; nudge field readers to re-query.
      fieldRepo.refresh();
    },
    [typeRepo, fieldRepo],
  );

  const addField = useCallback(
    (setTypeId: string, field: NewSetTypeFieldInput) => {
      const id = randomUUID();
      const siblingCount = fieldRows.filter(
        row => row.setTypeId === setTypeId,
      ).length;
      fieldRepo.create({
        id,
        setTypeId,
        name: field.name,
        dataType: field.dataType,
        unit: field.unit ?? null,
        position: siblingCount,
        config: field.config ?? {},
        createdAt: Date.now(),
      });
      return id;
    },
    [fieldRepo, fieldRows],
  );

  const updateField = useCallback(
    (fieldId: string, patch: SetTypeFieldPatch) =>
      fieldRepo.update(fieldId, patch),
    [fieldRepo],
  );

  const removeField = useCallback(
    (fieldId: string) => fieldRepo.deleteById(fieldId),
    [fieldRepo],
  );

  const reorderFields = useCallback(
    (orderedFieldIds: string[]) =>
      orderedFieldIds.forEach((fieldId, position) =>
        fieldRepo.update(fieldId, { position }),
      ),
    [fieldRepo],
  );

  return {
    items,
    byId,
    options,
    createSetType,
    updateSetType,
    deleteSetType,
    addField,
    updateField,
    removeField,
    reorderFields,
  };
}

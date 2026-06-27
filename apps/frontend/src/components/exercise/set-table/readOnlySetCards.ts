import type { TFunction } from 'i18next';
import { historicalFieldsForSet } from '@/data/local/sets/fieldValueSnapshots';
import {
  buildCardField,
  type ReadOnlyExerciseSetTableProps,
  type SetCardModel,
} from './exerciseSetTableModel';

export function buildReadOnlySetCards(
  t: TFunction,
  props: ReadOnlyExerciseSetTableProps,
): SetCardModel[] {
  const mode = props.mode ?? 'actual';
  return props.sets.map((set, index) => {
    const type = props.setTypesById.get(set.setType);
    // History ('actual') reconstructs fields from the snapshot taken when the
    // set was performed; template previews ('target') show the set type's
    // current fields directly.
    const fields =
      mode === 'actual'
        ? historicalFieldsForSet(
            type?.fields ?? [],
            set.setType,
            set.fieldValues,
            set.fieldDefinitions ?? [],
          )
        : type?.fields ?? [];
    return {
      key: set.id,
      index,
      setType: set.setType,
      setTypeLabel: type?.name ?? set.setType,
      setTypeIcon: type?.icon ?? null,
      setTypeColor: type?.color ?? 'terracotta',
      fields: fields.map(field =>
        buildCardField(field, set.fieldValues, {
          mode,
          readOnly: true,
          weightUnit: props.weightUnit,
          t,
          onChange: () => undefined,
        }),
      ),
      rest:
        set.restSeconds == null
          ? null
          : {
              value: set.restSeconds,
              readOnly: true,
              onChange: () => undefined,
            },
      tone: 'default',
      isCurrent: false,
      canRemove: false,
      readOnly: true,
      onSetTypeChange: () => undefined,
      onRemove: () => undefined,
    };
  });
}

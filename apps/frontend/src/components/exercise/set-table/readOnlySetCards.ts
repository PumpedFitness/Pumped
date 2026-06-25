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
  return props.sets.map((set, index) => {
    const type = props.setTypesById.get(set.setType);
    const fields = historicalFieldsForSet(
      type?.fields ?? [],
      set.setType,
      set.fieldValues,
      set.fieldDefinitions,
    );
    return {
      key: set.id,
      index,
      setType: set.setType,
      setTypeLabel: type?.name ?? set.setType,
      setTypeIcon: type?.icon ?? null,
      setTypeColor: type?.color ?? 'terracotta',
      fields: fields.map(field =>
        buildCardField(field, set.fieldValues, {
          mode: 'actual',
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

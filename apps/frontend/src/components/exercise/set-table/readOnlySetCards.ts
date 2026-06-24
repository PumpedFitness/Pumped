import type { TFunction } from 'i18next';
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
    return {
      key: set.id,
      index,
      setType: set.setType,
      setTypeLabel: type?.name ?? set.setType,
      setTypeIcon: type?.icon ?? null,
      setTypeColor: type?.color ?? 'terracotta',
      fields: (type?.fields ?? []).map(field =>
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

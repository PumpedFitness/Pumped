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

  // Group previous sets by type so we match by (setType, within-type order)
  // rather than by absolute position. This ensures adding or removing a set
  // type (e.g. Warmup) doesn't shift the comparison for all other set types.
  const previousByType = new Map<string, ReadOnlyExerciseSet[]>();
  for (const prev of props.previousSets ?? []) {
    const bucket = previousByType.get(prev.setType) ?? [];
    bucket.push(prev);
    previousByType.set(prev.setType, bucket);
  }
  const seenByType = new Map<string, number>();

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

    const typeOrder = seenByType.get(set.setType) ?? 0;
    seenByType.set(set.setType, typeOrder + 1);

    const matchingPrev = previousByType.get(set.setType)?.[typeOrder];
    const previousValues = matchingPrev?.fieldValues;
    const isAdditionalSet = props.previousSets != null && matchingPrev == null;

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
          previousValues,
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
      progressionBadgeText: isAdditionalSet
        ? t('progression.additionalSet')
        : undefined,
      progressionBadgeVariant: isAdditionalSet ? 'positive' : undefined,
      tone: 'default',
      isCurrent: false,
      canRemove: false,
      readOnly: true,
      onSetTypeChange: () => undefined,
      onRemove: () => undefined,
    };
  });
}

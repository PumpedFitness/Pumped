import type { TFunction } from 'i18next';
import { historicalFieldsForSet } from '@/data/local/sets/fieldValueSnapshots';
import type { SetTypeFieldDef, SetTypeWithFields } from '@/types/setType';
import {
  buildCardField,
  type ReadOnlyExerciseSet,
  type ReadOnlyExerciseSetTableProps,
  type SetCardModel,
} from './exerciseSetTableModel';

type ReadOnlyMode = NonNullable<ReadOnlyExerciseSetTableProps['mode']>;

type ReadOnlyCardContext = {
  t: TFunction;
  props: ReadOnlyExerciseSetTableProps;
  mode: ReadOnlyMode;
  previousByType: Map<string, ReadOnlyExerciseSet[]>;
  seenByType: Map<string, number>;
};

function previousSetsByType(
  previousSets: ReadOnlyExerciseSet[] | undefined,
): Map<string, ReadOnlyExerciseSet[]> {
  const previousByType = new Map<string, ReadOnlyExerciseSet[]>();
  for (const prev of previousSets ?? []) {
    const bucket = previousByType.get(prev.setType) ?? [];
    bucket.push(prev);
    previousByType.set(prev.setType, bucket);
  }
  return previousByType;
}

function nextTypeOrder(seenByType: Map<string, number>, setType: string) {
  const typeOrder = seenByType.get(setType) ?? 0;
  seenByType.set(setType, typeOrder + 1);
  return typeOrder;
}

function fieldsForReadOnlySet(
  set: ReadOnlyExerciseSet,
  type: SetTypeWithFields | undefined,
  mode: ReadOnlyMode,
): SetTypeFieldDef[] {
  // History ('actual') reconstructs fields from the snapshot taken when the
  // set was performed; template previews ('target') show the set type's
  // current fields directly.
  if (mode === 'actual') {
    return historicalFieldsForSet(
      type?.fields ?? [],
      set.setType,
      set.fieldValues,
      set.fieldDefinitions ?? [],
    );
  }
  return type?.fields ?? [];
}

function readOnlyRest(restSeconds: number | null): SetCardModel['rest'] {
  if (restSeconds == null) {
    return null;
  }
  return {
    value: restSeconds,
    readOnly: true,
    onChange: () => undefined,
  };
}

function buildReadOnlySetCard(
  context: ReadOnlyCardContext,
  set: ReadOnlyExerciseSet,
  index: number,
): SetCardModel {
  const { t, props, mode, previousByType, seenByType } = context;
  const type = props.setTypesById.get(set.setType);
  const fields = fieldsForReadOnlySet(set, type, mode);
  const typeOrder = nextTypeOrder(seenByType, set.setType);
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
    rest: readOnlyRest(set.restSeconds),
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
}

export function buildReadOnlySetCards(
  t: TFunction,
  props: ReadOnlyExerciseSetTableProps,
): SetCardModel[] {
  const mode = props.mode ?? 'actual';
  const context: ReadOnlyCardContext = {
    t,
    props,
    mode,
    previousByType: previousSetsByType(props.previousSets),
    seenByType: new Map<string, number>(),
  };
  return props.sets.map((set, index) =>
    buildReadOnlySetCard(context, set, index),
  );
}

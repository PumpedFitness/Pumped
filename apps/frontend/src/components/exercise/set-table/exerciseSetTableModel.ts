import type { TFunction } from 'i18next';
import type { SetTypeId } from '@/data/local/enums';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type {
  CurrentWorkoutSet,
  UpdateCurrentWorkoutSetInput,
} from '@/stores/currentWorkoutModel';
import type { EditableExerciseSet } from '@/types/exercise';
import type { PerformedSet } from '@/types/workout';
import type {
  SetTypeColorName,
  SetTypeFieldDef,
  SetTypeWithFields,
} from '@/types/setType';
import {
  reconcileValuesForType,
  type FieldValueMode,
} from '@/data/local/sets/fieldValues';
import type {
  DeleteHandler,
  DeleteResult,
} from '@pumped/ui/clay/SwipeToDelete';
import {
  fillEmptyFieldsFromSuggestion,
  type SuggestedSetValues,
} from './exerciseSetSuggestion';
import {
  buildSetCardProgression,
  type SetCardProgression,
} from './setCardProgression';
import {
  buildCardField,
  formatSetNumber,
  type SetCardField,
  type SetCardNumberField,
  type SetCardRangeField,
} from './setCardFields';

export { buildCardField, formatSetNumber };
export type { SetCardField, SetCardNumberField, SetCardRangeField };

export type SetTypeOption = { value: SetTypeId; label: string };

type SetTypeContext = {
  setTypeOptions: SetTypeOption[];
  setTypesById: Map<string, SetTypeWithFields>;
  weightUnit: WeightUnit;
};

type BaseTableProps = SetTypeContext & {
  addSetLabel?: string;
  /** Omitted where adding a set is not this table's call — a superset member
   *  gains rounds through its group, not one exercise at a time. */
  onAddSet?: () => void;
  // Whether set cards animate their layout (slide) when sets are added/removed.
  // Off in the active workout, where activation re-renders during the snap
  // scroll make the cards fly in oddly. Defaults to on. */
  animateLayout?: boolean;
};

export type TemplateSetTableProps = BaseTableProps & {
  sets: EditableExerciseSet[];
  onChangeSet: (index: number, set: EditableExerciseSet) => void;
  onRemoveSet: (index: number) => void;
  onDuplicateSet?: () => void;
  onCreateSetType?: (name: string) => string;
  // Set for a superset member: the superset owns how many rounds there are and
  // how long the rest is, so neither can be edited one member at a time.
  lockSetCount?: boolean;
  hideRest?: boolean;
};

type EditableExerciseSetTableProps = BaseTableProps & {
  readOnly?: false;
  sets: CurrentWorkoutSet[];
  suggestedSets?: SuggestedSetValues[];
  onChangeSet: (setId: string, values: UpdateCurrentWorkoutSetInput) => void;
  onToggleSetDone: (setId: string) => boolean;
  onRemoveSet: (set: CurrentWorkoutSet) => DeleteResult;
  onCreateSetType: (name: string) => string;
  activeRestSetId?: string | null;
  iconOnlySetType?: boolean;
  // Which set is up next. Normally the table works that out itself, but inside
  // a superset the order runs round-major across every member, so the block
  // decides and passes it down. `null` means "not this member's turn".
  currentSetId?: string | null;
  // A superset renders one table per member per round, so a table can hold a
  // single set that is not set #1. The badge shows `indexOffset + 1`.
  indexOffset?: number;
  // Overrides the "never leave an exercise with no sets" gate. In a superset
  // the real question is whether a whole round can go, which only the block
  // knows.
  canRemoveSets?: boolean;
};

// `fieldDefinitions` is optional: history ('actual') snapshots fields as
// performed; template previews ('target') have none and fall back to the set
// type's current fields.
export type ReadOnlyExerciseSet = Pick<
  PerformedSet,
  'id' | 'setType' | 'restSeconds' | 'fieldValues'
> & { fieldDefinitions?: PerformedSet['fieldDefinitions'] };

export type ReadOnlyExerciseSetTableProps = SetTypeContext & {
  readOnly: true;
  sets: ReadOnlyExerciseSet[];
  // Sets from a previous session to diff against. Matched by set type and
  // within-type order. When provided, each card shows a comparison hint like
  // "+1 reps, +2.5 kg".
  previousSets?: ReadOnlyExerciseSet[];
  // Which value slot to display: 'actual' (logged history, weights stored in kg
  // and converted to the user's unit) or 'target' (template plan, shown as-is,
  // ranges intact). Defaults to 'actual'.
  mode?: FieldValueMode;
};

export type ExerciseSetTableProps =
  | EditableExerciseSetTableProps
  | ReadOnlyExerciseSetTableProps;

export type SetCardRest = {
  value: number | null;
  readOnly: boolean;
  isRunning?: boolean;
  onChange: (value: number | null) => void;
};

export type SetCardModel = {
  key: string;
  index: number;
  setType: SetTypeId;
  setTypeLabel: string;
  setTypeIcon: string | null;
  setTypeColor: SetTypeColorName;
  fields: SetCardField[];
  rest: SetCardRest | null;
  progression?: SetCardProgression;
  progressionBadgeText?: string;
  progressionBadgeVariant?: 'default' | 'positive';
  tone: 'default' | 'completed';
  isDone?: boolean;
  isCurrent: boolean;
  /** Neither logged nor up next — recedes so the set you are on stands out.
   *  Only the live workout sets this; a template preview has no "next". */
  isUpcoming?: boolean;
  canRemove: boolean;
  readOnly: boolean;
  onSetTypeChange: (setType: SetTypeId) => void;
  onToggleDone?: () => boolean;
  onRemove: DeleteHandler;
};

function progressionModeLabelKey(
  setGoal: { kind?: string } | null | undefined,
  typeGoal: { kind?: string } | null | undefined,
): 'progression.modes.rangeRollover' | 'progression.modes.linear' {
  return (setGoal ?? typeGoal)?.kind === 'rangeRollover'
    ? 'progression.modes.rangeRollover'
    : 'progression.modes.linear';
}

function fieldsForType(
  context: SetTypeContext,
  setType: SetTypeId,
): SetTypeFieldDef[] {
  return context.setTypesById.get(setType)?.fields ?? [];
}

export function buildTemplateSetCards(
  t: TFunction,
  props: TemplateSetTableProps,
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
          mode: 'target',
          readOnly: false,
          weightUnit: props.weightUnit,
          t,
          onChange: next =>
            props.onChangeSet(index, { ...set, fieldValues: next }),
        }),
      ),
      rest: props.hideRest
        ? null
        : {
            value: set.restSeconds,
            readOnly: false,
            isRunning: false,
            onChange: value =>
              props.onChangeSet(index, { ...set, restSeconds: value }),
          },
      progression: buildSetCardProgression(set, type, progressionGoal =>
        props.onChangeSet(index, { ...set, progressionGoal }),
      ),
      tone: 'default',
      isCurrent: false,
      canRemove: !props.lockSetCount && props.sets.length > 1,
      readOnly: false,
      onSetTypeChange: setType =>
        props.onChangeSet(index, {
          ...set,
          setType,
          progressionGoal: undefined,
          fieldValues: reconcileValuesForType(
            set.fieldValues,
            fieldsForType(props, setType),
          ),
        }),
      onRemove: () => props.onRemoveSet(index),
    };
  });
}

/** Logged, up next, or still ahead — the three states a live set can be in. */
function cardState(set: CurrentWorkoutSet, isCurrent: boolean) {
  return {
    tone: set.isDone ? ('completed' as const) : ('default' as const),
    isDone: set.isDone,
    isCurrent,
    isUpcoming: !set.isDone && !isCurrent,
  };
}

export function buildWorkoutSetCards(
  t: TFunction,
  props: EditableExerciseSetTableProps,
): SetCardModel[] {
  // The set to log next: the first one not yet marked done, unless the caller
  // knows better (a superset alternates between exercises).
  const currentIndex =
    props.currentSetId === undefined
      ? props.sets.findIndex(set => !set.isDone)
      : props.sets.findIndex(set => set.id === props.currentSetId);
  const indexOffset = props.indexOffset ?? 0;
  return props.sets.map((set, index) => {
    const type = props.setTypesById.get(set.setType);
    const suggestion = props.suggestedSets?.[index];
    return {
      key: set.id,
      index: index + indexOffset,
      setType: set.setType,
      setTypeLabel: type?.name ?? set.setType,
      setTypeIcon: type?.icon ?? null,
      setTypeColor: type?.color ?? 'terracotta',
      fields: (type?.fields ?? []).map(field =>
        buildCardField(field, set.fieldValues, {
          mode: 'actual',
          readOnly: false,
          weightUnit: props.weightUnit,
          t,
          suggestion,
          onChange: next => props.onChangeSet(set.id, { fieldValues: next }),
        }),
      ),
      rest: {
        value: set.restSeconds,
        readOnly: false,
        isRunning: props.activeRestSetId === set.id,
        onChange: value => props.onChangeSet(set.id, { restSeconds: value }),
      },
      progression: buildSetCardProgression(set, type, progressionGoal =>
        props.onChangeSet(set.id, { progressionGoal }),
      ),
      progressionBadgeText: suggestion
        ? t(
            suggestion.isLastPerformanceOnly
              ? 'progression.modes.none'
              : progressionModeLabelKey(
                  set.progressionGoal,
                  type?.progressionGoal,
                ),
          )
        : undefined,
      ...cardState(set, index === currentIndex),
      canRemove: props.canRemoveSets ?? props.sets.length > 1,
      readOnly: false,
      onSetTypeChange: setType =>
        props.onChangeSet(set.id, {
          setType,
          fieldValues: reconcileValuesForType(
            set.fieldValues,
            fieldsForType(props, setType),
          ),
        }),
      // Commit whatever the card is showing as placeholders before completing,
      // in ONE write: each field's own `onChange` closes over the same
      // pre-edit `fieldValues`, so filling two fields separately would have the
      // second clobber the first. The store reads fresh state, so the toggle
      // that follows validates against the filled set.
      onToggleDone: () => {
        if (!set.isDone) {
          const filled = fillEmptyFieldsFromSuggestion(
            type?.fields ?? [],
            set.fieldValues,
            suggestion,
            props.weightUnit,
          );
          if (filled !== set.fieldValues) {
            props.onChangeSet(set.id, { fieldValues: filled });
          }
        }
        return props.onToggleSetDone(set.id);
      },
      onRemove: () => props.onRemoveSet(set),
    };
  });
}

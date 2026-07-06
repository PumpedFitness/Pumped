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
} from '@/components/clay/SwipeToDelete';
import type { SuggestedSetValues } from './exerciseSetSuggestion';
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
  onAddSet: () => void;
  // Whether set cards animate their layout (slide) when sets are added/removed.
  // Off in the active workout, where activation re-renders during the snap
  // scroll make the cards fly in oddly. Defaults to on. */
  animateLayout?: boolean;
};

export type TemplateSetTableProps = BaseTableProps & {
  sets: EditableExerciseSet[];
  onChangeSet: (index: number, set: EditableExerciseSet) => void;
  onRemoveSet: (index: number) => void;
  onDuplicateSet: () => void;
  onCreateSetType?: (name: string) => string;
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
};

export type ReadOnlyExerciseSet = Pick<
  PerformedSet,
  'id' | 'setType' | 'restSeconds' | 'fieldValues'
> & {
  // Snapshot of the set type's fields as they were when the set was performed.
  // Present for history ('actual' mode); template previews ('target') have none
  // and fall back to the set type's current fields.
  fieldDefinitions?: PerformedSet['fieldDefinitions'];
};

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
      rest: {
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
      canRemove: props.sets.length > 1,
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

export function buildWorkoutSetCards(
  t: TFunction,
  props: EditableExerciseSetTableProps,
): SetCardModel[] {
  // The set to log next: the first one not yet marked done.
  const currentIndex = props.sets.findIndex(set => !set.isDone);
  return props.sets.map((set, index) => {
    const type = props.setTypesById.get(set.setType);
    const suggestion = props.suggestedSets?.[index];
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
      tone: set.isDone ? 'completed' : 'default',
      isDone: set.isDone,
      isCurrent: index === currentIndex,
      canRemove: props.sets.length > 1,
      readOnly: false,
      onSetTypeChange: setType =>
        props.onChangeSet(set.id, {
          setType,
          fieldValues: reconcileValuesForType(
            set.fieldValues,
            fieldsForType(props, setType),
          ),
        }),
      onToggleDone: () => props.onToggleSetDone(set.id),
      onRemove: () => props.onRemoveSet(set),
    };
  });
}

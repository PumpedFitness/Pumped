import { Fragment, memo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import * as Haptics from 'expo-haptics';
import { colors } from '@/theme/tokens';
import { SwipeTo, type SwipeAction } from '@/components/clay/SwipeTo';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { SetFieldCell } from './SetFieldCell';
import { setTypeColorTokens } from './setTypeColors';
import { useSetSheetOpeners } from './SetSheets';
import type {
  SetCardField,
  SetCardModel,
  SetCardNumberField,
  SetCardRangeField,
} from './exerciseSetTableModel';

type SetCardProps = {
  card: SetCardModel;
};

type SetCardHeaderProps = {
  card: SetCardModel;
  onOpenSetTypePicker: () => void;
  onOpenProgressionPicker: () => void;
  onToggleDone: () => void;
};

type ProgressionPillsProps = {
  card: SetCardModel;
  onOpenProgressionPicker: () => void;
};

type SetCardProgressionSlotProps = {
  card: SetCardModel;
  onOpenProgressionPicker: () => void;
};

type SetCardActionsProps = {
  card: SetCardModel;
  onToggleDone: () => void;
};

function ProgressionPills({
  card,
  onOpenProgressionPicker,
}: ProgressionPillsProps) {
  const { t } = useTranslation();
  const progression = card.progression;

  if (!progression) {
    return null;
  }
  const goal = progression.goal;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={progression.readOnly}
      className="h-8 min-w-0 max-w-[42%] flex-row items-center gap-1.5 rounded-full bg-surface-sunk px-2.5 active:bg-surface-card"
      onPress={progression.readOnly ? undefined : onOpenProgressionPicker}
    >
      <Text
        className="min-w-0 shrink text-[11px] font-bold text-muted"
        numberOfLines={1}
      >
        {t(`progression.summary.${goal.kind}`)}
      </Text>
      {!progression.readOnly ? (
        <ClayIcon name="chevronDown" size={11} color={colors.muted} />
      ) : null}
    </Pressable>
  );
}

function SetCardProgressionSlot({
  card,
  onOpenProgressionPicker,
}: SetCardProgressionSlotProps) {
  if (card.progression) {
    return (
      <ProgressionPills
        card={card}
        onOpenProgressionPicker={onOpenProgressionPicker}
      />
    );
  }
  if (!card.progressionBadgeText) {
    return null;
  }

  const isPositive = card.progressionBadgeVariant === 'positive';
  return (
    <View
      className={`min-w-0 shrink rounded-full px-2.5 py-1 ${
        isPositive ? 'bg-sage/25' : 'bg-surface-sunk'
      }`}
    >
      <Text
        className={`text-[10px] font-bold ${
          isPositive ? 'text-moss' : 'text-muted'
        }`}
        numberOfLines={1}
      >
        {card.progressionBadgeText}
      </Text>
    </View>
  );
}

function SetCardCompletionToggle({ card, onToggleDone }: SetCardActionsProps) {
  const { t } = useTranslation();
  if (!card.onToggleDone) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: card.isDone }}
      accessibilityLabel={
        card.isDone
          ? t('setTable.a11y.markSetIncomplete', {
              number: card.index + 1,
            })
          : t('setTable.a11y.markSetComplete', {
              number: card.index + 1,
            })
      }
      className="h-8 w-8 items-center justify-center rounded-full active:bg-surface-sunk"
      onPress={onToggleDone}
    >
      <View
        className={`h-7 w-7 items-center justify-center rounded-full ${
          card.isDone ? 'bg-moss' : 'border-2 border-border-soft bg-background'
        }`}
      >
        {card.isDone && (
          <ClayIcon name="check" size={15} color={colors.cream} />
        )}
      </View>
    </Pressable>
  );
}

function SetCardActions({ card, onToggleDone }: SetCardActionsProps) {
  return (
    <View className="shrink-0 flex-row items-center gap-2">
      <SetCardCompletionToggle card={card} onToggleDone={onToggleDone} />
    </View>
  );
}

function SetCardHeader({
  card,
  onOpenSetTypePicker,
  onOpenProgressionPicker,
  onToggleDone,
}: SetCardHeaderProps) {
  const { t } = useTranslation();
  const tone = setTypeColorTokens(card.setTypeColor);

  return (
    <View className="flex-row items-center gap-2">
      <View
        className="h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: card.isCurrent ? colors.ink : colors.cardSunk,
        }}
      >
        <Text
          className="text-[12px] font-bold tabular-nums"
          style={{ color: card.isCurrent ? colors.cream : colors.muted }}
        >
          {card.index + 1}
        </Text>
      </View>

      <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
        <Pressable
          accessibilityRole={card.readOnly ? undefined : 'button'}
          accessibilityLabel={t('setTable.a11y.setType', {
            number: card.index + 1,
          })}
          disabled={card.readOnly}
          className="min-w-0 max-w-[58%] flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ backgroundColor: tone.soft }}
          onPress={card.readOnly ? undefined : onOpenSetTypePicker}
        >
          <ClayIcon
            name={card.setTypeIcon ?? 'target'}
            size={14}
            color={tone.fg}
          />
          <Text
            className="min-w-0 shrink text-[13px] font-bold"
            style={{ color: tone.fg }}
            numberOfLines={1}
          >
            {card.setTypeLabel}
          </Text>
          {!card.readOnly && (
            <ClayIcon name="chevronDown" size={12} color={tone.fg} />
          )}
        </Pressable>

        <SetCardProgressionSlot
          card={card}
          onOpenProgressionPicker={onOpenProgressionPicker}
        />
      </View>

      <SetCardActions card={card} onToggleDone={onToggleDone} />
    </View>
  );
}

type SetCardFieldsProps = {
  cells: SetCardField[];
  showValidation: boolean;
  showRequired: boolean;
  onOpenWheel: (field: SetCardNumberField) => void;
  onOpenRange: (field: SetCardRangeField) => void;
};

type SetCardFieldRow = {
  key: string;
  cells: SetCardField[];
};

function buildFieldRows(cells: SetCardField[]): SetCardFieldRow[] {
  const rows: SetCardFieldRow[] = [];
  let inlineCells: SetCardField[] = [];
  const orderedCells = [
    ...cells.filter(cell => cell.layout === 'inline'),
    ...cells.filter(cell => cell.layout === 'fullWidth'),
  ];

  const flushInlineRow = () => {
    if (inlineCells.length === 0) {
      return;
    }
    rows.push({
      key: inlineCells.map(field => field.id).join(':'),
      cells: inlineCells,
    });
    inlineCells = [];
  };

  for (const cell of orderedCells) {
    if (cell.layout === 'fullWidth') {
      flushInlineRow();
      rows.push({ key: cell.id, cells: [cell] });
      continue;
    }
    inlineCells.push(cell);
  }

  flushInlineRow();
  return rows;
}

function SetCardFields({
  cells,
  showValidation,
  showRequired,
  onOpenWheel,
  onOpenRange,
}: SetCardFieldsProps) {
  if (cells.length === 0) {
    return null;
  }
  const rows = buildFieldRows(cells);
  return (
    <View className="gap-2">
      {rows.map(row => (
        <View
          key={row.key}
          className="flex-row overflow-hidden rounded-[14px] bg-surface-sunk"
        >
          {row.cells.map((field, index) => (
            <Fragment key={field.id}>
              {index > 0 ? (
                <View className="my-2.5 w-px bg-border-soft" />
              ) : null}
              <SetFieldCell
                field={field}
                hasError={showValidation && field.isValid === false}
                showRequired={showRequired}
                onOpenWheel={onOpenWheel}
                onOpenRange={onOpenRange}
              />
            </Fragment>
          ))}
        </View>
      ))}
    </View>
  );
}

// Best-effort error haptic when a set can't be completed (missing inputs).
function fireErrorHaptic() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
      () => {},
    );
  } catch {
    // expo-haptics native module unavailable until the app is rebuilt.
  }
}

// Left swipe (drag right) finishes the set; right swipe (drag left) deletes it.
// Finish is non-destructive: the action returns false so the row springs back
// and re-renders in the new done state instead of sliding away.
function buildSwipeActions(
  card: SetCardModel,
  t: TFunction,
  onFinish: () => void,
): { left?: SwipeAction; right?: SwipeAction } {
  const left: SwipeAction | undefined = card.onToggleDone
    ? {
        action: () => {
          onFinish();
          return false;
        },
        color: card.isDone ? 'warning' : 'moss',
        icon: card.isDone ? 'x' : 'check',
        subtitle: card.isDone
          ? t('setTable.swipeUndo')
          : t('setTable.swipeFinish'),
      }
    : undefined;
  const right: SwipeAction | undefined =
    card.canRemove && !card.readOnly
      ? {
          action: card.onRemove,
          color: 'danger',
          icon: 'trash',
          subtitle: t('common.delete'),
        }
      : undefined;
  return { left, right };
}

// Memoized: with a stable `card` (and the stable open-handlers from the table
// host) an edit to one set re-renders only that set's card, not its siblings.
export const SetCard = memo(function SetCard({ card }: SetCardProps) {
  const { t } = useTranslation();
  const { openSetTypePicker, openProgressionPicker, openWheel, openRange } =
    useSetSheetOpeners();
  const [showValidation, setShowValidation] = useState(false);

  const restField: SetCardField | null = card.rest
    ? {
        kind: 'number',
        id: '__rest__',
        label: t('setTable.columns.rest'),
        layout: 'inline',
        unit: 's',
        value: card.rest.value,
        input: 'keyboard',
        allowDecimal: false,
        readOnly: card.rest.readOnly,
        isValid: true,
        required: false,
        onChange: card.rest.onChange,
      }
    : null;
  const cells = restField ? [...card.fields, restField] : card.fields;

  const attemptDone = () => {
    if (!card.onToggleDone) {
      return;
    }
    const ok = card.onToggleDone();
    setShowValidation(!ok);
    if (!ok) {
      fireErrorHaptic();
    }
  };

  const { left: finishAction, right: removeAction } = buildSwipeActions(
    card,
    t,
    attemptDone,
  );

  const containerClass = card.isDone
    ? 'border border-moss bg-sage/15'
    : card.isCurrent
    ? 'border-2 border-accent bg-surface-card'
    : 'border border-border-soft bg-surface-card';

  const content = (
    <View className={`gap-3 rounded-[20px] p-3 ${containerClass}`}>
      <SetCardHeader
        card={card}
        onOpenSetTypePicker={() => openSetTypePicker(card)}
        onOpenProgressionPicker={() => openProgressionPicker(card)}
        onToggleDone={attemptDone}
      />
      <SetCardFields
        cells={cells}
        showValidation={showValidation}
        showRequired={card.onToggleDone != null}
        onOpenWheel={openWheel}
        onOpenRange={openRange}
      />
    </View>
  );

  if (finishAction || removeAction) {
    return (
      <SwipeTo left={finishAction} right={removeAction} borderRadius={20}>
        {content}
      </SwipeTo>
    );
  }
  return content;
});

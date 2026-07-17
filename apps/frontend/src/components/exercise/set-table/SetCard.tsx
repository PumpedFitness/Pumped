import { Fragment, memo, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import * as Haptics from 'expo-haptics';
import { SwipeTo, type SwipeAction } from '@/components/clay/SwipeTo';
import { SetCardHeader } from './SetCardHeader';
import { SetFieldCell } from './SetFieldCell';
import { useSetSheetOpeners } from './SetSheets';
import type {
  SetCardField,
  SetCardModel,
  SetCardNumberField,
  SetCardRangeField,
} from './exerciseSetTableModel';

type SetCardProps = {
  card: SetCardModel;
  iconOnlySetType?: boolean;
};

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
export const SetCard = memo(function SetCard({
  card,
  iconOnlySetType = false,
}: SetCardProps) {
  const { t } = useTranslation();
  const {
    openSetTypePicker,
    openProgressionPicker,
    openWheel,
    openRange,
    openRestPicker,
  } = useSetSheetOpeners();
  const [showValidation, setShowValidation] = useState(false);

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
        iconOnlySetType={iconOnlySetType}
        onOpenSetTypePicker={() => openSetTypePicker(card)}
        onOpenProgressionPicker={() => openProgressionPicker(card)}
        onOpenRestPicker={() => {
          if (card.rest) {
            openRestPicker(card.rest);
          }
        }}
        onToggleDone={attemptDone}
      />
      <SetCardFields
        cells={card.fields}
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

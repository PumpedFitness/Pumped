import { Fragment, memo, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import * as Haptics from 'expo-haptics';
import { SwipeTo, type SwipeAction } from '@pumped/ui/clay/SwipeTo';
import { SetCardHeader, SetCardIdentity } from './SetCardHeader';
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
};

type SetCardFieldsProps = {
  cells: SetCardField[];
  leading: ReactNode;
  trailing?: ReactNode;
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
  leading,
  trailing,
  showValidation,
  showRequired,
  onOpenWheel,
  onOpenRange,
}: SetCardFieldsProps) {
  const rows = buildFieldRows(cells);

  if (rows.length === 0) {
    return (
      <View className="min-h-14 flex-row overflow-hidden">
        {leading}
        {trailing ? (
          <>
            <View className="my-2.5 w-px bg-border-soft" />
            {trailing}
          </>
        ) : null}
      </View>
    );
  }

  return (
    <View className="gap-2">
      {rows.map((row, rowIndex) => (
        <View key={row.key} className="flex-row overflow-hidden">
          {rowIndex === 0 ? (
            <>
              {leading}
              <View className="my-2.5 w-px bg-border-soft" />
            </>
          ) : null}
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
          {rowIndex === 0 && trailing ? (
            <>
              <View className="my-2.5 w-px bg-border-soft" />
              {trailing}
            </>
          ) : null}
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

// Sets you have not reached yet sit back so the one you are on carries the eye.
// Kept legible rather than truly disabled — they are still editable, and inside
// a block you are not on this dim compounds with the block's own.
const UPCOMING = { opacity: 0.72 };

// Memoized: with a stable `card` (and the stable open-handlers from the table
// host) an edit to one set re-renders only that set's card, not its siblings.
export const SetCard = memo(function SetCard({ card }: SetCardProps) {
  const { t } = useTranslation();
  const { openSetTypePicker, openWheel, openRange } = useSetSheetOpeners();
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
  const isStateBand = card.isDone || card.isCurrent;
  const extendsThroughTrailingGutter = isStateBand || removeAction != null;
  const containerClass = card.isDone
    ? 'border-l-2 border-l-moss bg-sage/15'
    : card.isCurrent
    ? 'border-l-2 border-l-accent bg-accent-soft'
    : 'border-l-2 border-l-transparent';

  const content = (
    <View
      className={`w-full border-b border-border-soft bg-background py-1 ${
        extendsThroughTrailingGutter ? 'pr-4' : ''
      } ${containerClass}`}
      style={card.isUpcoming ? UPCOMING : undefined}
    >
      <SetCardFields
        cells={card.fields}
        leading={
          <SetCardIdentity
            card={card}
            onOpenSetTypePicker={() => openSetTypePicker(card)}
          />
        }
        trailing={
          card.progressionBadgeText || card.onToggleDone ? (
            <SetCardHeader card={card} onToggleDone={attemptDone} />
          ) : undefined
        }
        showValidation={showValidation}
        showRequired={card.onToggleDone != null}
        onOpenWheel={openWheel}
        onOpenRange={openRange}
      />
    </View>
  );

  if (finishAction || removeAction) {
    const swipeable = (
      <SwipeTo left={finishAction} right={removeAction} borderRadius={0}>
        {content}
      </SwipeTo>
    );

    // The live workout body has horizontal padding so ordinary rows align with
    // the exercise content. State bands and a revealed delete action carry
    // through the trailing gutter, while their controls retain an inset.
    return extendsThroughTrailingGutter ? (
      <View className="-mr-4">{swipeable}</View>
    ) : (
      swipeable
    );
  }
  return content;
});

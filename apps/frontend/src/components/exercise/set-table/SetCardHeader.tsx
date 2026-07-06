import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { EditableNumberInput } from './ExerciseSetTableCells';
import {
  formatSetNumber,
  type SetCardModel,
  type SetCardRest,
} from './exerciseSetTableModel';
import { setTypeColorTokens } from './setTypeColors';

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

type RestTimerSlotProps = {
  rest: SetCardRest | null;
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

function RestTimerSlot({ rest }: RestTimerSlotProps) {
  const { t } = useTranslation();
  if (!rest) {
    return null;
  }
  const active = rest.isRunning === true;
  const valueClass = active ? 'text-accent' : 'text-muted';
  const borderClass = active
    ? 'border-accent bg-accent-soft'
    : 'border-border-soft bg-background';
  const iconColor = active ? colors.accent : colors.muted;

  return (
    <View
      className={`h-10 w-[76px] shrink-0 flex-row items-center overflow-hidden rounded-[12px] border ${borderClass}`}
    >
      <View className="h-full w-8 items-center justify-center bg-surface-sunk">
        <ClayIcon name="rest" size={13} color={iconColor} />
        {active ? (
          <View className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
        ) : null}
      </View>
      <View className="flex-row items-baseline px-1.5">
        {rest.readOnly ? (
          <Text
            accessibilityLabel={`${t('setTable.columns.rest')}: ${
              rest.value ?? '-'
            }`}
            className={`w-7 text-[13px] font-black leading-[17px] tabular-nums ${valueClass}`}
            numberOfLines={1}
            style={{ includeFontPadding: false }}
          >
            {formatSetNumber(rest.value) || '–'}
          </Text>
        ) : (
          <EditableNumberInput
            accessibilityLabel={t('setTable.columns.rest')}
            value={rest.value}
            allowDecimal={false}
            inputClassName={`w-7 p-0 text-[13px] font-black leading-[17px] tabular-nums ${valueClass}`}
            onChange={rest.onChange}
          />
        )}
        <Text
          className={`ml-0.5 text-[11px] font-bold leading-[14px] ${valueClass}`}
          style={{ includeFontPadding: false }}
        >
          s
        </Text>
      </View>
    </View>
  );
}

export function SetCardHeader({
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

      <RestTimerSlot rest={card.rest} />

      <SetCardActions card={card} onToggleDone={onToggleDone} />
    </View>
  );
}

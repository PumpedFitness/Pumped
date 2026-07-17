import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import type { SetCardModel, SetCardRest } from './exerciseSetTableModel';
import { setTypeColorTokens } from './setTypeColors';

type SetCardHeaderProps = {
  card: SetCardModel;
  iconOnlySetType: boolean;
  onOpenSetTypePicker: () => void;
  onOpenProgressionPicker: () => void;
  onOpenRestPicker: () => void;
  onToggleDone: () => void;
};

type ProgressionPillsProps = {
  card: SetCardModel;
  iconOnlySetType: boolean;
  onOpenProgressionPicker: () => void;
};

type SetCardProgressionSlotProps = {
  card: SetCardModel;
  iconOnlySetType: boolean;
  onOpenProgressionPicker: () => void;
};

type SetCardActionsProps = {
  card: SetCardModel;
  onToggleDone: () => void;
};

type RestTimerSlotProps = {
  rest: SetCardRest | null;
  onOpenRestPicker: () => void;
};

function formatRestValue(value: number | null): string {
  if (value == null) {
    return '–';
  }
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
    : `${seconds}s`;
}

function ProgressionPills({
  card,
  iconOnlySetType,
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
      className={`h-8 min-w-0 flex-row items-center gap-1 rounded-full bg-surface-sunk px-2 active:bg-surface-card ${
        iconOnlySetType ? 'max-w-[72%]' : 'max-w-[42%]'
      }`}
      onPress={progression.readOnly ? undefined : onOpenProgressionPicker}
    >
      <ClayIcon name="trend" size={12} color={colors.muted} />
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
  iconOnlySetType,
  onOpenProgressionPicker,
}: SetCardProgressionSlotProps) {
  if (card.progression) {
    return (
      <ProgressionPills
        card={card}
        iconOnlySetType={iconOnlySetType}
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

function RestTimerSlot({ rest, onOpenRestPicker }: RestTimerSlotProps) {
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
  const hasValue = rest.value != null;

  return (
    <Pressable
      accessibilityRole={rest.readOnly ? undefined : 'button'}
      accessibilityLabel={t('setTable.columns.rest')}
      disabled={rest.readOnly}
      className={`h-11 shrink-0 items-center overflow-hidden rounded-[14px] border ${borderClass} ${
        hasValue ? 'w-[88px] flex-row' : 'w-11 justify-center'
      }`}
      onPress={rest.readOnly ? undefined : onOpenRestPicker}
    >
      <View
        className={`h-full items-center justify-center bg-surface-sunk ${
          hasValue ? 'w-8' : 'w-full'
        }`}
      >
        <ClayIcon name="rest" size={14} color={iconColor} />
        {active ? (
          <View className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
        ) : null}
      </View>
      {hasValue ? (
        <View className="flex-1 flex-row items-baseline justify-center px-2">
          <Text
            className={`text-[13px] font-black leading-[17px] tabular-nums ${valueClass}`}
            numberOfLines={rest.readOnly ? 1 : undefined}
            style={{ includeFontPadding: false }}
          >
            {formatRestValue(rest.value)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function SetCardHeader({
  card,
  iconOnlySetType,
  onOpenSetTypePicker,
  onOpenProgressionPicker,
  onOpenRestPicker,
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
          className={
            iconOnlySetType
              ? 'h-9 w-9 items-center justify-center rounded-full'
              : 'min-w-0 max-w-[58%] flex-row items-center gap-1.5 rounded-full px-3 py-1.5'
          }
          style={{ backgroundColor: tone.soft }}
          onPress={card.readOnly ? undefined : onOpenSetTypePicker}
        >
          <ClayIcon
            name={card.setTypeIcon ?? 'target'}
            size={iconOnlySetType ? 16 : 14}
            color={tone.fg}
          />
          {!iconOnlySetType ? (
            <Text
              className="min-w-0 shrink text-[13px] font-bold"
              style={{ color: tone.fg }}
              numberOfLines={1}
            >
              {card.setTypeLabel}
            </Text>
          ) : null}
          {!iconOnlySetType && !card.readOnly && (
            <ClayIcon name="chevronDown" size={12} color={tone.fg} />
          )}
        </Pressable>

        <SetCardProgressionSlot
          card={card}
          iconOnlySetType={iconOnlySetType}
          onOpenProgressionPicker={onOpenProgressionPicker}
        />
      </View>

      <RestTimerSlot rest={card.rest} onOpenRestPicker={onOpenRestPicker} />

      <SetCardActions card={card} onToggleDone={onToggleDone} />
    </View>
  );
}

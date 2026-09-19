import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@pumped/ui/theme/tokens';
import { ClayIcon, isIconName } from '@pumped/ui/icons/ClayIcon';
import type { SetCardModel } from './exerciseSetTableModel';
import { setTypeColorTokens } from './setTypeColors';

type SetCardHeaderProps = {
  card: SetCardModel;
  onToggleDone: () => void;
};

type SetCardIdentityProps = {
  card: SetCardModel;
  onOpenSetTypePicker: () => void;
};

type SetCardProgressionSlotProps = {
  card: SetCardModel;
};

type SetCardActionsProps = {
  card: SetCardModel;
  onToggleDone: () => void;
};

function SetCardProgressionSlot({ card }: SetCardProgressionSlotProps) {
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

export function SetCardIdentity({
  card,
  onOpenSetTypePicker,
}: SetCardIdentityProps) {
  const { t } = useTranslation();
  const tone = setTypeColorTokens(card.setTypeColor);

  return (
    <View className="w-11 shrink-0 items-center justify-center">
      <Pressable
        accessibilityRole={card.readOnly ? undefined : 'button'}
        accessibilityLabel={t('setTable.a11y.setType', {
          number: card.index + 1,
        })}
        disabled={card.readOnly}
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: tone.soft }}
        onPress={card.readOnly ? undefined : onOpenSetTypePicker}
      >
        <ClayIcon
          name={isIconName(card.setTypeIcon) ? card.setTypeIcon : 'target'}
          size={15}
          color={tone.fg}
        />
      </Pressable>
    </View>
  );
}

export function SetCardHeader({ card, onToggleDone }: SetCardHeaderProps) {
  if (!card.progressionBadgeText && !card.onToggleDone) {
    return null;
  }

  return (
    <View className="shrink-0 flex-row items-center gap-2 pl-2">
      <SetCardProgressionSlot card={card} />
      <SetCardActions card={card} onToggleDone={onToggleDone} />
    </View>
  );
}

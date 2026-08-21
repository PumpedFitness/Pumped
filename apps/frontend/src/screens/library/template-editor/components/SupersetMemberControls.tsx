import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@pumped/ui/theme/tokens';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';

const DOWN_TRANSFORM = { transform: [{ rotate: '180deg' }] };

type SupersetMemberControlsProps = {
  name: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

type MoveButtonProps = {
  direction: 'up' | 'down';
  disabled: boolean;
  accessibilityLabel: string;
  testID: string;
  onPress: () => void;
};

function MoveButton({
  direction,
  disabled,
  accessibilityLabel,
  testID,
  onPress,
}: MoveButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      testID={testID}
      disabled={disabled}
      hitSlop={6}
      className="h-9 w-8 items-center justify-center rounded-full active:bg-surface-sunk"
      onPress={onPress}
      style={{ opacity: disabled ? 0.3 : 1 }}
    >
      {/* Arrows, not chevrons: the fold control sitting right beside these is a
          chevron, and two of the same glyph next to each other read as one
          repeated control rather than two different ones. */}
      <View style={direction === 'down' ? DOWN_TRANSFORM : undefined}>
        <ClayIcon name="arrowUp" size={16} color={colors.muted} />
      </View>
    </Pressable>
  );
}

/**
 * Order within a superset decides the alternation, so members need to be
 * movable — but a second drag list nested inside the block's own drag list
 * fights for the same gesture. Two buttons that can only move a member inside
 * its group keep the group contiguous by construction.
 */
export function SupersetMemberControls({
  name,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: SupersetMemberControlsProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center">
      <MoveButton
        direction="up"
        disabled={!canMoveUp}
        testID="superset_member_up"
        accessibilityLabel={t('templateEditor.superset.moveUpA11y', { name })}
        onPress={onMoveUp}
      />
      <MoveButton
        direction="down"
        disabled={!canMoveDown}
        testID="superset_member_down"
        accessibilityLabel={t('templateEditor.superset.moveDownA11y', { name })}
        onPress={onMoveDown}
      />
    </View>
  );
}

import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@pumped/ui/theme/tokens';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';

type SupersetCardHeaderProps = {
  rounds: number;
  memberCount: number;
  dragHandle?: ReactNode;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onChangeRounds: (rounds: number) => void;
};

const FLIP = { transform: [{ rotate: '180deg' }] };

const MIN_ROUNDS = 1;
const MAX_ROUNDS = 20;

type StepperButtonProps = {
  icon: 'plus' | 'minus';
  disabled: boolean;
  accessibilityLabel: string;
  testID: string;
  onPress: () => void;
};

function StepperButton({
  icon,
  disabled,
  accessibilityLabel,
  testID,
  onPress,
}: StepperButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      testID={testID}
      disabled={disabled}
      className="h-9 w-9 items-center justify-center rounded-full bg-surface-card active:bg-surface-sunk"
      onPress={onPress}
      style={{ opacity: disabled ? 0.35 : 1 }}
    >
      <ClayIcon name={icon} size={15} color={colors.accent} />
    </Pressable>
  );
}

export function SupersetCardHeader({
  rounds,
  memberCount,
  dragHandle,
  isCollapsed,
  onToggleCollapsed,
  onChangeRounds,
}: SupersetCardHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      {/* Fold toggle then drag handle, in that order and on the right — the
          same trailing pair a standalone exercise card shows. */}
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <Text className="t-eyebrow text-accent">
            {t('templateEditor.superset.eyebrow')}
          </Text>
          <Text className="t-caption mt-0.5">
            {t('templateEditor.superset.summary', {
              count: memberCount,
              rounds,
            })}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: !isCollapsed }}
          accessibilityLabel={t(
            isCollapsed
              ? 'templateEditor.superset.expandA11y'
              : 'templateEditor.superset.collapseA11y',
          )}
          testID="toggle_superset_collapsed"
          hitSlop={8}
          className="h-9 w-8 items-center justify-center rounded-full active:bg-surface-sunk"
          onPress={onToggleCollapsed}
        >
          <View style={isCollapsed ? undefined : FLIP}>
            <ClayIcon name="chevronDown" size={17} color={colors.muted} />
          </View>
        </Pressable>
        {dragHandle}
      </View>

      {isCollapsed ? null : (
        <View className="flex-row items-center justify-between rounded-[16px] bg-surface-card px-4 py-2.5">
          <Text className="t-label">
            {t('templateEditor.superset.rounds', { count: rounds })}
          </Text>
          <View className="flex-row items-center gap-2">
            <StepperButton
              icon="minus"
              disabled={rounds <= MIN_ROUNDS}
              testID="superset_rounds_down"
              accessibilityLabel={t('templateEditor.superset.fewerRoundsA11y')}
              onPress={() => onChangeRounds(rounds - 1)}
            />
            <Text className="t-heading w-7 text-center tabular-nums">
              {rounds}
            </Text>
            <StepperButton
              icon="plus"
              disabled={rounds >= MAX_ROUNDS}
              testID="superset_rounds_up"
              accessibilityLabel={t('templateEditor.superset.moreRoundsA11y')}
              onPress={() => onChangeRounds(rounds + 1)}
            />
          </View>
        </View>
      )}
    </View>
  );
}

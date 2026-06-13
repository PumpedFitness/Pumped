import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';

type ExerciseRowCardProps = {
  name: string;
  metadata: string;
  onPress: () => void;
  /**
   * When provided the card renders as a checkbox row (selection variant);
   * when omitted it renders as a plain button row (library variant).
   */
  selected?: boolean;
  trailing?: ReactNode;
  pressedClassName?: string;
};

export function ExerciseRowCard({
  name,
  metadata,
  onPress,
  selected,
  trailing,
  pressedClassName,
}: ExerciseRowCardProps) {
  const isSelectable = selected !== undefined;

  return (
    <Pressable
      accessibilityRole={isSelectable ? 'checkbox' : 'button'}
      accessibilityState={isSelectable ? { checked: selected } : undefined}
      className={`min-h-20 flex-row items-center gap-3 rounded-[20px] border p-4 ${
        selected
          ? 'border-accent bg-accent-soft'
          : 'border-border-hairline bg-surface-card'
      }${pressedClassName ? ` ${pressedClassName}` : ''}`}
      onPress={onPress}
    >
      <View
        className={`h-11 w-11 items-center justify-center rounded-[14px] ${
          selected ? 'bg-accent' : 'bg-surface-sunk'
        }`}
      >
        <ClayIcon
          name={selected ? 'check' : 'dumbbell'}
          size={21}
          color={selected ? colors.accentInk : colors.ink2}
          stroke={selected ? 2.4 : 1.75}
        />
      </View>

      <View className="flex-1">
        <Text className="t-heading">{name}</Text>
        {metadata ? (
          <Text className="t-caption mt-1" numberOfLines={2}>
            {metadata}
          </Text>
        ) : null}
      </View>

      {trailing}
    </Pressable>
  );
}

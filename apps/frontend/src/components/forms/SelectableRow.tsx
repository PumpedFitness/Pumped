import { Pressable, Text, type AccessibilityRole } from 'react-native';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';

type SelectableRowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  className?: string;
  accessibilityRole?: AccessibilityRole;
};

export function SelectableRow({
  label,
  selected,
  onPress,
  className,
  accessibilityRole = 'button',
}: SelectableRowProps) {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityState={{ selected }}
      className={`flex-row items-center justify-between px-4 ${
        selected ? 'bg-accent-soft' : 'bg-surface-card'
      }${className ? ` ${className}` : ''}`}
      onPress={onPress}
    >
      <Text
        className={`t-label ${selected ? 'text-accent' : 'text-foreground'}`}
      >
        {label}
      </Text>
      {selected && <ClayIcon name="check" size={18} color={colors.accent} />}
    </Pressable>
  );
}

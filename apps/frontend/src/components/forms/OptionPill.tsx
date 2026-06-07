import type { AccessibilityRole } from 'react-native';
import { Pressable, Text } from 'react-native';

type OptionPillProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: Extract<AccessibilityRole, 'button' | 'radio'>;
  selectedTone?: 'accent' | 'moss';
};

const SELECTED_CLASSES = {
  accent: {
    container: 'border-accent bg-accent',
    text: 'text-accent-foreground',
  },
  moss: {
    container: 'border-moss bg-moss',
    text: 'text-cream',
  },
} as const;

export function OptionPill({
  label,
  selected,
  onPress,
  accessibilityLabel,
  accessibilityRole = 'radio',
  selectedTone = 'accent',
}: OptionPillProps) {
  const selectedClasses = SELECTED_CLASSES[selectedTone];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ selected }}
      className={`min-h-11 items-center justify-center rounded-full border px-4 ${
        selected
          ? selectedClasses.container
          : 'border-border-hairline bg-surface-card'
      }`}
      onPress={onPress}
    >
      <Text
        className={`t-label ${
          selected ? selectedClasses.text : 'text-foreground-secondary'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

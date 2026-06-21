import { Pressable, View } from 'react-native';
import { colors } from '@/theme/tokens';
import { ClayIcon, type IconName } from '@/components/icons/ClayIcon';

// Curated subset of ClayIcons that read well as set-type glyphs.
const SET_TYPE_ICONS: IconName[] = [
  'dumbbell',
  'flame',
  'bolt',
  'target',
  'trend',
  'award',
  'star',
  'pulse',
  'clock',
  'rest',
  'play',
  'skip',
  'swap',
  'scale',
  'percent',
  'ruler',
];

type IconPickerProps = {
  value: IconName | null;
  onChange: (icon: IconName) => void;
};

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {SET_TYPE_ICONS.map(name => {
        const selected = name === value;
        return (
          <Pressable
            key={name}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={name}
            className={`h-11 w-11 items-center justify-center rounded-full border ${
              selected
                ? 'border-accent bg-accent-soft'
                : 'border-border-soft bg-surface-card'
            }`}
            onPress={() => onChange(name)}
          >
            <ClayIcon
              name={name}
              size={18}
              color={selected ? colors.accent : colors.ink2}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

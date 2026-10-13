import { Pressable, View } from 'react-native';
import { colors } from '@pumped/ui/theme/tokens';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';

export type ColorSwatchOption<T extends string> = {
  value: T;
  label: string;
  color: string;
  checkColor?: string;
};

type ColorSwatchPickerProps<T extends string> = {
  /** The selected value; null leaves every swatch unselected (inherit). */
  value: T | null;
  options: ColorSwatchOption<T>[];
  onChange: (value: T) => void;
  compact?: boolean;
};

export function ColorSwatchPicker<T extends string>({
  value,
  options,
  onChange,
  compact = false,
}: ColorSwatchPickerProps<T>) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {options.map(option => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            className={`items-center justify-center rounded-full border-2 ${
              compact ? 'h-10 w-10' : 'h-12 w-12'
            } ${selected ? 'border-foreground' : 'border-transparent'}`}
            onPress={() => onChange(option.value)}
          >
            <View
              className={`items-center justify-center rounded-full ${
                compact ? 'h-7 w-7' : 'h-9 w-9'
              }`}
              style={{ backgroundColor: option.color }}
            >
              {selected && (
                <ClayIcon
                  name="check"
                  size={17}
                  color={option.checkColor ?? colors.cream}
                  stroke={2.5}
                />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

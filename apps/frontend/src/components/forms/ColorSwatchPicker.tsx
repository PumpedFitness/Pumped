import { Pressable, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { ClayIcon } from '../icons/ClayIcon';

export type ColorSwatchOption<T extends string> = {
  value: T;
  label: string;
  color: string;
  checkColor?: string;
};

type ColorSwatchPickerProps<T extends string> = {
  value: T;
  options: ColorSwatchOption<T>[];
  onChange: (value: T) => void;
};

export function ColorSwatchPicker<T extends string>({
  value,
  options,
  onChange,
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
            className={`h-12 w-12 items-center justify-center rounded-full border-2 ${
              selected ? 'border-foreground' : 'border-transparent'
            }`}
            onPress={() => onChange(option.value)}
          >
            <View
              className="h-9 w-9 items-center justify-center rounded-full"
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

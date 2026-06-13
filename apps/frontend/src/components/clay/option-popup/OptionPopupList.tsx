import { Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import type { PopupOption } from './optionPopupModel';

type OptionPopupListProps<T extends string> = {
  options: PopupOption<T>[];
  selectedValue?: T;
  onSelect: (value: T) => void;
};

export function OptionPopupList<T extends string>({
  options,
  selectedValue,
  onSelect,
}: OptionPopupListProps<T>) {
  return (
    <View className="mt-6 gap-3">
      {options.map(option => {
        const selected = selectedValue === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className={`min-h-16 flex-row items-center rounded-[18px] border px-4 py-3 ${
              selected
                ? 'border-accent bg-accent-soft'
                : 'border-border-hairline bg-surface-sunk'
            }`}
            onPress={() => onSelect(option.value)}
          >
            <View className="flex-1">
              <Text
                className={`t-body ${
                  selected ? 'text-accent' : 'text-foreground'
                }`}
              >
                {option.label}
              </Text>
              {option.description && (
                <Text className="t-caption mt-1">{option.description}</Text>
              )}
            </View>

            <View
              className={`ml-3 h-6 w-6 items-center justify-center rounded-full border ${
                selected ? 'border-accent bg-accent' : 'border-border-hairline'
              }`}
            >
              {selected && (
                <ClayIcon
                  name="check"
                  size={15}
                  stroke={2.5}
                  color={colors.cream}
                />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

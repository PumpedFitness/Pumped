import { Pressable, Text, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { ClayIcon } from '../icons/ClayIcon';
import { BottomSheetFrame } from './BottomSheetFrame';

export type SelectorOption<T extends string> = {
  value: T;
  label: string;
};

type OptionSelectorSheetProps<T extends string> = {
  visible: boolean;
  title: string;
  value: T;
  options: SelectorOption<T>[];
  onClose: () => void;
  onChange: (value: T) => void;
};

export function OptionSelectorSheet<T extends string>({
  visible,
  title,
  value,
  options,
  onClose,
  onChange,
}: OptionSelectorSheetProps<T>) {
  return (
    <BottomSheetFrame
      visible={visible}
      accessibilityLabel={`Close ${title.toLocaleLowerCase()} selector`}
      onClose={onClose}
    >
      <View className="gap-4 px-5 pb-8 pt-3">
        <View className="mx-auto h-1.5 w-11 rounded-full bg-border-hairline" />
        <Text className="text-center text-[21px] font-bold text-foreground">
          {title}
        </Text>

        <View className="overflow-hidden rounded-[18px] border border-border-soft">
          {options.map((option, index) => {
            const selected = value === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className={`min-h-14 flex-row items-center justify-between px-4 ${
                  index > 0 ? 'border-t border-border-soft' : ''
                } ${selected ? 'bg-accent-soft' : 'bg-surface-card'}`}
                onPress={() => {
                  onChange(option.value);
                  onClose();
                }}
              >
                <Text
                  className={`t-label ${
                    selected ? 'text-accent' : 'text-foreground'
                  }`}
                >
                  {option.label}
                </Text>
                {selected && (
                  <ClayIcon name="check" size={18} color={colors.accent} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </BottomSheetFrame>
  );
}

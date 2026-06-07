import { Pressable, Text, View } from 'react-native';
import { BottomSheet } from 'heroui-native';
import { colors } from '../../theme/tokens';
import { ClayIcon } from '../icons/ClayIcon';

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
    <BottomSheet isOpen={visible} onOpenChange={open => { if (!open) onClose(); }}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content backgroundClassName="bg-background">
          <BottomSheet.Title className="text-center text-[21px] font-bold text-foreground">
            {title}
          </BottomSheet.Title>

          <View className="mt-4 overflow-hidden rounded-[18px] border border-border-soft">
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
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

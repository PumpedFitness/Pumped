import { View } from 'react-native';
import { BottomSheet } from 'heroui-native';
import { SelectableRow } from './SelectableRow';

type SelectorOption<T extends string> = {
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
    <BottomSheet
      isOpen={visible}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content backgroundClassName="bg-background">
          <BottomSheet.Title className="text-center text-[21px] font-bold text-foreground">
            {title}
          </BottomSheet.Title>

          <View className="mt-4 overflow-hidden rounded-[18px] border border-border-soft">
            {options.map((option, index) => (
              <SelectableRow
                key={option.value}
                testID={`option-${option.label}`}
                label={option.label}
                selected={value === option.value}
                accessibilityRole="radio"
                className={`min-h-14 ${
                  index > 0 ? 'border-t border-border-soft' : ''
                }`}
                onPress={() => {
                  onChange(option.value);
                  onClose();
                }}
              />
            ))}
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

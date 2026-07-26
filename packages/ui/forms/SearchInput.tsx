import { TextInput, View } from 'react-native';
import { useBottomSheetAwareHandlers } from 'heroui-native';
import { colors, shadows } from '../theme/tokens';
import { ClayIcon } from '../icons/ClayIcon';

type SearchInputHeight = 48 | 52 | 54;

type SearchInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  autoFocus?: boolean;
  height?: SearchInputHeight;
  sheetAware?: boolean;
};

const HEIGHT_CLASS: Record<SearchInputHeight, string> = {
  48: 'h-[48px]',
  52: 'h-[52px]',
  54: 'h-[54px]',
};

const ICON_SIZE: Record<SearchInputHeight, number> = {
  48: 17,
  52: 19,
  54: 19,
};

export function SearchInput({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  autoFocus,
  height = 52,
  sheetAware,
}: SearchInputProps) {
  // Must be called unconditionally; the handlers are no-ops outside a
  // BottomSheet context and are only attached when sheetAware is set.
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();

  return (
    <View
      className={`${HEIGHT_CLASS[height]} flex-row items-center gap-[10px] rounded-full bg-surface-card px-[18px]`}
      style={shadows.row}
    >
      <ClayIcon name="search" size={ICON_SIZE[height]} color={colors.muted} />
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoFocus={autoFocus}
        className="flex-1 p-0 text-[15px] font-medium text-foreground"
        placeholder={placeholder}
        placeholderTextColor={colors.muted2}
        value={value}
        onChangeText={onChangeText}
        {...(sheetAware ? { onFocus, onBlur } : undefined)}
      />
    </View>
  );
}

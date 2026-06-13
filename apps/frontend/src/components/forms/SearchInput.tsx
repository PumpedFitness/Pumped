import { View } from 'react-native';
import { Input, useBottomSheetAwareHandlers } from 'heroui-native';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';

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

type HeightStyles = {
  input: string;
  iconWrapper: string;
  iconSize: number;
};

const HEIGHT_STYLES: Record<SearchInputHeight, HeightStyles> = {
  48: {
    input:
      'h-[48px] rounded-full border-border-hairline bg-surface-card pl-11 pr-4 text-foreground',
    iconWrapper: 'absolute left-3.5 top-0 h-[48px] items-center justify-center',
    iconSize: 17,
  },
  52: {
    input:
      'h-[52px] rounded-full border-border-hairline bg-surface-card pl-12 pr-4 text-foreground',
    iconWrapper: 'absolute left-4 top-0 h-[52px] items-center justify-center',
    iconSize: 19,
  },
  54: {
    input:
      'h-[54px] rounded-full border-border-hairline bg-surface-card pl-12 pr-4 text-foreground',
    iconWrapper: 'absolute left-4 top-0 h-[54px] items-center justify-center',
    iconSize: 19,
  },
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
  const styles = HEIGHT_STYLES[height];

  return (
    <View className="relative">
      <Input
        accessibilityLabel={accessibilityLabel}
        autoFocus={autoFocus}
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        {...(sheetAware ? { onFocus, onBlur } : undefined)}
      />
      <View className={styles.iconWrapper} pointerEvents="none">
        <ClayIcon name="search" size={styles.iconSize} color={colors.muted} />
      </View>
    </View>
  );
}

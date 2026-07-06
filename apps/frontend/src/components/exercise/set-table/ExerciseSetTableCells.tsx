import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import { colors } from '@/theme/tokens';
import { formatSetNumber } from './exerciseSetTableModel';

type EditableNumberInputProps = {
  accessibilityLabel: string;
  value: number | null;
  suggestedValue?: number;
  allowDecimal: boolean;
  hasError?: boolean;
  onChange: (value: number | null) => void;
};

type ValueButtonProps = {
  accessibilityLabel: string;
  display: string;
  isSuggested?: boolean;
  hasError?: boolean;
  onPress?: () => void;
};

function parseInputValue(value: string, allowDecimal: boolean): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) {
    return null;
  }
  const pattern = allowDecimal ? /^\d+(\.\d*)?$/ : /^\d+$/;
  if (!pattern.test(normalized) || normalized.endsWith('.')) {
    return null;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Inline keyboard-entry number input sized for a set-card chip body. */
export function EditableNumberInput({
  accessibilityLabel,
  value,
  suggestedValue,
  allowDecimal,
  hasError = false,
  onChange,
}: EditableNumberInputProps) {
  const [draft, setDraft] = useState(() => formatSetNumber(value));
  const isFocused = useRef(false);
  const placeholder = formatSetNumber(suggestedValue ?? null) || '–';

  useEffect(() => {
    if (!isFocused.current) {
      setDraft(formatSetNumber(value));
    }
  }, [value]);

  const updateDraft = (nextDraft: string) => {
    const normalizedDraft = nextDraft.replace(',', '.');
    const pattern = allowDecimal ? /^\d*(\.\d*)?$/ : /^\d*$/;
    if (!pattern.test(normalizedDraft)) {
      return;
    }
    setDraft(normalizedDraft);
    if (!normalizedDraft) {
      onChange(null);
      return;
    }
    const parsed = parseInputValue(normalizedDraft, allowDecimal);
    if (parsed !== null) {
      onChange(parsed);
    }
  };

  return (
    <TextInput
      accessibilityLabel={accessibilityLabel}
      className={`min-w-12 p-0 text-[17px] font-bold leading-[22px] tabular-nums ${
        hasError ? 'text-danger' : 'text-foreground'
      }`}
      keyboardType={allowDecimal ? 'decimal-pad' : 'number-pad'}
      placeholder={placeholder}
      placeholderTextColor={hasError ? colors.danger : colors.muted}
      returnKeyType="done"
      selectTextOnFocus
      style={{ includeFontPadding: false }}
      value={draft}
      onBlur={() => {
        isFocused.current = false;
        const committedDraft =
          allowDecimal && draft.endsWith('.') ? draft.slice(0, -1) : draft;
        const parsed = parseInputValue(committedDraft, allowDecimal);
        setDraft(formatSetNumber(parsed));
        onChange(parsed);
      }}
      onChangeText={updateDraft}
      onFocus={() => {
        isFocused.current = true;
      }}
    />
  );
}

/** Tappable value (opens a wheel / range sheet), or static text when read-only. */
export function ValueButton({
  accessibilityLabel,
  display,
  isSuggested = false,
  hasError = false,
  onPress,
}: ValueButtonProps) {
  const textClass = `text-[17px] font-bold tabular-nums ${
    hasError
      ? 'text-danger'
      : display && !isSuggested
      ? 'text-foreground'
      : 'text-muted'
  }`;

  if (!onPress) {
    return (
      <Text
        accessibilityLabel={`${accessibilityLabel}: ${display || '-'}`}
        className={`${textClass} leading-[22px]`}
        numberOfLines={1}
        style={{ includeFontPadding: false }}
      >
        {display || '–'}
      </Text>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${accessibilityLabel}: ${display || '-'}`}
      hitSlop={6}
      onPress={onPress}
    >
      <Text className={textClass} numberOfLines={1}>
        {display || '–'}
      </Text>
    </Pressable>
  );
}

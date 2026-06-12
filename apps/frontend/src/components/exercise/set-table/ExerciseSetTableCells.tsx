import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import { colors } from '../../../theme/tokens';
import { formatSetNumber, type SetField } from './exerciseSetTableModel';

type SetTypeCellProps = {
  label: string;
  value: string;
  onPress?: () => void;
};

type NumberInputCellProps = {
  label: string;
  value: number | null;
  allowDecimal: boolean;
  hasError?: boolean;
  readOnly?: boolean;
  onChange: (value: number | null) => void;
};

type SliderValueCellProps = {
  field: Extract<SetField, { inputMethod: 'slider' }>;
  hasError?: boolean;
  onPress?: () => void;
};

export function SetTypeCell({ label, value, onPress }: SetTypeCellProps) {
  if (!onPress) {
    return (
      <Text
        accessibilityLabel={`${label}: ${value || '-'}`}
        className={`h-10 flex-1 py-3 pl-1 text-left text-[12px] font-bold ${
          value ? 'text-foreground' : 'text-muted'
        }`}
        numberOfLines={1}
      >
        {value || '-'}
      </Text>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value || '-'}`}
      className="h-10 flex-1 justify-center rounded-[10px] px-1 active:bg-surface-card"
      onPress={onPress}
    >
      <Text
        className={`text-left text-[12px] font-bold ${
          value ? 'text-foreground' : 'text-muted'
        }`}
        numberOfLines={1}
      >
        {value || '-'}
      </Text>
    </Pressable>
  );
}

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

export function NumberInputCell({
  label,
  value,
  allowDecimal,
  hasError = false,
  readOnly = false,
  onChange,
}: NumberInputCellProps) {
  if (readOnly) {
    const formattedValue = formatSetNumber(value);

    return (
      <Text
        accessibilityLabel={`${label}: ${formattedValue || '-'}`}
        className={`h-10 flex-1 py-3 text-center text-[12px] font-bold tabular-nums ${
          formattedValue ? 'text-foreground' : 'text-muted'
        }`}
        numberOfLines={1}
      >
        {formattedValue || '-'}
      </Text>
    );
  }

  return (
    <EditableNumberInputCell
      label={label}
      value={value}
      allowDecimal={allowDecimal}
      hasError={hasError}
      onChange={onChange}
    />
  );
}

function EditableNumberInputCell({
  label,
  value,
  allowDecimal,
  hasError = false,
  onChange,
}: NumberInputCellProps) {
  const [draft, setDraft] = useState(() => formatSetNumber(value));
  const isFocused = useRef(false);

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
      accessibilityLabel={label}
      className={`h-10 flex-1 rounded-[10px] border px-1 text-center text-[12px] font-bold tabular-nums ${
        hasError
          ? 'border-danger bg-danger/10 text-danger'
          : 'border-transparent text-foreground'
      }`}
      keyboardType={allowDecimal ? 'decimal-pad' : 'number-pad'}
      placeholder="-"
      placeholderTextColor={hasError ? colors.danger : colors.muted}
      returnKeyType="done"
      selectTextOnFocus
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

export function SliderValueCell({
  field,
  hasError = false,
  onPress,
}: SliderValueCellProps) {
  const value = formatSetNumber(field.value);

  if (!onPress) {
    return (
      <Text
        accessibilityLabel={`${field.accessibilityLabel}: ${value || '-'}`}
        className={`h-10 flex-1 py-3 text-center text-[12px] font-bold tabular-nums ${
          value ? 'text-foreground' : 'text-muted'
        }`}
        numberOfLines={1}
      >
        {value || '-'}
      </Text>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${field.accessibilityLabel}: ${value || '-'}`}
      className={`h-10 flex-1 justify-center rounded-[10px] border px-1 ${
        hasError
          ? 'border-danger bg-danger/10'
          : 'border-transparent active:bg-surface-card'
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-center text-[12px] font-bold tabular-nums ${
          hasError ? 'text-danger' : value ? 'text-foreground' : 'text-muted'
        }`}
        numberOfLines={1}
      >
        {value || '-'}
      </Text>
    </Pressable>
  );
}

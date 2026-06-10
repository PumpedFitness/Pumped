import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../../theme/tokens';
import { OptionSelectorSheet } from '../forms/OptionSelectorSheet';
import { OptionalSliderSheet } from '../forms/OptionalSliderSheet';
import { ClayIcon } from '../icons/ClayIcon';
import {
  formatSetNumber,
  type SetField,
  type SetTableRow,
  type SetTypeOption,
} from './exerciseSetTableModel';

type ExerciseSetTableRowProps = {
  row: SetTableRow;
  setTypeOptions: SetTypeOption[];
};

type SetTypeCellProps = {
  label: string;
  value: string;
  onPress: () => void;
};

type NumberInputCellProps = {
  label: string;
  value: number | null;
  allowDecimal: boolean;
  onChange: (value: number | null) => void;
};

type SliderValueCellProps = {
  field: Extract<SetField, { inputMethod: 'slider' }>;
  onPress: () => void;
};

function SetTypeCell({ label, value, onPress }: SetTypeCellProps) {
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

function NumberInputCell({
  label,
  value,
  allowDecimal,
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
      className="h-10 flex-1 px-1 text-center text-[12px] font-bold tabular-nums text-foreground"
      keyboardType={allowDecimal ? 'decimal-pad' : 'number-pad'}
      placeholder="-"
      placeholderTextColor={colors.muted}
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

function SliderValueCell({ field, onPress }: SliderValueCellProps) {
  const value = formatSetNumber(field.value);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${field.accessibilityLabel}: ${value || '-'}`}
      className="h-10 flex-1 justify-center rounded-[10px] px-1 active:bg-surface-card"
      onPress={onPress}
    >
      <Text
        className={`text-center text-[12px] font-bold tabular-nums ${
          value ? 'text-foreground' : 'text-muted'
        }`}
        numberOfLines={1}
      >
        {value || '-'}
      </Text>
    </Pressable>
  );
}

function SetPositionCell({
  row,
  onPress,
}: {
  row: SetTableRow;
  onPress: () => void;
}) {
  if (!row.onToggleDone) {
    return (
      <Text className="w-6 text-center text-[12px] font-bold tabular-nums text-muted">
        {row.index + 1}
      </Text>
    );
  }
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={`Mark set ${row.index + 1} complete`}
      accessibilityState={{ checked: row.isDone }}
      className="h-10 w-6 items-center justify-center rounded-[10px] active:bg-surface-card"
      onPress={onPress}
    >
      {row.isDone ? (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-moss">
          <ClayIcon name="check" size={14} color={colors.cream} />
        </View>
      ) : (
        <Text className="text-[12px] font-bold tabular-nums text-muted">
          {row.index + 1}
        </Text>
      )}
    </Pressable>
  );
}

export function ExerciseSetTableRow({
  row,
  setTypeOptions,
}: ExerciseSetTableRowProps) {
  const [activeSliderFieldId, setActiveSliderFieldId] = useState<string | null>(
    null,
  );
  const [isSetTypeSelectorOpen, setIsSetTypeSelectorOpen] = useState(false);
  const sliderFields = row.fields.filter(
    (field): field is Extract<SetField, { inputMethod: 'slider' }> =>
      field.inputMethod === 'slider',
  );
  const activeSliderField =
    sliderFields.find(field => field.id === activeSliderFieldId) ?? null;
  const sliderSheetField = activeSliderField ?? sliderFields[0];
  const setTypeLabel =
    setTypeOptions.find(option => option.value === row.setType)?.label ??
    'Working';

  const toggleDone = () => {
    if (row.onToggleDone && !row.onToggleDone()) {
      Alert.alert(
        'Complete the set details',
        'Reps must be a positive whole number. Weight cannot be negative, and RPE must be between 1 and 10.',
      );
    }
  };

  return (
    <>
      <View
        className={`flex-row items-center gap-1.5 border-t border-border-soft px-1 py-1 ${
          row.isDone ? 'bg-moss/10' : ''
        }`}
      >
        <SetPositionCell row={row} onPress={toggleDone} />
        <SetTypeCell
          label={`Set ${row.index + 1} type`}
          value={setTypeLabel}
          onPress={() => setIsSetTypeSelectorOpen(true)}
        />
        {row.fields.map(field =>
          field.inputMethod === 'keyboard' ? (
            <NumberInputCell
              key={field.id}
              label={field.accessibilityLabel}
              value={field.value}
              allowDecimal={field.allowDecimal}
              onChange={value => row.onFieldChange(field.id, value)}
            />
          ) : (
            <SliderValueCell
              key={field.id}
              field={field}
              onPress={() => {
                Keyboard.dismiss();
                setActiveSliderFieldId(field.id);
              }}
            />
          ),
        )}
        {row.canRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove set ${row.index + 1}`}
            className="h-10 w-8 items-center justify-center rounded-full active:bg-surface-card"
            onPress={row.onRemove}
          >
            <ClayIcon name="trash" size={15} color={colors.danger} />
          </Pressable>
        ) : (
          <View className="w-8" />
        )}
      </View>

      {isSetTypeSelectorOpen && (
        <OptionSelectorSheet
          visible
          title={`Set ${row.index + 1} type`}
          value={row.setType}
          options={setTypeOptions}
          onClose={() => setIsSetTypeSelectorOpen(false)}
          onChange={row.onSetTypeChange}
        />
      )}
      {sliderSheetField && (
        <OptionalSliderSheet
          visible={activeSliderField !== null}
          value={activeSliderField?.value ?? null}
          config={sliderSheetField.sliderConfig}
          onClose={() => setActiveSliderFieldId(null)}
          onChange={value => {
            if (activeSliderField) {
              row.onFieldChange(activeSliderField.id, value);
            }
          }}
        />
      )}
    </>
  );
}

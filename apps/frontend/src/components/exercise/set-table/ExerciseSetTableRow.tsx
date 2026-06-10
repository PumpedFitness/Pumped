import { useState } from 'react';
import { Alert, Keyboard, Pressable, Text, View } from 'react-native';
import { colors } from '../../../theme/tokens';
import { OptionSelectorSheet } from '../../forms/OptionSelectorSheet';
import { OptionalSliderSheet } from '../../forms/OptionalSliderSheet';
import { ClayIcon } from '../../icons/ClayIcon';
import {
  NumberInputCell,
  SetTypeCell,
  SliderValueCell,
} from './ExerciseSetTableCells';
import type {
  SetField,
  SetTableRow,
  SetTypeOption,
} from './exerciseSetTableModel';

type ExerciseSetTableRowProps = {
  row: SetTableRow;
  setTypeOptions: SetTypeOption[];
};

type SetPositionCellProps = {
  row: SetTableRow;
  onPress: () => void;
};

function SetPositionCell({ row, onPress }: SetPositionCellProps) {
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

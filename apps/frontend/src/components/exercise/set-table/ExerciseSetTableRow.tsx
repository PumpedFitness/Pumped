import { useState } from 'react';
import { Alert, Keyboard, Pressable, Text, View } from 'react-native';
import { colors } from '../../../theme/tokens';
import { SwipeToDelete } from '../../clay/SwipeToDelete';
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
};

function SetPositionCell({ row }: SetPositionCellProps) {
  return (
    <Text className="w-6 text-center text-[12px] font-bold tabular-nums text-muted">
      {row.index + 1}
    </Text>
  );
}

type SetActionCellProps = {
  row: SetTableRow;
  onToggleDone: () => void;
};

function SetActionCell({ row, onToggleDone }: SetActionCellProps) {
  if (row.onToggleDone) {
    return (
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`Mark set ${row.index + 1} ${
          row.isDone ? 'incomplete' : 'complete'
        }`}
        accessibilityState={{ checked: row.isDone }}
        className="h-10 w-8 items-center justify-center rounded-full active:bg-surface-card"
        onPress={onToggleDone}
      >
        <View
          className={`h-6 w-6 items-center justify-center rounded-full ${
            row.isDone ? 'bg-moss' : 'border border-border-soft bg-surface-card'
          }`}
        >
          {row.isDone && (
            <ClayIcon name="check" size={14} color={colors.cream} />
          )}
        </View>
      </Pressable>
    );
  }

  if (!row.canRemove) {
    return <View className="w-8" />;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Remove set ${row.index + 1}`}
      className="h-10 w-8 items-center justify-center rounded-full active:bg-surface-card"
      onPress={row.onRemove}
    >
      <ClayIcon name="trash" size={15} color={colors.danger} />
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

  const content = (
    <View
      className={`flex-row items-center gap-1.5 border-t border-border-soft px-1 py-1 ${
        row.isDone ? 'bg-moss/10' : 'bg-surface-card'
      }`}
    >
      <SetPositionCell row={row} />
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
      <SetActionCell row={row} onToggleDone={toggleDone} />
    </View>
  );

  return (
    <>
      {row.canRemove ? (
        <SwipeToDelete onDelete={row.onRemove}>{content}</SwipeToDelete>
      ) : (
        content
      )}

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

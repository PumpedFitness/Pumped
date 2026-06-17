import { useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/tokens';
import { SwipeToDelete } from '@/components/clay/SwipeToDelete';
import { OptionSelectorSheet } from '@/components/forms/OptionSelectorSheet';
import { OptionalWheelPickerSheet } from '@/components/forms/OptionalWheelPickerSheet';
import { ClayIcon } from '@/components/icons/ClayIcon';
import {
  NumberInputCell,
  SetTypeCell,
  WheelValueCell,
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
  const { t } = useTranslation();

  if (row.readOnly) {
    return null;
  }

  if (row.onToggleDone) {
    return (
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={
          row.isDone
            ? t('setTable.a11y.markSetIncomplete', { number: row.index + 1 })
            : t('setTable.a11y.markSetComplete', { number: row.index + 1 })
        }
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
      accessibilityLabel={t('setTable.a11y.removeSet', {
        number: row.index + 1,
      })}
      className="h-10 w-8 items-center justify-center rounded-full active:bg-surface-card"
      onPress={() => {
        void row.onRemove();
      }}
    >
      <ClayIcon name="trash" size={15} color={colors.danger} />
    </Pressable>
  );
}

export function ExerciseSetTableRow({
  row,
  setTypeOptions,
}: ExerciseSetTableRowProps) {
  const { t } = useTranslation();
  const [activeWheelFieldId, setActiveWheelFieldId] = useState<string | null>(
    null,
  );
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isSetTypeSelectorOpen, setIsSetTypeSelectorOpen] = useState(false);
  const wheelFields = row.fields.filter(
    (field): field is Extract<SetField, { inputMethod: 'wheel' }> =>
      field.inputMethod === 'wheel',
  );
  const activeWheelField =
    wheelFields.find(field => field.id === activeWheelFieldId) ?? null;
  const wheelSheetField = activeWheelField ?? wheelFields[0];
  const setTypeLabel = t(
    setTypeOptions.find(option => option.value === row.setType)?.labelKey ??
      'setTable.setTypes.working',
  );
  const rowToneClassName =
    row.tone === 'completed'
      ? 'border-l-moss bg-sage/20'
      : 'border-l-transparent bg-surface-card';

  const toggleDone = () => {
    if (!row.onToggleDone) {
      return;
    }
    setShowValidationErrors(!row.onToggleDone());
  };

  const content = (
    <View
      className={`flex-row items-center gap-1.5 border-l-2 border-t border-border-soft px-1 py-1 ${rowToneClassName}`}
    >
      <SetPositionCell row={row} />
      <SetTypeCell
        label={t('setTable.a11y.setType', { number: row.index + 1 })}
        value={setTypeLabel}
        onPress={
          row.readOnly ? undefined : () => setIsSetTypeSelectorOpen(true)
        }
      />
      {row.fields.map(field =>
        field.inputMethod === 'keyboard' ? (
          <NumberInputCell
            key={field.id}
            label={field.accessibilityLabel}
            value={field.value}
            allowDecimal={field.allowDecimal}
            hasError={showValidationErrors && field.isValid === false}
            readOnly={row.readOnly}
            onChange={value => row.onFieldChange(field.id, value)}
          />
        ) : (
          <WheelValueCell
            key={field.id}
            field={field}
            hasError={showValidationErrors && field.isValid === false}
            onPress={
              row.readOnly
                ? undefined
                : () => {
                    Keyboard.dismiss();
                    setActiveWheelFieldId(field.id);
                  }
            }
          />
        ),
      )}
      <SetActionCell row={row} onToggleDone={toggleDone} />
    </View>
  );

  return (
    <>
      {row.canRemove && !row.readOnly ? (
        <SwipeToDelete onDelete={row.onRemove}>{content}</SwipeToDelete>
      ) : (
        content
      )}

      {!row.readOnly && isSetTypeSelectorOpen && (
        <OptionSelectorSheet
          visible
          title={t('setTable.a11y.setType', { number: row.index + 1 })}
          value={row.setType}
          options={setTypeOptions.map(option => ({
            value: option.value,
            label: t(option.labelKey),
          }))}
          onClose={() => setIsSetTypeSelectorOpen(false)}
          onChange={row.onSetTypeChange}
        />
      )}
      {!row.readOnly && wheelSheetField && (
        <OptionalWheelPickerSheet
          visible={activeWheelField !== null}
          value={activeWheelField?.value ?? null}
          config={wheelSheetField.wheelConfig}
          onClose={() => setActiveWheelFieldId(null)}
          onChange={value => {
            if (activeWheelField) {
              row.onFieldChange(activeWheelField.id, value);
            }
          }}
        />
      )}
    </>
  );
}

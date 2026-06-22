import type { ReactNode } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import type { SetFieldRange } from '@/types/workout';
import { EditableNumberInput, ValueButton } from './ExerciseSetTableCells';
import {
  formatSetNumber,
  type SetCardField,
  type SetCardNumberField,
  type SetCardRangeField,
} from './exerciseSetTableModel';

type SetFieldCellProps = {
  field: SetCardField;
  /** True when completion was attempted and this field is still missing/invalid. */
  hasError: boolean;
  /** Show the "required to finish" marker (active workout only). */
  showRequired: boolean;
  onOpenWheel: (field: SetCardNumberField) => void;
  onOpenRange: (field: SetCardRangeField) => void;
};

function withUnit(value: string, unit: string): string {
  if (!value) {
    return '';
  }
  return unit ? `${value} ${unit}` : value;
}

function formatRange(range: SetFieldRange | null, unit: string): string {
  if (!range || (range.min === null && range.max === null)) {
    return '';
  }
  const low = range.min !== null ? formatSetNumber(range.min) : '?';
  const high = range.max !== null ? formatSetNumber(range.max) : '?';
  return withUnit(`${low}–${high}`, unit);
}

type CellLabelProps = {
  label: string;
  /** Required & still unfilled → accent dot; required & filled → moss dot. */
  required: boolean;
  satisfied: boolean;
  hasError: boolean;
};

function CellLabel({ label, required, satisfied, hasError }: CellLabelProps) {
  const dotClass = hasError ? 'bg-danger' : satisfied ? 'bg-moss' : 'bg-accent';
  return (
    <View className="mb-1.5 flex-row items-center gap-1">
      <Text
        className={`text-[9px] font-semibold uppercase tracking-[0.6px] ${
          hasError ? 'text-danger' : 'text-muted'
        }`}
        numberOfLines={1}
      >
        {label}
      </Text>
      {required ? (
        <View
          accessibilityLabel="required"
          className={`h-1.5 w-1.5 rounded-full ${dotClass}`}
        />
      ) : null}
    </View>
  );
}

function CellShell({
  hasError,
  children,
}: {
  hasError: boolean;
  children: ReactNode;
}) {
  return (
    <View className={`flex-1 px-3 py-2.5 ${hasError ? 'bg-danger/10' : ''}`}>
      {children}
    </View>
  );
}

type BooleanCellProps = {
  field: Extract<SetCardField, { kind: 'boolean' }>;
  label: ReactNode;
  hasError: boolean;
};

function BooleanFieldCell({ field, label, hasError }: BooleanCellProps) {
  const { t } = useTranslation();
  return (
    <CellShell hasError={hasError}>
      {label}
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: field.value }}
        accessibilityLabel={field.label}
        disabled={field.readOnly}
        className="flex-row items-center gap-1.5"
        onPress={() => field.onChange(!field.value)}
      >
        <View
          className={`h-5 w-5 items-center justify-center rounded-full ${
            field.value ? 'bg-moss' : 'border border-border-soft bg-background'
          }`}
        >
          {field.value && (
            <ClayIcon name="check" size={11} color={colors.cream} />
          )}
        </View>
        <Text className="text-[13px] font-bold text-foreground">
          {field.value ? t('setField.boolean.on') : t('setField.boolean.off')}
        </Text>
      </Pressable>
    </CellShell>
  );
}

type TextCellProps = {
  field: Extract<SetCardField, { kind: 'text' }>;
  label: ReactNode;
  hasError: boolean;
};

function TextFieldCell({ field, label, hasError }: TextCellProps) {
  return (
    <CellShell hasError={hasError}>
      {label}
      {field.readOnly ? (
        <Text
          className="text-[15px] font-bold text-foreground"
          numberOfLines={1}
        >
          {field.value || '–'}
        </Text>
      ) : (
        <TextInput
          accessibilityLabel={field.label}
          className="text-[15px] font-semibold text-foreground"
          placeholder="–"
          placeholderTextColor={hasError ? colors.danger : colors.muted}
          value={field.value}
          onChangeText={field.onChange}
        />
      )}
    </CellShell>
  );
}

type NumberCellProps = {
  field: Extract<SetCardField, { kind: 'number' }>;
  label: ReactNode;
  hasError: boolean;
};

function NumberFieldCell({ field, label, hasError }: NumberCellProps) {
  return (
    <CellShell hasError={hasError}>
      {label}
      <View className="flex-row items-baseline gap-1">
        {field.readOnly ? (
          <Text className="text-[17px] font-bold tabular-nums text-foreground">
            {formatSetNumber(field.value) || '–'}
          </Text>
        ) : (
          <EditableNumberInput
            accessibilityLabel={field.label}
            value={field.value}
            allowDecimal={field.allowDecimal}
            hasError={hasError}
            onChange={field.onChange}
          />
        )}
        {field.unit ? (
          <Text
            className={`text-[11px] font-semibold ${
              hasError ? 'text-danger' : 'text-muted'
            }`}
          >
            {field.unit}
          </Text>
        ) : null}
      </View>
    </CellShell>
  );
}

type ButtonCellProps = {
  label: ReactNode;
  accessibilityLabel: string;
  display: string;
  hasError: boolean;
  onPress?: () => void;
};

function ButtonFieldCell({
  label,
  accessibilityLabel,
  display,
  hasError,
  onPress,
}: ButtonCellProps) {
  return (
    <CellShell hasError={hasError}>
      {label}
      <ValueButton
        accessibilityLabel={accessibilityLabel}
        display={display}
        hasError={hasError}
        onPress={onPress}
      />
    </CellShell>
  );
}

export function SetFieldCell({
  field,
  hasError,
  showRequired,
  onOpenWheel,
  onOpenRange,
}: SetFieldCellProps) {
  const label = (
    <CellLabel
      label={field.label}
      required={showRequired && field.required}
      satisfied={field.isValid !== false}
      hasError={hasError}
    />
  );

  if (field.kind === 'boolean') {
    return <BooleanFieldCell field={field} label={label} hasError={hasError} />;
  }
  if (field.kind === 'text') {
    return <TextFieldCell field={field} label={label} hasError={hasError} />;
  }
  if (field.kind === 'range') {
    const rangeField = field;
    return (
      <ButtonFieldCell
        label={label}
        accessibilityLabel={field.label}
        display={formatRange(field.range, field.unit)}
        hasError={hasError}
        onPress={field.readOnly ? undefined : () => onOpenRange(rangeField)}
      />
    );
  }
  if (field.input === 'wheel') {
    const wheelField = field;
    return (
      <ButtonFieldCell
        label={label}
        accessibilityLabel={field.label}
        display={withUnit(formatSetNumber(field.value), field.unit)}
        hasError={hasError}
        onPress={field.readOnly ? undefined : () => onOpenWheel(wheelField)}
      />
    );
  }
  return <NumberFieldCell field={field} label={label} hasError={hasError} />;
}

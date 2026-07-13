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
import { SetTextFieldCell } from './SetTextFieldCell';

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
  hasSuggestion,
  children,
}: {
  hasError: boolean;
  hasSuggestion?: boolean;
  children: ReactNode;
}) {
  const backgroundClass = hasError
    ? 'bg-danger/10'
    : hasSuggestion
    ? 'bg-foreground/5'
    : '';
  return (
    <View className={`flex-1 px-3 py-2.5 ${backgroundClass}`}>{children}</View>
  );
}

type ComparisonHintProps = {
  hint: SetCardField['comparisonHint'];
};

function ComparisonHint({ hint }: ComparisonHintProps) {
  if (!hint) return null;
  const colorClass = hint.neutral
    ? 'text-muted'
    : hint.positive
    ? 'text-moss'
    : 'text-danger';
  return (
    <Text className={`mt-0.5 text-[12px] font-bold ${colorClass}`}>
      {hint.label}
    </Text>
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

type NumberCellProps = {
  field: SetCardNumberField;
  label: ReactNode;
  hasError: boolean;
};

/**
 * Canonical read-only renderer for all number fields regardless of input type.
 * Uses Text (not TextInput) so sizing is platform-consistent — TextInput carries
 * Android default padding that shifts the baseline relative to Text.
 */
function ReadOnlyNumberCell({ field, label, hasError }: NumberCellProps) {
  return (
    <CellShell hasError={hasError}>
      {label}
      <View className="flex-row items-baseline gap-1">
        <Text
          className="text-[17px] font-bold leading-[22px] tabular-nums text-foreground"
          style={{ includeFontPadding: false }}
        >
          {formatSetNumber(field.value) || '–'}
        </Text>
        {field.unit ? (
          <Text
            className={`text-[11px] font-semibold leading-[14px] ${
              hasError ? 'text-danger' : 'text-muted'
            }`}
            style={{ includeFontPadding: false }}
          >
            {field.unit}
          </Text>
        ) : null}
      </View>
      <ComparisonHint hint={field.comparisonHint} />
    </CellShell>
  );
}

/** Editable keyboard number field. */
function EditableKeyboardNumberCell({
  field,
  label,
  hasError,
}: NumberCellProps) {
  const hasSuggestion = field.value === null && field.suggestedValue != null;
  return (
    <CellShell hasError={hasError} hasSuggestion={hasSuggestion}>
      {label}
      <View className="flex-row items-baseline gap-1">
        <EditableNumberInput
          accessibilityLabel={field.label}
          value={field.value}
          suggestedValue={field.suggestedValue}
          allowDecimal={field.allowDecimal}
          hasError={hasError}
          onChange={field.onChange}
        />
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

type WheelNumberCellProps = {
  field: SetCardNumberField;
  label: ReactNode;
  hasError: boolean;
  onPress: () => void;
};

/** Editable wheel-picker number field. */
function EditableWheelNumberCell({
  field,
  label,
  hasError,
  onPress,
}: WheelNumberCellProps) {
  const hasSuggestion = field.value === null && field.suggestedValue != null;
  const display = formatSetNumber(field.value);
  const placeholder = hasSuggestion
    ? formatSetNumber(field.suggestedValue ?? null)
    : '–';
  const valueInput = (
    <TextInput
      accessibilityLabel={field.label}
      className={`min-w-12 text-[17px] font-bold tabular-nums ${
        hasError ? 'text-danger' : display ? 'text-foreground' : 'text-muted'
      }`}
      editable={false}
      placeholder={placeholder}
      placeholderTextColor={hasError ? colors.danger : colors.muted}
      pointerEvents="none"
      value={display}
    />
  );

  return (
    <CellShell hasError={hasError} hasSuggestion={hasSuggestion}>
      {label}
      <View className="flex-row items-baseline gap-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${field.label}: ${display || placeholder}`}
          hitSlop={6}
          onPress={onPress}
        >
          {valueInput}
        </Pressable>
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
  isSuggested = false,
  hasError,
  onPress,
}: ButtonCellProps & { isSuggested?: boolean }) {
  return (
    <CellShell hasError={hasError} hasSuggestion={isSuggested}>
      {label}
      <ValueButton
        accessibilityLabel={accessibilityLabel}
        display={display}
        isSuggested={isSuggested}
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
    return <SetTextFieldCell field={field} label={label} hasError={hasError} />;
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

  // Number fields: read-only uses Text (platform-consistent height);
  // editable splits on keyboard vs wheel (interaction concern only).
  if (field.readOnly) {
    return (
      <ReadOnlyNumberCell field={field} label={label} hasError={hasError} />
    );
  }
  if (field.input === 'wheel') {
    return (
      <EditableWheelNumberCell
        field={field}
        label={label}
        hasError={hasError}
        onPress={() => onOpenWheel(field)}
      />
    );
  }
  return (
    <EditableKeyboardNumberCell
      field={field}
      label={label}
      hasError={hasError}
    />
  );
}

import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Button, Input } from 'heroui-native';
import { AppBottomSheet } from '@/components/forms/AppBottomSheet';
import { randomUUID } from 'expo-crypto';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { SegmentedControl } from '@/components/clay/SegmentedControl';
import type { SetFieldDataType, SetFieldUnit } from '@/data/local/enums';
import type { DraftField } from './draft';

type SetTypeFieldEditorSheetProps = {
  visible: boolean;
  field: DraftField | null;
  onClose: () => void;
  onSave: (field: DraftField) => void;
  onRemove?: () => void;
};

type NumberFormat = 'decimal' | 'integer';

type FieldControlProps = {
  label: string;
  children: ReactNode;
};

type DataTypeControlProps = {
  dataType: SetFieldDataType;
  onChange: (value: SetFieldDataType) => void;
};

type NumberFormatControlProps = {
  numberFormat: NumberFormat;
  onChange: (value: NumberFormat) => void;
};

type UnitControlProps = {
  unit: SetFieldUnit | 'none';
  onChange: (value: SetFieldUnit | 'none') => void;
};

type RequiredToggleProps = {
  required: boolean;
  onToggle: () => void;
};

type ActionButtonsProps = {
  canSave: boolean;
  onSave: () => void;
  onRemove?: () => void;
};

const DATA_TYPES: SetFieldDataType[] = ['number', 'range', 'boolean', 'text'];
const UNIT_OPTIONS: (SetFieldUnit | 'none')[] = [
  'none',
  'amount',
  'percentage',
  'seconds',
];

function hasNumberFormat(dataType: SetFieldDataType): boolean {
  return dataType === 'number' || dataType === 'range';
}

function hasUnit(dataType: SetFieldDataType): boolean {
  return dataType === 'number' || dataType === 'range';
}

function numberFormatFromField(field: DraftField | null): NumberFormat {
  return field?.config.decimals === 0 ? 'integer' : 'decimal';
}

function FieldControl({ label, children }: FieldControlProps) {
  return (
    <View className="gap-1.5">
      <Text className="t-eyebrow">{label}</Text>
      {children}
    </View>
  );
}

function DataTypeControl({ dataType, onChange }: DataTypeControlProps) {
  const { t } = useTranslation();
  return (
    <FieldControl label={t('setTypeEditor.fieldSheet.typeLabel')}>
      <SegmentedControl
        options={DATA_TYPES.map(value => ({
          value,
          label: t(`setField.dataType.${value}`),
        }))}
        value={dataType}
        onChange={value => onChange(value as SetFieldDataType)}
      />
    </FieldControl>
  );
}

function NumberFormatControl({
  numberFormat,
  onChange,
}: NumberFormatControlProps) {
  const { t } = useTranslation();
  return (
    <FieldControl
      label={t('setTypeEditor.fieldSheet.numberFormatLabel', {
        defaultValue: 'Number format',
      })}
    >
      <SegmentedControl
        options={[
          {
            value: 'decimal',
            label: t('setTypeEditor.fieldSheet.numberFormat.decimal', {
              defaultValue: 'Comma number',
            }),
          },
          {
            value: 'integer',
            label: t('setTypeEditor.fieldSheet.numberFormat.integer', {
              defaultValue: 'Integer',
            }),
          },
        ]}
        value={numberFormat}
        onChange={value => onChange(value as NumberFormat)}
      />
    </FieldControl>
  );
}

function UnitControl({ unit, onChange }: UnitControlProps) {
  const { t } = useTranslation();
  return (
    <FieldControl label={t('setTypeEditor.fieldSheet.unitLabel')}>
      <SegmentedControl
        options={UNIT_OPTIONS.map(value => ({
          value,
          label:
            value === 'none'
              ? t('setTypeEditor.fieldSheet.unitNone', { defaultValue: 'None' })
              : value === 'amount'
              ? t('setTypeEditor.fieldSheet.unit.weight', {
                  defaultValue: 'Weight (settings)',
                })
              : t(`setField.unit.${value}`),
        }))}
        value={unit}
        onChange={value => onChange(value as SetFieldUnit | 'none')}
      />
    </FieldControl>
  );
}

function RequiredToggle({ required, onToggle }: RequiredToggleProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: required }}
      className="flex-row items-center justify-between rounded-[18px] border border-border-hairline bg-surface px-4 py-3.5"
      onPress={onToggle}
    >
      <Text className="t-label text-foreground">
        {t('setTypeEditor.fieldSheet.requiredLabel')}
      </Text>
      <View
        className={`h-6 w-6 items-center justify-center rounded-full ${
          required ? 'bg-moss' : 'border border-border-soft bg-background'
        }`}
      >
        {required && <ClayIcon name="check" size={14} color={colors.cream} />}
      </View>
    </Pressable>
  );
}

function ActionButtons({ canSave, onSave, onRemove }: ActionButtonsProps) {
  const { t } = useTranslation();
  return (
    <>
      <Button
        className={`h-13 rounded-full ${
          canSave ? 'bg-accent' : 'bg-surface-sunk'
        }`}
        feedbackVariant="scale"
        isDisabled={!canSave}
        onPress={onSave}
      >
        <Button.Label
          className={
            canSave ? 'font-bold text-accent-foreground' : 'text-muted'
          }
        >
          {t('setTypeEditor.fieldSheet.save')}
        </Button.Label>
      </Button>

      {onRemove && (
        <Button
          className="h-13 rounded-full"
          variant="ghost"
          feedbackVariant="scale"
          onPress={onRemove}
        >
          <Button.Label className="text-danger">
            {t('setTypeEditor.fieldSheet.remove')}
          </Button.Label>
        </Button>
      )}
    </>
  );
}

export function SetTypeFieldEditorSheet({
  visible,
  field,
  onClose,
  onSave,
  onRemove,
}: SetTypeFieldEditorSheetProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [dataType, setDataType] = useState<SetFieldDataType>('number');
  const [numberFormat, setNumberFormat] = useState<NumberFormat>('decimal');
  const [unit, setUnit] = useState<SetFieldUnit | 'none'>('amount');
  const [required, setRequired] = useState(false);

  useEffect(() => {
    if (visible) {
      const nextDataType = field?.dataType ?? 'number';
      setName(field?.name ?? '');
      setDataType(nextDataType);
      setNumberFormat(numberFormatFromField(field));
      setUnit(field?.unit ?? (hasUnit(nextDataType) ? 'amount' : 'none'));
      setRequired(field?.config.required ?? false);
    }
  }, [visible, field]);

  const canSave = name.trim().length > 0;

  const setNextDataType = (nextDataType: SetFieldDataType) => {
    setDataType(nextDataType);
    setUnit(current =>
      hasUnit(nextDataType)
        ? current === 'none'
          ? 'amount'
          : current
        : 'none',
    );
  };

  const save = () => {
    if (!canSave) {
      return;
    }

    const config = { ...field?.config, required };
    if (hasNumberFormat(dataType)) {
      config.decimals = numberFormat === 'integer' ? 0 : 2;
    } else {
      delete config.decimals;
    }

    onSave({
      key: field?.key ?? randomUUID(),
      id: field?.id,
      name: name.trim(),
      dataType,
      unit: hasUnit(dataType) && unit !== 'none' ? unit : null,
      config,
    });
    onClose();
  };

  return (
    <AppBottomSheet open={visible} onClose={onClose}>
      <BottomSheet.Overlay />
      <AppBottomSheet.Content backgroundClassName="bg-background">
        <BottomSheet.Title className="text-[21px] font-bold text-foreground">
          {field
            ? t('setTypeEditor.fieldSheet.editTitle')
            : t('setTypeEditor.fieldSheet.addTitle')}
        </BottomSheet.Title>

        <View className="mt-4 gap-4">
          <FieldControl label={t('setTypeEditor.fieldSheet.nameLabel')}>
            <Input
              className="h-[50px] rounded-[16px] border-border-hairline bg-surface-sunk px-4 text-foreground"
              placeholder={t('setTypeEditor.fieldSheet.namePlaceholder')}
              value={name}
              onChangeText={setName}
            />
          </FieldControl>

          <DataTypeControl dataType={dataType} onChange={setNextDataType} />

          {hasNumberFormat(dataType) && (
            <NumberFormatControl
              numberFormat={numberFormat}
              onChange={setNumberFormat}
            />
          )}

          {hasUnit(dataType) && <UnitControl unit={unit} onChange={setUnit} />}

          <RequiredToggle
            required={required}
            onToggle={() => setRequired(current => !current)}
          />

          <ActionButtons
            canSave={canSave}
            onSave={save}
            onRemove={
              onRemove
                ? () => {
                    onRemove();
                    onClose();
                  }
                : undefined
            }
          />
        </View>
      </AppBottomSheet.Content>
    </AppBottomSheet>
  );
}

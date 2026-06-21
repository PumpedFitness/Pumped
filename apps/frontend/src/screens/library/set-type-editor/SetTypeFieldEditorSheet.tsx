import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Button, Input } from 'heroui-native';
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

const DATA_TYPES: SetFieldDataType[] = ['number', 'range', 'boolean', 'text'];
const UNIT_OPTIONS: (SetFieldUnit | 'none')[] = [
  'none',
  'amount',
  'percentage',
  'seconds',
];

function hasUnit(dataType: SetFieldDataType): boolean {
  return dataType === 'number' || dataType === 'range';
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
  const [unit, setUnit] = useState<SetFieldUnit | 'none'>('none');
  const [required, setRequired] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(field?.name ?? '');
      setDataType(field?.dataType ?? 'number');
      setUnit(field?.unit ?? 'none');
      setRequired(field?.config.required ?? false);
    }
  }, [visible, field]);

  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) {
      return;
    }
    const resolvedUnit = hasUnit(dataType) && unit !== 'none' ? unit : null;
    onSave({
      key: field?.key ?? randomUUID(),
      id: field?.id,
      name: name.trim(),
      dataType,
      unit: resolvedUnit,
      config: { ...field?.config, required },
    });
    onClose();
  };

  return (
    <BottomSheet
      isOpen={visible}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content backgroundClassName="bg-background">
          <BottomSheet.Title className="text-[21px] font-bold text-foreground">
            {field
              ? t('setTypeEditor.fieldSheet.editTitle')
              : t('setTypeEditor.fieldSheet.addTitle')}
          </BottomSheet.Title>

          <View className="mt-4 gap-4">
            <View className="gap-1.5">
              <Text className="t-eyebrow">
                {t('setTypeEditor.fieldSheet.nameLabel')}
              </Text>
              <Input
                className="h-[50px] rounded-[16px] border-border-hairline bg-surface-sunk px-4 text-foreground"
                placeholder={t('setTypeEditor.fieldSheet.namePlaceholder')}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="gap-1.5">
              <Text className="t-eyebrow">
                {t('setTypeEditor.fieldSheet.typeLabel')}
              </Text>
              <SegmentedControl
                options={DATA_TYPES.map(value => ({
                  value,
                  label: t(`setField.dataType.${value}`),
                }))}
                value={dataType}
                onChange={value => setDataType(value as SetFieldDataType)}
              />
            </View>

            {hasUnit(dataType) && (
              <View className="gap-1.5">
                <Text className="t-eyebrow">
                  {t('setTypeEditor.fieldSheet.unitLabel')}
                </Text>
                <SegmentedControl
                  options={UNIT_OPTIONS.map(value => ({
                    value,
                    label:
                      value === 'none'
                        ? t('setTypeEditor.fieldSheet.unitNone')
                        : t(`setField.unit.${value}`),
                  }))}
                  value={unit}
                  onChange={value => setUnit(value as SetFieldUnit | 'none')}
                />
              </View>
            )}

            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: required }}
              className="flex-row items-center justify-between rounded-[16px] bg-surface-sunk px-4 py-3.5"
              onPress={() => setRequired(current => !current)}
            >
              <Text className="t-label text-foreground">
                {t('setTypeEditor.fieldSheet.requiredLabel')}
              </Text>
              <View
                className={`h-6 w-6 items-center justify-center rounded-full ${
                  required ? 'bg-moss' : 'border border-border-soft bg-background'
                }`}
              >
                {required && (
                  <ClayIcon name="check" size={14} color={colors.cream} />
                )}
              </View>
            </Pressable>

            <Button
              className={`h-13 rounded-full ${canSave ? 'bg-accent' : 'bg-surface-sunk'}`}
              feedbackVariant="scale"
              isDisabled={!canSave}
              onPress={save}
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
                onPress={() => {
                  onRemove();
                  onClose();
                }}
              >
                <Button.Label className="text-danger">
                  {t('setTypeEditor.fieldSheet.remove')}
                </Button.Label>
              </Button>
            )}
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

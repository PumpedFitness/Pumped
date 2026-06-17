import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Button } from 'heroui-native';
import { WheelPicker } from './WheelPicker';

export type OptionalWheelPickerConfig = {
  title: string;
  description: string;
  minValue: number;
  maxValue: number;
  step: number;
  defaultValue: number;
  formatValue: (value: number) => string;
};

type OptionalWheelPickerSheetProps = {
  visible: boolean;
  value: number | null;
  config: OptionalWheelPickerConfig;
  onClose: () => void;
  onChange: (value: number | null) => void;
};

function buildValues(config: OptionalWheelPickerConfig): number[] {
  const { minValue, maxValue, step } = config;
  const values: number[] = [];
  // Accumulate via the step count to avoid floating point drift on
  // fractional steps (e.g. RPE 0.5 increments).
  const count = Math.round((maxValue - minValue) / step);
  for (let i = 0; i <= count; i++) {
    values.push(Math.round((minValue + i * step) * 1000) / 1000);
  }
  return values;
}

function nearestIndex(values: number[], target: number): number {
  let bestIndex = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < values.length; i++) {
    const distance = Math.abs(values[i] - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }
  return bestIndex;
}

export function OptionalWheelPickerSheet({
  visible,
  value,
  config,
  onClose,
  onChange,
}: OptionalWheelPickerSheetProps) {
  const { t } = useTranslation();
  const values = useMemo(() => buildValues(config), [config]);
  const items = useMemo(() => values.map(config.formatValue), [values, config]);

  const [selectedIndex, setSelectedIndex] = useState(() =>
    nearestIndex(values, value ?? config.defaultValue),
  );

  useEffect(() => {
    if (visible) {
      setSelectedIndex(nearestIndex(values, value ?? config.defaultValue));
    }
  }, [config.defaultValue, value, values, visible]);

  const selectedValue = values[selectedIndex] ?? config.defaultValue;

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
          <View className="items-center">
            <BottomSheet.Title className="text-[21px] font-bold text-foreground">
              {config.title}
            </BottomSheet.Title>
            <BottomSheet.Description className="mt-1 text-center text-[13px] text-muted">
              {config.description}
            </BottomSheet.Description>
          </View>

          <Text className="mt-4 text-center text-[34px] font-bold tabular-nums text-foreground">
            {config.formatValue(selectedValue)}
          </Text>

          <View className="mt-4 items-center">
            <WheelPicker
              items={items}
              selectedIndex={selectedIndex}
              onChange={setSelectedIndex}
              width={180}
            />
          </View>

          <View className="mt-6 flex-row gap-2">
            <Button
              className="h-13 flex-1 rounded-full"
              variant="ghost"
              feedbackVariant="scale"
              onPress={() => {
                onChange(null);
                onClose();
              }}
            >
              <Button.Label>{t('common.clear')}</Button.Label>
            </Button>
            <Button
              className="h-13 flex-1 rounded-full bg-accent"
              feedbackVariant="scale"
              onPress={() => {
                onChange(selectedValue);
                onClose();
              }}
            >
              <Button.Label className="font-bold text-accent-foreground">
                {t('common.apply')}
              </Button.Label>
            </Button>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Button } from 'heroui-native';
import type { SetFieldRange } from '@/types/workout';
import type { OptionalWheelPickerConfig } from './OptionalWheelPickerSheet';
import { WheelPicker } from './WheelPicker';

type RangeWheelPickerSheetProps = {
  visible: boolean;
  value: SetFieldRange | null;
  config: OptionalWheelPickerConfig;
  onClose: () => void;
  onChange: (value: SetFieldRange | null) => void;
};

function buildValues(config: OptionalWheelPickerConfig): number[] {
  const { minValue, maxValue, step } = config;
  const values: number[] = [];
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

// Dual wheel for a `range` field's target span (min ≤ max).
export function RangeWheelPickerSheet({
  visible,
  value,
  config,
  onClose,
  onChange,
}: RangeWheelPickerSheetProps) {
  const { t } = useTranslation();
  const values = useMemo(() => buildValues(config), [config]);
  const items = useMemo(() => values.map(config.formatValue), [values, config]);

  const [minIndex, setMinIndex] = useState(() =>
    nearestIndex(values, value?.min ?? config.defaultValue),
  );
  const [maxIndex, setMaxIndex] = useState(() =>
    nearestIndex(values, value?.max ?? config.defaultValue),
  );

  useEffect(() => {
    if (visible) {
      setMinIndex(nearestIndex(values, value?.min ?? config.defaultValue));
      setMaxIndex(nearestIndex(values, value?.max ?? config.defaultValue));
    }
  }, [config.defaultValue, value, values, visible]);

  const minValue = values[minIndex] ?? config.defaultValue;
  const maxValue = values[maxIndex] ?? config.defaultValue;
  // Keep max ≥ min so the span is always valid.
  const orderedMin = Math.min(minValue, maxValue);
  const orderedMax = Math.max(minValue, maxValue);

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
              {t('setTable.wheel.rangeDescription')}
            </BottomSheet.Description>
          </View>

          <Text className="mt-4 text-center text-[34px] font-bold tabular-nums text-foreground">
            {`${config.formatValue(orderedMin)} – ${config.formatValue(orderedMax)}`}
          </Text>

          <View className="mt-4 flex-row items-center justify-center gap-4">
            <View className="items-center">
              <Text className="t-caption mb-1">{t('setTable.wheel.min')}</Text>
              <WheelPicker
                items={items}
                selectedIndex={minIndex}
                onChange={setMinIndex}
                width={140}
              />
            </View>
            <View className="items-center">
              <Text className="t-caption mb-1">{t('setTable.wheel.max')}</Text>
              <WheelPicker
                items={items}
                selectedIndex={maxIndex}
                onChange={setMaxIndex}
                width={140}
              />
            </View>
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
                onChange({ min: orderedMin, max: orderedMax });
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

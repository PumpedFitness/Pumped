import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Button, Slider } from 'heroui-native';

export type OptionalSliderConfig = {
  title: string;
  description: string;
  minValue: number;
  maxValue: number;
  step: number;
  defaultValue: number;
  formatValue: (value: number) => string;
};

type OptionalSliderSheetProps = {
  visible: boolean;
  value: number | null;
  config: OptionalSliderConfig;
  onClose: () => void;
  onChange: (value: number | null) => void;
};

function getSliderValue(value: number | number[]): number {
  return Array.isArray(value) ? value[0] ?? 0 : value;
}

export function OptionalSliderSheet({
  visible,
  value,
  config,
  onClose,
  onChange,
}: OptionalSliderSheetProps) {
  const { t } = useTranslation();
  const [sliderValue, setSliderValue] = useState(value ?? config.defaultValue);

  useEffect(() => {
    if (visible) {
      setSliderValue(value ?? config.defaultValue);
    }
  }, [config.defaultValue, value, visible]);

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

          <Text className="mt-6 text-center text-[34px] font-bold tabular-nums text-foreground">
            {config.formatValue(sliderValue)}
          </Text>

          <View className="mt-6 justify-center py-3">
            <Slider
              aria-label={config.title}
              value={sliderValue}
              minValue={config.minValue}
              maxValue={config.maxValue}
              step={config.step}
              onChange={nextValue => setSliderValue(getSliderValue(nextValue))}
            >
              <Slider.Track
                className="h-3 rounded-full bg-surface-sunk"
                hitSlop={16}
              >
                <Slider.Fill className="rounded-full bg-accent" />
                <Slider.Thumb
                  hitSlop={18}
                  classNames={{
                    thumbContainer: 'size-7 rounded-full bg-accent',
                    thumbKnob: 'rounded-full bg-accent-foreground',
                  }}
                />
              </Slider.Track>
            </Slider>
          </View>

          <View className="flex-row justify-between">
            <Text className="t-caption tabular-nums">
              {config.formatValue(config.minValue)}
            </Text>
            <Text className="t-caption tabular-nums">
              {config.formatValue(config.maxValue)}
            </Text>
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
                onChange(sliderValue);
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

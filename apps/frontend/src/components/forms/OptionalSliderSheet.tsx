import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Slider } from 'heroui-native';
import { BottomSheetFrame } from './BottomSheetFrame';

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

type OptionalSliderTriggerProps = {
  label: string;
  value: string;
  emptyLabel?: string;
  compact?: boolean;
  onPress: () => void;
};

function getSliderValue(value: number | number[]): number {
  return Array.isArray(value) ? value[0] ?? 0 : value;
}

export function OptionalSliderTrigger({
  label,
  value,
  emptyLabel = 'Optional',
  compact = false,
  onPress,
}: OptionalSliderTriggerProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value || emptyLabel}`}
      className={`flex-1 justify-center rounded-[14px] border border-border-hairline bg-surface-card active:bg-background ${
        compact ? 'h-14 px-2 py-1.5' : 'min-h-16 px-3 py-2'
      }`}
      onPress={onPress}
    >
      <Text
        className={`font-semibold text-muted ${
          compact ? 'text-[9px]' : 'text-[11px]'
        }`}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        className={`${compact ? 'mt-0.5 text-[12px]' : 'mt-1 text-[14px]'} ${
          value ? 'text-foreground' : 'text-muted'
        } font-bold tabular-nums`}
        numberOfLines={1}
      >
        {value || emptyLabel}
      </Text>
    </Pressable>
  );
}

export function OptionalSliderSheet({
  visible,
  value,
  config,
  onClose,
  onChange,
}: OptionalSliderSheetProps) {
  const [sliderValue, setSliderValue] = useState(value ?? config.defaultValue);

  useEffect(() => {
    if (visible) {
      setSliderValue(value ?? config.defaultValue);
    }
  }, [config.defaultValue, value, visible]);

  return (
    <BottomSheetFrame
      visible={visible}
      accessibilityLabel="Close value picker"
      onClose={onClose}
    >
      <View className="gap-6 px-5 pb-8 pt-3">
        <View className="mx-auto h-1.5 w-11 rounded-full bg-border-hairline" />

        <View className="items-center">
          <Text className="text-[21px] font-bold text-foreground">
            {config.title}
          </Text>
          <Text className="mt-1 text-center text-[13px] text-muted">
            {config.description}
          </Text>
        </View>

        <Text className="text-center text-[34px] font-bold tabular-nums text-foreground">
          {config.formatValue(sliderValue)}
        </Text>

        <View className="justify-center py-3">
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

        <View className="flex-row gap-2">
          <Button
            className="h-13 flex-1 rounded-full"
            variant="ghost"
            feedbackVariant="scale"
            onPress={() => {
              onChange(null);
              onClose();
            }}
          >
            <Button.Label>Clear</Button.Label>
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
              Apply
            </Button.Label>
          </Button>
        </View>
      </View>
    </BottomSheetFrame>
  );
}

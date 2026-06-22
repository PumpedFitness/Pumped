import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Input } from 'heroui-native';
import { formatNumber } from '@/data/local/sets/progressionGoals';

type ProgressionNumberInputRowProps = {
  label: string;
  value: number;
  suffix?: string;
  onChange: (value: number) => void;
};

function parseInputNumber(text: string, fallback: number): number {
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) ? value : fallback;
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseInputText(text: string): string {
  const normalizedText = text.replaceAll(',', '.');
  const firstSeparator = normalizedText.indexOf('.');

  if (firstSeparator === -1) {
    return normalizedText;
  }

  return (
    normalizedText.slice(0, firstSeparator + 1) +
    normalizedText.slice(firstSeparator + 1).replaceAll('.', '')
  );
}

export function ProgressionNumberInputRow({
  label,
  value,
  suffix,
  onChange,
}: ProgressionNumberInputRowProps) {
  const [text, setText] = useState<string>(formatNumber(value));

  useEffect(() => {
    setText(formatNumber(value));
  }, [value]);

  return (
    <View className="flex-1 gap-1.5">
      <Text className="t-caption text-muted">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Input
          className="h-[46px] flex-1 rounded-[14px] border-border-hairline bg-surface-sunk px-3 text-foreground"
          keyboardType="decimal-pad"
          value={text}
          onChangeText={uiText => setText(parseInputText(uiText))}
          onEndEditing={event => {
            const parsed = roundToTwoDecimals(
              parseInputNumber(
              parseInputText(event.nativeEvent.text),
              value,
              ),
            );
            onChange(parsed);
            setText(formatNumber(parsed));
          }}
        />
        {suffix ? <Text className="t-caption text-muted">{suffix}</Text> : null}
      </View>
    </View>
  );
}

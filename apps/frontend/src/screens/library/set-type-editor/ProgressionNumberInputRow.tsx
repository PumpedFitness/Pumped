import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Input } from 'heroui-native';
import { formatNumber } from '@/data/local/sets/progressionGoals';

type ProgressionNumberInputRowProps = {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  onChange: (value: number) => void;
};

function parseInputNumber(text: string, fallback: number): number {
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) ? value : fallback;
}

function roundToDecimals(value: number, decimals: number): number {
  if (decimals === 0) {
    return Math.round(value);
  }
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function parseInputText(text: string, allowDecimal: boolean): string {
  const normalizedText = text.replaceAll(',', '.');
  const numericText = normalizedText.replace(/[^\d.]/g, '');
  if (!allowDecimal) {
    return numericText.replaceAll('.', '');
  }
  const firstSeparator = numericText.indexOf('.');

  if (firstSeparator === -1) {
    return numericText;
  }

  return (
    numericText.slice(0, firstSeparator + 1) +
    numericText.slice(firstSeparator + 1).replaceAll('.', '')
  );
}

export function ProgressionNumberInputRow({
  label,
  value,
  decimals = 2,
  suffix,
  onChange,
}: ProgressionNumberInputRowProps) {
  const [text, setText] = useState<string>(formatNumber(value));
  const safeDecimals = Math.max(0, decimals);
  const allowDecimal = safeDecimals > 0;

  useEffect(() => {
    setText(formatNumber(roundToDecimals(value, safeDecimals)));
  }, [safeDecimals, value]);

  return (
    <View className="flex-1 gap-1.5">
      <Text className="t-caption text-muted">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Input
          className="h-[46px] flex-1 rounded-[14px] border-border-hairline bg-surface-sunk px-3 text-foreground"
          keyboardType={allowDecimal ? 'decimal-pad' : 'number-pad'}
          value={text}
          onChangeText={uiText => setText(parseInputText(uiText, allowDecimal))}
          onEndEditing={event => {
            const parsed = roundToDecimals(
              parseInputNumber(
                parseInputText(event.nativeEvent.text, allowDecimal),
                value,
              ),
              safeDecimals,
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

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

export function ProgressionNumberInputRow({
  label,
  value,
  suffix,
  onChange,
}: ProgressionNumberInputRowProps) {
  return (
    <View className="flex-1 gap-1.5">
      <Text className="t-caption text-muted">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Input
          className="h-[46px] flex-1 rounded-[14px] border-border-hairline bg-surface-sunk px-3 text-foreground"
          keyboardType="decimal-pad"
          value={formatNumber(value)}
          onChangeText={text => onChange(parseInputNumber(text, value))}
        />
        {suffix ? <Text className="t-caption text-muted">{suffix}</Text> : null}
      </View>
    </View>
  );
}

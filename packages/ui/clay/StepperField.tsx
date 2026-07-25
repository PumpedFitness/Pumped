import { Pressable, Text, View } from 'react-native';
import { ClayIcon } from '../icons/ClayIcon';

type StepperButtonProps = {
  kind: 'minus' | 'plus';
  disabled: boolean;
  onPress: () => void;
  testID?: string;
};

function StepperButton({ kind, disabled, onPress, testID }: StepperButtonProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      className={`h-[38px] w-[38px] items-center justify-center rounded-full bg-[#F1EFEC] active:bg-[#E9E6E2] ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      <ClayIcon name={kind} size={17} stroke={2.6} color="#57544F" />
    </Pressable>
  );
}

type StepperFieldProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  format?: (v: number) => string;
  className?: string;
  testID?: string;
};

export function StepperField({
  label,
  value,
  onChange,
  step = 1,
  min = -Infinity,
  max = Infinity,
  format,
  className = '',
  testID,
}: StepperFieldProps) {
  const atMin = value - step < min;
  const atMax = value + step > max;

  const decrement = () => {
    if (!atMin) onChange(Math.max(min, value - step));
  };
  const increment = () => {
    if (!atMax) onChange(Math.min(max, value + step));
  };

  return (
    <View testID={testID} className={`gap-[10px] ${className}`}>
      <Text className="text-[12px] font-[600] text-muted">{label}</Text>
      <View className="flex-row items-center justify-between">
        <StepperButton
          kind="minus"
          disabled={atMin}
          onPress={decrement}
          testID={testID ? `${testID}-minus` : undefined}
        />
        <Text className="text-[22px] font-[800] text-foreground">
          {format ? format(value) : String(value)}
        </Text>
        <StepperButton
          kind="plus"
          disabled={atMax}
          onPress={increment}
          testID={testID ? `${testID}-plus` : undefined}
        />
      </View>
    </View>
  );
}

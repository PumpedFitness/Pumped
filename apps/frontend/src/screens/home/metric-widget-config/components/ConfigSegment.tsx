import { Text, View } from 'react-native';
import { SegmentedControl } from '@pumped/ui/clay/SegmentedControl';

type ConfigSegmentProps<T extends string> = {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
};

/** A labelled segmented control — one row of the tracker's display options. */
export function ConfigSegment<T extends string>({
  label,
  value,
  options,
  onChange,
}: ConfigSegmentProps<T>) {
  return (
    <View className="mb-5">
      <Text className="mb-2 ml-1 text-[12.5px] font-semibold uppercase tracking-[0.5px] text-muted">
        {label}
      </Text>
      <SegmentedControl
        options={options}
        value={value}
        onChange={next => onChange(next as T)}
      />
    </View>
  );
}

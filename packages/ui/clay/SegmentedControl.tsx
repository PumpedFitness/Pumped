import { View, Text, Pressable } from 'react-native';

type Option = string | { value: string; label: string };

type SegmentedControlProps = {
  options: Option[];
  value: string;
  onChange?: (value: string) => void;
  className?: string;
  testID?: string;
};

/**
 * Segmented control — a track pill with the active segment filled by a solid
 * charcoal pill (light label), inactive segments muted. A static (non-animated)
 * fill is used deliberately: it renders reliably across screens where the
 * measured-width animated thumb did not.
 */
export function SegmentedControl({
  options = [],
  value,
  onChange,
  className = '',
  testID,
}: SegmentedControlProps) {
  const opts = options.map(o =>
    typeof o === 'object' ? o : { value: o, label: o },
  );

  return (
    <View
      testID={testID}
      className={`flex-row gap-[3px] rounded-full bg-surface-sunk p-[3px] ${className}`}
    >
      {opts.map(o => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            testID={`segment-${o.value}`}
            onPress={() => onChange?.(o.value)}
            className={`h-[38px] flex-1 items-center justify-center rounded-full ${
              on ? 'bg-moss' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold capitalize ${
                on ? 'text-cream' : 'text-muted'
              }`}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type WidgetLabelRowProps = {
  label: string;
  right?: ReactNode;
  inverted?: boolean;
};

/** The v2 "label + badge" header row shared by the dashboard widgets. */
export function WidgetLabelRow({ label, right, inverted }: WidgetLabelRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text
        className={
          'text-[12px] font-[600] ' +
          (inverted ? 'text-cream-dim' : 'text-muted')
        }
      >
        {label}
      </Text>
      {right}
    </View>
  );
}

import { useState } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import { ClayIcon, colors, shadows, type IconName } from '@pumped/ui';

export type QuickAction = {
  key: string;
  icon: IconName;
  label: string;
  onPress: () => void;
};

type QuickActionsProps = {
  actions: QuickAction[];
};

function QuickActionCircle({ icon, label, onPress }: QuickAction) {
  // Measure the column width so the circle stays a perfect square across widths.
  const [size, setSize] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => {
    setSize(event.nativeEvent.layout.width);
  };

  return (
    <View className="flex-1 items-center" onLayout={onLayout}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        className="w-full items-center justify-center rounded-full bg-surface-card active:bg-[#FFFFFF]"
        style={[shadows.circle, { height: size }]}
      >
        <ClayIcon name={icon} size={20} stroke={1.7} color={colors.ink} />
      </Pressable>
      <Text className="mt-[9px] text-[11px] font-[600] text-muted">{label}</Text>
    </View>
  );
}

/** Quick-actions row — 4 equal circle actions. README §1.4. */
export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <View className="flex-row gap-[12px]">
      {actions.map(action => (
        <QuickActionCircle
          key={action.key}
          icon={action.icon}
          label={action.label}
          onPress={action.onPress}
        />
      ))}
    </View>
  );
}

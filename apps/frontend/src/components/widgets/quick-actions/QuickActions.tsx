import { useState } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import { ClayIcon, colors, shadows, type IconName } from '@pumped/ui';

export type QuickAction = {
  key: string;
  icon: IconName;
  label: string;
  onPress: () => void;
};

export type QuickActionOption = {
  key: string;
  icon: IconName;
  label: string;
};

type QuickActionsProps = {
  actions: QuickAction[];
  /** Catalog entries not currently on the home screen — only shown while editing. */
  available: QuickActionOption[];
  editing: boolean;
  onAdd: (key: string) => void;
  onRemove: (key: string) => void;
  addLabel: (label: string) => string;
  removeLabel: (label: string) => string;
};

const COLUMNS = 4;
const GAP = 12;

type CircleProps = {
  icon: IconName;
  label: string;
  size: number;
  /** Muted outline treatment for catalog entries that aren't placed yet. */
  ghost?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
  children?: React.ReactNode;
};

function QuickActionCircle({
  icon,
  label,
  size,
  ghost = false,
  onPress,
  accessibilityLabel,
  children,
}: CircleProps) {
  return (
    <View style={{ width: size }} className="items-center">
      <View className="w-full">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          onPress={onPress}
          disabled={!onPress}
          className={`w-full items-center justify-center rounded-full ${
            ghost
              ? 'border border-dashed border-border-hairline'
              : 'bg-surface-card active:bg-[#FFFFFF]'
          }`}
          style={[ghost ? undefined : shadows.circle, { height: size }]}
        >
          <ClayIcon
            name={icon}
            size={20}
            stroke={1.7}
            color={ghost ? colors.muted : colors.ink}
          />
        </Pressable>
        {children}
      </View>
      <Text
        className={`mt-[9px] text-[11px] font-[600] ${
          ghost ? 'text-muted opacity-70' : 'text-muted'
        }`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * Quick-actions row — a fixed 4-per-row grid of circle actions. README §1.4.
 *
 * Editing reveals the rest of the catalog inline as dashed "ghost" circles
 * rather than pushing the user into a separate picker: the catalog is small
 * enough to show whole, and add/remove then read as one toggle surface.
 * The 4-column grid is deliberate — sizing circles with flex-1 would make them
 * grow or shrink as actions are added and removed.
 */
export function QuickActions({
  actions,
  available,
  editing,
  onAdd,
  onRemove,
  addLabel,
  removeLabel,
}: QuickActionsProps) {
  const [rowWidth, setRowWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) =>
    setRowWidth(event.nativeEvent.layout.width);

  const size = (rowWidth - GAP * (COLUMNS - 1)) / COLUMNS;

  return (
    <View
      onLayout={onLayout}
      className="flex-row flex-wrap"
      style={{ columnGap: GAP, rowGap: 16 }}
    >
      {size > 0 &&
        actions.map(action => (
          <QuickActionCircle
            key={action.key}
            icon={action.icon}
            label={action.label}
            size={size}
            accessibilityLabel={action.label}
            onPress={editing ? undefined : action.onPress}
          >
            {editing ? (
              <View className="absolute -right-2 -top-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={removeLabel(action.label)}
                  hitSlop={10}
                  onPress={() => onRemove(action.key)}
                  className="h-7 w-7 items-center justify-center rounded-full bg-foreground active:opacity-80"
                >
                  <ClayIcon name="x" size={15} color={colors.cream} />
                </Pressable>
              </View>
            ) : null}
          </QuickActionCircle>
        ))}

      {size > 0 && editing
        ? available.map(option => (
            <QuickActionCircle
              key={option.key}
              icon={option.icon}
              label={option.label}
              size={size}
              ghost
              accessibilityLabel={addLabel(option.label)}
              onPress={() => onAdd(option.key)}
            >
              <View className="absolute -right-2 -top-2">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-accent">
                  <ClayIcon name="plus" size={15} color={colors.cream} />
                </View>
              </View>
            </QuickActionCircle>
          ))
        : null}
    </View>
  );
}

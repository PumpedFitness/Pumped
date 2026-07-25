import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ClayIcon, colors, shadows } from '@pumped/ui';

type ModuleShellProps = {
  children: ReactNode;
  editing: boolean;
  onPress?: () => void;
  onRemove: () => void;
  onToggleSpan?: () => void;
  removeA11y: string;
  resizeA11y: string;
  /** Inverted (charcoal) modules paint their own bg. */
  inverted?: boolean;
  /** Accent-outlined computed-field modules. */
  outlined?: boolean;
  /** Drag handle rendered by the reorderable list (edit mode only). */
  dragHandle?: ReactNode;
  testID?: string;
};

const REMOVE_SHADOW = {
  shadowColor: colors.accent,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.35,
  shadowRadius: 10,
  elevation: 4,
} as const;

/**
 * The card chrome shared by every dashboard module: radius 26, card shadow, and
 * the edit-mode affordances (✕ remove, ⇱ span toggle). Tap-through to the
 * module's own onPress is suppressed while editing. README §1 "Modules" +
 * "Edit mode".
 */
export function ModuleShell({
  children,
  editing,
  onPress,
  onRemove,
  onToggleSpan,
  removeA11y,
  resizeA11y,
  inverted = false,
  outlined = false,
  dragHandle,
  testID,
}: ModuleShellProps) {
  const surface = inverted
    ? 'bg-foreground'
    : 'bg-surface-card border border-border-hairline';

  return (
    <View className="relative w-full">
      <Pressable
        accessibilityRole={onPress && !editing ? 'button' : undefined}
        testID={testID}
        onPress={editing ? undefined : onPress}
        disabled={editing || !onPress}
        className={`overflow-hidden rounded-[26px] p-[18px] ${surface}`}
        style={[
          inverted ? shadows.invertedCard : shadows.card,
          outlined
            ? { borderWidth: 1.5, borderColor: 'rgba(226,84,44,0.35)' }
            : undefined,
        ]}
      >
        {children}
      </Pressable>

      {editing && (
        <>
          {dragHandle ? (
            <View className="absolute left-[10px] top-[10px]">{dragHandle}</View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={removeA11y}
            testID={testID ? `${testID}-remove` : undefined}
            onPress={onRemove}
            hitSlop={8}
            className="absolute -right-[6px] -top-[6px] h-[26px] w-[26px] items-center justify-center rounded-full bg-accent"
            style={REMOVE_SHADOW}
          >
            <ClayIcon name="x" size={14} stroke={2.4} color={colors.onInk} />
          </Pressable>

          {onToggleSpan ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={resizeA11y}
              testID={testID ? `${testID}-resize` : undefined}
              onPress={onToggleSpan}
              hitSlop={8}
              className="absolute bottom-[12px] right-[12px] h-[28px] w-[28px] items-center justify-center rounded-full bg-foreground"
              style={shadows.buttonInk}
            >
              <ClayIcon name="swap" size={14} stroke={2} color={colors.onInk} />
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}

type ModuleLabelRowProps = {
  label: string;
  right?: ReactNode;
  inverted?: boolean;
};

/** The "label + ƒx badge" header row shared by several modules. */
export function ModuleLabelRow({ label, right, inverted }: ModuleLabelRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text
        className={`text-[12px] font-[600] ${
          inverted ? 'text-[rgba(244,242,239,0.6)]' : 'text-muted'
        }`}
      >
        {label}
      </Text>
      {right}
    </View>
  );
}

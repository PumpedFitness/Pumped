import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@pumped/ui/theme/tokens';
import {
  SwipeToDelete,
  type DeleteHandler,
} from '@pumped/ui/clay/SwipeToDelete';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';

const FLIP = { transform: [{ rotate: '180deg' }] };

type ExerciseCardProps = {
  name: string;
  description: string;
  children: ReactNode;
  headerAccessory?: ReactNode;
  /** 0–1 completion shown as a progress bar under the description. */
  progress?: number;
  openAccessibilityLabel?: string;
  onOpen?: () => void;
  onRemove?: DeleteHandler;
  /** Renders a fold toggle next to the open chevron. What actually collapses is
   *  the caller's business — this only owns the control and its direction. */
  isCollapsed?: boolean;
  collapseAccessibilityLabel?: string;
  onToggleCollapsed?: () => void;
};

export function ExerciseCard({
  name,
  description,
  children,
  headerAccessory,
  progress,
  openAccessibilityLabel,
  onOpen,
  onRemove,
  isCollapsed,
  collapseAccessibilityLabel,
  onToggleCollapsed,
}: ExerciseCardProps) {
  const content = (
    <View className="gap-4 rounded-[22px] border border-border-hairline bg-surface-sunk p-4">
      <View className="flex-row items-start gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-accent">
          <ClayIcon name="dumbbell" size={20} color={colors.cream} />
        </View>
        <View className="flex-1">
          <Text className="t-heading">{name}</Text>
          <Text className="t-caption mt-0.5">{description}</Text>
          {progress != null ? (
            <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
              <View
                className="h-full rounded-full bg-accent"
                style={{
                  width: `${Math.round(
                    Math.max(0, Math.min(1, progress)) * 100,
                  )}%`,
                }}
              />
            </View>
          ) : null}
        </View>
        {onOpen || headerAccessory || onToggleCollapsed ? (
          <View className="flex-row items-center gap-1">
            {onToggleCollapsed ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={collapseAccessibilityLabel}
                accessibilityState={{ expanded: !isCollapsed }}
                testID="toggle_exercise_collapsed"
                hitSlop={8}
                className="h-10 w-9 items-center justify-center rounded-full active:bg-surface-card"
                onPress={onToggleCollapsed}
              >
                {/* Always the down chevron, flipped when open. A right-facing
                    one would read as the "open exercise" arrow beside it. */}
                <View style={isCollapsed ? undefined : FLIP}>
                  <ClayIcon name="chevronDown" size={17} color={colors.muted} />
                </View>
              </Pressable>
            ) : null}
            {onOpen ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={openAccessibilityLabel}
                hitSlop={8}
                className="h-10 w-9 items-center justify-center rounded-full active:bg-surface-card"
                onPress={onOpen}
              >
                <ClayIcon name="chevron" size={17} color={colors.muted} />
              </Pressable>
            ) : null}
            {headerAccessory}
          </View>
        ) : null}
      </View>

      {children}
    </View>
  );

  return onRemove ? (
    <SwipeToDelete onDelete={onRemove} borderRadius={22}>
      {content}
    </SwipeToDelete>
  ) : (
    content
  );
}

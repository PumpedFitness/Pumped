import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';
import {
  SwipeToDelete,
  type DeleteHandler,
} from '@/components/clay/SwipeToDelete';
import { ClayIcon } from '@/components/icons/ClayIcon';

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
        {onOpen || headerAccessory ? (
          <View className="flex-row items-center gap-1">
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

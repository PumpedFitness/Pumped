import { Pressable, Text, View } from 'react-native';
import { Button } from 'heroui-native';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors, shadows } from '@pumped/ui/theme/tokens';

type PlanCardProps = {
  name: string;
  summary: string;
  active: boolean;
  editAccessibilityLabel: string;
  toggleAccessibilityLabel: string;
  testID: string;
  onEdit: () => void;
  onToggleActive: () => void;
};

export function PlanCard({
  name,
  summary,
  active,
  editAccessibilityLabel,
  toggleAccessibilityLabel,
  testID,
  onEdit,
  onToggleActive,
}: PlanCardProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={editAccessibilityLabel}
      className="flex-row items-center gap-2.5 rounded-[24px] bg-surface-card p-3 active:bg-surface-sunk"
      style={shadows.row}
      onPress={onEdit}
    >
      <View className="h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-accent-soft">
        <ClayIcon name="calendar" size={18} color={colors.accent} />
      </View>
      <View className="min-w-0 flex-1 gap-1.5">
        <Text
          className="text-[16px] font-bold leading-[1.25] text-foreground"
          numberOfLines={2}
        >
          {name}
        </Text>
        <Text
          className="text-[12px] font-medium leading-[1.4] text-muted"
          numberOfLines={2}
        >
          {summary}
        </Text>
      </View>
      <View className="shrink-0 gap-2">
        <Button
          testID={`${testID}-edit`}
          accessibilityLabel={editAccessibilityLabel}
          className="h-9 w-9 min-w-9 rounded-full p-0"
          variant="ghost"
          hitSlop={4}
          feedbackVariant="scale"
          onPress={event => {
            event.stopPropagation();
            onEdit();
          }}
        >
          <ClayIcon name="chevron" size={18} color={colors.muted} />
        </Button>
        <Button
          testID={`${testID}-toggle`}
          accessibilityLabel={toggleAccessibilityLabel}
          accessibilityState={{ selected: active }}
          className="h-9 w-9 min-w-9 shrink-0 rounded-full bg-accent p-0"
          hitSlop={4}
          feedbackVariant="scale"
          onPress={event => {
            event.stopPropagation();
            onToggleActive();
          }}
        >
          <ClayIcon
            name={active ? 'pause' : 'play'}
            size={16}
            color={colors.onInk}
          />
        </Button>
      </View>
    </Pressable>
  );
}

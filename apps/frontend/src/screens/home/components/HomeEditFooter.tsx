import { Pressable, Text, View } from 'react-native';

type HomeEditFooterProps = {
  editing: boolean;
  onToggleEdit: () => void;
  onAddWidget: () => void;
  editLabel: string;
  doneLabel: string;
  addWidgetLabel: string;
};

/**
 * Footer edit controls, below the widget grid — "Edit home" at rest, and while
 * editing the add-widget affordance plus a solid Done. README §1.1.
 */
export function HomeEditFooter({
  editing,
  onToggleEdit,
  onAddWidget,
  editLabel,
  doneLabel,
  addWidgetLabel,
}: HomeEditFooterProps) {
  if (!editing) {
    return (
      <Pressable
        accessibilityRole="button"
        testID="home-edit-toggle"
        onPress={onToggleEdit}
        className="mt-[18px] items-center rounded-[22px] border border-dashed border-border-hairline py-[14px] active:opacity-60"
      >
        <Text className="text-[13.5px] font-semibold text-muted">
          {editLabel}
        </Text>
      </Pressable>
    );
  }

  return (
    <View className="mt-[12px]">
      <Pressable
        accessibilityRole="button"
        onPress={onAddWidget}
        className="items-center rounded-[22px] border border-dashed border-border-hairline py-[14px] active:opacity-60"
      >
        <Text className="text-[13.5px] font-semibold text-muted">
          {addWidgetLabel}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        testID="home-edit-toggle"
        onPress={onToggleEdit}
        className="mt-[10px] items-center rounded-[22px] bg-foreground py-[14px] active:opacity-80"
      >
        <Text className="text-[13.5px] font-semibold text-on-ink">
          {doneLabel}
        </Text>
      </Pressable>
    </View>
  );
}

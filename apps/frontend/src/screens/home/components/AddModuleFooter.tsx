import { Pressable, Text } from 'react-native';

type AddModuleFooterProps = {
  label: string;
  onPress: () => void;
};

/** Dashed "+ Add module" footer that opens the Add-module sheet. README §1. */
export function AddModuleFooter({ label, onPress }: AddModuleFooterProps) {
  return (
    <Pressable
      accessibilityRole="button"
      testID="home-add-module"
      onPress={onPress}
      className="items-center justify-center rounded-[26px] border-[1.5px] border-dashed border-[rgba(27,26,24,0.2)] bg-[rgba(252,251,250,0.5)] px-[20px] py-[20px] active:border-foreground"
    >
      <Text className="text-[13px] font-[700] text-muted">{label}</Text>
    </Pressable>
  );
}

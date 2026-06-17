import { Pressable, Text } from 'react-native';

type CTAButtonProps = {
  label: string;
  onPress: () => void;
  className?: string;
  testID?: string;
};

export function CTAButton({
  label,
  onPress,
  className = '',
  testID,
}: CTAButtonProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      className={`py-[18px] rounded-full items-center bg-accent active:bg-[#B06A42] active:scale-[0.97] ${className}`}
    >
      <Text className="text-[17px] font-semibold text-accent-foreground">
        {label}
      </Text>
    </Pressable>
  );
}

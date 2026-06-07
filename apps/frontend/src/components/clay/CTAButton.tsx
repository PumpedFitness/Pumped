import { Pressable, Text } from 'react-native';
import { colors, radii } from '../../theme/tokens';

type CTAButtonProps = {
  label: string;
  onPress: () => void;
};

export function CTAButton({ label, onPress }: CTAButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? '#B06A42' : colors.accent,
        paddingVertical: 18,
        borderRadius: radii.pill,
        alignItems: 'center' as const,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: '600',
          color: colors.accentInk,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

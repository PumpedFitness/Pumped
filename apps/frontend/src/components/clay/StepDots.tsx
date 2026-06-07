import { View } from 'react-native';
import { colors } from '../../theme/tokens';

type StepDotsProps = {
  current: number;
  total: number;
};

export function StepDots({ current, total }: StepDotsProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        alignSelf: 'center',
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? 24 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i === current ? colors.accent : colors.line,
          }}
        />
      ))}
    </View>
  );
}

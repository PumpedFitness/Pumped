import { View, Text, Pressable } from 'react-native';
import { colors, radii } from '../../theme/tokens';
import { ClayIcon } from '../icons/ClayIcon';

type StepperProps = {
  label?: string;
  value: number;
  unit?: string;
  step?: number;
  onChange?: (next: number) => void;
  onMoss?: boolean;
};

export function Stepper({
  label,
  value,
  unit,
  step = 1,
  onChange,
  onMoss = true,
}: StepperProps) {
  const handleStep = (delta: number) => {
    onChange?.(Math.max(0, Math.round((value + delta) * 10) / 10));
  };

  const stepButton = (delta: number, iconName: 'minus' | 'plus') => (
    <Pressable
      onPress={() => handleStep(delta)}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: radii.sm,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <ClayIcon name={iconName} size={18} color={colors.ink} stroke={2} />
    </Pressable>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: onMoss ? colors.mossDeep : colors.cardSunk,
        borderRadius: radii.md,
        padding: 10,
        paddingBottom: 12,
      }}
    >
      {label && (
        <Text
          style={{
            fontSize: 11,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 0.96,
            fontWeight: '600',
            marginBottom: 8,
            color: onMoss ? colors.creamDim : colors.muted,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {stepButton(-step, 'minus')}
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              fontVariant: ['tabular-nums'],
              color: onMoss ? colors.cream : colors.ink,
            }}
          >
            {value}
          </Text>
          {unit && (
            <Text
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: onMoss ? colors.creamDim : colors.muted,
                marginLeft: 3,
              }}
            >
              {unit}
            </Text>
          )}
        </View>
        {stepButton(step, 'plus')}
      </View>
    </View>
  );
}

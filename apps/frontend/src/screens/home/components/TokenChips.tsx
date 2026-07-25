import { Pressable, Text, View } from 'react-native';
import { shadows } from '@pumped/ui';

// Chip order per README §5 "Computed field". The trailing ⌫ is rendered
// separately with the accent-tint treatment.
export const FORMULA_TOKENS = [
  'Σ',
  'sets',
  'reps',
  'load',
  'bodyweight',
  'sessions',
  'e1RM',
  'HRV',
  'sleep',
  '(',
  ')',
  '÷',
  '×',
  '+',
  '−',
  '7d',
  '28d',
] as const;

const CHIP_SHADOW = {
  shadowColor: '#1B1A18',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 1,
} as const;

type TokenChipsProps = {
  onAppend: (token: string) => void;
  onBackspace: () => void;
  backspaceLabel: string;
};

/** Wrapping row of formula token chips + a trailing backspace chip. */
export function TokenChips({
  onAppend,
  onBackspace,
  backspaceLabel,
}: TokenChipsProps) {
  return (
    <View className="flex-row flex-wrap gap-[7px]">
      {FORMULA_TOKENS.map(token => (
        <Pressable
          key={token}
          accessibilityRole="button"
          accessibilityLabel={token}
          testID={`formula-token-${token}`}
          onPress={() => onAppend(token)}
          className="rounded-full bg-surface-card px-[13px] py-[10px] active:bg-foreground"
          style={CHIP_SHADOW}
        >
          <Text className="text-[12px] font-[700] text-foreground">{token}</Text>
        </Pressable>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backspaceLabel}
        testID="formula-token-backspace"
        onPress={onBackspace}
        className="rounded-full bg-accent-soft px-[13px] py-[10px] active:opacity-80"
        style={shadows.row}
      >
        <Text className="text-[12px] font-[700] text-[#C2431F]">⌫</Text>
      </Pressable>
    </View>
  );
}

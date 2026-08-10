import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { colors } from '@pumped/ui/theme/tokens';

type ProfileFieldProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
};

// Wizard text field: clay card well with a terracotta focus ring.
export function ProfileField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: ProfileFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-2">
      <Text className="text-[11px] font-bold uppercase tracking-[1.2px] text-muted">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={
          'h-[58px] px-5 bg-surface-card text-foreground text-[17px] font-medium rounded-[18px] border ' +
          (focused ? 'border-accent' : 'border-border-hairline')
        }
      />
    </View>
  );
}

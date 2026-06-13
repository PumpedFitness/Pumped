import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { colors } from '@/theme/tokens';

type ProfileFieldProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
};

export function ProfileField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: ProfileFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-1.5">
      <Text className="text-[12.5px] font-semibold text-muted">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={
          'h-[52px] px-4 bg-surface-card text-foreground text-base font-medium rounded-[18px] border ' +
          (focused ? 'border-accent' : 'border-border-hairline')
        }
      />
    </View>
  );
}

import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { colors, radii } from '../../theme/tokens';

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
    <View style={{ gap: 6 }}>
      <Text
        style={{
          fontSize: 12.5,
          fontWeight: '600',
          color: colors.muted,
        }}
      >
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
        style={{
          height: 52,
          paddingHorizontal: 16,
          backgroundColor: colors.card,
          color: colors.ink,
          fontSize: 16,
          fontWeight: '500',
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: focused ? colors.accent : colors.line,
        }}
      />
    </View>
  );
}

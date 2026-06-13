import type { Ref } from 'react';
import { Text, TextInput, View } from 'react-native';
import { colors } from '@/theme/tokens';
import { Card } from '@/components/clay/Card';

type LabeledFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  inputRef?: Ref<TextInput>;
};

export function LabeledField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  inputRef,
}: LabeledFieldProps) {
  return (
    <Card variant="card" radius="xl" pad={0}>
      <View className="px-4 py-1.5">
        <Text className="text-[12.5px] text-muted mb-0.5">{label}</Text>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          multiline={multiline}
          className={
            multiline
              ? 'min-h-10 text-[15px] text-foreground'
              : 'h-10 text-[15px] font-medium text-foreground'
          }
        />
      </View>
    </Card>
  );
}

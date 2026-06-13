import type { RefObject } from 'react';
import { View, Text, TextInput } from 'react-native';
import DateTimePicker from '@expo/ui/community/datetime-picker';
import { Card } from '@/components/clay/Card';
import { colors } from '@/theme/tokens';

type MetricFormCardProps = {
  value: string;
  onChangeValue: (value: string) => void;
  entryDate: Date;
  onChangeDate: (date: Date) => void;
  unit: string;
  placeholder: string;
  inputRef: RefObject<TextInput | null>;
  onSubmit: () => void;
};

export function MetricFormCard({
  value,
  onChangeValue,
  entryDate,
  onChangeDate,
  unit,
  placeholder,
  inputRef,
  onSubmit,
}: MetricFormCardProps) {
  return (
    <View className="px-5 mt-7">
      <Card variant="card" radius="xl" pad={0}>
        {/* Date + Time picker */}
        <View className="items-center py-3">
          <DateTimePicker
            value={entryDate}
            onValueChange={(_, selected) => {
              if (selected) onChangeDate(selected);
            }}
            mode="datetime"
            display="spinner"
            maximumDate={new Date()}
            presentation="inline"
            themeVariant="light"
          />
        </View>

        {/* Divider */}
        <View className="h-px bg-border-hairline mx-4" />

        {/* Value input row */}
        <View className="flex-row items-center py-1.5 px-4">
          <Text className="text-[15px] text-muted mr-3">{unit}</Text>
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeValue}
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            onSubmitEditing={onSubmit}
            className="flex-1 h-12 text-[15px] font-medium text-foreground"
          />
        </View>
      </Card>
    </View>
  );
}

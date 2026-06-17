import { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { colors } from '@/theme/tokens';

type EditableRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  divider?: boolean;
  onSave: (value: string) => void;
  className?: string;
  testID?: string;
};

export function EditableRow({
  icon,
  label,
  value,
  placeholder,
  keyboardType = 'default',
  divider = false,
  onSave,
  className = '',
  testID,
}: EditableRowProps) {
  const inputRef = useRef<TextInput>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const commitEdit = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  return (
    <Pressable testID={testID} onPress={startEdit}>
      <View
        className={`flex-row items-center gap-[13px] py-[14px] px-4 ${
          divider ? 'border-t border-border-hairline' : ''
        } ${className}`}
      >
        <View className="w-8 h-8 rounded-xl bg-accent-soft items-center justify-center">
          {icon}
        </View>
        <Text className="text-[15px] font-medium text-foreground w-[70px]">
          {label}
        </Text>
        {editing ? (
          <TextInput
            ref={inputRef}
            value={draft}
            onChangeText={setDraft}
            onBlur={commitEdit}
            onSubmitEditing={commitEdit}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            className="flex-1 text-sm font-medium text-foreground p-0 text-right"
          />
        ) : (
          <Text
            className={`flex-1 text-sm text-right ${
              value ? 'text-muted' : 'text-[rgba(52,54,44,0.09)]'
            }`}
          >
            {value || placeholder}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

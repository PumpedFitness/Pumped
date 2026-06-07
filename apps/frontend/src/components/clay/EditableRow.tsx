import { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { colors, radii } from '../../theme/tokens';

type EditableRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  divider?: boolean;
  onSave: (value: string) => void;
};

export function EditableRow({
  icon,
  label,
  value,
  placeholder,
  keyboardType = 'default',
  divider = false,
  onSave,
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
    <Pressable onPress={startEdit}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 13,
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderTopWidth: divider ? 1 : 0,
          borderTopColor: colors.line,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: radii.sm,
            backgroundColor: colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
        <Text
          style={{
            fontSize: 15,
            fontWeight: '500',
            color: colors.ink,
            width: 70,
          }}
        >
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
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: '500',
              color: colors.ink,
              padding: 0,
              textAlign: 'right',
            }}
          />
        ) : (
          <Text
            style={{
              flex: 1,
              fontSize: 14,
              color: value ? colors.muted : colors.line,
              textAlign: 'right',
            }}
          >
            {value || placeholder}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

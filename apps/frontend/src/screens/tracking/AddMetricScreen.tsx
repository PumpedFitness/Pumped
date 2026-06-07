import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTimeWheelPicker } from '../../components/forms/DateTimeWheelPicker';
import { randomUUID } from 'expo-crypto';
import type { InferInsertModel } from 'drizzle-orm';
import { ClayIcon } from '../../components/icons/ClayIcon';
import { Card } from '../../components/clay/Card';
import { useRepository } from '../../data/local/useRepository';
import {
  bodyWeightEntries,
  bodyFatEntries,
} from '../../data/local/schema/bodyMetrics';
import { colors, radii, typography } from '../../theme/tokens';

type AddMetricScreenProps = RouteProp<RootStackParamList, 'AddMetric'>;

export function AddMetricScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<AddMetricScreenProps>();
  const { metric } = route.params;

  const table = metric === 'weight' ? bodyWeightEntries : bodyFatEntries;
  const repo = useRepository(table);
  const inputRef = useRef<TextInput>(null);

  const [value, setValue] = useState('');
  const [entryDate, setEntryDate] = useState(new Date());

  const title = metric === 'weight' ? 'Weight' : 'Body Fat';
  const unit = metric === 'weight' ? 'kg' : '%';
  const iconName = metric === 'weight' ? 'scale' : 'percent';
  const placeholder = metric === 'weight' ? 'e.g. 80.5' : 'e.g. 15.5';

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  const handleSave = () => {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed <= 0) return;
    if (metric === 'bodyFat' && parsed > 100) return;

    repo.create({
      id: randomUUID(),
      value: parsed,
      recordedAt: entryDate.getTime(),
    } as InferInsertModel<typeof table>);

    navigation.goBack();
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}
    >
      {/* Header: X and checkmark */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          height: 56,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: radii.pill,
            backgroundColor: colors.cardSunk,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <ClayIcon name="x" size={20} color={colors.ink} />
        </Pressable>

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: radii.pill,
            backgroundColor: colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <ClayIcon name="check" size={20} color={colors.cream} />
        </Pressable>
      </View>

      {/* Icon + Title */}
      <View style={{ alignItems: 'center', marginTop: 32 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: radii.pill,
            backgroundColor: colors.cardSunk,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ClayIcon name={iconName} size={36} color={colors.accent} />
        </View>
        <Text
          style={{
            fontSize: typography.title,
            fontWeight: '700',
            color: colors.ink,
            marginTop: 12,
          }}
        >
          {title}
        </Text>
      </View>

      {/* Form card */}
      <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
        <Card variant="card" radius="xl" pad={0}>
          {/* Date + Time picker */}
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                value={entryDate}
                onChange={(_, selected) => {
                  if (selected) setEntryDate(selected);
                }}
                mode="datetime"
                display="spinner"
                maximumDate={new Date()}
                themeVariant="light"
              />
            ) : (
              <DateTimeWheelPicker
                value={entryDate}
                onChange={setEntryDate}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.line,
              marginHorizontal: 16,
            }}
          />

          {/* Value input row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 6,
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                fontSize: typography.body,
                color: colors.muted,
                marginRight: 12,
              }}
            >
              {unit}
            </Text>
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={setValue}
              placeholder={placeholder}
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              onSubmitEditing={handleSave}
              style={{
                flex: 1,
                height: 48,
                fontSize: typography.body,
                fontWeight: '500',
                color: colors.ink,
              }}
            />
          </View>
        </Card>
      </View>
    </View>
  );
}

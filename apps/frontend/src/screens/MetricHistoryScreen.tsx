import { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { randomUUID } from 'expo-crypto';
import { desc } from 'drizzle-orm';
import type { SQLiteTable, SQLiteColumn } from 'drizzle-orm/sqlite-core';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ClayIcon } from '../components/icons/ClayIcon';
import { Card } from '../components/clay/Card';
import { MetricChart } from '../components/charts/MetricChart';
import { BottomSheetFrame } from '../components/forms/BottomSheetFrame';
import { useRepository } from '../data/local/useRepository';
import { colors, radii, typography } from '../theme/tokens';

type MetricEntry = {
  id: string;
  value: number;
  recordedAt: number;
};

type MetricHistoryScreenProps = {
  title: string;
  unit: string;
  table: SQLiteTable;
  recordedAtColumn: SQLiteColumn;
  formatValue: (value: number) => string;
  parseInput: (text: string) => number | null;
  inputPlaceholder: string;
  inputKeyboard?: 'numeric' | 'decimal-pad';
  lineColor?: string;
  areaTopColor?: string;
  areaBottomColor?: string;
};

function formatDate(epoch: number): string {
  const d = new Date(epoch);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatDateShort(epoch: number): string {
  const d = new Date(epoch);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function MetricHistoryScreen({
  title,
  unit,
  table,
  recordedAtColumn,
  formatValue,
  parseInput,
  inputPlaceholder,
  inputKeyboard = 'decimal-pad',
  lineColor,
  areaTopColor,
  areaBottomColor,
}: MetricHistoryScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const repo = useRepository(table);
  const inputRef = useRef<TextInput>(null);
  const [addSheet, setAddSheet] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [entryDate, setEntryDate] = useState(new Date());

  const entries = repo.query({
    orderBy: desc(recordedAtColumn),
  }) as MetricEntry[];

  const chartData = [...entries]
    .sort((a, b) => a.recordedAt - b.recordedAt)
    .map(e => ({
      time: formatDateShort(e.recordedAt),
      value: e.value,
    }));

  const openAddSheet = useCallback(() => {
    setInputValue('');
    setEntryDate(new Date());
    setAddSheet(true);
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleAdd = useCallback(() => {
    const parsed = parseInput(inputValue);
    if (parsed === null || parsed <= 0) return;

    repo.create({
      id: randomUUID(),
      value: parsed,
      recordedAt: entryDate.getTime(),
    } as any);

    setInputValue('');
    setAddSheet(false);
  }, [inputValue, entryDate, parseInput, repo]);

  const handleDelete = useCallback(
    (entry: MetricEntry) => {
      Alert.alert(
        'Delete Entry?',
        `${formatValue(entry.value)} on ${formatDate(entry.recordedAt)}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => repo.deleteById(entry.id),
          },
        ],
      );
    },
    [formatValue, repo],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          height: 52,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: radii.pill,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <ClayIcon name="back" size={22} color={colors.ink} />
        </Pressable>

        <Text
          style={{
            fontSize: typography.heading,
            fontWeight: '700',
            color: colors.ink,
          }}
        >
          {title}
        </Text>

        <Pressable
          onPress={openAddSheet}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: radii.pill,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <ClayIcon name="plus" size={22} color={colors.accent} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Latest value */}
        {entries.length > 0 && (
          <View style={{ alignItems: 'center', marginBottom: 16, marginTop: 8 }}>
            <Text
              style={{
                fontSize: 36,
                fontWeight: '700',
                color: colors.ink,
                fontVariant: ['tabular-nums'],
              }}
            >
              {formatValue(entries[0].value)}
            </Text>
            <Text style={{ fontSize: typography.caption, color: colors.muted, marginTop: 2 }}>
              {formatDate(entries[0].recordedAt)}
            </Text>
          </View>
        )}

        {/* Chart */}
        {chartData.length >= 2 && (
          <Card variant="card" radius="xl" pad={8} style={{ marginBottom: 24 }}>
            <MetricChart
              data={chartData}
              height={180}
              lineColor={lineColor}
              areaTopColor={areaTopColor}
              areaBottomColor={areaBottomColor}
            />
          </Card>
        )}

        {/* Entry list */}
        {entries.length > 0 ? (
          <Card variant="card" radius="xl" pad={0}>
            {entries.map((entry, i) => (
              <Pressable
                key={entry.id}
                onLongPress={() => handleDelete(entry)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: colors.line,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '500', color: colors.ink }}>
                  {formatDate(entry.recordedAt)}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: colors.ink,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {formatValue(entry.value)}
                </Text>
              </Pressable>
            ))}
          </Card>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <ClayIcon name="plus" size={32} color={colors.muted} />
            <Text
              style={{
                fontSize: typography.body,
                color: colors.muted,
                marginTop: 12,
                textAlign: 'center',
              }}
            >
              No entries yet.{'\n'}Tap + to add your first.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Entry Sheet */}
      <BottomSheetFrame
        visible={addSheet}
        accessibilityLabel="Close add entry"
        onClose={() => setAddSheet(false)}
      >
        <View style={{ gap: 16, paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12 }}>
          <View
            style={{
              width: 44,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.line,
              alignSelf: 'center',
            }}
          />
          <Text
            style={{
              fontSize: typography.title,
              fontWeight: '700',
              color: colors.ink,
              textAlign: 'center',
            }}
          >
            Add {title}
          </Text>

          {/* Value input */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.muted }}>
              Value ({unit})
            </Text>
            <TextInput
              ref={inputRef}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={inputPlaceholder}
              placeholderTextColor={colors.muted}
              keyboardType={inputKeyboard}
              returnKeyType="done"
              style={{
                height: 52,
                paddingHorizontal: 16,
                backgroundColor: colors.card,
                color: colors.ink,
                fontSize: 16,
                fontWeight: '500',
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: colors.line,
              }}
            />
          </View>

          {/* Date picker */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.muted }}>
              Date
            </Text>
            <DateTimePicker
              value={entryDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'compact' : 'default'}
              maximumDate={new Date()}
              onChange={(_, selected) => {
                if (selected) setEntryDate(selected);
              }}
              style={{ alignSelf: 'flex-start' }}
            />
          </View>

          <Pressable
            onPress={handleAdd}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#B06A42' : colors.accent,
              paddingVertical: 16,
              borderRadius: radii.pill,
              alignItems: 'center',
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.accentInk }}>
              Save
            </Text>
          </Pressable>
        </View>
      </BottomSheetFrame>
    </View>
  );
}

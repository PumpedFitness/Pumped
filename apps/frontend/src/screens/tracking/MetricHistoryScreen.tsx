import { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { desc } from 'drizzle-orm';
import type { SQLiteTable, SQLiteColumn } from 'drizzle-orm/sqlite-core';
import { ClayIcon } from '../../components/icons/ClayIcon';
import { Card } from '../../components/clay/Card';
import { MetricChart } from '../../components/charts/MetricChart';
import { useRepository } from '../../data/local/useRepository';
import { colors, radii, typography } from '../../theme/tokens';

type MetricEntry = {
  id: string;
  value: number;
  recordedAt: number;
};

type MetricHistoryScreenProps = {
  title: string;
  unit: string;
  metric: 'weight' | 'bodyFat';
  table: SQLiteTable;
  recordedAtColumn: SQLiteColumn;
  formatValue: (value: number) => string;
  lineColor?: string;
  areaTopColor?: string;
  areaBottomColor?: string;
};

function formatDate(epoch: number): string {
  const d = new Date(epoch);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
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
  metric,
  table,
  recordedAtColumn,
  formatValue,
  lineColor,
  areaTopColor,
  areaBottomColor,
}: MetricHistoryScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const repo = useRepository(table);

  const entries = repo.query({
    orderBy: desc(recordedAtColumn),
  }) as MetricEntry[];

  const chartData = [...entries]
    .sort((a, b) => a.recordedAt - b.recordedAt)
    .map(e => ({
      time: formatDateShort(e.recordedAt),
      value: e.value,
    }));

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
    <View
      style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}
    >
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
          onPress={() => navigation.navigate('AddMetric', { metric })}
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
          <View
            style={{ alignItems: 'center', marginBottom: 16, marginTop: 8 }}
          >
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
            <Text
              style={{
                fontSize: typography.caption,
                color: colors.muted,
                marginTop: 2,
              }}
            >
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
                <Text
                  style={{ fontSize: 15, fontWeight: '500', color: colors.ink }}
                >
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

    </View>
  );
}

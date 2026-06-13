import { useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { desc } from 'drizzle-orm';
import type { SQLiteTable, SQLiteColumn } from 'drizzle-orm/sqlite-core';
import { Card } from '@/components/clay/Card';
import { MetricChart } from './components/MetricChart';
import { MetricHistoryHeader } from './components/MetricHistoryHeader';
import { LatestValueBlock } from './components/LatestValueBlock';
import { MetricEntryList } from './components/MetricEntryList';
import type { MetricEntry } from './types';
import { formatDate, formatDateShort } from './dateFormat';
import { useRepository } from '@/data/local/useRepository';
import {
  bodyFatEntries,
  bodyWeightEntries,
} from '@/data/local/schema/bodyMetrics';
import { useUserProfile } from '@/hooks/useUserProfile';
import { formatWeight } from '@/utils/units';
import { colors } from '@/theme/tokens';

type MetricHistoryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'MetricHistory'
>;

export function MetricHistoryScreen({ route }: MetricHistoryScreenProps) {
  const { t } = useTranslation();
  const { profile } = useUserProfile();

  if (route.params.metric === 'weight') {
    return (
      <MetricHistoryContent
        title={t('metrics.weight')}
        metric="weight"
        table={bodyWeightEntries}
        recordedAtColumn={bodyWeightEntries.recordedAt}
        formatValue={v => formatWeight(v, profile.weightUnit)}
      />
    );
  }

  return (
    <MetricHistoryContent
      title={t('metrics.bodyFat')}
      metric="bodyFat"
      table={bodyFatEntries}
      recordedAtColumn={bodyFatEntries.recordedAt}
      formatValue={v => `${v.toFixed(1)}%`}
      lineColor={colors.accent}
      areaTopColor="rgba(198, 123, 82, 0.3)"
      areaBottomColor="rgba(198, 123, 82, 0.0)"
    />
  );
}

type MetricHistoryContentProps = {
  title: string;
  metric: 'weight' | 'bodyFat';
  table: SQLiteTable;
  recordedAtColumn: SQLiteColumn;
  formatValue: (value: number) => string;
  lineColor?: string;
  areaTopColor?: string;
  areaBottomColor?: string;
};

function MetricHistoryContent({
  title,
  metric,
  table,
  recordedAtColumn,
  formatValue,
  lineColor,
  areaTopColor,
  areaBottomColor,
}: MetricHistoryContentProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
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
        t('metrics.deleteEntryTitle'),
        t('metrics.deleteEntryBody', {
          value: formatValue(entry.value),
          date: formatDate(entry.recordedAt, i18n.language),
        }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => repo.deleteById(entry.id),
          },
        ],
      );
    },
    [t, i18n.language, formatValue, repo],
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <MetricHistoryHeader
        title={title}
        onBack={() => navigation.goBack()}
        onAdd={() => navigation.navigate('AddMetric', { metric })}
      />

      <ScrollView
        contentContainerClassName="px-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Latest value */}
        {entries.length > 0 && (
          <LatestValueBlock
            value={formatValue(entries[0].value)}
            date={formatDate(entries[0].recordedAt, i18n.language)}
          />
        )}

        {/* Chart */}
        {chartData.length >= 2 && (
          <Card variant="card" radius="xl" pad={8} className="mb-6">
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
        <MetricEntryList
          entries={entries}
          formatValue={formatValue}
          onDeleteEntry={handleDelete}
        />
      </ScrollView>
    </View>
  );
}

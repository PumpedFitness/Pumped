import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { Card } from '@/components/clay/Card';
import type { MetricEntry } from '@/screens/tracking/metric-history/types';
import { formatDate } from '@/screens/tracking/metric-history/dateFormat';
import { colors } from '@/theme/tokens';

type MetricEntryListProps = {
  entries: MetricEntry[];
  formatValue: (value: number) => string;
  onDeleteEntry: (entry: MetricEntry) => void;
};

export function MetricEntryList({
  entries,
  formatValue,
  onDeleteEntry,
}: MetricEntryListProps) {
  const { t, i18n } = useTranslation();

  return entries.length > 0 ? (
    <Card variant="card" radius="xl" pad={0}>
      {entries.map((entry, i) => (
        <Pressable
          key={entry.id}
          onLongPress={() => onDeleteEntry(entry)}
          className={
            'flex-row items-center justify-between py-3.5 px-4 ' +
            (i > 0 ? 'border-t border-border-hairline' : '')
          }
        >
          <Text className="text-[15px] font-medium text-foreground">
            {formatDate(entry.recordedAt, i18n.language)}
          </Text>
          <Text className="text-[15px] font-semibold text-foreground tabular-nums">
            {formatValue(entry.value)}
          </Text>
        </Pressable>
      ))}
    </Card>
  ) : (
    <View className="items-center py-12">
      <ClayIcon name="plus" size={32} color={colors.muted} />
      <Text className="text-[15px] text-muted mt-3 text-center">
        {t('metrics.emptyList')}
      </Text>
    </View>
  );
}

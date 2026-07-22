import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';

type ConsistencyFullWidgetProps = { colSpan: number; width: number };

export function ConsistencyFullWidget(_props: ConsistencyFullWidgetProps) {
  const { t } = useTranslation();
  const days = useHomeWidgetData().activityDays;
  const count = days.filter(Boolean).length;

  return (
    <Card radius="xl" pad={18}>
      <View className="flex-row items-end justify-between">
        <View>
          <Text className="t-eyebrow text-muted">
            {t('widgets.consistency.title')}
          </Text>
          <Text className="t-heading mt-1">
            {t('widgets.consistency.summary', { count })}
          </Text>
        </View>
        <Text className="t-caption text-muted">
          {t('widgets.consistency.range')}
        </Text>
      </View>
      <View className="mt-4 flex-row justify-between gap-1.5">
        {Array.from({ length: 8 }, (_, week) => (
          <View key={week} className="flex-1 gap-1.5">
            {days.slice(week * 7, week * 7 + 7).map((active, day) => (
              <View
                key={day}
                className={`aspect-square w-full rounded-[4px] ${
                  active ? 'bg-accent' : 'bg-surface-sunk'
                }`}
              />
            ))}
          </View>
        ))}
      </View>
    </Card>
  );
}

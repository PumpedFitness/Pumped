import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';

type ScheduleWidgetProps = {
  colSpan: number;
  width: number;
};

type DayStatus = 'done' | 'today' | 'rest' | 'upcoming';

// Dummy: week starting Tuesday
const DAY_STATUSES: DayStatus[] = [
  'done',
  'done',
  'rest',
  'today',
  'upcoming',
  'rest',
  'upcoming',
];

// Jan 2 2024 is a Tuesday — used only to derive localized weekday labels
function weekdayLabel(language: string, tuesdayOffset: number): string {
  return new Date(2024, 0, 2 + tuesdayOffset)
    .toLocaleDateString(language, { weekday: 'short' })
    .slice(0, 2);
}

const DOT_CLASSES: Record<DayStatus, string> = {
  done: 'bg-sage',
  today: 'bg-accent',
  rest: 'bg-muted',
  upcoming: 'bg-text-secondary',
};

export function ScheduleWidget(_props: ScheduleWidgetProps) {
  const { t, i18n } = useTranslation();

  return (
    <Card variant="card" radius="lg" pad={15}>
      <Text className="text-[12.5px] font-semibold text-muted mb-[10px]">
        {t('widgets.schedule.title')}
      </Text>

      <View className="flex-row justify-between">
        {DAY_STATUSES.map((status, i) => {
          const isToday = status === 'today';
          return (
            <View key={i} className="items-center gap-[6px]">
              <Text
                className={`text-[11px] ${
                  isToday ? 'font-bold text-accent' : 'font-medium text-muted'
                }`}
              >
                {weekdayLabel(i18n.language, i)}
              </Text>
              <View
                className={`rounded-full ${
                  isToday ? 'w-[10px] h-[10px]' : 'w-2 h-2'
                } ${DOT_CLASSES[status]}`}
              />
            </View>
          );
        })}
      </View>
    </Card>
  );
}

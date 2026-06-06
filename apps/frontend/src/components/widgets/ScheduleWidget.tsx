import { View, Text } from 'react-native';
import { Card } from '../clay/Card';
import { colors, typography } from '../../theme/tokens';

type ScheduleWidgetProps = {
  colSpan: number;
  width: number;
};

type DayEntry = {
  label: string;
  status: 'done' | 'today' | 'rest' | 'upcoming';
};

const DAYS: DayEntry[] = [
  { label: 'Tu', status: 'done' },
  { label: 'We', status: 'done' },
  { label: 'Th', status: 'rest' },
  { label: 'Fr', status: 'today' },
  { label: 'Sa', status: 'upcoming' },
  { label: 'Su', status: 'rest' },
  { label: 'Mo', status: 'upcoming' },
];

const DOT_COLORS: Record<DayEntry['status'], string> = {
  done: colors.sage,
  today: colors.accent,
  rest: colors.muted,
  upcoming: colors.ink2,
};

export function ScheduleWidget(_props: ScheduleWidgetProps) {
  return (
    <Card variant="card" radius="lg" pad={15}>
      <Text style={{ fontSize: typography.caption, fontWeight: '600', color: colors.muted, marginBottom: 10 }}>
        Schedule
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {DAYS.map((day, i) => {
          const isToday = day.status === 'today';
          return (
            <View key={i} style={{ alignItems: 'center', gap: 6 }}>
              <Text
                style={{
                  fontSize: typography.micro,
                  fontWeight: isToday ? '700' : '500',
                  color: isToday ? colors.accent : colors.muted,
                }}
              >
                {day.label}
              </Text>
              <View
                style={{
                  width: isToday ? 10 : 8,
                  height: isToday ? 10 : 8,
                  borderRadius: 999,
                  backgroundColor: DOT_COLORS[day.status],
                }}
              />
            </View>
          );
        })}
      </View>
    </Card>
  );
}

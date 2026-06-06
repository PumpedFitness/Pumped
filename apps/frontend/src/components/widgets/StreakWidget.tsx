import { View, Text } from 'react-native';
import { Card } from '../clay/Card';
import { ClayIcon } from '../icons/ClayIcon';
import { colors, typography } from '../../theme/tokens';

type StreakWidgetProps = {
  colSpan: number;
  width: number;
};

// Dummy: last 7 days — true = worked out
const WEEK_DATA = [
  { day: 'Mo', active: true },
  { day: 'Tu', active: true },
  { day: 'We', active: true },
  { day: 'Th', active: false },
  { day: 'Fr', active: true },
  { day: 'Sa', active: true },
  { day: 'Su', active: false },
];

export function StreakWidget({ colSpan }: StreakWidgetProps) {
  return (
    <Card variant="card" radius="lg" pad={15}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <ClayIcon name="flame" size={16} color={colors.sage} />
          <Text style={{ fontSize: typography.caption, fontWeight: '600', color: colors.muted }}>
            {colSpan >= 2 ? '12-day streak' : 'Streak'}
          </Text>
        </View>
        {colSpan < 2 && (
          <Text style={{ fontSize: typography.body, fontWeight: '700', color: colors.ink }}>
            12
          </Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: colSpan >= 2 ? 6 : 4, marginTop: 10 }}>
        {WEEK_DATA.map((day, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View
              style={{
                width: '100%',
                height: colSpan >= 2 ? 24 : 20,
                borderRadius: 6,
                backgroundColor: day.active ? colors.sage : colors.cardSunk,
              }}
            />
            {colSpan >= 2 && (
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '500',
                  color: colors.muted,
                }}
              >
                {day.day}
              </Text>
            )}
          </View>
        ))}
      </View>
    </Card>
  );
}

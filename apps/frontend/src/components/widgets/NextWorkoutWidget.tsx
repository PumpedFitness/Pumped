import { View, Text } from 'react-native';
import { Card } from '../clay/Card';
import { ClayIcon } from '../icons/ClayIcon';
import { colors, typography } from '../../theme/tokens';

type NextWorkoutWidgetProps = {
  colSpan: number;
  width: number;
};

export function NextWorkoutWidget(_props: NextWorkoutWidgetProps) {
  return (
    <Card variant="card" radius="2xl" pad={18}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ClayIcon name="dumbbell" size={22} color={colors.accent} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: typography.caption, color: colors.muted, fontWeight: '500' }}>
            Last session · Tuesday
          </Text>
          <Text style={{ fontSize: typography.body, fontWeight: '700', color: colors.ink, marginTop: 2 }}>
            Pull Day — 52 min
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <ClayIcon name="award" size={16} color={colors.sage} />
          <Text style={{ fontSize: typography.label, fontWeight: '600', color: colors.sage }}>
            2 PRs
          </Text>
        </View>
      </View>
    </Card>
  );
}
